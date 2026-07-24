import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const PERMISSIONS = [
  // Dashboard
  { action: "dashboard.view", module: "Dashboard" },
  { action: "dashboard.manage", module: "Dashboard" },
  
  // Workspace (General configuration)
  { action: "workspace.view", module: "Workspace" },
  { action: "workspace.manage", module: "Workspace" },

  // Leads
  { action: "leads.view", module: "Leads" },
  { action: "leads.create", module: "Leads" },
  { action: "leads.update", module: "Leads" },
  { action: "leads.delete", module: "Leads" },

  // Clients
  { action: "clients.view", module: "Clients" },
  { action: "clients.create", module: "Clients" },
  { action: "clients.update", module: "Clients" },
  { action: "clients.delete", module: "Clients" },

  // Projects
  { action: "projects.view", module: "Projects" },
  { action: "projects.create", module: "Projects" },
  { action: "projects.update", module: "Projects" },
  { action: "projects.delete", module: "Projects" },
  { action: "projects.assign", module: "Projects" },
  { action: "projects.approve", module: "Projects" },

  // Shoots
  { action: "shoots.view", module: "Shoots" },
  { action: "shoots.create", module: "Shoots" },
  { action: "shoots.update", module: "Shoots" },
  { action: "shoots.delete", module: "Shoots" },

  // Deliverables
  { action: "deliverables.view", module: "Deliverables" },
  { action: "deliverables.create", module: "Deliverables" },
  { action: "deliverables.update", module: "Deliverables" },
  { action: "deliverables.delete", module: "Deliverables" },
  { action: "deliverables.review", module: "Deliverables" },

  // Calendar
  { action: "calendar.view", module: "Calendar" },
  { action: "calendar.manage", module: "Calendar" },

  // CRM / Sales
  { action: "crm.manage", module: "CRM" },

  // Finance
  { action: "finance.view", module: "Finance" },
  { action: "finance.manage", module: "Finance" },
  { action: "finance.export", module: "Finance" },
  { action: "invoices.manage", module: "Finance" },
  { action: "payments.manage", module: "Finance" },
  { action: "expenses.manage", module: "Finance" },

  // Reports
  { action: "reports.view", module: "Reports" },

  // Team & Users
  { action: "users.manage", module: "Users" },
  
  // Settings & Architecture
  { action: "roles.manage", module: "Settings" },
  { action: "settings.manage", module: "Settings" },
  { action: "backup.manage", module: "Settings" },
  { action: "ownership.transfer", module: "System" } // Exclusive to Owner
];

const ROLES = [
  {
    name: "Owner",
    description: "Full unrestricted access to the entire system.",
    isSystem: true,
    permissions: PERMISSIONS.map(p => p.action) // Everything
  },
  {
    name: "Admin",
    description: "Runs the business. Full access except ownership, roles, and backups.",
    isSystem: true,
    permissions: PERMISSIONS.map(p => p.action).filter(a => 
      !["ownership.transfer", "roles.manage", "backup.manage"].includes(a)
    )
  },
  {
    name: "Operations Manager",
    description: "Runs daily operations across leads, clients, projects, and calendar.",
    isSystem: true,
    permissions: [
      "dashboard.view", "dashboard.manage",
      "workspace.view",
      "leads.view", "leads.create", "leads.update", "leads.delete",
      "clients.view", "clients.create", "clients.update", "clients.delete",
      "projects.view", "projects.create", "projects.update", "projects.delete", "projects.assign", "projects.approve",
      "shoots.view", "shoots.create", "shoots.update", "shoots.delete",
      "deliverables.view", "deliverables.create", "deliverables.update", "deliverables.delete", "deliverables.review",
      "calendar.view", "calendar.manage",
      "reports.view"
    ]
  },
  {
    name: "Sales & CRM Manager",
    description: "Handles leads, clients, quotations and follow-ups.",
    isSystem: true,
    permissions: [
      "dashboard.view",
      "leads.view", "leads.create", "leads.update", "leads.delete",
      "clients.view", "clients.create", "clients.update", "clients.delete",
      "crm.manage",
      "reports.view"
    ]
  },
  {
    name: "Finance Manager",
    description: "Manages invoices, payments, expenses, and financial reports.",
    isSystem: true,
    permissions: [
      "dashboard.view",
      "finance.view", "finance.manage", "finance.export",
      "invoices.manage", "payments.manage", "expenses.manage",
      "reports.view"
    ]
  },
  {
    name: "Creative Director",
    description: "Oversees creative output, reviews, and team assignments.",
    isSystem: true,
    permissions: [
      "dashboard.view",
      "projects.view", "projects.assign", "projects.approve",
      "shoots.view",
      "deliverables.view", "deliverables.review",
      "calendar.view"
    ]
  },
  {
    name: "Creative",
    description: "Photographer, videographer, editor, etc. Accesses assigned work.",
    isSystem: true,
    permissions: [
      "dashboard.view",
      "projects.view",
      "shoots.view",
      "deliverables.view", "deliverables.create", "deliverables.update",
      "calendar.view"
    ]
  },
  {
    name: "Viewer",
    description: "Read-only access to assigned items.",
    isSystem: true,
    permissions: [
      "dashboard.view",
      "projects.view",
      "shoots.view",
      "deliverables.view",
      "calendar.view"
    ]
  }
];

