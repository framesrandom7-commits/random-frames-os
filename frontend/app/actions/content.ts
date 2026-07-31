"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { ContentPlatform, ContentEditingStatus, ContentApprovalStatus, ContentPublishingStatus } from "@prisma/client";
import { GlobalErrorService } from "@/lib/core/errors/global-error.service";

export type CreateContentData = {
  title: string;
  description?: string | null;
  shootDate?: Date | null;
  platform: ContentPlatform;
  projectId: string;
};

export async function createContentPlan(data: CreateContentData) {
  try {
    const content = await prisma.contentPlan.create({
      data,
    });
    
    const { logActivity } = await import('@/lib/timeline');
    await logActivity({
      type: "SYSTEM",
      description: `Content Plan '${content.title}' created`,
      projectId: content.projectId,
    });
    
    revalidatePath("/content");
    revalidatePath(`/projects/${content.projectId}`);
    return { success: true, content };
  } catch (error) {
    console.error("Error creating content plan:", error);
    return GlobalErrorService.handleError(error, "Action:createContentPlan");
  }
}

export async function updateContentPlan(
  id: string, 
  data: Partial<CreateContentData & { 
    editingStatus: ContentEditingStatus; 
    approvalStatus: ContentApprovalStatus;
    publishingStatus: ContentPublishingStatus;
  }>
) {
  try {
    const content = await prisma.contentPlan.update({
      where: { id },
      data,
    });
    
    revalidatePath("/content");
    revalidatePath(`/projects/${content.projectId}`);
    return { success: true, content };
  } catch (error) {
    console.error("Error updating content plan:", error);
    return GlobalErrorService.handleError(error, "Action:updateContentPlan");
  }
}

export async function deleteContentPlan(id: string) {
  try {
    const content = await prisma.contentPlan.delete({
      where: { id },
    });
    
    revalidatePath("/content");
    revalidatePath(`/projects/${content.projectId}`);
    return { success: true };
  } catch (error) {
    console.error("Error deleting content plan:", error);
    return GlobalErrorService.handleError(error, "Action:deleteContentPlan");
  }
}

export async function getContentPlans(params?: {
  projectId?: string;
  platform?: ContentPlatform | "";
  editingStatus?: ContentEditingStatus | "";
  approvalStatus?: ContentApprovalStatus | "";
  publishingStatus?: ContentPublishingStatus | "";
  page?: number;
  limit?: number;
  search?: string;
}) {
  const {
    projectId, platform, editingStatus, approvalStatus, publishingStatus,
    page = 1, limit = 50, search = ""
  } = params || {};

  try {
    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (platform) where.platform = platform;
    if (editingStatus) where.editingStatus = editingStatus;
    if (approvalStatus) where.approvalStatus = approvalStatus;
    if (publishingStatus) where.publishingStatus = publishingStatus;
    
    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    const skip = (page - 1) * limit;

    const [content, total] = await Promise.all([
      prisma.contentPlan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          project: {
            include: { client: true }
          }
        }
      }),
      prisma.contentPlan.count({ where }),
    ]);

    return {
      content,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching content plans:", error);
    return { content: [], total: 0, totalPages: 0, currentPage: page };
  }
}
