import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PERMISSIONS_LIST, ROLES_CONFIG } from "../domain/rbac/constants";
import { RoleName } from "../domain/rbac/types";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Database with Domain-Driven RBAC Architecture...");

  // 1. Seed Permissions from Domain Constants
  for (const perm of PERMISSIONS_LIST) {
    await prisma.permission.upsert({
      where: { action: perm.action },
      update: { module: perm.module, description: perm.description },
      create: { action: perm.action, module: perm.module, description: perm.description },
    });
  }
  console.log(`✅ Seeded ${PERMISSIONS_LIST.length} Granular Permissions.`);

  const allPerms = await prisma.permission.findMany();
  const permMap = new Map(allPerms.map((p) => [p.action, p.id]));

  // 2. Seed Roles and Map Permissions
  for (const roleDef of ROLES_CONFIG) {
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      update: { description: roleDef.description, isSystem: roleDef.isSystem },
      create: { name: roleDef.name, description: roleDef.description, isSystem: roleDef.isSystem },
    });

    // Clear existing permissions for this role to ensure a clean updated mapping
    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id },
    });

    // Assign permissions
    const rpData = roleDef.permissions
      .map((action) => permMap.get(action))
      .filter((id): id is string => Boolean(id))
      .map((permissionId) => ({
        roleId: role.id,
        permissionId,
      }));

    await prisma.rolePermission.createMany({
      data: rpData,
      skipDuplicates: true,
    });
  }
  console.log(`✅ Seeded ${ROLES_CONFIG.length} Scalable Roles with respective permission mappings.`);

  // 3. Preserve Existing Founder / Super Admin Account
  const founderRole = await prisma.role.findUnique({ where: { name: RoleName.FOUNDER } });
  if (!founderRole) throw new Error("Founder role not found after seeding.");

  const ownerEmail = process.env.OWNER_EMAIL || "admin@randomframes.local";
  const existingFounder = await prisma.user.findFirst({
    where: {
      OR: [
        { email: ownerEmail },
        { role: { name: { in: [RoleName.FOUNDER, RoleName.OWNER, "Owner", "Admin"] } } },
      ],
    },
    orderBy: { createdAt: "asc" },
  });

  if (existingFounder) {
    // DO NOT recreate account, DO NOT modify credentials or reset password.
    // Ensure they are attached to the official Super Admin 'Founder' role if previously 'Owner'.
    if (existingFounder.roleId !== founderRole.id) {
      await prisma.user.update({
        where: { id: existingFounder.id },
        data: { roleId: founderRole.id },
      });
      console.log(`✅ Updated existing Founder/Owner user (${existingFounder.email}) to official Founder role without modifying credentials.`);
    } else {
      console.log(`✅ Founder account (${existingFounder.email}) already exists with unchanged credentials and correct Super Admin role.`);
    }
  } else {
    // Only if starting with completely blank db
    const name = process.env.OWNER_NAME || "Savan (Founder)";
    const password = process.env.OWNER_PASSWORD || "Admin@123";
    const passwordHash = await bcrypt.hash(password, 10);
    await prisma.user.create({
      data: {
        email: ownerEmail,
        name,
        passwordHash,
        roleId: founderRole.id,
      },
    });
    console.log(`✅ Created initial Founder account for ${ownerEmail}`);
  }

  // 4. Seed Default Co-Founder Dummy Account (Operations)
  const coFounderRole = await prisma.role.findUnique({ where: { name: RoleName.CO_FOUNDER } });
  if (!coFounderRole) throw new Error("Co-Founder role not found after seeding.");

  const coFounderEmail = "hbpooja04@gmail.com";
  const existingCoFounder = await prisma.user.findUnique({
    where: { email: coFounderEmail },
  });

  if (!existingCoFounder) {
    const defaultPasswordHash = await bcrypt.hash("Pooja@04", 10);
    await prisma.user.create({
      data: {
        email: coFounderEmail,
        name: "H B Pooja",
        passwordHash: defaultPasswordHash,
        roleId: coFounderRole.id,
        archivedAt: null, // Active status
      },
    });
    console.log(`✅ Created default Co-Founder account for ${coFounderEmail} (H B Pooja) with Operations access.`);
  } else {
    // Ensure role is mapped to Co-Founder without overwriting profile changes if editable
    if (existingCoFounder.roleId !== coFounderRole.id) {
      await prisma.user.update({
        where: { id: existingCoFounder.id },
        data: { roleId: coFounderRole.id },
      });
    }
    console.log(`✅ Co-Founder account (${coFounderEmail}) already active in system.`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
