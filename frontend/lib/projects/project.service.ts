import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { EventBus } from "@/lib/workflow/event-bus";
import { WorkflowEvent } from "@/lib/workflow/events";
import { logActivity } from "@/lib/timeline";

export class ProjectService {
  
  public static async getProjects(params: any) {
    const page = params.page || 1;
    const limit = params.limit || 50;
    const skip = (page - 1) * limit;

    const where: Prisma.ProjectWhereInput = {
      archivedAt: params.archived ? { not: null } : null,
    };

    if (params.search) {
      where.OR = [
        { title: { contains: params.search, mode: "insensitive" } },
        { projectCode: { contains: params.search, mode: "insensitive" } },
        { client: { businessName: { contains: params.search, mode: "insensitive" } } },
      ];
    }

    if (params.status) where.status = params.status;
    if (params.category) where.category = params.category;
    if (params.clientId) where.clientId = params.clientId;

    const orderBy: Prisma.ProjectOrderByWithRelationInput = {};
    if (params.sortBy) {
      orderBy[params.sortBy as keyof Prisma.ProjectOrderByWithRelationInput] = params.sortOrder || "desc";
    } else {
      orderBy.createdAt = "desc";
    }

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          client: { select: { id: true, businessName: true, contactPerson: true } },
          shoots: { select: { id: true, title: true, status: true, date: true } }
        }
      }),
      prisma.project.count({ where }),
    ]);

    return { projects, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  public static async getProject(id: string) {
    return prisma.project.findUnique({
      where: { id, archivedAt: null },
      include: {
        client: true,
        shoots: { orderBy: { date: "asc" } },
        invoices: { orderBy: { createdAt: "desc" } },
        quotations: { orderBy: { createdAt: "desc" } },
        deliveries: { orderBy: { createdAt: "desc" } },
        tasks: { orderBy: { createdAt: "desc" } },
        activities: { orderBy: { createdAt: "desc" } },
      }
    });
  }

  public static async createProject(data: any, userId?: string) {
    const projectCode = `PRJ-${Date.now().toString().slice(-6)}`;
    
    const project = await prisma.project.create({
      data: {
        ...data,
        projectCode,
      }
    });

    await logActivity({
      type: "SYSTEM",
      description: "Project created",
      projectId: project.id,
      createdBy: userId
    });

    EventBus.publish(WorkflowEvent.PROJECT_CREATED, {
      projectId: project.id,
      clientId: project.clientId,
      userId
    });

    return project;
  }

  public static async updateProject(id: string, data: any, userId?: string) {
    const project = await prisma.project.update({
      where: { id },
      data
    });

    if (data.status) {
      await logActivity({
        type: "STATUS_CHANGE",
        description: `Project status changed to ${data.status}`,
        projectId: id,
        createdBy: userId
      });
      EventBus.publish(WorkflowEvent.PROJECT_UPDATED, { projectId: id, updates: data, userId });
    }

    return project;
  }

  public static async syncProjectFinancials(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        invoices: { where: { status: { not: "CANCELLED" } } },
        payments: true,
        expenses: true,
      }
    });

    if (!project) throw new Error("Project not found");

    const totalInvoiced = project.invoices.reduce((sum, inv) => sum + Number(inv.total || 0), 0);
    const totalPaid = project.payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const balanceAmount = totalInvoiced - totalPaid;

    let paymentStatus: any = "UNPAID";
    if (totalInvoiced > 0) {
      if (totalPaid >= totalInvoiced) paymentStatus = "PAID";
      else if (totalPaid > 0) paymentStatus = "PARTIAL";
    } else {
      paymentStatus = "UNPAID";
    }

    return prisma.project.update({
      where: { id: projectId },
      data: {
        totalAmount: totalInvoiced,
        balanceAmount: balanceAmount > 0 ? balanceAmount : 0,
        paymentStatus,
      }
    });
  }

  public static async deleteProject(id: string) {
    return prisma.project.delete({ where: { id } });
  }
}
