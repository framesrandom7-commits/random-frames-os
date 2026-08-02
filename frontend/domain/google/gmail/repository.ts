import { prisma } from "@/lib/prisma";
import { Logger } from "@/lib/logger";

export interface EmailRecordDto {
  subject: string;
  body: string;
  direction: "INBOUND" | "OUTBOUND";
  status?: string;
  error?: string;
  clientId?: string;
  leadId?: string;
  projectId?: string;
  invoiceId?: string;
  quotationId?: string;
  paymentId?: string;
  shootId?: string;
  eventId?: string;
  templateUsed?: string;
  replyToId?: string;
  createdBy?: string;
}

/**
 * Gmail Repository layer responsible for persisting email records and querying unified communication timelines.
 * Uses existing Communication architectural pillar without duplicate tables.
 */
export class GmailRepository {
  /**
   * Records a sent or received email in the central Communication table.
   */
  static async logEmail(dto: EmailRecordDto) {
    try {
      const record = await prisma.communication.create({
        data: {
          type: "EMAIL" as any,
          direction: dto.direction as any,
          subject: dto.subject,
          body: dto.body,
          status: dto.status || "DELIVERED",
          error: dto.error,
          clientId: dto.clientId,
          leadId: dto.leadId,
          projectId: dto.projectId,
          invoiceId: dto.invoiceId,
          quotationId: dto.quotationId,
          paymentId: dto.paymentId,
          shootId: dto.shootId,
          eventId: dto.eventId,
          templateUsed: dto.templateUsed,
          replyToId: dto.replyToId,
          createdBy: dto.createdBy || "system",
        }
      });
      return record;
    } catch (e: any) {
      Logger.error("[GmailRepository] Failed to log email communication:", e.message);
      throw e;
    }
  }

  /**
   * Updates tracking status of an email (e.g. SENT -> DELIVERED -> READ or FAILED)
   */
  static async updateEmailStatus(id: string, status: string, error?: string) {
    try {
      await prisma.communication.update({
        where: { id },
        data: { status, error }
      });
      return true;
    } catch (e: any) {
      Logger.error(`[GmailRepository] Failed to update email status for ${id}:`, e.message);
      return false;
    }
  }

  /**
   * Retrieves conversation threads linked to a parent email or client/project
   */
  static async getThread(replyToId: string) {
    return prisma.communication.findMany({
      where: {
        OR: [{ id: replyToId }, { replyToId: replyToId }],
        type: "EMAIL" as any
      },
      orderBy: { sentAt: "asc" }
    });
  }

  /**
   * Unified Communication Timeline Generator.
   * Merges Phone, WhatsApp, Email, Meetings, Internal Notes, Invoices, Payments, Preview & Delivery links chronologically.
   */
  static async getUnifiedTimeline(filter: { clientId?: string; projectId?: string; leadId?: string; limit?: number }) {
    const limit = filter.limit || 50;
    const whereClause: any = {};
    if (filter.clientId) whereClause.clientId = filter.clientId;
    if (filter.projectId) whereClause.projectId = filter.projectId;
    if (filter.leadId) whereClause.leadId = filter.leadId;

    try {
      const communications = await prisma.communication.findMany({
        where: whereClause,
        orderBy: { sentAt: "desc" },
        take: limit
      });

      const activities = await prisma.activity.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit
      });

      // Merge and normalize items into one unified chronological stream
      const unified: Array<{
        id: string;
        timestamp: Date;
        channel: string;
        direction: string;
        title: string;
        content: string;
        status: string;
        metadata: any;
      }> = [];

      for (const c of communications) {
        unified.push({
          id: c.id,
          timestamp: c.sentAt,
          channel: c.type, // EMAIL, WHATSAPP, CALL, MEETING, MESSAGE, SMS
          direction: c.direction,
          title: c.subject || `${c.type} (${c.direction})`,
          content: c.body,
          status: c.status,
          metadata: { templateUsed: c.templateUsed, replyToId: c.replyToId, wamid: c.wamid }
        });
      }

      for (const a of activities) {
        unified.push({
          id: a.id,
          timestamp: a.createdAt,
          channel: a.type === ("NOTE" as any) ? "INTERNAL_NOTE" : "SYSTEM_MILESTONE",
          direction: "INTERNAL",
          title: `Milestone: ${a.type}`,
          content: a.description,
          status: "COMPLETED",
          metadata: a.metadata
        });
      }

      // Sort chronological descending
      unified.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      return unified.slice(0, limit);
    } catch (e: any) {
      Logger.error("[GmailRepository] Failed to generate unified timeline:", e.message);
      return [];
    }
  }
}
