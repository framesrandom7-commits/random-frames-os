"use server";

import { revalidatePath } from "next/cache";
import { LeadFormData, LeadUpdateFormData } from "@/lib/validations/lead";
import { LeadStatus, ActivityType, CommunicationType } from "@prisma/client";
import { LeadService } from "@/domain/services/LeadService";
import { GetLeadsParams } from "@/domain/repositories/LeadRepository";
export type CustomerFormData = any;

export async function getLeads(params?: GetLeadsParams) {
  try {
    return await LeadService.getLeads(params);
  } catch (error) {
    console.error("Error fetching leads:", error);
    return { leads: [], total: 0, page: 1, limit: 50, totalPages: 0 };
  }
}

export async function getLead(id: string) {
  try {
    return await LeadService.getLead(id);
  } catch (error) {
    console.error("Error fetching lead:", error);
    return null;
  }
}

export async function checkLeadDuplicates(email?: string | null, phone?: string | null) {
  try {
    return await LeadService.checkDuplicates(email, phone);
  } catch (error) {
    console.error("Error checking lead duplicates:", error);
    return { duplicate: false, matches: [] };
  }
}

export async function createLead(data: LeadFormData) {
  try {
    const newLead = await LeadService.createLead(data);
    revalidatePath("/leads");
    return { success: true, lead: newLead };
  } catch (error: any) {
    console.error("Error creating lead:", error);
    return { success: false, error: error.message || "Failed to create lead" };
  }
}

export async function updateLead(id: string, data: LeadUpdateFormData) {
  try {
    const updatedLead = await LeadService.updateLead(id, data);
    revalidatePath("/leads");
    revalidatePath(`/leads/${id}`);
    return { success: true, lead: updatedLead };
  } catch (error: any) {
    console.error("Error updating lead:", error);
    return { success: false, error: error.message || "Failed to update lead" };
  }
}

export async function updateLeadStatus(id: string, status: LeadStatus) {
  try {
    const updatedLead = await LeadService.updateStatus(id, status);
    revalidatePath("/leads");
    revalidatePath(`/leads/${id}`);
    return updatedLead;
  } catch (error) {
    console.error("Error updating lead status:", error);
    return null;
  }
}

export async function softDeleteLead(id: string): Promise<boolean> {
  try {
    await LeadService.softDelete(id);
    revalidatePath("/leads");
    return true;
  } catch (error) {
    console.error("Error soft deleting lead:", error);
    return false;
  }
}

export async function addLeadActivity(leadId: string, type: ActivityType, description: string, metadata?: Record<string, unknown>) {
  try {
    const result = await LeadService.addActivity(leadId, type, description, metadata);
    revalidatePath(`/leads/${leadId}`);
    return result;
  } catch (error) {
    console.error("Error adding activity:", error);
    return null;
  }
}

export async function addLeadCommunication(leadId: string, type: CommunicationType, summary: string, details?: string) {
  try {
    const comm = await LeadService.addCommunication(leadId, type, summary, details);
    revalidatePath(`/leads/${leadId}`);
    return comm;
  } catch (error) {
    console.error("Error adding communication:", error);
    return null;
  }
}

export async function getLeadStats() {
  try {
    return await LeadService.getStats();
  } catch (error) {
    console.error("Error fetching lead stats:", error);
    return null;
  }
}

export async function importLeads(data: LeadFormData[]): Promise<{success: boolean, count?: number}> {
  try {
    const result = await LeadService.importLeads(data);
    revalidatePath("/leads");
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Error importing leads:", error);
    return { success: false };
  }
}

