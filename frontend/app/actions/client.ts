"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { BusinessType } from "@prisma/client";

export async function generateClientCode(): Promise<string> {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  
  const count = await prisma.client.count({
    where: {
      createdAt: {
        gte: new Date(date.getFullYear(), date.getMonth(), 1),
      }
    }
  });

  const sequential = (count + 1).toString().padStart(3, '0');
  return `CL${year}${month}${sequential}`;
}

export type CreateClientData = {
  businessName: string;
  contactPerson?: string | null;
  phone?: string | null;
  email?: string | null;
  instagram?: string | null;
  website?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  postalCode?: string | null;
  businessType?: BusinessType;
  gstNumber?: string | null;
  notes?: string | null;
};

export async function createClient(data: CreateClientData) {
  try {
    const clientCode = await generateClientCode();
    
    const client = await prisma.client.create({
      data: {
        ...data,
        clientCode,
      }
    });
    
    const { logActivity } = await import('@/lib/timeline');
    await logActivity({
      type: "SYSTEM",
      description: `Client profile created`,
      clientId: client.id,
    });
    
    revalidatePath("/clients");
    return { success: true, client };
  } catch (error) {
    console.error("Error creating client:", error);
    return { success: false, error: "Failed to create client" };
  }
}

export async function updateClient(id: string, data: Partial<CreateClientData>) {
  try {
    const client = await prisma.client.update({
      where: { id },
      data,
    });
    
    revalidatePath("/clients");
    revalidatePath(`/clients/${id}`);
    return { success: true, client };
  } catch (error) {
    console.error("Error updating client:", error);
    return { success: false, error: "Failed to update client" };
  }
}

