"use server";

import { prisma } from "@/lib/prisma";
import { QuotationStatus, Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { EventBus } from "@/lib/workflow/event-bus";
import { WorkflowEvent } from "@/lib/workflow/events";
import { NumberGenerator } from "@/lib/finance/number-generator.service";

export type QuotationItemData = {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
};

export type CreateQuotationData = {
  quotationNumber?: string;
  issueDate: Date;
  validUntil: Date;
  subtotal: number;
  discount?: number;
  tax?: number;
  total: number;
  status?: QuotationStatus;
  notes?: string;
  termsAndConditions?: string;
  projectId: string;
  clientId: string;
  items: QuotationItemData[];
};

export type UpdateQuotationData = Partial<Omit<CreateQuotationData, "items">> & { items?: QuotationItemData[] };

export async function createQuotation(data: CreateQuotationData) {
  try {
    const quoNum = data.quotationNumber || await NumberGenerator.generateQuotationNumber();
    
    const quotation = await prisma.quotation.create({
      data: {
        quotationNumber: quoNum,
        issueDate: data.issueDate,
        validUntil: data.validUntil,
        subtotal: data.subtotal,
        discount: data.discount || 0,
        tax: data.tax || 0,
        total: data.total,
        status: data.status || "DRAFT",
        notes: data.notes,
        termsAndConditions: data.termsAndConditions,
        projectId: data.projectId,
        clientId: data.clientId,
        items: {
          create: data.items,
        },
      },
      include: {
        items: true
      }
    });

    EventBus.publish(WorkflowEvent.QUOTATION_CREATED, {
      quotationId: quotation.id,
      projectId: data.projectId,
      clientId: data.clientId,
    });
    
    revalidatePath("/finance/quotations");
    revalidatePath(`/clients/${data.clientId}`);
    if (data.projectId) revalidatePath(`/projects/${data.projectId}`);
    
    return { success: true, quotation };
  } catch (error) {
    console.error("Error creating quotation:", error);
    return { success: false, error: "Failed to create quotation" };
  }
}

export async function updateQuotation(id: string, data: UpdateQuotationData) {
  try {
    const existingQuotation = await prisma.quotation.findUnique({ where: { id } });
    if (!existingQuotation) throw new Error("Quotation not found");
    
    // First, delete existing items if we are updating items
    if (data.items) {
      await prisma.quotationItem.deleteMany({
        where: { quotationId: id }
      });
    }
    
    const updateData: Prisma.QuotationUpdateInput = {
      quotationNumber: data.quotationNumber,
      issueDate: data.issueDate,
      validUntil: data.validUntil,
      subtotal: data.subtotal,
      discount: data.discount,
      tax: data.tax,
      total: data.total,
      status: data.status,
      notes: data.notes,
      termsAndConditions: data.termsAndConditions,
      project: data.projectId ? { connect: { id: data.projectId } } : undefined,
      client: data.clientId ? { connect: { id: data.clientId } } : undefined,
    };
    
    if (data.items) {
      updateData.items = {
        create: data.items
      };
    }

    const quotation = await prisma.quotation.update({
      where: { id },
      data: updateData,
    });

    if (existingQuotation.status !== 'APPROVED' && quotation.status === 'APPROVED') {
      EventBus.publish(WorkflowEvent.QUOTATION_APPROVED, {
        quotationId: quotation.id,
        projectId: quotation.projectId,
        clientId: quotation.clientId,
      });
    } else if (existingQuotation.status !== 'REJECTED' && quotation.status === 'REJECTED') {
      EventBus.publish(WorkflowEvent.QUOTATION_REJECTED, {
        quotationId: quotation.id,
        projectId: quotation.projectId,
        clientId: quotation.clientId,
      });
    }

    revalidatePath("/finance/quotations");
    revalidatePath(`/finance/quotations/${id}`);
    revalidatePath(`/clients/${quotation.clientId}`);
    if (quotation.projectId) revalidatePath(`/projects/${quotation.projectId}`);
    
    return { success: true, quotation };
  } catch (error) {
    console.error("Error updating quotation:", error);
    return { success: false, error: "Failed to update quotation" };
  }
}

export async function getQuotations(params?: {
  clientId?: string;
  projectId?: string;
  status?: QuotationStatus;
  page?: number;
  limit?: number;
}) {
  try {
    const page = params?.page || 1;
    const limit = params?.limit || 50;
    const skip = (page - 1) * limit;

    const where: Prisma.QuotationWhereInput = {};
    if (params?.clientId) where.clientId = params.clientId;
    if (params?.projectId) where.projectId = params.projectId;
    if (params?.status) where.status = params.status;

    const [quotations, total] = await Promise.all([
      prisma.quotation.findMany({
        where,
        include: {
          client: true,
          project: true,
        },
        orderBy: { issueDate: "desc" },
        skip,
        take: limit,
      }),
      prisma.quotation.count({ where }),
    ]);

    return {
      quotations,
      total,
      totalPages: Math.ceil(total / limit),
      page,
    };
  } catch (error) {
    console.error("Error fetching quotations:", error);
    throw new Error("Failed to fetch quotations");
  }
}

export async function getQuotationById(id: string) {
  try {
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        client: true,
        project: true,
        items: true,
      },
    });
    return quotation;
  } catch (error) {
    console.error("Error fetching quotation:", error);
    throw new Error("Failed to fetch quotation");
  }
}
