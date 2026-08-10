import { ProjectRepository, GetProjectsParams } from "../repositories/ProjectRepository";
import { EventBus } from "../events/EventBus";
import { prisma } from "@/lib/prisma";
import { CreateProjectData } from "@/app/actions/project";

export class ProjectService {
  static async getDashboardActiveProjects(limit: number = 5) {
    return ProjectRepository.findActive(limit);
  }

  static async getContinueWorkingProjects(limit: number = 4) {
    return ProjectRepository.findEditable(limit);
  }

  static async generateCode(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    const count = await ProjectRepository.count({
      createdAt: {
        gte: new Date(date.getFullYear(), date.getMonth(), 1),
      }
    });

    const sequential = (count + 1).toString().padStart(3, '0');
    return `PR${year}${month}${sequential}`;
  }

  static async create(data: CreateProjectData) {
    const projectCode = await ProjectService.generateCode();
    
    const { assignedUserIds, clientId, quotationId, ...projectData } = data;

    const quotationAmount = Number(data.quotationAmount || 0);
    const additionalServicesAmount = Number(data.additionalServicesAmount || 0);
    const additionalChargesAmount = Number(data.additionalChargesAmount || 0);
    const discountAmount = Number(data.discountAmount || 0);
    const taxAmount = Number(data.taxAmount || 0);

    const computedTotalAmount = quotationAmount + additionalServicesAmount + additionalChargesAmount - discountAmount + taxAmount;

    const project = await ProjectRepository.create({
      ...projectData,
      totalAmount: computedTotalAmount,
      projectCode,
      client: { connect: { id: clientId } },
      ...(assignedUserIds && assignedUserIds.length > 0 ? {
        assignedUsers: {
          connect: assignedUserIds.map(id => ({ id }))
        }
      } : {}),
      ...(data.deliveryDate ? {
        calendarEvents: {
          create: {
            title: `Delivery: ${data.title}`,
            date: data.deliveryDate,
            isAllDay: true,
            eventType: "DELIVERY",
            status: data.status === "DELIVERED" || data.status === "COMPLETED" ? "COMPLETED" : (data.status === "CANCELLED" ? "CANCELLED" : "SCHEDULED"),
            clientId: data.clientId,
          }
        }
      } : {}),
      ...(quotationId ? {
        originQuotation: {
          connect: { id: quotationId }
        }
      } : {})
    });
    
    const { logActivity } = await import('@/lib/timeline');
    await logActivity({
      type: "SYSTEM",
      description: `Project '${project.title}' created`,
      projectId: project.id,
      clientId: data.clientId,
    });
    
    const client = await prisma.client.findUnique({ where: { id: data.clientId } });
    if (client && client.driveFolderId) {
      const { EventBus } = await import("@/lib/workflow/event-bus");
      const { WorkflowEvent } = await import("@/lib/workflow/events");
      EventBus.publish(WorkflowEvent.PROJECT_CREATED, { projectId: project.id, clientId: client.id, userId: client.createdBy || undefined });
    }
    
    return project;
  }

  static async syncFinancials(projectId: string) {
    const project = await ProjectRepository.findById(projectId);
    if (!project) return;

    // Calculate total amount based on the new architecture
    const quotationAmount = Number(project.quotationAmount || 0);
    const additionalServicesAmount = Number(project.additionalServicesAmount || 0);
    const additionalChargesAmount = Number(project.additionalChargesAmount || 0);
    const discountAmount = Number(project.discountAmount || 0);
    const taxAmount = Number(project.taxAmount || 0);

    const computedTotalAmount = quotationAmount + additionalServicesAmount + additionalChargesAmount - discountAmount + taxAmount;

    // Calculate financials
    const totalInvoiced = project.invoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    const totalPaid = project.payments.reduce((sum, pay) => sum + Number(pay.amount), 0);
    const totalExpenses = project.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    
    // Balance is now computed against the true project total minus what's paid
    const balanceAmount = computedTotalAmount - totalPaid;
    // Profit is computed against project total minus expenses
    const profitAmount = computedTotalAmount - totalExpenses; 
    
    let paymentStatus: "PENDING" | "PARTIAL" | "PAID" = "PENDING";
    if (totalPaid > 0) {
      if (balanceAmount <= 0) {
        paymentStatus = "PAID";
      } else {
        paymentStatus = "PARTIAL";
      }
    }

    await ProjectRepository.update(projectId, {
      totalAmount: computedTotalAmount,
      balanceAmount: balanceAmount,
      paymentStatus: paymentStatus,
      profitAmount: profitAmount,
    });
  }