export async function updateClientPhone(id: string, phone: string) {
  try {
    await prisma.client.update({
      where: { id },
      data: { phone },
    });
    
    const { logActivity } = await import('@/lib/timeline');
    await logActivity({
      type: "SYSTEM",
      description: `Phone number updated to ${phone}`,
      clientId: id
    });
    
    revalidatePath("/clients");
    revalidatePath(`/clients/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating client phone:", error);
    return { success: false, error: "Failed to update phone number" };
  }
}
export async function deleteClient(id: string) {
  try {
    await prisma.client.update({
      where: { id },
      data: {
        archivedAt: new Date()
      }
    });
    
    revalidatePath("/clients");
    return true;
  } catch (error) {
    console.error("Error deleting client:", error);
    return false;
  }
}

export async function getClient(id: string) {
  try {
    return await prisma.client.findUnique({
      where: { id },
      include: {
        activities: {
          orderBy: { createdAt: "desc" }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching client:", error);
    return null;
  }
}

export type GetClientsParams = {
  page?: number;
  limit?: number;
  search?: string;
  businessType?: BusinessType | "";
  archived?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
};

export async function getClients(params: GetClientsParams = {}) {
  const {
    page = 1,
    limit = 50,
    search = "",
    businessType,
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

    if (search) {
      where.OR = [
        { businessName: { contains: search, mode: "insensitive" } },
        { contactPerson: { contains: search, mode: "insensitive" } },
        { clientCode: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    if (businessType) {
      where.businessType = businessType;
    }

    const skip = (page - 1) * limit;

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
      prisma.client.count({ where }),
    ]);

    return {
      clients,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error fetching clients:", error);
    return { clients: [], total: 0, totalPages: 0, currentPage: page };
  }
}

import { generateProjectCode } from "./project";
import { generateShootCode } from "./shoot";

export type OnboardClientData = {
  leadId: string;
  // Client Info
  businessName: string;
  contactPerson: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  website: string;
  address: string;
  gstNumber: string;
  clientNotes: string;
  // Project Info
  projectTitle: string;
  projectCategory: any; // ProjectCategory
  projectDescription: string;
  deliverables: string;
  projectPriority: any; // ProjectPriority
  // Shoot Info
  shootDate: string;
  shootStartTime: string;
  shootEndTime: string;
  shootLocation: string;
  equipmentNeeded: string;
  shootNotes: string;
  // Finance Info
  quotedAmount: number;
  discountAmount: number;
  finalAmount: number;
  advanceReceived: number;
  balanceAmount: number;
};

export async function onboardClient(data: OnboardClientData) {
  try {
    const lead = await prisma.lead.findUnique({ where: { id: data.leadId } });
    if (!lead) return { success: false, error: "Lead not found" };
    if (lead.convertedToClientId) return { success: false, error: "Lead already converted" };

    const clientCode = await generateClientCode();
    // In a real app we'd import generateProjectCode, but since it's not exported nicely or we can just generate it inline:
    // Let's just generate basic codes if imports fail, or use inline.
    const projectCode = `PRJ${new Date().getTime().toString().slice(-6)}`;
    const shootCode = `SHT${new Date().getTime().toString().slice(-6)}`;
    const invoiceNumber = `INV${new Date().getTime().toString().slice(-6)}`;

    const result = await prisma.$transaction(async (tx: any) => {
      // 1. Create Client
      let combinedNotes = data.clientNotes || "";
      if (data.whatsapp) combinedNotes += `\nWhatsApp: ${data.whatsapp}`;
      if (data.gstNumber) combinedNotes += `\nGST Number: ${data.gstNumber}`;

      const newClient = await tx.client.create({
        data: {
          clientCode,
          businessName: data.businessName,
          contactPerson: data.contactPerson,
          phone: data.phone,
          email: data.email,
          instagram: data.instagram,
          website: data.website,
          address: data.address,
          notes: combinedNotes,
        }
      });

      // 2. Create Project
      const newProject = await tx.project.create({
        data: {
          projectCode,
          title: data.projectTitle,
          description: data.projectDescription,
          category: data.projectCategory || "OTHER",
          priority: data.projectPriority || "MEDIUM",
          clientId: newClient.id,
          quotationAmount: data.finalAmount,
          advanceAmount: data.advanceReceived,
          totalAmount: data.finalAmount,
          balanceAmount: data.balanceAmount,
          paymentStatus: data.balanceAmount <= 0 ? "PAID" : (data.advanceReceived > 0 ? "PARTIAL" : "PENDING"),
        }
      });

      // 3. Create Shoot
      const newShoot = await tx.shoot.create({
        data: {
          shootCode,
          title: `Shoot: ${data.projectTitle}`,
          date: data.shootDate ? new Date(data.shootDate) : null,
          startTime: data.shootStartTime,
          endTime: data.shootEndTime,
          location: data.shootLocation,
          notes: data.shootNotes,
          clientRequirements: data.deliverables,
          projectId: newProject.id,
          clientId: newClient.id,
        }
      });

      // 4. Create Finance Record (Invoice)
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          issueDate: new Date(),
          dueDate: new Date(new Date().getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
          subtotal: data.quotedAmount,
          discount: data.discountAmount,
          total: data.finalAmount,
          status: data.balanceAmount <= 0 ? "PAID" : (data.advanceReceived > 0 ? "PARTIAL" : "SENT"),
          clientId: newClient.id,
          projectId: newProject.id,
        }
      });

      // 5. If advance received, create Payment
      if (data.advanceReceived > 0) {
        await tx.payment.create({
          data: {
            amount: data.advanceReceived,
            paymentDate: new Date(),
            clientId: newClient.id,
            projectId: newProject.id,
            invoiceId: invoice.id,
            notes: "Advance payment received on onboarding"
          }
        });
      }

      // 6. Create Calendar Event
      if (data.shootDate) {
        await tx.calendarEvent.create({
          data: {
            title: `Shoot: ${data.projectTitle}`,
            date: new Date(data.shootDate),
            startTime: data.shootStartTime,
            endTime: data.shootEndTime,
            eventType: "SHOOT",
            clientId: newClient.id,
            projectId: newProject.id,
            shootId: newShoot.id,
          }
        });
      }

      // 7. Update Lead
      await tx.lead.update({
        where: { id: data.leadId },
        data: {
          status: "CONVERTED_TO_CLIENT",
          convertedToClientId: newClient.id
        }
      });

      return { newClient, newProject };
    });

    const { logActivity } = await import('@/lib/timeline');
    await logActivity({
      type: "SYSTEM",
      description: `Client onboarded. Created project: ${data.projectTitle}`,
      clientId: result.newClient.id,
      projectId: result.newProject.id,
      leadId: data.leadId,
    });

    revalidatePath("/leads");
    revalidatePath(`/leads/${data.leadId}`);
    revalidatePath("/clients");
    revalidatePath("/projects");
    revalidatePath("/shoots");
    revalidatePath("/finance");
    revalidatePath("/calendar");
    
    return { success: true, clientId: result.newClient.id };
  } catch (error) {
    console.error("Error onboarding client:", error);
    return { success: false, error: "Failed to onboard client" };
  }
}

export async function getClientStats() {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [totalClients, newClientsThisMonth, archivedClients] = await Promise.all([
      prisma.client.count({ where: { archivedAt: null } }),
      prisma.client.count({ where: { archivedAt: null, createdAt: { gte: startOfMonth } } }),
      prisma.client.count({ where: { archivedAt: { not: null } } }),
    ]);

    return {
      totalClients,
      newClientsThisMonth,
      activeClients: totalClients, // Since we don't have project tracking yet, all non-archived are "active"
      inactiveClients: archivedClients
    };
  } catch (error) {
    console.error("Error fetching client stats:", error);
    return {
      totalClients: 0,
      newClientsThisMonth: 0,
      activeClients: 0,
      inactiveClients: 0
    };
  }
}
