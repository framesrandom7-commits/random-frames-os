import { prisma } from "@/lib/prisma";
import { Logger } from "@/lib/logger";
import { WHATSAPP_CONSTANTS } from "./constants";
import { 
  WhatsAppTemplatePayload, 
  WhatsAppConversationRecord, 
  WhatsAppIntegrationConfig,
  ShootReminderPolicyConfig,
  WhatsAppMessageLinks 
} from "./types";
import { MetaWhatsAppClient, MetaWhatsAppClientConfig } from "@/lib/whatsapp";

/**
 * WhatsAppRepository
 * Persistent database repository managing credentials, conversation logging, status synchronization,
 * dynamic settings storage, and Dead Letter Queue transitions.
 */
export class WhatsAppRepository {
  /**
   * Retrieves active credentials and initializes the pure Meta API client
   */
  static async getClient(): Promise<MetaWhatsAppClient | null> {
    try {
      const waSettings = await prisma.integrationSettings.findUnique({
        where: { provider: WHATSAPP_CONSTANTS.PROVIDER_ID }
      });

      if (!waSettings || !waSettings.accessToken) {
        return null;
      }

      const metadata: any = waSettings.metadata || {};
      const phoneNumberId = metadata.phoneNumberId || metadata.phone_number_id;
      const businessAccountId = metadata.businessAccountId || metadata.business_account_id;

      if (!phoneNumberId) {
        return null;
      }

      return new MetaWhatsAppClient({
        accessToken: waSettings.accessToken,
        phoneNumberId,
        businessAccountId: businessAccountId || "",
        apiVersion: WHATSAPP_CONSTANTS.API_VERSION,
        baseUrl: WHATSAPP_CONSTANTS.BASE_URL,
      });
    } catch (error: any) {
      Logger.error("Failed to initialize MetaWhatsAppClient", error.message);
      return null;
    }
  }

  /**
   * Dispatches a template message via MetaWhatsAppClient and logs conversation record
   */
  static async sendTemplate(
    recipientPhone: string,
    templateName: string,
    components: any[] = [],
    links?: WhatsAppMessageLinks,
    assignedUserId?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const client = await this.getClient();
    if (!client) {
      const err = "WhatsApp credentials not configured or missing phone number ID.";
      await this.recordMessageLog({
        direction: "OUTBOUND",
        recipientPhone,
        messageType: "TEMPLATE",
        content: `Template: ${templateName}`,
        templateName,
        status: "FAILED",
        errorMessage: err,
        links,
        assignedUserId
      });
      throw new Error(err);
    }

    const result = await client.sendTemplate(recipientPhone, templateName, "en", components);
    const status = result.success ? "SENT" : "FAILED";
    const errorMessage = result.error;

    await this.recordMessageLog({
      messageId: result.messageId,
      direction: "OUTBOUND",
      recipientPhone,
      messageType: "TEMPLATE",
      content: `Template: ${templateName}`,
      templateName,
      status,
      errorMessage,
      links,
      assignedUserId
    });

    if (!result.success) {
      throw new Error(errorMessage || "Meta Cloud API rejected template transmission.");
    }

    return result;
  }

  /**
   * Dispatches freeform text message (session communication)
   */
  static async sendTextMessage(
    recipientPhone: string,
    text: string,
    links?: WhatsAppMessageLinks,
    replyToId?: string,
    assignedUserId?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const client = await this.getClient();
    if (!client) {
      throw new Error("WhatsApp credentials not configured.");
    }

    const result = await client.sendTextMessage(recipientPhone, text, true, replyToId);
    const status = result.success ? "SENT" : "FAILED";

    await this.recordMessageLog({
      messageId: result.messageId,
      direction: "OUTBOUND",
      recipientPhone,
      messageType: "TEXT",
      content: text,
      status,
      errorMessage: result.error,
      replyToId,
      links,
      assignedUserId
    });

    if (!result.success) {
      throw new Error(result.error || "Meta Cloud API session text transmission failed.");
    }

    return result;
  }

  /**
   * Dispatches media or document message (Invoices, Quotations, Previews)
   */
  static async sendMediaMessage(
    recipientPhone: string,
    mediaType: "IMAGE" | "VIDEO" | "DOCUMENT" | "PDF" | "VOICE_NOTE",
    mediaSource: { link: string; caption?: string; filename?: string },
    links?: WhatsAppMessageLinks,
    assignedUserId?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string }> {
    const client = await this.getClient();
    if (!client) {
      throw new Error("WhatsApp credentials not configured.");
    }

    let result: any;
    if (mediaType === "IMAGE") {
      result = await client.sendImageMessage(recipientPhone, mediaSource);
    } else if (mediaType === "VIDEO") {
      result = await client.sendVideoMessage(recipientPhone, mediaSource);
    } else if (mediaType === "VOICE_NOTE") {
      result = await client.sendAudioMessage(recipientPhone, mediaSource);
    } else {
      result = await client.sendDocumentMessage(recipientPhone, mediaSource);
    }

    await this.recordMessageLog({
      messageId: result.messageId,
      direction: "OUTBOUND",
      recipientPhone,
      messageType: mediaType,
      content: mediaSource.caption || `Media: ${mediaSource.filename || mediaSource.link}`,
      status: result.success ? "SENT" : "FAILED",
      errorMessage: result.error,
      links,
      assignedUserId,
      metadata: mediaSource
    });

    if (!result.success) {
      throw new Error(result.error || `Meta Cloud API ${mediaType} transmission failed.`);
    }

    return result;
  }

