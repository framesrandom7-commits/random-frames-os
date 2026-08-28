"use server";

import { prisma } from "@/lib/prisma";
import { checkFinanceRbac, checkFounderRbac } from "./rbac";
import { verifySession } from "@/lib/auth";
import crypto from "crypto";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function getCurrentUserSession() {
  try {
    const session = await verifySession();
    if (!session) return { success: false };
    
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      include: { role: true }
    });
    
    if (!user) return { success: false };
    
    return { 
      success: true, 
      user: { 
        email: user.email, 
        role: user.role?.name 
      } 
    };
  } catch (error) {
    return { success: false };
  }
}

export async function sendOtpForPinReset(email: string) {
  try {
    // 1. Verify user exists
    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true }
    });

    if (!user) return { success: false, error: "User not found" };
    if (user.role?.name?.toUpperCase() !== "FOUNDER") return { success: false, error: "Only Founders can manage the security PIN" };

    // 2. Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Hash the OTP before storing
    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    // Store in DB, expires in 5 minutes
    await prisma.otpToken.create({
      data: {
        email,
        otpHash,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      }
    });

    // 3. Send email via Resend
    if (!RESEND_API_KEY) {
      console.warn("RESEND_API_KEY missing, OTP is:", otp);
      return { success: true, warning: "Email skipped in dev mode. OTP logged to console." };
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "Security <onboarding@resend.dev>", // Safe fallback for unverified domains
        to: email,
        subject: "Your Random Frames OS Security Code",
        html: `<h2>Security Code</h2><p>Your 6-digit OTP is: <strong>${otp}</strong></p><p>This code will expire in 5 minutes. If you did not request this, please ignore this email.</p>`
      })
    });

    if (!res.ok) {
      console.error("Resend error:", await res.text());
      return { success: false, error: "Failed to send email. Check API key and domain configuration." };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error in sendOtpForPinReset:", error);
    return { success: false, error: error.message };
  }
}

export async function verifyOtpAndSetPin(email: string, otp: string, newPin: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { success: false, error: "User not found" };
    
    if (newPin.length !== 4 || !/^\d{4}$/.test(newPin)) {
      return { success: false, error: "PIN must be exactly 4 digits" };
    }

    const otpHash = crypto.createHash('sha256').update(otp).digest('hex');

    // Find valid token
    const token = await prisma.otpToken.findFirst({
      where: {
        email,
        otpHash,
        expiresAt: { gt: new Date() },
        usedAt: null
      }
    });

    if (!token) return { success: false, error: "Invalid or expired OTP" };

    // Mark token used
    await prisma.otpToken.update({
      where: { id: token.id },
      data: { usedAt: new Date() }
    });

    // Set new PIN
    const pinHash = crypto.createHash('sha256').update(newPin).digest('hex');
    await prisma.user.update({
      where: { email },
      data: { securityPin: pinHash }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error in verifyOtpAndSetPin:", error);
    return { success: false, error: error.message };
  }
}

export async function verifyPin(pin: string) {
  try {
    const user = await checkFounderRbac(); 
    if (!user.securityPin) return { success: false, error: "No PIN set. Please setup your PIN first." };

    const inputHash = crypto.createHash('sha256').update(pin).digest('hex');
    if (user.securityPin !== inputHash) {
      return { success: false, error: "Incorrect PIN" };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function executeDataDeletion(target: string, pin: string) {
  try {
    const pinCheck = await verifyPin(pin);
    if (!pinCheck.success) return pinCheck;

    // Proceed with deletion based on target
    if (target === "ALL") {
      await prisma.$transaction([
        prisma.activity.deleteMany(),
        prisma.notification.deleteMany(),
        prisma.deliverableFile.deleteMany(),
        prisma.deliverableVersion.deleteMany(),
        prisma.deliverable.deleteMany(),
        prisma.shootEquipment.deleteMany(),
        prisma.shootShot.deleteMany(),
        prisma.shoot.deleteMany(),
        prisma.checklistItem.deleteMany(),
        prisma.task.deleteMany(),
        prisma.calendarEvent.deleteMany(),
        prisma.financialLedger.deleteMany(),
        prisma.paymentAllocation.deleteMany(),
        prisma.payment.deleteMany(),
        prisma.invoiceItem.deleteMany(),
        prisma.invoice.deleteMany(),
        prisma.expense.deleteMany(),
        prisma.quotationItem.deleteMany(),
        prisma.quotation.deleteMany(),
        prisma.project.deleteMany(),
        prisma.approval.deleteMany(),
        prisma.leadTag.deleteMany(),
        prisma.leadAttachment.deleteMany(),
        prisma.leadReminder.deleteMany(),
        prisma.leadCommunication.deleteMany(),
        prisma.lead.deleteMany(),
        prisma.client.deleteMany(),
      ]);
    } else if (target === "LEADS") {
      await prisma.$transaction([
        prisma.leadTag.deleteMany(),
        prisma.leadAttachment.deleteMany(),
        prisma.leadReminder.deleteMany(),
        prisma.leadCommunication.deleteMany(),
        prisma.lead.deleteMany(),
      ]);
    } else if (target === "CLIENTS") {
      await prisma.$transaction([
        prisma.client.deleteMany(),
      ]);
    } else if (target === "QUOTATIONS") {
      await prisma.$transaction([
        prisma.quotationItem.deleteMany(),
        prisma.quotation.deleteMany(),
      ]);
    } else if (target === "INVOICES") {
      await prisma.$transaction([
        prisma.invoiceItem.deleteMany(),
        prisma.invoice.deleteMany(),
      ]);
    } else if (target === "PAYMENTS") {
      await prisma.$transaction([
        prisma.paymentAllocation.deleteMany(),
        prisma.payment.deleteMany(),
      ]);
    } else if (target === "EXPENSES") {
      await prisma.$transaction([
        prisma.expense.deleteMany(),
      ]);
    } else if (target === "PROJECTS") {
      await prisma.$transaction([
        prisma.project.deleteMany(),
      ]);
    } else if (target === "SHOOTS") {
      await prisma.$transaction([
        prisma.shootEquipment.deleteMany(),
        prisma.shootShot.deleteMany(),
        prisma.shoot.deleteMany(),
      ]);
    } else if (target === "DELIVERABLES") {
      await prisma.$transaction([
        prisma.deliverableFile.deleteMany(),
        prisma.deliverableVersion.deleteMany(),
        prisma.deliverable.deleteMany(),
      ]);
    } else {
      return { success: false, error: "Invalid target selection" };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error executing data deletion:", error);
    return { success: false, error: "Failed to delete data. Make sure to delete related data first." };
  }
}
