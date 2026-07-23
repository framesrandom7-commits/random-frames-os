"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ProjectCategory, ProjectStatus, ProjectPriority, PaymentStatus } from "@prisma/client";

export async function generateProjectCode(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  const count = await prisma.project.count({
    where: {
      createdAt: {
        gte: new Date(date.getFullYear(), date.getMonth(), 1),
      }
    }
  });

  const sequential = (count + 1).toString().padStart(3, '0');
  return `PR${year}${month}${sequential}`;
}

export type CreateProjectData = {
  clientId: string;
  title: string;
  description?: string | null;
  category?: ProjectCategory;
  status?: ProjectStatus;
  priority?: ProjectPriority;
  paymentStatus?: PaymentStatus;
  startDate?: Date | null;
  endDate?: Date | null;
  deliveryDate?: Date | null;
  quotationAmount?: number | null;
  advanceAmount?: number | null;
  totalAmount?: number | null;
  balanceAmount?: number | null;
  notes?: string | null;
};

export async function createProject(data: CreateProjectData) {
  try {
    const projectCode = await generateProjectCode();
    
    const project = await prisma.project.create({
      data: {
        ...data,
        projectCode,
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
        } : {})
      }
    });
    
    const { logActivity } = await import('@/lib/timeline');
    await logActivity({
      type: "SYSTEM",
      description: `Project '${project.title}' created`,
      projectId: project.id,
      clientId: data.clientId,
    });
    
    revalidatePath("/projects");
    revalidatePath(`/clients/${data.clientId}`);
    return { success: true, project };
  } catch (error) {
    console.error("Error creating project:", error);
    return { success: false, error: "Failed to create project" };
  }
}

export async function syncProjectFinancials(projectId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        invoices: { where: { status: { not: "CANCELLED" } } },
        payments: true,
        expenses: true,
      }
    });

    if (!project) return;

    const totalInvoiced = project.invoices.reduce((sum, inv) => sum + Number(inv.total), 0);
    const totalPaid = project.payments.reduce((sum, pay) => sum + Number(pay.amount), 0);
    const totalExpenses = project.expenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
    
    const balanceAmount = totalInvoiced - totalPaid;
    const profitAmount = totalInvoiced - totalExpenses; // Projected profit
    
    let paymentStatus: "PENDING" | "PARTIAL" | "PAID" = "PENDING";
    if (totalPaid > 0) {
      if (balanceAmount <= 0) {
        paymentStatus = "PAID";
      } else {
        paymentStatus = "PARTIAL";
      }
    }

    await prisma.project.update({
      where: { id: projectId },
      data: {
        totalAmount: totalInvoiced,
        balanceAmount: balanceAmount,
        paymentStatus: paymentStatus,
        profitAmount: profitAmount,
      }
    });
  } catch (error) {
    console.error("Failed to sync project financials:", error);
  }
}

export async function updateProject(id: string, data: Partial<CreateProjectData>) {
  try {
    const project = await prisma.project.update({
      where: { id },
      data,
    });
    
    // Sync CalendarEvent
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
    
    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);
    revalidatePath(`/clients/${project.clientId}`);
    revalidatePath("/calendar");
    return { success: true, project };
  } catch (error) {
    console.error("Error updating project:", error);
    return { success: false, error: "Failed to update project" };
  }
}

export async function deleteProject(id: string) {
  try {
    const project = await prisma.project.update({
      where: { id },
      data: {
        archivedAt: new Date()
      }
    });
    
    revalidatePath("/projects");
    revalidatePath(`/clients/${project.clientId}`);
    return true;
  } catch (error) {
    console.error("Error deleting project:", error);
    return false;
  }
}

export async function duplicateProject(id: string) {
  try {
    const existingProject = await prisma.project.findUnique({
      where: { id }
    });

    if (!existingProject) {
      return { success: false, error: "Project not found" };
    }

    const projectCode = await generateProjectCode();
    
     
    const { id: _, projectCode: __, createdAt, updatedAt, archivedAt, ...projectData } = existingProject;

    const newProject = await prisma.project.create({
      data: {
        ...projectData,
        projectCode,
        title: `${projectData.title} (Copy)`,
        status: "INQUIRY",
        paymentStatus: "PENDING",
      }
    });

    revalidatePath("/projects");
    revalidatePath(`/clients/${newProject.clientId}`);
    return { success: true, project: newProject };
  } catch (error) {
    console.error("Error duplicating project:", error);
    return { success: false, error: "Failed to duplicate project" };
  }
}

