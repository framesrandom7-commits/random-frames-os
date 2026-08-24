"use server";

import { verifySession as getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GlobalErrorService } from "@/lib/core/errors/global-error.service";
import { CryptoService } from '@/lib/core/security/crypto.service';
import nodemailer from 'nodemailer';

const SMTP_PROVIDER_ID = "SMTP_EMAIL";

export async function getEmailSettings() {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Unauthorized' };

    const settings = await prisma.integrationSettings.findUnique({
      where: { provider: SMTP_PROVIDER_ID }
    });

    const hasPassword = !!settings?.accessToken; // We store the encrypted password in accessToken
    const metadata = (settings?.metadata as any) || {};

    return { 
      success: true, 
      connected: !!settings,
      host: metadata.host || "",
      port: metadata.port || "",
      user: metadata.user || "",
      secure: metadata.secure || false,
      hasPassword,
      lastSync: settings?.updatedAt ? settings.updatedAt.toISOString() : null,
      lastError: metadata.lastError || null,
    };
  } catch (error: any) {
    return GlobalErrorService.handleError(error, "Action:getEmailSettings");
  }
}

export async function saveEmailSettings(host: string, port: string, user: string, pass: string, secure: boolean) {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Unauthorized' };

    const existing = await prisma.integrationSettings.findUnique({ where: { provider: SMTP_PROVIDER_ID } });
    
    // We only encrypt and store the password if a new one is provided.
    // If pass is empty or starts with dots (placeholder), we keep the existing access token.
    let encryptedPass = existing?.accessToken || "";
    if (pass && !pass.startsWith("••••")) {
      encryptedPass = CryptoService.encrypt(pass);
    }

    const metadata = { 
      host,
      port,
      user,
      secure,
      lastError: null 
    };

    await prisma.integrationSettings.upsert({
      where: { provider: SMTP_PROVIDER_ID },
      update: { accessToken: encryptedPass, metadata, updatedAt: new Date() },
      create: { 
        provider: SMTP_PROVIDER_ID,
        accessToken: encryptedPass,
        metadata,
        userId: session.userId
      }
    });

    return { success: true };
  } catch (error: any) {
    return GlobalErrorService.handleError(error, "Action:saveEmailSettings");
  }
}

export async function disconnectEmailSettings() {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Unauthorized' };

    await prisma.integrationSettings.deleteMany({
      where: { provider: SMTP_PROVIDER_ID }
    });
    return { success: true };
  } catch (error: any) {
    return GlobalErrorService.handleError(error, "Action:disconnectEmailSettings");
  }
}

export async function testEmailConnection(testEmail: string) {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Unauthorized' };

    const settings = await prisma.integrationSettings.findUnique({
      where: { provider: SMTP_PROVIDER_ID }
    });

    if (!settings || !settings.accessToken) {
      return { success: false, error: "Missing SMTP credentials." };
    }

    const metadata = (settings.metadata as any) || {};
    const pass = CryptoService.decrypt(settings.accessToken);

    const transporter = nodemailer.createTransport({
      host: metadata.host,
      port: Number(metadata.port),
      secure: metadata.secure || false,
      auth: {
        user: metadata.user,
        pass: pass
      }
    });

    // Test sending an email
    await transporter.sendMail({
      from: `"Random Frames OS" <${metadata.user}>`,
      to: testEmail,
      subject: "Integration Test: SMTP Configuration Successful 🎉",
      text: "Hello! If you are reading this, your SMTP configuration in Random Frames OS is fully functional and ready to dispatch production emails.",
      html: "<h3>Hello!</h3><p>If you are reading this, your SMTP configuration in <strong>Random Frames OS</strong> is fully functional and ready to dispatch production emails.</p>"
    });

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to send test email." };
  }
}