async function main() {
  console.log("Seeding Database with RBAC Architecture...");

  // 1. Seed Permissions
  for (const perm of PERMISSIONS) {
    await prisma.permission.upsert({
      where: { action: perm.action },
      update: { module: perm.module },
      create: { action: perm.action, module: perm.module, description: `Allows ${perm.action}` }
    });
  }
  console.log(`✅ Seeded ${PERMISSIONS.length} Permissions.`);

  const allPerms = await prisma.permission.findMany();
  const permMap = new Map(allPerms.map(p => [p.action, p.id]));

  // 2. Seed Roles and Map Permissions
  for (const roleDef of ROLES) {
    const role = await prisma.role.upsert({
      where: { name: roleDef.name },
      update: { description: roleDef.description, isSystem: roleDef.isSystem },
      create: { name: roleDef.name, description: roleDef.description, isSystem: roleDef.isSystem }
    });

    // Clear existing permissions for this role to ensure a clean state
    await prisma.rolePermission.deleteMany({
      where: { roleId: role.id }
    });

    // Assign permissions
    const rpData = roleDef.permissions
      .map(action => permMap.get(action))
      .filter(id => id) // Ensure ID exists
      .map(permissionId => ({
        roleId: role.id,
        permissionId: permissionId as string
      }));
      
    await prisma.rolePermission.createMany({
      data: rpData,
      skipDuplicates: true
    });
  }
  console.log(`✅ Seeded ${ROLES.length} Roles with their respective permissions.`);

  // 3. Seed Initial Owner Account
  const name = process.env.OWNER_NAME || "System Admin";
  const email = process.env.OWNER_EMAIL;
  const password = process.env.OWNER_PASSWORD;

  if (!email || !password) {
    console.log("⚠️ OWNER_EMAIL or OWNER_PASSWORD environment variables are missing. Skipping admin user seed.");
    return;
  }

  const ownerRole = await prisma.role.findUnique({ where: { name: "Owner" } });
  if (!ownerRole) throw new Error("Owner role not found after seeding.");

  const existingOwner = await prisma.user.findUnique({
    where: { email },
  });

  if (existingOwner) {
    if (existingOwner.roleId !== ownerRole.id) {
      await prisma.user.update({
        where: { id: existingOwner.id },
        data: { roleId: ownerRole.id }
      });
      console.log("✅ Updated existing admin user to Owner role.");
    } else {
      console.log("✅ Owner account already exists and has correct role.");
    }
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      roleId: ownerRole.id,
    },
  });

  console.log(`✅ Successfully created initial Owner account for ${email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
