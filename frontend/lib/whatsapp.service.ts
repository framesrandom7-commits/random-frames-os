import { prisma } from "./prisma";
import axios from "axios";
import { QueueService } from "./queue.service";
import { Logger } from "./logger";

export class WhatsAppService {
  /**
   * Fail-safe execution of template messages via WhatsApp Cloud API
   */
  static async sendTemplateMessage(to: string, templateName: string, templateData: Record<string, string> = {}): Promise<boolean> {
    try {
      const waSettings = await prisma.integrationSettings.findUnique({
        where: { provider: "WHATSAPP" }
      });

      // We expect accessToken and metadata { phoneNumberId } to be configured by the user
      if (!waSettings || !waSettings.accessToken) {
        Logger.warn("[WhatsAppService] Credentials missing. Skipping template message.");
        return false;
      }

      const metadata = waSettings.metadata as any;
      const phoneNumberId = metadata?.phoneNumberId || process.env.WHATSAPP_PHONE_NUMBER_ID;

      if (!phoneNumberId) {
        Logger.warn("[WhatsAppService] Phone Number ID missing. Skipping message.");
        return false;
      }

      // Convert map to WhatsApp Cloud API parameter structure
      const parameters = Object.keys(templateData).map(key => ({
        type: "text",
        text: templateData[key]
      }));

      const payload = {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: "en" },
          components: parameters.length > 0 ? [{
            type: "body",
            parameters
          }] : []
        }
      };

      const response = await axios.post(
        `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${waSettings.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Log successful send to DB
      if (response.data && response.data.messages) {
        await prisma.whatsAppLog.create({
          data: {
            templateName,
            recipientPhone: to,
            status: 'SENT',
          }
        });
      }

      return true;
    } catch (error: any) {
      Logger.error(`[WhatsAppService] Failed to send template ${templateName} to ${to}`, error.response?.data || error.message);
      
      // Store in DB for Webhook/Admin review, status FAILED
      await prisma.whatsAppLog.create({
        data: {
          templateName,
          recipientPhone: to,
          status: 'FAILED',
          errorMessage: error.response?.data?.error?.message || error.message,
        }
      });

      // Push to retry queue
      await QueueService.pushJob("WHATSAPP", "SEND_TEMPLATE", { to, templateName, templateData }, error.message);
      return false; // Fail-safe
    }
  }
}
