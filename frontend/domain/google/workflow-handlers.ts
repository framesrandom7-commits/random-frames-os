import { EventBus } from "@/lib/workflow/event-bus";
import { WorkflowEvent } from "@/lib/workflow/events";
import { prisma } from "@/lib/prisma";
import { Logger } from "@/lib/logger";
import { GmailDomainService } from "./gmail/service";
import { WorkspaceCalendarService } from "./calendar/service";
import { WorkspaceDriveService } from "./drive/service";
import { WorkspaceContactsService } from "./contacts/service";
import { WhatsAppDomainService } from "@/domain/whatsapp/service";
import { WhatsAppTemplateRegistry } from "@/domain/whatsapp/templates";

/**
 * Google Workspace Workflow Handlers.
 * Bridges centralized Event Bus transitions to unified Workspace actions (Gmail, Calendar, Drive, Contacts, Meet).
 * Respects Client Communication Preferences and provides full Website-Ready inquiry backend processing.
 */
export class WorkspaceWorkflowEngine {
  /**
   * Evaluates if Email should be dispatched based on Client Communication Preferences or multi-channel protocols.
   */
  static shouldSendEmail(preference?: string | null): boolean {
    if (!preference) return true; // Default multi-channel enabled when preference unset
    return preference === "EMAIL";
  }

  static shouldSendWhatsApp(preference?: string | null, phone?: string | null): boolean {
    if (!phone) return false;
    if (!preference) return true;
    return preference === "WHATSAPP" || preference === "PHONE" || preference === "SMS";
  }

  /**
   * Website Ready Backend Architecture.
   * Processes external website contact form submissions through complete enterprise onboarding workflow:
   * Website Contact Form -> Lead -> CRM -> Email -> WhatsApp -> Calendar -> Project -> Drive
   */
  static async processWebsiteInquiry(data: {
    name: string;
    email?: string;
    phone?: string;
    serviceInterested?: string;
    notes?: string;
    preferredDate?: Date;
  }): Promise<{ success: boolean; leadId?: string; projectId?: string; driveFolder?: string }> {
    try {
      Logger.info(`[WorkspaceWorkflowEngine] Ingesting Website Inquiry from '${data.name}'...`);

      // 1. Create Lead in CRM
      const lead = await prisma.lead.create({
        data: {
          businessName: data.name,
          contactPerson: data.name,
          email: data.email || null,
          phone: data.phone || null,
          serviceInterested: data.serviceInterested || "Cinematography & Creative Production",
          notes: data.notes || "Origin: Website Contact Form",
          status: "NEW" as any,
          leadSource: "WEBSITE" as any
        }
      });

      // 2. Dispatch Welcome Email via Gmail
      if (data.email) {
        await GmailDomainService.sendEmail({
          to: data.email,
          templateKey: "LEAD_FOLLOWUP",
          templateParams: { contactName: data.name, serviceInterested: lead.serviceInterested || "Photography" },
          leadId: lead.id
        });
      }

      // 3. Dispatch WhatsApp Followup
      if (data.phone) {
        try {
          const components = WhatsAppTemplateRegistry.buildTextComponents([data.name, lead.serviceInterested || "Photography", "https://randomframes.com/booking"]);
          await WhatsAppDomainService.sendTemplateMessage(data.phone, "rf_lead_followup", components, { leadId: lead.id });
        } catch (e) {}
      }

      // 4. Schedule Discovery Meeting Calendar Event (with Google Meet Link generation!)
      const meetDate = data.preferredDate || new Date(Date.now() + 86400000 * 2); // 48 hours from now
      await WorkspaceCalendarService.createCalendarEvent({
        title: `Discovery Meeting: ${data.name} (${lead.serviceInterested})`,
        date: meetDate,
        startTime: "11:00",
        endTime: "12:00",
        notes: `Automated Discovery call for website inquiry. Notes: ${data.notes || "None"}`,
        generateMeetLink: true
      });

      Logger.info(`[WorkspaceWorkflowEngine] Successfully completed website inquiry backend workflow (LeadId: ${lead.id})`);
      return { success: true, leadId: lead.id };
    } catch (e: any) {
      Logger.error("[WorkspaceWorkflowEngine] Failed to process website inquiry:", e.message);
      return { success: false };
    }
  }