export async function getProject(id: string) {
  try {
    return await prisma.project.findUnique({
      where: { id },
      include: {
        client: true,
        activities: {
          orderBy: { createdAt: "desc" }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}

export async function completeProject(id: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        shoots: true,
      }
    });

    if (!project) {
      return { success: false, error: "Project not found" };
    }

    if (project.balanceAmount && Number(project.balanceAmount) > 0) {
      return { success: false, error: "Cannot complete project with outstanding balance" };
    }

    const incompleteShoots = project.shoots.some(s => s.status !== "COMPLETED");
    if (incompleteShoots) {
      return { success: false, error: "Cannot complete project with pending shoots" };
    }

    const updatedProject = await prisma.project.update({
      where: { id },
      data: { status: "COMPLETED" },
    });

    const { logActivity } = await import('@/lib/timeline');
    await logActivity({
      type: "STATUS_CHANGE",
      description: `Project status marked as COMPLETED`,
      projectId: id,
      clientId: updatedProject.clientId,
    });

    revalidatePath("/projects");
    revalidatePath(`/projects/${id}`);
    
    return { success: true, project: updatedProject };
  } catch (error) {
    console.error("Error completing project:", error);
    return { success: false, error: "Failed to complete project" };
  }
}

export type GetProjectsParams = {
  page?: number;
  limit?: number;
  search?: string;
  clientId?: string;
  status?: ProjectStatus | "";
  priority?: ProjectPriority | "";
  paymentStatus?: PaymentStatus | "";
  archived?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export async function getProjects(params: GetProjectsParams = {}) {
  const {
    page = 1,
    limit = 50,
    search = "",
    clientId,
    status,
    priority,
    paymentStatus,
    archived = false,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = params;

  try {
    const where: any = {};
    
    if (archived) {
      where.archivedAt = { not: null };
    } else {
      where.archivedAt = null;
    }

    if (clientId) {
      where.clientId = clientId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { projectCode: { contains: search, mode: "insensitive" } },
        { client: { businessName: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (paymentStatus) where.paymentStatus = paymentStatus;

    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          client: true
        }
      }),
      prisma.project.count({ where }),
    ]);

    return {
      projects,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching projects:", error);
    return { projects: [], total: 0, totalPages: 0, currentPage: page };
  }
}

export async function getProjectStats() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [
      activeProjects,
      upcomingShoots,
      editingProjects,
      deliveredProjects,
      overdueProjects,
      revenueInProgress
    ] = await Promise.all([
      prisma.project.count({ 
        where: { archivedAt: null, status: { notIn: ["COMPLETED", "CANCELLED"] } } 
      }),
      prisma.project.count({ 
        where: { archivedAt: null, status: "PLANNED", startDate: { gte: now } } 
      }),
      prisma.project.count({ 
        where: { archivedAt: null, status: "EDITING" } 
      }),
      prisma.project.count({ 
        where: { archivedAt: null, status: "DELIVERED" } 
      }),
      prisma.project.count({ 
        where: { archivedAt: null, deliveryDate: { lt: now }, status: { notIn: ["DELIVERED", "COMPLETED", "CANCELLED"] } } 
      }),
      prisma.project.aggregate({
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
      revenueInProgress: Number(revenueInProgress._sum.totalAmount || 0)
    };
  } catch (error) {
    console.error("Error fetching project stats:", error);
    return {
      activeProjects: 0,
      upcomingShoots: 0,
      editingProjects: 0,
      deliveredProjects: 0,
      overdueDeliveries: 0,
      revenueInProgress: 0
    };
  }
}

export type ProjectWithClient = NonNullable<Awaited<ReturnType<typeof getProject>>>;
export type ProjectListWithClient = Awaited<ReturnType<typeof getProjects>>["projects"][number];
