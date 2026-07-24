import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export class VariableResolver {
  
  /**
   * Resolves {{variables}} within a string based on the provided entity context
   */
  public static async resolve(
    templateBody: string, 
    context: {
      clientId?: string;
      projectId?: string;
      leadId?: string;
      invoiceId?: string;
      quotationId?: string;
      deliveryLink?: string;
      shootId?: string;
      eventId?: string;
    }
  ): Promise<string> {
    const variables: Record<string, string> = {
      client_name: "",
      project_name: "",
      quotation_number: "",
      invoice_number: "",
      amount: "",
      due_date: "",
      delivery_link: context.deliveryLink || "",
      shoot_date: "",
      meeting_time: "",
      company_name: "Random Frames",
      phone: "+1234567890", // Example hardcoded company config, could be fetched from global config
      email: "hello@randomframes.com",
      website: "www.randomframes.com"
    };

    // Gather data based on context
    if (context.clientId) {
      const client = await prisma.client.findUnique({ where: { id: context.clientId }});
      if (client) {
        variables.client_name = client.contactPerson || client.businessName || "";
      }
    }

    if (context.leadId && !variables.client_name) {
      const lead = await prisma.lead.findUnique({ where: { id: context.leadId }});
      if (lead) {
        variables.client_name = lead.contactPerson || lead.businessName || "";
      }
    }

    if (context.projectId) {
      const project = await prisma.project.findUnique({ 
        where: { id: context.projectId },
        include: { client: true }
      });
      if (project) {
        variables.project_name = project.title || "";
        if (!variables.client_name && project.client) {
          variables.client_name = project.client.contactPerson || project.client.businessName || "";
        }
      }
    }

    if (context.invoiceId) {
      const invoice = await prisma.invoice.findUnique({ where: { id: context.invoiceId }});
      if (invoice) {
        variables.invoice_number = invoice.invoiceNumber;
        variables.amount = invoice.total ? invoice.total.toString() : "0.00";
        if (invoice.dueDate) {
          variables.due_date = format(new Date(invoice.dueDate), 'MMM d, yyyy');
        }
      }
    }

    if (context.quotationId) {
      const quotation = await prisma.quotation.findUnique({ where: { id: context.quotationId }});
      if (quotation) {
        variables.quotation_number = quotation.quotationNumber;
        variables.amount = quotation.total ? quotation.total.toString() : "0.00";
      }
    }

    if (context.shootId) {
      const shoot = await prisma.shoot.findUnique({ where: { id: context.shootId }});
      if (shoot && shoot.date) {
        variables.shoot_date = format(new Date(shoot.date), 'MMM d, yyyy');
      }
    }

    if (context.eventId) {
      const event = await prisma.calendarEvent.findUnique({ where: { id: context.eventId }});
      if (event && event.date && event.startTime) {
        variables.meeting_time = `${format(new Date(event.date), 'MMM d, yyyy')} at ${event.startTime}`;
      }
    }

    // Replace all occurrences of {{variable}} safely
    let resolvedBody = templateBody;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      resolvedBody = resolvedBody.replace(regex, value || "");
    }

    return resolvedBody;
  }
}