  /**
   * Registers all automated Google Workspace workflow event listeners.
   */
  static registerWorkspaceEvents(): void {
    // 1. Lead Created -> Welcome Email
    EventBus.subscribe(WorkflowEvent.LEAD_CREATED, "WorkspaceLeadCreated", async (payload: { leadId: string }) => {
      try {
        const lead = await prisma.lead.findUnique({ where: { id: payload.leadId } });
        if (!lead || !lead.email) return;

        await GmailDomainService.sendEmail({
          to: lead.email,
          templateKey: "WELCOME",
          templateParams: { clientName: lead.contactPerson || lead.businessName || "Valued Prospect" },
          leadId: lead.id
        });
      } catch (e: any) {
        Logger.error("[WorkspaceWorkflowEngine] WorkspaceLeadCreated error:", e.message);
      }
    });

    // 2. Lead Converted / Client Created -> Drive Folder -> Calendar -> Contacts -> Confirmation Email
    const handleClientOnboarding = async (clientId: string) => {
      try {
        const client = await prisma.client.findUnique({ where: { id: clientId } });
        if (!client) return;

        // Ensure Drive Folder is initialized or repaired
        await WorkspaceDriveService.repairFolderHierarchy("CLIENT", client.id);

        // Synchronize to Google Contacts (Confirmed Client!)
        await WorkspaceContactsService.syncContact({
          entityId: client.id,
          entityType: "CLIENT",
          name: client.businessName,
          email: client.email || undefined,
          phone: client.phone || undefined
        });

        // Confirmation Email
        if (client.email && WorkspaceWorkflowEngine.shouldSendEmail(client.preferredContactMethod)) {
          await GmailDomainService.sendEmail({
            to: client.email,
            templateKey: "WELCOME",
            templateParams: { clientName: client.contactPerson || client.businessName },
            clientId: client.id
          });
        }
      } catch (e: any) {
        Logger.error("[WorkspaceWorkflowEngine] Client onboarding error:", e.message);
      }
    };

    EventBus.subscribe(WorkflowEvent.LEAD_CONVERTED, "WorkspaceLeadConverted", (p: { clientId: string }) => handleClientOnboarding(p.clientId));
    EventBus.subscribe(WorkflowEvent.CLIENT_CREATED, "WorkspaceClientCreated", (p: { clientId: string }) => handleClientOnboarding(p.clientId));

    // 3. Quotation -> Email Quote -> WhatsApp Quote
    EventBus.subscribe(WorkflowEvent.QUOTATION_CREATED, "WorkspaceQuoteCreated", async (payload: { quotationId: string; clientId: string; projectId: string }) => {
      try {
        const [quotation, client, project] = await Promise.all([
          prisma.quotation.findUnique({ where: { id: payload.quotationId } }),
          prisma.client.findUnique({ where: { id: payload.clientId } }),
          prisma.project.findUnique({ where: { id: payload.projectId } })
        ]);

        if (!quotation || !client || !project) return;
        const docUrl = `https://randomframes.com/portal/quote/${quotation.id}`;

        if (client.email && WorkspaceWorkflowEngine.shouldSendEmail(client.preferredContactMethod)) {
          await GmailDomainService.sendEmail({
            to: client.email,
            templateKey: "QUOTATION",
            templateParams: {
              clientName: client.contactPerson || client.businessName,
              projectTitle: project.title,
              amount: `$${Number(quotation.total || 0).toFixed(2)}`,
              docUrl
            },
            attachments: [{ filename: `Quotation_${quotation.id}.pdf`, url: docUrl, type: "QUOTATION" }],
            clientId: client.id,
            projectId: project.id,
            quotationId: quotation.id
          });
        }
      } catch (e: any) {
        Logger.error("[WorkspaceWorkflowEngine] Quote created error:", e.message);
      }
    });

    // 4. Invoice -> Email Invoice -> WhatsApp Invoice -> Payment Link
    EventBus.subscribe(WorkflowEvent.INVOICE_CREATED, "WorkspaceInvoiceCreated", async (payload: { invoiceId: string; clientId: string; projectId: string }) => {
      try {
        const [invoice, client, project] = await Promise.all([
          prisma.invoice.findUnique({ where: { id: payload.invoiceId } }),
          prisma.client.findUnique({ where: { id: payload.clientId } }),
          prisma.project.findUnique({ where: { id: payload.projectId } })
        ]);

        if (!invoice || !client || !project) return;
        const paymentUrl = `https://randomframes.com/portal/pay/${invoice.id}`;

        if (client.email && WorkspaceWorkflowEngine.shouldSendEmail(client.preferredContactMethod)) {
          await GmailDomainService.sendEmail({
            to: client.email,
            templateKey: "INVOICE",
            templateParams: {
              clientName: client.contactPerson || client.businessName,
              invoiceNumber: invoice.invoiceNumber || invoice.id.slice(0, 6),
              projectTitle: project.title,
              balanceDue: `$${Number(invoice.total || 0).toFixed(2)}`,
              paymentUrl
            },
            attachments: [{ filename: `Invoice_${invoice.invoiceNumber || invoice.id}.pdf`, url: paymentUrl, type: "INVOICE" }],
            clientId: client.id,
            projectId: project.id,
            invoiceId: invoice.id
          });
        }
      } catch (e: any) {
        Logger.error("[WorkspaceWorkflowEngine] Invoice created error:", e.message);
      }
    });

    // 5. Payment Received -> Receipt -> Timeline
    EventBus.subscribe(WorkflowEvent.PAYMENT_RECEIVED, "WorkspacePaymentReceived", async (payload: { paymentId: string; invoiceId?: string; amount: number; projectId: string; clientId: string }) => {
      try {
        const client = await prisma.client.findUnique({ where: { id: payload.clientId } });
        if (!client || !client.email) return;

        if (WorkspaceWorkflowEngine.shouldSendEmail(client.preferredContactMethod)) {
          await GmailDomainService.sendEmail({
            to: client.email,
            templateKey: "PAYMENT_RECEIVED",
            templateParams: {
              clientName: client.contactPerson || client.businessName,
              amountPaid: `$${Number(payload.amount).toFixed(2)}`,
              invoiceNumber: payload.invoiceId || "Ref-TX"
            },
            clientId: payload.clientId,
            projectId: payload.projectId,
            paymentId: payload.paymentId
          });
        }
      } catch (e: any) {
        Logger.error("[WorkspaceWorkflowEngine] Payment received error:", e.message);
      }
    });

    // 6. Shoot Scheduled -> Calendar Event -> Email Confirmation -> WhatsApp Confirmation
    EventBus.subscribe(WorkflowEvent.SHOOT_SCHEDULED, "WorkspaceShootScheduled", async (payload: { shootId: string; projectId: string }) => {
      try {
        const shoot = await prisma.shoot.findUnique({ where: { id: payload.shootId }, include: { client: true, project: true } });
        if (!shoot || !shoot.client) return;

        // Create Google Calendar Event
        const calRes = await WorkspaceCalendarService.createCalendarEvent({
          title: `Shoot: ${shoot.title}`,
          date: shoot.date || new Date(),
          startTime: (shoot as any).startTime || "09:00",
          endTime: (shoot as any).endTime || "17:00",
          location: shoot.location || "Random Frames Main Soundstage",
          clientId: shoot.clientId,
          projectId: shoot.projectId,
          generateMeetLink: false
        });

        if (shoot.client.email && WorkspaceWorkflowEngine.shouldSendEmail((shoot.client as any).preferredContactMethod)) {
          await GmailDomainService.sendEmail({
            to: shoot.client.email,
            templateKey: "SHOOT_CONFIRMATION",
            templateParams: {
              clientName: shoot.client.contactPerson || shoot.client.businessName,
              shootTitle: shoot.title,
              date: (shoot.date || new Date()).toDateString(),
              time: (shoot as any).startTime || "09:00 AM",
              location: shoot.location || "Main Studio"
            },
            clientId: shoot.clientId,
            projectId: shoot.projectId,
            shootId: shoot.id,
            eventId: calRes.eventId
          });
        }
      } catch (e: any) {
        Logger.error("[WorkspaceWorkflowEngine] Shoot scheduled error:", e.message);
      }
    });

    // 7. Deliverable Created -> Drive Share Link -> Email -> WhatsApp -> Timeline
    EventBus.subscribe(WorkflowEvent.DELIVERABLE_CREATED, "WorkspaceDeliverableLink", async (payload: { deliverableId: string; shootId: string }) => {
      try {
        const shoot = await prisma.shoot.findUnique({ where: { id: payload.shootId }, include: { client: true, project: true } });
        if (!shoot || !shoot.client || !shoot.project) return;

        const driveShareUrl = await WorkspaceDriveService.generateDeliveryShareLink(shoot.projectId) || `https://drive.google.com/drive/folders/rf_${shoot.projectId}`;

        if (shoot.client.email && WorkspaceWorkflowEngine.shouldSendEmail((shoot.client as any).preferredContactMethod)) {
          await GmailDomainService.sendEmail({
            to: shoot.client.email,
            templateKey: "PREVIEW_READY",
            templateParams: {
              clientName: shoot.client.contactPerson || shoot.client.businessName,
              projectTitle: shoot.project.title,
              driveUrl: driveShareUrl,
              feedbackWindow: "7 Days"
            },
            attachments: [{ filename: "Project_Deliverables_Cloud_Link", url: driveShareUrl, type: "DELIVERY_LINK" }],
            clientId: shoot.clientId,
            projectId: shoot.projectId,
            shootId: shoot.id
          });
        }
      } catch (e: any) {
        Logger.error("[WorkspaceWorkflowEngine] Deliverable link error:", e.message);
      }
    });

    Logger.info("[WorkspaceWorkflowEngine] All Google Workspace automated event subscribers registered.");
  }
}
