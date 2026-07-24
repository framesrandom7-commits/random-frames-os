"use server";

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { Resend } from "resend";
import { createSession, deleteSession } from "@/lib/auth";
import { redirect } from "next/navigation";

// Next.js recommended way to instantiate Prisma Client in dev
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Please enter your email and password." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "Invalid email or password." };
    }

    // Verify account status is active (not archived)
    if (user.archivedAt) {
      return { error: "This account has been deactivated. Please contact an administrator." };
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return { error: "Invalid email or password." };
    }

    await createSession(user.id);
  } catch (error) {
    console.error("Login error:", error);
    return { error: "An unexpected error occurred. Please try again later." };
  }
  
  redirect("/");
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}

export async function forgotPassword(formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return { error: "Please enter your email address." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // To prevent email enumeration, we do not throw an error if the user doesn't exist.
    if (user && !user.archivedAt) {
      const rawToken = crypto.randomBytes(32).toString("hex");
      const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
      
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration

      await prisma.passwordResetToken.create({
        data: {
          email,
          tokenHash,
          expiresAt,
        },
      });

      const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${rawToken}`;

      if (!process.env.RESEND_API_KEY) {
        console.log("=========================================");
        console.log("MOCK EMAIL SENT");
        console.log("To:", email);
        console.log("Subject: Password Reset Request");
        console.log("Reset Link:", resetLink);
        console.log("=========================================");
      } else {
        await resend.emails.send({
          from: "Random Frames OS <noreply@randomframes.com>", // Replace with verified domain
          to: email,
          subject: "Password Reset Request",
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Reset Your Password</h2>
              <p>You requested a password reset for Random Frames OS.</p>
              <p>Click the link below to set a new password. This link will expire in 1 hour.</p>
              <a href="${resetLink}" style="display: inline-block; background-color: #E53935; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
              <p style="margin-top: 30px; font-size: 12px; color: #888;">If you didn't request this, you can safely ignore this email.</p>
            </div>
          `,
        });
      }
    }
    
    // Always return success to not leak email existence
    return { success: "If an active account exists with that email, we've sent instructions to reset your password." };
  } catch (error) {
    console.error("Forgot password error:", error);
    return { error: "An unexpected error occurred. Please try again later." };
  }
}

export async function resetPassword(formData: FormData) {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!token) return { error: "Missing or invalid token." };
  if (!password || !confirmPassword) return { error: "Please enter all fields." };
  if (password !== confirmPassword) return { error: "Passwords do not match." };
  if (password.length < 8) return { error: "Password must be at least 8 characters long." };

  try {
    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
    });

    if (!resetToken) {
      return { error: "Invalid or expired reset token." };
    }

    if (resetToken.usedAt) {
      return { error: "This password reset token has already been used." };
    }

    if (resetToken.expiresAt < new Date()) {
      return { error: "This password reset token has expired." };
    }

    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user || user.archivedAt) {
      return { error: "Account not found or deactivated." };
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // Run updates in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return { success: "Password successfully reset. You can now log in with your new password." };
  } catch (error) {
    console.error("Reset password error:", error);
    return { error: "An unexpected error occurred. Please try again later." };
  }
}
