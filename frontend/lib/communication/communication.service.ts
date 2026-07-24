import { prisma } from "@/lib/prisma";
import { Communication, CommunicationDirection } from "@prisma/client";
import { EmailProvider } from "./providers/email.provider";
import { WhatsAppProvider } from "./providers/whatsapp.provider";
import { EventBus } from "@/lib/workflow/event-bus";
import { WorkflowEvent } from "@/lib/workflow/events";

export interface SendCommunicationParams {
  type: "EMAIL" | "MESSAGE";
  direction: "INBOUND" | "OUTBOUND" | "INTERNAL";
  subject?: string;
  body: string;
  
  leadId?: string;
  clientId?: string;
  projectId?: string;
  invoiceId?: string;
  quotationId?: string;
  eventId?: string;

  recipientEmail?: string;
  recipientPhone?: string;
  
  createdBy?: string;
}

export class CommunicationService {
  
  private static emailProvider = new EmailProvider();
  private static whatsappProvider = new WhatsAppProvider();

  /**
   * Send a communication via appropriate provider and log it
   */
  public static async sendCommunication(params: SendCommunicationParams): Promise<Communication> {
    
    let status = "SENT";
    let errorMsg = null;
    
    // 1. Delegate to Providers
    try {
      if (params.type === "EMAIL" && params.recipientEmail) {
        await this.emailProvider.sendEmail(params.recipientEmail, params.subject || "No Subject", params.body);
      } else if (params.type === "MESSAGE" && params.recipientPhone) {
        // Generates and handles whatsapp logic
        await this.whatsappProvider.sendMessage(params.recipientPhone, params.body);
      }
    } catch (error: any) {
      status = "FAILED";
      errorMsg = error.message;
    }

    // 2. Log Communication to DB (Single Source of Truth)
    const communication = await prisma.communication.create({
      data: {
        type: params.type,
        direction: params.direction,
        subject: params.subject,
        body: params.body,
        status,
        error: errorMsg,
        leadId: params.leadId,
        clientId: params.clientId,
        projectId: params.projectId,
        invoiceId: params.invoiceId,
        quotationId: params.quotationId,
        eventId: params.eventId,
        createdBy: params.createdBy
      }
    });

    // 3. Emit Workflow Event for timeline integration
    if (status === "SENT") {
      if (params.type === "EMAIL") {
        EventBus.publish(WorkflowEvent.EMAIL_SENT, { 
          communicationId: communication.id, 
          projectId: params.projectId, 
          clientId: params.clientId,
          userId: params.createdBy 
        });
      } else if (params.type === "MESSAGE") {
        EventBus.publish(WorkflowEvent.WHATSAPP_SHARED, { 
          communicationId: communication.id, 
          projectId: params.projectId, 
          clientId: params.clientId,
          userId: params.createdBy 
        });
      }
    }

    return communication;
  }

  /**
   * Log an inbound communication (reply)
   */
  public static async receiveCommunication(params: SendCommunicationParams): Promise<Communication> {
    const communication = await prisma.communication.create({
      data: {
        type: params.type,
        direction: "INBOUND",
        subject: params.subject,
        body: params.body,
        status: "RECEIVED",
        leadId: params.leadId,
        clientId: params.clientId,
        projectId: params.projectId,
        createdBy: params.createdBy
      }
    });

    return communication;
  }

  /**
   * Fetch communication history for an entity
   */
  public static async getHistory(where: {
    clientId?: string;
    leadId?: string;
    projectId?: string;
  }): Promise<Communication[]> {
    return prisma.communication.findMany({
      where,
      orderBy: { sentAt: 'desc' },
      include: {
        attachments: true
      }
    });
  }
}
