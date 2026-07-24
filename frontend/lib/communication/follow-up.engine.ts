import { prisma } from "@/lib/prisma";
import { FollowUpStatus } from "@prisma/client";

export class FollowUpEngine {
  
  /**
   * Schedule a new follow-up manually
   */
  public static async scheduleFollowUp(data: {
    title: string;
    dueDate: Date;
    description?: string;
    priority?: string;
    leadId?: string;
    clientId?: string;
    projectId?: string;
    communicationId?: string;
    assignedToId?: string;
    createdBy?: string;
  }) {
    return prisma.followUp.create({
      data: {
        title: data.title,
        dueDate: data.dueDate,
        description: data.description,
        priority: data.priority || "MEDIUM",
        status: "PENDING",
        leadId: data.leadId,
        clientId: data.clientId,
        projectId: data.projectId,
        communicationId: data.communicationId,
        assignedToId: data.assignedToId,
        createdBy: data.createdBy
      }
    });
  }

  /**
   * Mark follow-up as completed
   */
  public static async completeFollowUp(followUpId: string) {
    return prisma.followUp.update({
      where: { id: followUpId },
      data: { status: "COMPLETED" }
    });
  }

  /**
   * Get pending follow-ups
   */
  public static async getPendingFollowUps(where: {
    clientId?: string;
    leadId?: string;
    projectId?: string;
    assignedToId?: string;
  }) {
    return prisma.followUp.findMany({
      where: {
        ...where,
        status: "PENDING"
      },
      orderBy: { dueDate: 'asc' },
      include: {
        client: true,
        lead: true,
        project: true
      }
    });
  }
}
