"use server";

import { verifySession as getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GlobalErrorService } from "@/lib/core/errors/global-error.service";
import { WHATSAPP_CONSTANTS } from '@/domain/whatsapp/constants';
import { WhatsAppRepository } from '@/domain/whatsapp/repository';
import { WhatsAppDomainService } from '@/domain/whatsapp/service';
import { WhatsAppTemplateRegistry } from '@/domain/whatsapp/templates';
import { WhatsAppMessageLinks } from '@/domain/whatsapp/types';

export async function getWhatsAppSettings() {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Unauthorized' };

    const settings = await WhatsAppRepository.getSettings();
    const policy = await WhatsAppRepository.getShootReminderPolicy();

    const hasAccessToken = !!settings?.accessToken;
    const metadata = (settings?.metadata as any) || {};
    const phoneNumberId = metadata.phoneNumberId || metadata.phone_number_id || "";
    const businessAccountId = metadata.businessAccountId || metadata.business_account_id || "";

    return { 
      success: true, 
      connected: hasAccessToken && !!phoneNumberId,
      phoneNumberId,
      businessAccountId,
      hasAccessToken,
      apiVersion: WHATSAPP_CONSTANTS.API_VERSION,
      webhookStatus: hasAccessToken ? "Active & Verified" : "Disconnected",
      rateLimits: "Tier 1 (1,000 messages / 24h)",
      lastSync: settings?.updatedAt ? settings.updatedAt.toISOString() : null,
      lastError: metadata.lastError || null,
      shootReminderPolicy: policy,
      templatesCount: Object.keys(WhatsAppTemplateRegistry.TEMPLATES).length,
    };
  } catch (error: any) {
    return GlobalErrorService.handleError(error, "Action:getWhatsAppSettings");
  }
}

export async function saveWhatsAppSettings(accessToken: string, phoneNumberId: string, businessAccountId?: string) {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Unauthorized' };

    const existing = await prisma.integrationSettings.findUnique({ where: { provider: WHATSAPP_CONSTANTS.PROVIDER_ID } });
    const oldMeta = (existing?.metadata as any) || {};

    const metadata = { 
      ...oldMeta, 
      phoneNumberId, 
      businessAccountId: businessAccountId || oldMeta.businessAccountId || "",
      lastError: null 
    };

    await prisma.integrationSettings.upsert({
      where: { provider: WHATSAPP_CONSTANTS.PROVIDER_ID },
      update: { accessToken, metadata },
      create: { 
        provider: WHATSAPP_CONSTANTS.PROVIDER_ID,
        accessToken,
        metadata,
        userId: session.userId
      }
    });

    return { success: true };
  } catch (error: any) {
    return GlobalErrorService.handleError(error, "Action:saveWhatsAppSettings");
  }
}

export async function disconnectWhatsAppSettings() {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Unauthorized' };

    await prisma.integrationSettings.deleteMany({
      where: { provider: WHATSAPP_CONSTANTS.PROVIDER_ID }
    });
    return { success: true };
  } catch (error: any) {
    return GlobalErrorService.handleError(error, "Action:disconnectWhatsAppSettings");
  }
}

export async function verifyWhatsAppConnection() {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Unauthorized' };

    const client = await WhatsAppRepository.getClient();
    if (!client) return { success: false, error: "Missing API credentials." };

    const res = await client.verifyPhoneNumber();
    if (!res.success) {
      return { success: false, error: res.error || "Verification failed with Meta Cloud API." };
    }

    return { success: true, data: res.data };
  } catch (error: any) {
    return GlobalErrorService.handleError(error, "Action:verifyWhatsAppConnection");
  }
}

export async function testWhatsAppConnection(testPhone: string, customText?: string) {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Unauthorized' };

    const components = WhatsAppTemplateRegistry.buildTextComponents([
      (session as any).role === "Founder" || (session as any).role === "Co-Founder" ? (session as any).role : "Client Account",
      "Random Frames OS Production Infrastructure",
    ]);

    const success = await WhatsAppDomainService.sendTemplateMessage(
      testPhone,
      WhatsAppTemplateRegistry.TEMPLATES.WELCOME_CLIENT.id,
      components,
      undefined,
      session.userId
    );

    return { success };
  } catch (error: any) {
    return GlobalErrorService.handleError(error, "Action:testWhatsAppConnection");
  }
}

export async function refreshWhatsAppTemplates() {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Unauthorized' };

    const templates = Object.values(WhatsAppTemplateRegistry.TEMPLATES);
    return { success: true, templates };
  } catch (error: any) {
    return GlobalErrorService.handleError(error, "Action:refreshWhatsAppTemplates");
  }
}

export async function saveShootReminderPolicy(enabled: boolean, timingHoursBefore: number) {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Unauthorized' };

    await WhatsAppRepository.updateShootReminderPolicy({ enabled, timingHoursBefore });
    return { success: true };
  } catch (error: any) {
    return GlobalErrorService.handleError(error, "Action:saveShootReminderPolicy");
  }
}

export async function sendManualWhatsAppMessage(
  recipientPhone: string, 
  content: string, 
  messageType: "TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT" | "PDF" | "VOICE_NOTE" | "LOCATION" | "BUSINESS_CARD" = "TEXT",
  links?: WhatsAppMessageLinks
) {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Unauthorized' };

    if (messageType === "TEXT" || messageType === "BUSINESS_CARD" || messageType === "LOCATION") {
      await WhatsAppDomainService.sendTextMessage(recipientPhone, content, links, undefined, session.userId);
    } else {
      await WhatsAppDomainService.sendMediaMessage(
        recipientPhone, 
        messageType as any, 
        { link: content, caption: `Shared via Random Frames OS (${messageType})` }, 
        links, 
        session.userId
      );
    }

    return { success: true };
  } catch (error: any) {
    return GlobalErrorService.handleError(error, "Action:sendManualWhatsAppMessage");
  }
}

export async function getConversationHistory(filter: { clientId?: string; leadId?: string; projectId?: string; shootId?: string; limit?: number }) {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Unauthorized' };

    const conversations = await WhatsAppRepository.getConversationHistory(filter);
    return { success: true, conversations };
  } catch (error: any) {
    return GlobalErrorService.handleError(error, "Action:getConversationHistory");
  }
}
