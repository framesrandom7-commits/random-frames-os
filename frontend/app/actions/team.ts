"use server";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Resend } from "resend";
import { verifySession } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/rbac";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

export async function inviteUser(formData: FormData) {
  try {
    const { userId } = await requirePermission("users.manage");

    const name = formData.get("name") as string;
    const loginEmail = formData.get("loginEmail") as string;
    const contactEmail = formData.get("contactEmail") as string;
    const roleId = formData.get("roleId") as string;

    if (!name || !loginEmail || !contactEmail || !roleId) {
      return { error: "Please provide all required fields." };
    }

    // Check if the requested role is 'Owner' and block it if the inviter is not an Owner
    const targetRole = await prisma.role.findUnique({ where: { id: roleId } });
    if (!targetRole) return { error: "Invalid role selected." };

    if (targetRole.name === "Owner") {
      const inviterUser = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
      if (inviterUser?.role?.name !== "Owner") {
        return { error: "Only an Owner can invite another Owner." };
      }
    }

    const existingUser = await prisma.user.findUnique({ where: { email: loginEmail } });
    if (existingUser) {
      return { error: "A user with this login email already exists." };
    }

    // Create user with a secure random temporary password
    const tempPassword = crypto.randomBytes(32).toString("hex");
    const passwordHash = await bcrypt.hash(tempPassword, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        email: loginEmail,
        contactEmail,
        roleId,
        passwordHash,
      },
    });

    // Generate setup token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours for new account setup

    await prisma.passwordResetToken.create({
      data: {
        email: loginEmail,
        tokenHash,
        expiresAt,
      },
    });

    const setupLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${rawToken}`;

    if (!process.env.RESEND_API_KEY) {
      console.log("=========================================");
      console.log("MOCK SETUP EMAIL SENT");
      console.log("To Contact Email:", contactEmail);
      console.log("Subject: Set up your Random Frames OS account");
      console.log("Login ID:", loginEmail);
      console.log("Setup Link:", setupLink);
      console.log("=========================================");
    } else {
      await resend.emails.send({
        from: "Random Frames OS <noreply@randomframes.com>", // Replace with verified domain
        to: contactEmail,
        subject: "Set up your Random Frames OS account",
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Random Frames OS, ${name}!</h2>
            <p>An administrator has created an account for you.</p>
            <p><strong>Your designated login ID is:</strong> ${loginEmail}</p>
            <p>Click the link below to set your password and access the system. This link will expire in 48 hours.</p>
            <a href="${setupLink}" style="display: inline-block; background-color: #E53935; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Set My Password</a>
          </div>
        `,
      });
    }

    revalidatePath("/settings/team");
    return { success: `Successfully invited ${name}. Setup instructions sent to ${contactEmail}.` };
  } catch (error: any) {
    console.error("Invite user error:", error);
    return { error: error.message || "An unexpected error occurred. Please try again later." };
  }
}

export async function toggleUserStatus(targetUserId: string, isDeactivating: boolean) {
  try {
    const { userId } = await requirePermission("users.manage");
    if (userId === targetUserId) return { error: "You cannot change your own status." };

    const targetUser = await prisma.user.findUnique({ where: { id: targetUserId }, include: { role: true } });
    if (!targetUser) return { error: "User not found." };
    if (targetUser.role?.name === "Owner") return { error: "Owner accounts cannot be deactivated." };

    await prisma.user.update({
      where: { id: targetUserId },
      data: { archivedAt: isDeactivating ? new Date() : null },
    });
    
    revalidatePath("/settings/team");
    return { success: `User successfully ${isDeactivating ? "deactivated" : "reactivated"}.` };
  } catch (error: any) {
    return { error: error.message || "Failed to update user status." };
  }
}
