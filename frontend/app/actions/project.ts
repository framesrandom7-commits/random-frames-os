"use server";

import { revalidatePath } from "next/cache";
import { ProjectCategory, ProjectStatus, ProjectPriority, PaymentStatus } from "@prisma/client";
import { ProjectService } from "@/domain/services/ProjectService";
import { GetProjectsParams } from "@/domain/repositories/ProjectRepository";

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
  assignedUserIds?: string[];
};

export async function generateProjectCode(): Promise<string> {
  return ProjectService.generateCode();
}

export async function createProject(data: CreateProjectData) {
  try {
    const project = await ProjectService.create(data);
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
    await ProjectService.syncFinancials(projectId);
  } catch (error) {
    console.error("Failed to sync project financials:", error);
  }
}

export async function updateProject(id: string, data: Partial<CreateProjectData>) {
  try {
    const project = await ProjectService.update(id, data);
    
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
    const project = await ProjectService.softDelete(id);
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
    const newProject = await ProjectService.duplicate(id);
    revalidatePath("/projects");
    revalidatePath(`/clients/${newProject.clientId}`);
    return { success: true, project: newProject };
  } catch (error: any) {
    console.error("Error duplicating project:", error);
    return { success: false, error: error.message || "Failed to duplicate project" };
  }
}

export async function getProject(id: string) {
  try {
    return await ProjectService.getById(id);
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}

export async function completeProject(id: string) {
  try {
    return await ProjectService.completeProject(id);
  } catch (error) {
    console.error("Error completing project:", error);
    return { success: false, error: "Failed to complete project" };
  }
}

export async function getProjects(params: GetProjectsParams = {}) {
  try {
    return await ProjectService.getMany(params);
  } catch (error) {
    console.error("Error fetching projects:", error);
    return { projects: [], total: 0, totalPages: 0, currentPage: params.page || 1 };
  }
}

export async function getProjectStats() {
  try {
    return await ProjectService.getStats();
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
