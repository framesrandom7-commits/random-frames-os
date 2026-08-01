import { EventBus } from "../event-bus";
import { WorkflowEvent } from "../events";
import { QueueManager } from "@/domain/integrations/queue-manager";
import { WHATSAPP_CONSTANTS, WHATSAPP_TEMPLATES } from "@/domain/whatsapp/constants";
import { prisma } from "@/lib/prisma";
import { Logger } from "@/lib/logger";

export function registerWhatsAppHandlers() {
  
  // Send Welcome Client message when Client is created or converted
  EventBus.subscribe(WorkflowEvent.CLIENT_CREATED, "WhatsAppWelcomeClient", async (payload: any) => {
    try {
      const client = await prisma.client.findUnique({ where: { id: payload.clientId } });
      if (!client || !client.phone) return;

      // Variables: [Client Name]
      const templateData = {
        to: client.phone,
        templateName: WHATSAPP_TEMPLATES.WELCOME_CLIENT,
        components: [
          {
            type: "body",
            parameters: [{ type: "text", text: client.contactPerson || client.businessName }]
          }
        ]
      };

      await QueueManager.pushJob(WHATSAPP_CONSTANTS.PROVIDER_ID, 'SEND_TEMPLATE', templateData);
    } catch (e) {
      Logger.error("Error in WhatsAppWelcomeClient handler", e);
    }
  });

  // Example: Shoot Reminder (Triggered by a cron/scheduler that emits REMINDER_TRIGGERED)
  EventBus.subscribe(WorkflowEvent.REMINDER_TRIGGERED, "WhatsAppShootReminder", async (payload: any) => {
    try {
      if (!payload.shootId) return;
      const shoot = await prisma.shoot.findUnique({ 
        where: { id: payload.shootId },
        include: { project: { include: { client: true } } }
      });
      if (!shoot || !shoot.date || !shoot.project.client.phone) return;

      // Variables: [Shoot Name], [Date], [Time], [Location]
      const templateData = {
        to: shoot.project.client.phone,
        templateName: WHATSAPP_TEMPLATES.SHOOT_REMINDER,
        components: [
          {
            type: "body",
            parameters: [
              { type: "text", text: shoot.title },
              { type: "text", text: new Date(shoot.date).toLocaleDateString() },
              { type: "text", text: shoot.startTime || "TBD" },
              { type: "text", text: shoot.location || "TBD" }
            ]
          }
        ]
      };

      await QueueManager.pushJob(WHATSAPP_CONSTANTS.PROVIDER_ID, 'SEND_TEMPLATE', templateData);
    } catch (e) {
      Logger.error("Error in WhatsAppShootReminder handler", e);
    }
  });

  // We can add more handlers for Quotes, Invoices, Delivery etc.
}
