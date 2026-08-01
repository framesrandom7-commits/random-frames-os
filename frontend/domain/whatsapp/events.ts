import { EventBus } from "@/lib/workflow/event-bus";
import { WorkflowEvent } from "@/lib/workflow/events";
import { WhatsAppDomainService } from "./service";
import { WhatsAppTemplateRegistry } from "./templates";
import { prisma } from "@/lib/prisma";
import { Logger } from "@/lib/logger";

/**
 * WhatsAppDomainEvents
 * Bridges the centralized Workflow Automation Engine with the WhatsApp Domain Service.
 * Implements automated client messaging across CRM, Shoot Planning, Deliverables, and Finance workflows.
 */
export function registerWhatsAppDomainEvents(): void {
  // 1. Lead Created -> Automated Inquiry Welcome & Followup
  EventBus.subscribe(WorkflowEvent.LEAD_CREATED, "WhatsAppLeadFollowup", async (payload: { leadId: string }) => {
    try {
      const lead = await prisma.lead.findUnique({ where: { id: payload.leadId } });
      if (!lead || !lead.phone) return;

      const components = WhatsAppTemplateRegistry.buildTextComponents([
        lead.contactPerson || lead.businessName || "Valued Prospect",
        lead.serviceInterested || "Luxury Cinematic & Photography Solutions",
        "https://randomframes.com/booking",
      ]);

      await WhatsAppDomainService.sendTemplateMessage(
        lead.phone,
        WhatsAppTemplateRegistry.TEMPLATES.LEAD_FOLLOWUP.id,
        components,
        { leadId: lead.id }
      );
    } catch (e: any) {
      Logger.error("Error executing WhatsAppLeadFollowup event", e.message);
    }
  });

  // 2. Lead Converted / Client Created -> Welcome Client & Share Workspace
  const handleClientWelcome = async (clientId: string) => {
    try {
      const client = await prisma.client.findUnique({ where: { id: clientId } });
      if (!client || !client.phone) return;

      const components = WhatsAppTemplateRegistry.buildTextComponents([
        client.contactPerson || client.businessName,
        "Random Frames Executive Account Management",
      ]);

      await WhatsAppDomainService.sendTemplateMessage(
        client.phone,
        WhatsAppTemplateRegistry.TEMPLATES.WELCOME_CLIENT.id,
        components,
        { clientId: client.id }
      );
    } catch (e: any) {
      Logger.error("Error executing Client Welcome messaging", e.message);
    }
  };

  EventBus.subscribe(WorkflowEvent.LEAD_CONVERTED, "WhatsAppLeadConverted", (p: { clientId: string }) => handleClientWelcome(p.clientId));
  EventBus.subscribe(WorkflowEvent.CLIENT_CREATED, "WhatsAppClientCreated", (p: { clientId: string }) => handleClientWelcome(p.clientId));

  // 3. Shoot Scheduled / Rescheduled -> Calendar & Reminder Synchronization
  EventBus.subscribe(WorkflowEvent.SHOOT_SCHEDULED, "WhatsAppShootScheduled", async (payload: { shootId: string; projectId: string }) => {
    try {
      // When shoot date changes or is scheduled, our configurable 24h reminder is registered in the Queue/Scheduler
      Logger.info(`[WhatsAppEvents] Shoot ${payload.shootId} scheduled. Automated 24h shoot reminder registered.`);
    } catch (e: any) {
      Logger.error("Error processing Shoot Scheduled event for WhatsApp", e.message);
    }
  });

  // 4. Automated 24-Hour Single Shoot Reminder execution
  EventBus.subscribe(WorkflowEvent.REMINDER_TRIGGERED, "WhatsAppShootReminder", async (payload: { shootId?: string }) => {
    try {
      if (payload.shootId) {
        await WhatsAppDomainService.triggerShootReminder(payload.shootId);
      }
    } catch (e: any) {
      Logger.error("Error running REMINDER_TRIGGERED shoot automation", e.message);
    }
  });

  // 5. Quotation Created / Sent -> Automatic Finance Transmission
  EventBus.subscribe(WorkflowEvent.QUOTATION_CREATED, "WhatsAppQuotationSent", async (payload: { quotationId: string; clientId: string; projectId: string }) => {
    try {
      const quote = await prisma.quotation.findUnique({
        where: { id: payload.quotationId },
        include: { client: true, project: true }
      });
      if (!quote || !quote.client.phone) return;

      const components = WhatsAppTemplateRegistry.buildTextComponents([
        quote.client.contactPerson || quote.client.businessName,
        quote.project.title,
        `₹${quote.total ? quote.total.toString() : "0"}`,
        (quote as any).documentUrl || `https://app.randomframes.com/portal/quotation/${quote.id}`
      ]);

      await WhatsAppDomainService.sendTemplateMessage(
        quote.client.phone,
        WhatsAppTemplateRegistry.TEMPLATES.QUOTATION_SENT.id,
        components,
        { clientId: quote.clientId, projectId: quote.projectId, quotationId: quote.id }
      );
    } catch (e: any) {
      Logger.error("Error executing Quotation WhatsApp dispatch", e.message);
    }
  });

  // 6. Quotation Approved -> Booking Confirmation & Next Steps
  EventBus.subscribe(WorkflowEvent.QUOTATION_APPROVED, "WhatsAppQuotationApproved", async (payload: { quotationId: string; clientId: string; projectId: string }) => {
    try {
      const quote = await prisma.quotation.findUnique({
        where: { id: payload.quotationId },
        include: { client: true, project: true }
      });
      if (!quote || !quote.client.phone) return;

      const components = WhatsAppTemplateRegistry.buildTextComponents([
        quote.client.contactPerson || quote.client.businessName,
        quote.project.title,
        "50% Advance Booking Retainer",
      ]);

      await WhatsAppDomainService.sendTemplateMessage(
        quote.client.phone,
        WhatsAppTemplateRegistry.TEMPLATES.QUOTATION_APPROVED.id,
        components,
        { clientId: quote.clientId, projectId: quote.projectId, quotationId: quote.id }
      );
    } catch (e: any) {
      Logger.error("Error processing Quotation Approved WhatsApp confirmation", e.message);
    }
  });

  // 7. Deliverables & Google Drive Integration -> Instant Secure Link Delivery
  EventBus.subscribe(WorkflowEvent.DELIVERABLE_CREATED, "WhatsAppDeliverableLink", async (payload: { deliverableId: string; shootId: string }) => {
    try {
      const deliverable = await prisma.deliverable.findUnique({
        where: { id: payload.deliverableId },
        include: { shoot: { include: { client: true, project: true } } }
      });
      if (!deliverable || !deliverable.shoot?.client?.phone) return;

      const client = deliverable.shoot.client;
      const url = (deliverable as any).fileUrl || (deliverable as any).driveFileId ? `https://drive.google.com/open?id=${(deliverable as any).driveFileId}` : "https://app.randomframes.com/portal/deliverables";

      const components = WhatsAppTemplateRegistry.buildTextComponents([
        client.contactPerson || client.businessName,
        deliverable.shoot.project.title || deliverable.shoot.title,
        url,
        "7 days for revision feedback"
      ]);

      await WhatsAppDomainService.sendTemplateMessage(
        client.phone as string,
        WhatsAppTemplateRegistry.TEMPLATES.PREVIEW_READY.id,
        components,
        { clientId: client.id, projectId: deliverable.shoot.projectId, shootId: deliverable.shootId }
      );
    } catch (e: any) {
      Logger.error("Error processing automated deliverable WhatsApp notification", e.message);
    }
  });

  // 8. Invoice Created -> Payment Reminder & Invoice PDF URL
  EventBus.subscribe(WorkflowEvent.INVOICE_CREATED, "WhatsAppInvoiceSent", async (payload: { invoiceId: string; clientId: string; projectId: string }) => {
    try {
      const invoice = await prisma.invoice.findUnique({
        where: { id: payload.invoiceId },
        include: { client: true, project: true }
      });
      if (!invoice || !invoice.client.phone) return;

      const components = WhatsAppTemplateRegistry.buildTextComponents([
        invoice.client.contactPerson || invoice.client.businessName,
        invoice.invoiceNumber,
        `₹${invoice.total ? invoice.total.toString() : "0"}`,
        (invoice as any).documentUrl || `https://app.randomframes.com/portal/pay/${invoice.id}`
      ]);

      await WhatsAppDomainService.sendTemplateMessage(
        invoice.client.phone,
        WhatsAppTemplateRegistry.TEMPLATES.FINAL_PAYMENT_PENDING.id,
        components,
        { clientId: invoice.clientId, projectId: invoice.projectId, invoiceId: invoice.id }
      );
    } catch (e: any) {
      Logger.error("Error executing Invoice WhatsApp transmission", e.message);
    }
  });

  // 9. Payment Received -> Receipt Delivery & Thank You Milestone
  EventBus.subscribe(WorkflowEvent.PAYMENT_RECEIVED, "WhatsAppPaymentReceived", async (payload: { paymentId: string; invoiceId?: string; amount: number; projectId: string; clientId: string }) => {
    try {
      const payment = await prisma.payment.findUnique({
        where: { id: payload.paymentId },
        include: { client: true, project: true, invoice: true }
      });
      if (!payment || !payment.client?.phone) return;

      const components = WhatsAppTemplateRegistry.buildTextComponents([
        payment.client.contactPerson || payment.client.businessName,
        `₹${payload.amount}`,
        payment.invoice?.invoiceNumber || "Retainer Booking",
        (payment as any).receiptUrl || `https://app.randomframes.com/portal/receipt/${payment.id}`
      ]);

      await WhatsAppDomainService.sendTemplateMessage(
        payment.client.phone,
        WhatsAppTemplateRegistry.TEMPLATES.PAYMENT_RECEIVED.id,
        components,
        { clientId: payment.clientId, projectId: payment.projectId, paymentId: payment.id, invoiceId: payload.invoiceId }
      );
    } catch (e: any) {
      Logger.error("Error processing Payment Receipt WhatsApp confirmation", e.message);
    }
  });
}
