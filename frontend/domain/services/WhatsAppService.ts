import { WhatsAppRepository } from "../repositories/WhatsAppRepository";
import { EventBus } from "@/lib/workflow/event-bus";
import { WorkflowEvent } from "@/lib/workflow/events";

export class WhatsAppService {
  static async sendTemplateMessage(to: string, templateId: string, variables: Record<string, string>, referenceId?: { clientId?: string, leadId?: string }) {
    const template = await WhatsAppRepository.getTemplate(templateId);
    if (!template) throw new Error("Template not found");
    
    // Stub for sending actual message via WhatsApp API
    const messageId = `wa_msg_${Date.now()}`;
    
    const log = await WhatsAppRepository.logMessage({
      to,
      templateId,
      status: "SENT",
      clientId: referenceId?.clientId,
      leadId: referenceId?.leadId,
    });
    
    EventBus.publish(WorkflowEvent.WHATSAPP_MESSAGE_SENT, {
      logId: log.id,
      recipientPhone: to,
      templateName: templateId
    });
    
    return log;
  }

  static async handleDeliveryWebhook(messageId: string, status: string) {
    // Stub for processing webhook from WhatsApp Business API
    // Actually we don't have messageId on WhatsAppLog in Prisma currently, but if we did:
    // await WhatsAppRepository.updateLogStatus(messageId, status, status === 'DELIVERED' ? new Date() : undefined);
    
    EventBus.publish(WorkflowEvent.WHATSAPP_DELIVERY_UPDATE, {
      logId: messageId,
      status
    });
  }

  static async getLogs(params: any = {}) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;
    
    const where: any = {};
    if (params.clientId) where.clientId = params.clientId;
    if (params.leadId) where.leadId = params.leadId;
    
    return WhatsAppRepository.getLogs(where, skip, limit);
  }
}
