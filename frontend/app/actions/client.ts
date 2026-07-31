"use server";

import { revalidatePath } from "next/cache";
import { BusinessType, ProjectCategory, ProjectPriority } from "@prisma/client";
import { ClientService } from "@/domain/services/ClientService";
import { GetClientsParams } from "@/domain/repositories/ClientRepository";
import { GlobalErrorService } from "@/lib/core/errors/global-error.service";

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
  whatsapp?: string | null;
  googleMapsLink?: string | null;
  serviceType?: string | null;
  preferredContactMethod?: any; 
  ownerNotes?: string | null;
  notes?: string | null;
};

export type OnboardClientData = {
  leadId: string;
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
  projectTitle: string;
  projectCategory: ProjectCategory; 
  projectDescription: string;
  deliverables: string;
  projectPriority: ProjectPriority; 
};

export async function generateClientCode(): Promise<string> {
  return ClientService.generateCode();
}

export async function createClient(data: CreateClientData) {
  try {
    const client = await ClientService.create(data);
    revalidatePath("/clients");
    return { success: true, client };
  } catch (error) {
    console.error("Error in createClient:", error);
    return GlobalErrorService.handleError(error, "Action:createClient");
  }
}

export async function updateClient(id: string, data: Partial<CreateClientData>) {
  try {
    const client = await ClientService.update(id, data);
    revalidatePath("/clients");
    revalidatePath(`/clients/${id}`);
    return { success: true, client };
  } catch (error) {
    console.error("Error in updateClient:", error);
    return GlobalErrorService.handleError(error, "Action:updateClient");
  }
}

export async function updateClientPhone(id: string, phone: string) {
  try {
    await ClientService.updatePhone(id, phone);
    revalidatePath("/clients");
    revalidatePath(`/clients/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Error in updateClientPhone:", error);
    return GlobalErrorService.handleError(error, "Action:updateClientPhone");
  }
}

export async function deleteClient(id: string) {
  try {
    await ClientService.softDelete(id);
    revalidatePath("/clients");
    return true;
  } catch (error) {
    console.error("Error in deleteClient:", error);
    return GlobalErrorService.handleError(error, "Action:deleteClient");
  }
}

export async function getClient(id: string) {
  try {
    return await ClientService.getById(id);
  } catch (error) {
    console.error("Error in getClient:", error);
    return GlobalErrorService.handleError(error, "Action:getClient");
  }
}

export async function getClients(params: GetClientsParams = {}) {
  try {
    return await ClientService.getMany(params);
  } catch (error) {
    console.error("Error in getClients:", error);
    return GlobalErrorService.handleError(error, "Action:getClients");
  }
}

export async function onboardClient(data: OnboardClientData) {
  try {
    const client = await ClientService.onboard(data);
    
    revalidatePath("/leads");
    revalidatePath(`/leads/${data.leadId}`);
    revalidatePath("/clients");
    revalidatePath("/projects");
    revalidatePath("/shoots");
    revalidatePath("/finance");
    revalidatePath("/calendar");
    
    return { success: true, clientId: client.id };
  } catch (error) {
    console.error("Error in onboardClient:", error);
    return GlobalErrorService.handleError(error, "Action:onboardClient");
  }
}

export async function getClientStats() {
  try {
    return await ClientService.getStats();
  } catch (error) {
    console.error("Error in getClientStats:", error);
    return GlobalErrorService.handleError(error, "Action:getClientStats");
  }
}