  static async update(id: string, data: Partial<CreateProjectData>) {
    const { assignedUserIds, ...projectData } = data;

    // Fetch existing project to combine with partial data
    const existingProject = await ProjectRepository.findById(id);
    
    // Make sure totalAmount is computed based on fields passed + existing fields
    const quotationAmount = Number(data.quotationAmount !== undefined ? data.quotationAmount : (existingProject?.quotationAmount || 0));
    const additionalServicesAmount = Number(data.additionalServicesAmount !== undefined ? data.additionalServicesAmount : (existingProject?.additionalServicesAmount || 0));
    const additionalChargesAmount = Number(data.additionalChargesAmount !== undefined ? data.additionalChargesAmount : (existingProject?.additionalChargesAmount || 0));
    const discountAmount = Number(data.discountAmount !== undefined ? data.discountAmount : (existingProject?.discountAmount || 0));
    const taxAmount = Number(data.taxAmount !== undefined ? data.taxAmount : (existingProject?.taxAmount || 0));

    const computedTotalAmount = quotationAmount + additionalServicesAmount + additionalChargesAmount - discountAmount + taxAmount;
    
    // Merge the computed totalAmount if we are touching financial fields
    const updatedData = {
      ...projectData,
      totalAmount: computedTotalAmount
    };

    const project = await ProjectRepository.update(id, {
      ...updatedData,
      ...(assignedUserIds ? {
        assignedUsers: {
          set: assignedUserIds.map(userId => ({ id: userId }))
        }
      } : {})
    });
    
    if (project.deliveryDate) {
      const existingEvent = await prisma.calendarEvent.findFirst({ where: { projectId: id, eventType: "DELIVERY" } });
      const status = project.status === "DELIVERED" || project.status === "COMPLETED" ? "COMPLETED" : (project.status === "CANCELLED" ? "CANCELLED" : "SCHEDULED");
      if (existingEvent) {
        await prisma.calendarEvent.update({
          where: { id: existingEvent.id },
          data: {
            title: `Delivery: ${project.title}`,
            date: project.deliveryDate,
            status,
          }
        });
      } else {
        await prisma.calendarEvent.create({
          data: {
            title: `Delivery: ${project.title}`,
            date: project.deliveryDate,
            isAllDay: true,
            eventType: "DELIVERY",
            status,
            clientId: project.clientId,
            projectId: project.id,
          }
        });
      }
    } else {
      await prisma.calendarEvent.deleteMany({ where: { projectId: id, eventType: "DELIVERY" } });
    }
    
    return project;
  }

  static async softDelete(id: string) {
    return ProjectRepository.softDelete(id);
  }

  static async duplicate(id: string) {
    const existingProject = await ProjectRepository.findById(id);
    if (!existingProject) throw new Error("Project not found");

    const projectCode = await ProjectService.generateCode();
    const { id: _, projectCode: __, createdAt, updatedAt, archivedAt, client, assignedUsers, activities, invoices, payments, expenses, ...projectData } = existingProject as any;

    const newProject = await ProjectRepository.create({
      ...projectData,
      projectCode,
      title: `${projectData.title} (Copy)`,
      status: "PLANNING",
      paymentStatus: "PENDING",
    });

    return newProject;
  }

  static async getById(id: string) {
    const project = await ProjectRepository.findById(id);
    if (!project) return null;

    return {
      ...project,
      quotationAmount: project.quotationAmount ? Number(project.quotationAmount) : null,
      advanceAmount: project.advanceAmount ? Number(project.advanceAmount) : null,
      totalAmount: project.totalAmount ? Number(project.totalAmount) : null,
      balanceAmount: project.balanceAmount ? Number(project.balanceAmount) : null,
      profitAmount: project.profitAmount ? Number(project.profitAmount) : null,
    };
  }

  static async getMany(params: GetProjectsParams) {
    const result = await ProjectRepository.findMany(params);
    return {
      ...result,
      projects: result.projects.map((p: any) => ({
        ...p,
        quotationAmount: p.quotationAmount ? Number(p.quotationAmount) : null,
        advanceAmount: p.advanceAmount ? Number(p.advanceAmount) : null,
        totalAmount: p.totalAmount ? Number(p.totalAmount) : null,
        balanceAmount: p.balanceAmount ? Number(p.balanceAmount) : null,
        profitAmount: p.profitAmount ? Number(p.profitAmount) : null,
      }))
    };
  }

  static async completeProject(id: string) {
    const project = await prisma.project.findUnique({
      where: { id },
      include: { shoots: true }
    });

    if (!project) return { success: false, error: "Project not found" };

    if (project.balanceAmount && Number(project.balanceAmount) > 0) {
      return { success: false, error: "Cannot complete project with outstanding balance" };
    }

    const incompleteShoots = project.shoots.some(s => s.status !== "COMPLETED");
    if (incompleteShoots) {
      return { success: false, error: "Cannot complete project with pending shoots" };
    }

    const updatedProject = await ProjectRepository.update(id, { status: "COMPLETED" });

    EventBus.emit("PROJECT_STATUS_CHANGED", {
      projectId: id,
      oldStatus: project.status,
      newStatus: "COMPLETED",
      timestamp: new Date()
    });

    const { logActivity } = await import('@/lib/timeline');
    await logActivity({
      type: "STATUS_CHANGE",
      description: `Project status marked as COMPLETED`,
      projectId: id,
      clientId: updatedProject.clientId,
    });

    return { success: true, project: updatedProject };
  }

  static async getStats() {
    const now = new Date();
    
    const [
      activeProjects,
      upcomingShoots,
      editingProjects,
      deliveredProjects,
      overdueProjects,
      revenueInProgress
    ] = await Promise.all([
      ProjectRepository.count({ archivedAt: null, status: { notIn: ["COMPLETED", "CANCELLED"] } }),
      ProjectRepository.count({ archivedAt: null, status: "SCHEDULED", startDate: { gte: now } }),
      ProjectRepository.count({ archivedAt: null, status: "EDITING" }),
      ProjectRepository.count({ archivedAt: null, status: "DELIVERED" }),
      ProjectRepository.count({ archivedAt: null, deliveryDate: { lt: now }, status: { notIn: ["DELIVERED", "COMPLETED", "CANCELLED"] } }),
      ProjectRepository.aggregate({
        _sum: { totalAmount: true },
        where: { archivedAt: null, status: { notIn: ["COMPLETED", "CANCELLED"] } }
      })
    ]);

    return {
      activeProjects,
      upcomingShoots,
      editingProjects,
      deliveredProjects,
      overdueDeliveries: overdueProjects,
      revenueInProgress: Number(revenueInProgress._sum?.totalAmount || 0)
    };
  }
}
