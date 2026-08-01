import { WhatsAppRepository } from "./repository";
import { WhatsAppTemplatePayload, WhatsAppTemplateComponent } from "./types";
import { AuditManager } from "@/domain/integrations/audit-manager";
import { WHATSAPP_CONSTANTS } from "./constants";
import { Logger } from "@/lib/logger";

export class WhatsAppDomainService {
  /**
   * Constructs the template payload and passes it to the repository.
   */
  static async sendTemplateMessage(
    to: string, 
    templateName: string, 
    components?: WhatsAppTemplateComponent[]
  ): Promise<boolean> {
    try {
      const payload: WhatsAppTemplatePayload = {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: "en" },
          components: components || []
        }
      };

      await WhatsAppRepository.sendTemplate(payload);

      await AuditManager.logIntegrationEvent(
        WHATSAPP_CONSTANTS.PROVIDER_ID,
        "TEMPLATE_SENT",
        `Successfully sent template ${templateName} to ${to}`,
        { to, templateName }
      );

      return true;
    } catch (error: any) {
      Logger.error(`WhatsAppDomainService failed to send ${templateName}`, error.message);
      await AuditManager.logIntegrationEvent(
        WHATSAPP_CONSTANTS.PROVIDER_ID,
        "TEMPLATE_FAILED",
        `Failed to send template ${templateName} to ${to}`,
        { to, templateName, error: error.message }
      );
      throw error;
    }
  }

  /**
   * Helper to format simple text components array
   */
  static buildTextComponents(texts: string[]): WhatsAppTemplateComponent[] {
    if (texts.length === 0) return [];
    return [{
      type: "body",
      parameters: texts.map(text => ({
        type: "text",
        text
      }))
    }];
  }

  /**
   * Helper to format PDF document component
   */
  static buildDocumentComponent(link: string, filename: string): WhatsAppTemplateComponent {
    return {
      type: "header",
      parameters: [{
        type: "document",
        document: {
          link,
          filename
        }
      }]
    };
  }
}
