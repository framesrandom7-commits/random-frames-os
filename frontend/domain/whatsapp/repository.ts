import axios from "axios";
import { prisma } from "@/lib/prisma";
import { Logger } from "@/lib/logger";
import { WHATSAPP_CONSTANTS } from "./constants";
import { WhatsAppTemplatePayload } from "./types";

export class WhatsAppRepository {
  /**
   * Dispatches a WhatsApp Template via the Meta Cloud API.
   */
  static async sendTemplate(payload: WhatsAppTemplatePayload): Promise<boolean> {
    try {
      const waSettings = await prisma.integrationSettings.findUnique({
        where: { provider: WHATSAPP_CONSTANTS.PROVIDER_ID }
      });

      if (!waSettings || !waSettings.accessToken) {
        throw new Error("WhatsApp credentials missing.");
      }

      const metadata = waSettings.metadata as any;
      const phoneNumberId = metadata?.phoneNumberId;

      if (!phoneNumberId) {
        throw new Error("WhatsApp Phone Number ID missing.");
      }

      const url = `${WHATSAPP_CONSTANTS.BASE_URL}/${WHATSAPP_CONSTANTS.API_VERSION}/${phoneNumberId}/messages`;

      const response = await axios.post(url, payload, {
        headers: {
          'Authorization': `Bearer ${waSettings.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      // Log success
      if (response.data && response.data.messages) {
        await prisma.whatsAppLog.create({
          data: {
            templateName: payload.template.name,
            recipientPhone: payload.to,
            status: 'SENT',
          }
        });
      }

      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message;
      Logger.error(`Failed to send WhatsApp template ${payload.template.name} to ${payload.to}`, errorMessage);
      
      // Log failure
      await prisma.whatsAppLog.create({
        data: {
          templateName: payload.template.name,
          recipientPhone: payload.to,
          status: 'FAILED',
          errorMessage: errorMessage,
        }
      });
      
      throw new Error(errorMessage);
    }
  }

  static async getSettings() {
    return prisma.integrationSettings.findUnique({
      where: { provider: WHATSAPP_CONSTANTS.PROVIDER_ID }
    });
  }
}
