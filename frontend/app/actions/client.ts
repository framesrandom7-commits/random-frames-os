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
      where: { id }
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

export async function convertLeadToClient(leadId: string) {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: leadId }
    });

    if (!lead) return { success: false, error: "Lead not found" };
    if (lead.convertedToClientId) return { success: false, error: "Lead is already converted to a client" };

    const clientCode = await generateClientCode();

    const client = await prisma.$transaction(async (tx: any) => {
      // 1. Create client from lead data
      const newClient = await tx.client.create({
        data: {
          clientCode,
          businessName: lead.businessName,
          contactPerson: lead.contactPerson,
          phone: lead.phone,
          email: lead.email,
          instagram: lead.instagram,
          website: lead.website,
          address: lead.address,
          city: lead.city,
          state: lead.state,
          country: lead.country,
          postalCode: lead.postalCode,
          businessType: lead.businessType,
          notes: lead.notes,
        }
      });

      // 2. Update lead status to WON and link to client
      await tx.lead.update({
        where: { id: leadId },
        data: {
          status: "WON",
          convertedToClientId: newClient.id
        }
      });

      return newClient;
    });

    revalidatePath("/leads");
    revalidatePath(`/leads/${leadId}`);
    revalidatePath("/clients");
    
    return { success: true, clientId: client.id };
  } catch (error) {
    console.error("Error converting lead:", error);
    return { success: false, error: "Failed to convert lead to client" };
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