export async function updateLeadPhone(id: string, phone: string) {
  try {
    await LeadService.updatePhone(id, phone);
    revalidatePath("/leads");
    revalidatePath(`/leads/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Error updating lead phone:", error);
    return { success: false, error: "Failed to update phone number" };
  }
}

export async function bulkDeleteLeads(ids: string[]): Promise<boolean> {
  try {
    await LeadService.bulkDelete(ids);
    revalidatePath("/leads");
    return true;
  } catch (error) {
    console.error("Error bulk deleting leads:", error);
    return false;
  }
}

export async function bulkUpdateLeadStatus(ids: string[], status: LeadStatus): Promise<boolean> {
  try {
    await LeadService.bulkUpdateStatus(ids, status);
    revalidatePath("/leads");
    return true;
  } catch (error) {
    console.error("Error bulk updating status:", error);
    return false;
  }
}

export async function restoreLead(id: string): Promise<boolean> {
  try {
    await LeadService.restore(id);
    revalidatePath("/leads");
    return true;
  } catch (error) {
    console.error("Error restoring lead:", error);
    return false;
  }
}

export async function completeReminder(id: string): Promise<boolean> {
  try {
    const reminder = await LeadService.completeReminder(id);
    revalidatePath(`/leads/${reminder.leadId}`);
    revalidatePath("/calendar");
    return true;
  } catch (error) {
    console.error("Error completing reminder:", error);
    return false;
  }
}

export async function addLeadAttachment(leadId: string, fileName: string, fileUrl: string, fileSize: number, fileType: string) {
  try {
    const attachment = await LeadService.addAttachment(leadId, fileName, fileUrl, fileSize, fileType);
    revalidatePath(`/leads/${leadId}`);
    return attachment;
  } catch (error) {
    console.error("Error adding attachment:", error);
    return null;
  }
}

export async function submitCustomerForm(leadId: string, data: CustomerFormData) {
  try {
    await LeadService.submitCustomerForm(leadId, data);
    revalidatePath(`/leads/${leadId}`);
    return true;
  } catch (error) {
    console.error("Error submitting customer form:", error);
    return false;
  }
}

export async function markLeadAsLost(id: string, reason: string, remarks?: string) {
  try {
    await LeadService.markAsLost(id, reason, remarks);
    revalidatePath(`/leads/${id}`);
    revalidatePath("/leads");
    return true;
  } catch (error) {
    console.error("Error marking lead as lost:", error);
    return false;
  }
}

export async function convertLead(id: string) {
  try {
    await LeadService.convertLead(id);
    revalidatePath(`/leads/${id}`);
    revalidatePath("/leads");
    revalidatePath("/clients");
    return true;
  } catch (error) {
    console.error("Error converting lead:", error);
    return false;
  }
}

export type LeadWithRelations = NonNullable<Awaited<ReturnType<typeof getLead>>>;
export type LeadListWithRelations = NonNullable<Awaited<ReturnType<typeof getLeads>>>["leads"][number];


export async function markLeadAsContacted(id: string, channel: OutreachChannel) {
  try {
    const updatedLead = await LeadService.updateLead(id, {
      id,
      outreachChannel: channel,
      status: LeadStatus.CONTACTED
    });
    
    // Log the activity
    await prisma.activity.create({
      data: {
        type: "NOTE",
        description: `Marked as contacted via ${channel.replace(/_/g, " ")}`,
        leadId: id,
        createdBy: "SYSTEM",
      }
    });

    revalidatePath("/leads");
    revalidatePath(`/leads/${id}`);
    return { success: true, lead: updatedLead };
  } catch (error) {
    console.error("Error marking lead as contacted:", error);
    return { success: false, error: "Failed to update lead" };
  }
}

export async function logCallAttempt(leadId: string, outcome: 'ANSWERED' | 'NO_ANSWER' | 'VOICEMAIL') {
  try {
    const outcomeText = outcome === 'ANSWERED' ? 'Answered' : outcome === 'NO_ANSWER' ? 'No Answer' : 'Left Voicemail';
    await LeadService.addActivity(leadId, ActivityType.CALL, `Call Attempt: ${outcomeText}`);
    await LeadService.updateLead(leadId, { status: LeadStatus.CONTACTED } as any);
    revalidatePath("/leads");
    revalidatePath(`/leads/${leadId}`);
    return { success: true };
  } catch (error: any) {
    console.error("Error logging call:", error);
    return { success: false, error: error.message || "Failed to log call" };
  }
}
