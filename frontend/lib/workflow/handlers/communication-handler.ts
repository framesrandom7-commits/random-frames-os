import { EventBus } from "../event-bus";
import { WorkflowEvent } from "../events";
import { prisma } from "@/lib/prisma";

export function registerCommunicationHandlers() {
  
  // Handlers for Timeline injection (Activity table)
  
  EventBus.subscribe(WorkflowEvent.EMAIL_SENT, "TimelineEmailSent", async (payload) => {
    const communication = await prisma.communication.findUnique({ where: { id: payload.communicationId } });
    if (!communication) return;

    await prisma.activity.create({
      data: {
        type: "SYSTEM",
        description: `Sent Email: ${communication.subject}`,
        metadata: { communicationId: communication.id, body: communication.body },
        projectId: payload.projectId,
        clientId: payload.clientId,
        createdBy: payload.userId,
      }
    });
  });

  EventBus.subscribe(WorkflowEvent.WHATSAPP_SHARED, "TimelineWhatsAppShared", async (payload) => {
    const communication = await prisma.communication.findUnique({ where: { id: payload.communicationId } });
    if (!communication) return;

    await prisma.activity.create({
      data: {
        type: "SYSTEM",
        description: `Shared WhatsApp Message`,
        metadata: { communicationId: communication.id, body: communication.body },
        projectId: payload.projectId,
        clientId: payload.clientId,
        createdBy: payload.userId,
      }
    });
  });

  EventBus.subscribe(WorkflowEvent.FOLLOWUP_CREATED, "TimelineFollowUpCreated", async (payload) => {
    const followUp = await prisma.followUp.findUnique({ where: { id: payload.followUpId } });
    if (!followUp) return;

    await prisma.activity.create({
      data: {
        type: "SYSTEM",
        description: `Scheduled Follow-up: ${followUp.title}`,
        metadata: { followUpId: followUp.id, dueDate: followUp.dueDate },
        projectId: payload.projectId,
        clientId: payload.clientId,
        createdBy: payload.userId,
      }
    });
  });

  EventBus.subscribe(WorkflowEvent.DELIVERY_SENT, "TimelineDeliverySent", async (payload) => {
    const delivery = await prisma.delivery.findUnique({ where: { id: payload.deliveryId } });
    if (!delivery) return;

    await prisma.activity.create({
      data: {
        type: "SYSTEM",
        description: `Sent Delivery: ${delivery.title}`,
        metadata: { deliveryId: delivery.id, link: delivery.deliveryLink },
        projectId: payload.projectId,
        createdBy: payload.userId,
      }
    });
  });
}
