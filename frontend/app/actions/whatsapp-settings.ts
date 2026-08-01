"use server";

import { verifySession as getSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { GlobalErrorService } from "@/lib/core/errors/global-error.service";
import { WHATSAPP_CONSTANTS, WHATSAPP_TEMPLATES } from '@/domain/whatsapp/constants';
import { WhatsAppDomainService } from '@/domain/whatsapp/service';

export async function getWhatsAppSettings() {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Unauthorized' };

    const settings = await prisma.integrationSettings.findUnique({
      where: { provider: WHATSAPP_CONSTANTS.PROVIDER_ID }
    });

    const hasAccessToken = !!settings?.accessToken;
    const metadata = settings?.metadata as any;
    const phoneNumberId = metadata?.phoneNumberId;

    return { 
      success: true, 
      connected: hasAccessToken && !!phoneNumberId,
      phoneNumberId,
      hasAccessToken
    };
  } catch (error: any) {
    return GlobalErrorService.handleError(error, "Action:getWhatsAppSettings");
  }
}

export async function saveWhatsAppSettings(accessToken: string, phoneNumberId: string) {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Unauthorized' };

    const metadata = { phoneNumberId };

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

export async function testWhatsAppConnection(testPhone: string) {
  try {
    const session = await getSession();
    if (!session || !session.userId) return { success: false, error: 'Unauthorized' };

    // Use a basic welcome template for testing
    const components = WhatsAppDomainService.buildTextComponents(["Test User"]);
    
    await WhatsAppDomainService.sendTemplateMessage(
      testPhone,
      WHATSAPP_TEMPLATES.WELCOME_CLIENT,
      components
    );

    return { success: true };
  } catch (error: any) {
    return GlobalErrorService.handleError(error, "Action:testWhatsAppConnection");
  }
}
