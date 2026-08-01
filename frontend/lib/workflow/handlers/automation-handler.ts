import { WorkflowEvent } from "../events";
import { EventBus } from "../event-bus";
import { prisma } from "@/lib/prisma";
import { Logger } from "@/lib/logger";
import { NotificationCenter, NotificationChannel } from "@/domain/integrations/notification-manager";
import { RoleName } from "@/domain/rbac/types";

/**
 * Core Automation Engine
 * 
 * Orchestrates business process transitions across domains.
 */
export function registerAutomationHandlers() {
  
  // 1. LEAD CONVERTED -> CLIENT
  EventBus.subscribe(WorkflowEvent.LEAD_CONVERTED, 'Automation_LeadConverted', async (payload) => {
    Logger.info(`[Automation] Lead ${payload.leadId} converted to Client ${payload.clientId}`);
    try {
      const client = await prisma.client.findUnique({ where: { id: payload.clientId } });
      if (!client) return;

      // Auto-create a default project for the new client
      const defaultProjectName = `${client.businessName || client.contactPerson} - Initial Project`;
      const project = await prisma.project.create({
        data: {
          title: defaultProjectName,
          clientId: client.id,
          status: 'PLANNING',
          description: 'Automatically created upon client onboarding.',
          projectCode: `PRJ-${Date.now()}`
        }
      });
      Logger.info(`[Automation] Auto-created Project ${project.id} for Client ${client.id}`);

      // Emit Project Created so other handlers (Storage, etc.) pick it up
      EventBus.publish(WorkflowEvent.PROJECT_CREATED, {
        projectId: project.id,
        clientId: client.id,
        userId: payload.userId
      });

      // Dispatch Notifications
      await NotificationCenter.dispatch({
        title: `Welcome Client: ${client.businessName || client.contactPerson}`,
        message: `A new client was onboarded and project ${project.projectCode} was auto-created.`,
        type: 'SYSTEM',
        priority: 'HIGH',
        clientId: client.id,
        projectId: project.id,
        userId: payload.userId,
        channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
        emailPayload: {
          to: client.email || "hello@example.com",
          subject: `Welcome to Random Frames, ${client.contactPerson || client.businessName}!`,
          body: `We are thrilled to have you onboard. We've set up your project folder and will be in touch shortly.`
        }
      });

    } catch (e) {
      Logger.error(`[Automation] Error processing LEAD_CONVERTED automation`, e);
    }
  });

  // 2. QUOTE APPROVED -> UPDATE PROJECT STATUS
  EventBus.subscribe(WorkflowEvent.QUOTATION_APPROVED, 'Automation_QuoteApproved', async (payload) => {
    try {
      await prisma.project.update({
        where: { id: payload.projectId },
        data: { status: 'PLANNING' }
      });
      Logger.info(`[Automation] Updated Project ${payload.projectId} status to PLANNING after Quote Approval`);
      
      const project = await prisma.project.findUnique({ where: { id: payload.projectId }, include: { client: true } });
      
      if (project) {
        await NotificationCenter.dispatch({
          title: `Quote Approved for ${project.title}`,
          message: `The project status has been updated to PLANNING.`,
          type: 'SYSTEM',
          projectId: project.id,
          clientId: project.clientId,
          channels: [NotificationChannel.IN_APP, NotificationChannel.WHATSAPP],
          whatsappPayload: {
            recipientPhone: project.client.phone || "0000000000",
            templateName: "quote_approved",
            templateData: { projectName: project.title }
          }
        });
      }
    } catch (e) {
      Logger.error(`[Automation] Error processing QUOTATION_APPROVED`, e);
    }
  });

  // 3. PAYMENT RECEIVED -> UPDATE STATUS (50% Advance check)
  EventBus.subscribe(WorkflowEvent.PAYMENT_RECEIVED, 'Automation_PaymentReceived', async (payload) => {
    try {
      const project = await prisma.project.findUnique({ where: { id: payload.projectId }, include: { client: true } });
      if (project && project.status === 'PLANNING') {
        await prisma.project.update({
          where: { id: payload.projectId },
          data: { status: 'SCHEDULED' }
        });
        Logger.info(`[Automation] Updated Project ${payload.projectId} status to SCHEDULED after advance payment`);
        
        await NotificationCenter.dispatch({
          title: `Advance Payment Received for ${project.title}`,
          message: `The project is now ready to be scheduled!`,
          type: 'SYSTEM',
          projectId: project.id,
          clientId: project.clientId,
          channels: [NotificationChannel.IN_APP, NotificationChannel.EMAIL],
          emailPayload: {
            to: project.client.email || "hello@example.com",
            subject: `Payment Received - Let's schedule your shoot!`,
            body: `We have received your advance payment for ${project.title}. Our team will contact you shortly to schedule dates.`
          }
        });

      } else if (project && (project.status === 'DELIVERED' || project.status === 'CLIENT_REVIEW')) {
        await prisma.project.update({
          where: { id: payload.projectId },
          data: { status: 'COMPLETED' }
        });
        Logger.info(`[Automation] Updated Project ${payload.projectId} status to COMPLETED after final payment`);
        
        await NotificationCenter.dispatch({
          title: `Final Payment Received for ${project.title}`,
          message: `The project is now marked as COMPLETED.`,
          type: 'SYSTEM',
          projectId: project.id,
          clientId: project.clientId,
          channels: [NotificationChannel.IN_APP, NotificationChannel.WHATSAPP],
          whatsappPayload: {
            recipientPhone: project.client.phone || "0000000000",
            templateName: "project_completed",
            templateData: { projectName: project.title }
          }
        });
      }
    } catch (e) {
      Logger.error(`[Automation] Error processing PAYMENT_RECEIVED`, e);
    }
  });

  // 4. DELIVERABLE CREATED -> UPDATE STATUS
  EventBus.subscribe(WorkflowEvent.DELIVERABLE_CREATED, 'Automation_DeliverableCreated', async (payload) => {
    try {
      const shoot = await prisma.shoot.findUnique({ 
        where: { id: payload.shootId },
        select: { projectId: true, title: true, client: true }
      });
      if (shoot) {
        const project = await prisma.project.update({
          where: { id: shoot.projectId },
          data: { status: 'DELIVERED' }
        });
        Logger.info(`[Automation] Updated Project ${shoot.projectId} status to DELIVERED`);
        
        await NotificationCenter.dispatch({
          title: `Deliverables Ready for ${shoot.title}`,
          message: `New deliverables have been uploaded and the project status is DELIVERED.`,
          type: 'SYSTEM',
          projectId: project.id,
          clientId: project.clientId,
          channels: [NotificationChannel.IN_APP, NotificationChannel.WHATSAPP, NotificationChannel.EMAIL],
          emailPayload: {
            to: shoot.client.email || "hello@example.com",
            subject: `Your Photos/Videos are Ready!`,
            body: `We have uploaded the final deliverables for ${shoot.title}. You can view them in your client portal.`
          },
          whatsappPayload: {
            recipientPhone: shoot.client.phone || "0000000000",
            templateName: "deliverables_ready",
            templateData: { shootName: shoot.title }
          }
        });
      }
    } catch (e) {
      Logger.error(`[Automation] Error processing DELIVERABLE_CREATED`, e);
    }
  });

  // 5. WORKFLOW OWNERSHIP: LEAD CREATED -> AUTOMATICALLY ASSIGN TO CO-FOUNDER
  EventBus.subscribe(WorkflowEvent.LEAD_CREATED, 'Automation_LeadOwnership', async (payload) => {
    try {
      if (!payload.leadId) return;
      const coFounder = await prisma.user.findFirst({
        where: {
          OR: [
            { role: { name: RoleName.CO_FOUNDER } },
            { email: "pooja@randomframes.local" }
          ]
        }
      });

      if (coFounder) {
        await prisma.lead.update({
          where: { id: payload.leadId },
          data: { ownerId: coFounder.id }
        });
        Logger.info(`[Workflow Ownership] Automatically assigned Lead ${payload.leadId} to Co-Founder ${coFounder.name} (${coFounder.email})`);
      }
    } catch (e) {
      Logger.error(`[Workflow Ownership] Error processing LEAD_CREATED assignment`, e);
    }
  });

  // 6. WORKFLOW OWNERSHIP: PROJECT CREATED -> CREATIVE OWNER = FOUNDER, OPERATIONS OWNER = CO-FOUNDER
  EventBus.subscribe(WorkflowEvent.PROJECT_CREATED, 'Automation_ProjectOwnership', async (payload) => {
    try {
      if (!payload.projectId) return;
      const owners = await prisma.user.findMany({
        where: {
          OR: [
            { role: { name: { in: [RoleName.FOUNDER, RoleName.CO_FOUNDER, RoleName.OWNER, RoleName.OPERATIONS_MANAGER, "Owner", "Admin"] } } },
            { email: { in: ["pooja@randomframes.local"] } }
          ]
        },
        select: { id: true, email: true, role: { select: { name: true } } }
      });

      if (owners.length > 0) {
        const connectList = owners.map(u => ({ id: u.id }));
        await prisma.project.update({
          where: { id: payload.projectId },
          data: {
            assignedUsers: {
              connect: connectList
            }
          }
        });
        Logger.info(`[Workflow Ownership] Automatically assigned Founder (Creative Owner) and Co-Founder (Operations Owner) to Project ${payload.projectId}`);
      }
    } catch (e) {
      Logger.error(`[Workflow Ownership] Error processing PROJECT_CREATED assignment`, e);
    }
  });
}