  /**
   * Permanently links and logs conversations in both WhatsAppLog and global Communication tables
   */
  static async recordMessageLog(record: WhatsAppConversationRecord): Promise<void> {
    try {
      // 1. Create dedicated WhatsApp audit log
      await prisma.whatsAppLog.create({
        data: {
          messageId: record.messageId,
          templateName: record.templateName || null,
          messageType: record.messageType || "TEXT",
          direction: record.direction === "INBOUND" ? "INBOUND" : "OUTBOUND",
          recipientPhone: record.recipientPhone,
          status: record.status === "DELIVERED" || record.status === "READ" ? "DELIVERED" 
                : record.status === "FAILED" ? "FAILED" 
                : record.status === "SENT" ? "SENT" : "PENDING",
          errorMessage: record.errorMessage || null,
          scheduledFor: record.scheduledAt || null,
          leadId: record.links?.leadId || null,
          clientId: record.links?.clientId || null,
          projectId: record.links?.projectId || null,
          shootId: record.links?.shootId || null,
          replyToId: record.replyToId || null,
          assignedUserId: record.assignedUserId || null,
          metadata: record.metadata || {},
        }
      });

      // 2. Register inside centralized Conversation Center (Communication table)
      await prisma.communication.create({
        data: {
          type: "WHATSAPP",
          direction: record.direction === "INBOUND" ? "INBOUND" : "OUTBOUND",
          subject: record.templateName ? `WhatsApp Template: ${record.templateName}` : `WhatsApp (${record.messageType})`,
          body: record.content || `[${record.messageType}]`,
          status: record.status,
          error: record.errorMessage || null,
          wamid: record.messageId || null,
          templateUsed: record.templateName || null,
          replyToId: record.replyToId || null,
          assignedUser: record.assignedUserId || null,
          scheduledAt: record.scheduledAt || null,
          leadId: record.links?.leadId || null,
          clientId: record.links?.clientId || null,
          projectId: record.links?.projectId || null,
          shootId: record.links?.shootId || null,
          invoiceId: record.links?.invoiceId || null,
          quotationId: record.links?.quotationId || null,
          paymentId: record.links?.paymentId || null,
        }
      });
    } catch (error: any) {
      Logger.error("Error logging WhatsApp conversation record to database", error.message);
    }
  }

  /**
   * Synchronizes message delivery status updates from inbound Meta webhooks
   */
  static async updateDeliveryStatus(messageId: string, status: "SENT" | "DELIVERED" | "READ" | "FAILED", error?: string): Promise<void> {
    try {
      const waStatus = status === "DELIVERED" || status === "READ" ? "DELIVERED" : status === "FAILED" ? "FAILED" : "SENT";

      await prisma.whatsAppLog.updateMany({
        where: { messageId },
        data: { status: waStatus as any, errorMessage: error || null }
      });

      await prisma.communication.updateMany({
        where: { wamid: messageId },
        data: { status, error: error || null }
      });
    } catch (e: any) {
      Logger.error("Failed to sync delivery status in repository", e.message);
    }
  }

  /**
   * Retrieves conversation history linked to specific CRM entities
   */
  static async getConversationHistory(filter: { clientId?: string; leadId?: string; projectId?: string; shootId?: string; limit?: number }) {
    return prisma.communication.findMany({
      where: {
        type: "WHATSAPP",
        OR: [
          filter.clientId ? { clientId: filter.clientId } : undefined,
          filter.leadId ? { leadId: filter.leadId } : undefined,
          filter.projectId ? { projectId: filter.projectId } : undefined,
          filter.shootId ? { shootId: filter.shootId } : undefined,
        ].filter(Boolean) as any,
      },
      orderBy: { sentAt: "desc" },
      take: filter.limit || 50,
    });
  }

  /**
   * Retrieves Shoot Reminder policy settings from database without hardcoded values
   */
  static async getShootReminderPolicy(): Promise<ShootReminderPolicyConfig> {
    const setting = await prisma.setting.findUnique({
      where: { key: WHATSAPP_CONSTANTS.SETTINGS_SHOOT_REMINDER_KEY }
    });

    if (setting && setting.value) {
      const val = setting.value as any;
      return {
        enabled: val.enabled ?? true,
        timingHoursBefore: Number(val.timingHoursBefore || val.hoursBefore || 24),
      };
    }

    // Return official Random Frames default: Enabled = True, 24 Hours Before Shoot
    return {
      enabled: true,
      timingHoursBefore: WHATSAPP_CONSTANTS.DEFAULT_SHOOT_REMINDER_HOURS,
    };
  }

  /**
   * Updates Shoot Reminder policy settings
   */
  static async updateShootReminderPolicy(policy: ShootReminderPolicyConfig): Promise<void> {
    await prisma.setting.upsert({
      where: { key: WHATSAPP_CONSTANTS.SETTINGS_SHOOT_REMINDER_KEY },
      update: { value: policy as any },
      create: {
        key: WHATSAPP_CONSTANTS.SETTINGS_SHOOT_REMINDER_KEY,
        value: policy as any
      },
    });
  }

  /**
   * Moves failed jobs to Dead Letter Queue after exhausting maximum retry thresholds
   */
  static async moveToDeadLetterQueue(jobId: string, errorReason: string): Promise<void> {
    try {
      await prisma.integrationJobQueue.update({
        where: { id: jobId },
        data: {
          status: "DEAD_LETTER" as any,
          lastError: `DEAD_LETTER_EXHAUSTED: ${errorReason}`
        }
      });
    } catch (e: any) {
      Logger.error(`Failed to transition job ${jobId} to DEAD_LETTER queue`, e.message);
    }
  }

  /**
   * Retrieves active integration settings for UI monitoring
   */
  static async getSettings() {
    return prisma.integrationSettings.findUnique({
      where: { provider: WHATSAPP_CONSTANTS.PROVIDER_ID }
    });
  }
}
