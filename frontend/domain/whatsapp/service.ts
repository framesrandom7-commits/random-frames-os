import { WhatsAppRepository } from "./repository";
import { WhatsAppTemplateComponent, WhatsAppMessageLinks, WhatsAppConversationRecord } from "./types";
import { WhatsAppTemplateRegistry } from "./templates";
import { WHATSAPP_CONSTANTS } from "./constants";
import { QueueManager } from "@/domain/integrations/queue-manager";
import { AuditManager } from "@/domain/integrations/audit-manager";
import { NotificationCenter, NotificationChannel } from "@/domain/integrations/notification-manager";
import { RbacDomainService } from "@/domain/rbac/service";
import { logActivity } from "@/lib/timeline";
import { prisma } from "@/lib/prisma";
import { Logger } from "@/lib/logger";
import { MetaWhatsAppClient } from "@/lib/whatsapp";

/**
 * WhatsAppDomainService
 * Encapsulates 100% of WhatsApp domain business logic, media optimization validation, 
 * role-aware notification routing, shoot reminder policy execution, and webhook processing.
 */
export class WhatsAppDomainService {
  /**
   * Dispatches a structured template message through the Queue Manager after business validation
   */
  static async sendTemplateMessage(
    to: string,
    templateName: string,
    components: WhatsAppTemplateComponent[] = [],
    links?: WhatsAppMessageLinks,
    assignedUserId?: string
  ): Promise<boolean> {
    try {
      // 1. Verify Client Communication Preference if linked to an existing client or lead
      const shouldSend = await this.validateCommunicationPreference(links);
      if (!shouldSend) {
        Logger.info(`[WhatsAppService] Skipping automated WhatsApp delivery for ${to} due to Client Communication Preference.`);
        await AuditManager.logIntegrationEvent(
          WHATSAPP_CONSTANTS.PROVIDER_ID,
          "DELIVERY_SKIPPED_PREFERENCE",
          `Skipped template ${templateName} to ${to} per Client Communication Preference`,
          { to, templateName, links }
        );
        return false;
      }

      // 2. Verify template registry recognition
      if (!WhatsAppTemplateRegistry.isValidTemplate(templateName)) {
        throw new Error(`Template '${templateName}' is not registered in official Random Frames OS registry.`);
      }

      // 3. Dispatch through Queue Manager for background reliability & retry resilience
      await QueueManager.pushJob(WHATSAPP_CONSTANTS.PROVIDER_ID, "SEND_TEMPLATE", {
        recipientPhone: to,
        templateName,
        components,
        links,
        assignedUserId,
      });

      await AuditManager.logIntegrationEvent(
        WHATSAPP_CONSTANTS.PROVIDER_ID,
        "QUEUE_TEMPLATE",
        `Queued template ${templateName} to ${to}`,
        { to, templateName }
      );

      return true;
    } catch (error: any) {
      Logger.error(`WhatsAppDomainService failed to queue template ${templateName}`, error.message);
      await this.notifySystemFailure("WhatsApp Template Queue Error", `Failed to queue ${templateName}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Dispatches a media or document message (Invoices, Quotations, Previews, Business Cards)
   */
  static async sendMediaMessage(
    to: string,
    mediaType: "IMAGE" | "VIDEO" | "DOCUMENT" | "PDF" | "VOICE_NOTE",
    mediaSource: { link: string; caption?: string; filename?: string; fileSizeMb?: number },
    links?: WhatsAppMessageLinks,
    assignedUserId?: string
  ): Promise<boolean> {
    try {
      // 1. Validate Media Optimization and File Size limits
      this.validateMediaSize(mediaType, mediaSource.fileSizeMb);

      // 2. Dispatch job via Queue Manager
      await QueueManager.pushJob(WHATSAPP_CONSTANTS.PROVIDER_ID, "SEND_MEDIA", {
        recipientPhone: to,
        mediaType,
        mediaSource,
        links,
        assignedUserId,
      });

      await AuditManager.logIntegrationEvent(
        WHATSAPP_CONSTANTS.PROVIDER_ID,
        "QUEUE_MEDIA",
        `Queued ${mediaType} message to ${to}`,
        { to, mediaType, link: mediaSource.link }
      );

      return true;
    } catch (error: any) {
      Logger.error(`WhatsAppDomainService failed to send ${mediaType}`, error.message);
      await this.notifySystemFailure("WhatsApp Media Optimization & Transmission Error", error.message);
      throw error;
    }
  }

  /**
   * Dispatches freeform text messaging within active session window
   */
  static async sendTextMessage(
    to: string,
    text: string,
    links?: WhatsAppMessageLinks,
    replyToId?: string,
    assignedUserId?: string
  ): Promise<boolean> {
    try {
      await QueueManager.pushJob(WHATSAPP_CONSTANTS.PROVIDER_ID, "SEND_TEXT", {
        recipientPhone: to,
        text,
        links,
        replyToId,
        assignedUserId,
      });
      return true;
    } catch (error: any) {
      Logger.error("Failed to queue text message", error.message);
      throw error;
    }
  }

  /**
   * Executes queued jobs (Called by Background Job Worker / Queue Manager)
   */
  static async executeQueuedJob(action: string, payload: any, jobId?: string): Promise<any> {
    try {
      let result: any;
      if (action === "SEND_TEMPLATE") {
        result = await WhatsAppRepository.sendTemplate(
          payload.recipientPhone,
          payload.templateName,
          payload.components,
          payload.links,
          payload.assignedUserId
        );
      } else if (action === "SEND_MEDIA") {
        result = await WhatsAppRepository.sendMediaMessage(
          payload.recipientPhone,
          payload.mediaType,
          payload.mediaSource,
          payload.links,
          payload.assignedUserId
        );
      } else if (action === "SEND_TEXT") {
        result = await WhatsAppRepository.sendTextMessage(
          payload.recipientPhone,
          payload.text,
          payload.links,
          payload.replyToId,
          payload.assignedUserId
        );
      } else {
        throw new Error(`Unsupported WhatsApp queue action: ${action}`);
      }

      // Record Timeline milestone upon successful delivery
      if (result.success && payload.links) {
        await logActivity({
          type: "COMMUNICATION_SENT" as any,
          description: `WhatsApp (${action.replace("SEND_", "")}) delivered to ${payload.recipientPhone}`,
          metadata: { messageId: result.messageId, template: payload.templateName },
          leadId: payload.links.leadId,
          clientId: payload.links.clientId,
          projectId: payload.links.projectId,
          shootId: payload.links.shootId,
          invoiceId: payload.links.invoiceId,
          paymentId: payload.links.paymentId,
        });
      }

      return result;
    } catch (error: any) {
      Logger.error(`WhatsApp job ${jobId} (${action}) failed execution`, error.message);
      
      if (jobId && payload.retryCount >= WHATSAPP_CONSTANTS.MAX_RETRIES) {
        await WhatsAppRepository.moveToDeadLetterQueue(jobId, error.message);
        await this.notifySystemFailure("WhatsApp Dead Letter Queue Warning", `Job ${jobId} permanently failed after exhausting retries: ${error.message}`);
      }
      throw error;
    }
  }

  /**
   * Triggers official 24-hour single Shoot Reminder automation policy
   */
  static async triggerShootReminder(shootId: string): Promise<boolean> {
    try {
      // 1. Check configurable policy without hardcoding timing or enablement
      const policy = await WhatsAppRepository.getShootReminderPolicy();
      if (!policy.enabled) {
        Logger.info(`[WhatsAppService] Shoot Reminder policy is currently disabled in Settings. Skipping shoot ${shootId}.`);
        return false;
      }

      const shoot = await prisma.shoot.findUnique({
        where: { id: shootId },
        include: { project: { include: { client: true } } }
      });

      if (!shoot || !shoot.project?.client?.phone) {
        return false;
      }

      const client = shoot.project.client;
      const dateStr = shoot.date ? new Date(shoot.date).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' }) : "Confirmed Date";
      const timeStr = shoot.startTime || "As scheduled";
      const locationStr = shoot.location || "On Location";
      const contactStr = shoot.contactPerson || client.contactPerson || "Account Manager";
      const notesStr = shoot.specialRequests || shoot.notes || "Please arrive 15 mins prior to call time.";
      const replyStr = "Reply with 'RESCHEDULE' immediately if schedule adjustments are required.";

      // 2. Build dynamic parameters for SHOOT_REMINDER
      const components = WhatsAppTemplateRegistry.buildTextComponents([
        client.businessName || client.contactPerson || "Client",
        shoot.project.title || shoot.title,
        dateStr,
        timeStr,
        locationStr,
        contactStr,
        notesStr,
        replyStr
      ]);

      const links: WhatsAppMessageLinks = {
        clientId: client.id,
        projectId: shoot.projectId,
        shootId: shoot.id,
      };

      // 3. Send via Queue Manager
      const success = await this.sendTemplateMessage(
        client.phone as string,
        WhatsAppTemplateRegistry.TEMPLATES.SHOOT_REMINDER.id,
        components,
        links
      );

      if (success) {
        // Automatically generate Activity log and operational notification
        await logActivity({
          type: "INTEGRATION_SYNC" as any,
          description: `24h Shoot Reminder sent for '${shoot.title}' to ${client.phone}`,
          metadata: { shootId, timingHoursBefore: policy.timingHoursBefore },
          clientId: client.id,
          projectId: shoot.projectId,
          shootId: shoot.id,
        });

        await NotificationCenter.dispatch({
          title: "Shoot Reminder Dispatched ⏰",
          message: `Automated 24h reminder delivered for shoot: ${shoot.title}`,
          type: "CLIENT_COMMUNICATION" as any,
          priority: "HIGH" as any,
          shootId: shoot.id,
          projectId: shoot.projectId,
          clientId: client.id,
          channels: [NotificationChannel.IN_APP],
        });
      }

      return success;
    } catch (error: any) {
      Logger.error(`Error executing shoot reminder policy for ${shootId}`, error.message);
      return false;
    }
  }

  /**
   * Processes inbound Meta Cloud API Webhooks with message recovery and synchronization
   */
  static async processWebhookPayload(rawBody: any): Promise<{ processedMessages: number; processedStatuses: number }> {
    const events = MetaWhatsAppClient.parseWebhookEvent(rawBody);
    let msgCount = 0;
    let statusCount = 0;

    for (const ev of events) {
      if (ev.type === "MESSAGE" && ev.sender && ev.content) {
        msgCount++;
        // Automatically correlate sender phone with CRM Lead or Client
        const links = await this.lookupEntityLinksByPhone(ev.sender);
        const textContent = ev.content?.text?.body || ev.content?.caption || `[Received ${ev.content.type || "Message"}]`;

        await WhatsAppRepository.recordMessageLog({
          messageId: ev.messageId,
          direction: "INBOUND",
          sender: ev.sender,
          recipientPhone: ev.sender,
          messageType: ev.content?.type?.toUpperCase() || "TEXT",
          content: textContent,
          status: "DELIVERED",
          links,
          metadata: ev.raw,
        });

        // Emit Operational Notification to Co-Founder & Founder regarding client reply
        await NotificationCenter.dispatch({
          title: `💬 New WhatsApp Reply from ${ev.sender}`,
          message: textContent.slice(0, 100),
          type: "INFO" as any,
          priority: "HIGH" as any,
          clientId: links?.clientId,
          leadId: links?.leadId,
          projectId: links?.projectId,
          channels: [NotificationChannel.IN_APP],
        });

        if (links?.clientId || links?.leadId) {
          await logActivity({
            type: "INTEGRATION_SYNC" as any,
            description: `Inbound WhatsApp message received from ${ev.sender}`,
            metadata: { messageId: ev.messageId, text: textContent.slice(0, 50) },
            clientId: links.clientId,
            leadId: links.leadId,
            projectId: links.projectId,
          });
        }
      } else if (ev.type === "STATUS_UPDATE" && ev.messageId && ev.status) {
        statusCount++;
        await WhatsAppRepository.updateDeliveryStatus(
          ev.messageId,
          ev.status as any,
          ev.raw?.errors?.[0]?.title || ev.raw?.errors?.[0]?.message
        );
      }
    }

    return { processedMessages: msgCount, processedStatuses: statusCount };
  }

  /**
   * Helper to inspect client preferred communication channel (WhatsApp vs Email/Phone)
   */
  private static async validateCommunicationPreference(links?: WhatsAppMessageLinks): Promise<boolean> {
    if (!links?.clientId && !links?.leadId) return true;

    try {
      if (links.clientId) {
        const client = await prisma.client.findUnique({ where: { id: links.clientId }, select: { preferredContactMethod: true } });
        if (client && client.preferredContactMethod && client.preferredContactMethod !== "WHATSAPP" && client.preferredContactMethod !== "PHONE") {
          return false;
        }
      }
    } catch (e) {
      // Ignore error and proceed
    }
    return true;
  }

  /**
   * Validates file size limits for WhatsApp Media Optimization
   */
  private static validateMediaSize(mediaType: string, sizeMb?: number): void {
    if (!sizeMb) return;
    if (mediaType === "IMAGE" && sizeMb > WHATSAPP_CONSTANTS.MEDIA_LIMITS.IMAGE_MB) {
      throw new Error(`Image size (${sizeMb}MB) exceeds official WhatsApp limit (${WHATSAPP_CONSTANTS.MEDIA_LIMITS.IMAGE_MB}MB).`);
    }
    if ((mediaType === "VIDEO" || mediaType === "VOICE_NOTE") && sizeMb > WHATSAPP_CONSTANTS.MEDIA_LIMITS.VIDEO_MB) {
      throw new Error(`Video/Audio size (${sizeMb}MB) exceeds WhatsApp limit (${WHATSAPP_CONSTANTS.MEDIA_LIMITS.VIDEO_MB}MB).`);
    }
    if ((mediaType === "DOCUMENT" || mediaType === "PDF") && sizeMb > WHATSAPP_CONSTANTS.MEDIA_LIMITS.DOCUMENT_MB) {
      throw new Error(`Document size (${sizeMb}MB) exceeds WhatsApp limit (${WHATSAPP_CONSTANTS.MEDIA_LIMITS.DOCUMENT_MB}MB).`);
    }
  }

  /**
   * Correlates incoming phone numbers with CRM Client or Lead profiles
   */
  private static async lookupEntityLinksByPhone(phone: string): Promise<WhatsAppMessageLinks | undefined> {
    try {
      const cleanPhone = phone.replace(/[^0-9]/g, "");
      const client = await prisma.client.findFirst({
        where: { OR: [{ phone: { contains: cleanPhone } }, { whatsapp: { contains: cleanPhone } }] }
      });
      if (client) {
        const activeProject = await prisma.project.findFirst({
          where: { clientId: client.id, status: { notIn: ["COMPLETED", "CANCELLED"] as any } },
          orderBy: { createdAt: "desc" }
        });
        return { clientId: client.id, projectId: activeProject?.id };
      }

      const lead = await prisma.lead.findFirst({
        where: { OR: [{ phone: { contains: cleanPhone } }, { whatsapp: { contains: cleanPhone } }] }
      });
      if (lead) return { leadId: lead.id };
    } catch (e) {
      // Return empty links if search errors
    }
    return undefined;
  }

  /**
   * Helper to broadcast system developer or debugging errors exclusively to Founder Super Admin
   */
  private static async notifySystemFailure(title: string, message: string): Promise<void> {
    try {
      await NotificationCenter.dispatch({
        title: `⚠️ [Admin System Debug] ${title}`,
        message,
        type: "INTEGRATION_SYNC_ERROR" as any, // Filtered out from operational staff (Co-Founder) via RbacDomainService
        priority: "HIGH" as any,
        channels: [NotificationChannel.IN_APP],
      });
    } catch (e) {
      Logger.error("Failed to emit developer debugging notification", e);
    }
  }
}
