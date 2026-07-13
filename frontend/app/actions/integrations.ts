"use server";

import { google } from "googleapis";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { LeadStatus, LeadPriority, LeadSource, BusinessType } from "@prisma/client";

// Mock authentication logic. In a real scenario, this would use OAuth2Client.
// const oauth2Client = new google.auth.OAuth2(
//   process.env.GOOGLE_CLIENT_ID,
//   process.env.GOOGLE_CLIENT_SECRET,
//   process.env.GOOGLE_REDIRECT_URI
// );
// oauth2Client.setCredentials({ refresh_token: process.env.GOOGLE_REFRESH_TOKEN });

/**
 * Creates the standard nested Google Drive folder structure for a Project.
 * Folders: /RAW, /Photos, /Videos, /Deliverables, /Invoices, /Contracts
 */
export async function createProjectDriveFolder(projectId: string) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { client: true }
    });

    if (!project) throw new Error("Project not found");

    // In a real scenario, we would use the Drive API:
    // const drive = google.drive({ version: 'v3', auth: oauth2Client });
    // const fileMetadata = { name: `${project.client.businessName} - ${project.title}`, mimeType: 'application/vnd.google-apps.folder' };
    // const res = await drive.files.create({ requestBody: fileMetadata, fields: 'id, webViewLink' });
    
    // Simulating API call delay and mock response since we don't have OAuth credentials active yet.
    await new Promise(resolve => setTimeout(resolve, 1500));
    const mockFolderId = `gdrive_folder_${Math.random().toString(36).substring(7)}`;
    const mockLink = `https://drive.google.com/drive/folders/${mockFolderId}`;

    await prisma.project.update({
      where: { id: projectId },
      data: {
        googleDriveFolderId: mockFolderId,
        googleDriveLink: mockLink
      }
    });

    revalidatePath(`/projects/${projectId}`);
    return { success: true, link: mockLink };
  } catch (error: any) {
    console.error("Failed to create Drive folder:", error);
    return { error: error.message || "Failed to create Drive folder" };
  }
}

/**
 * Syncs a Shoot or Meeting to Google Calendar
 */
export async function syncToGoogleCalendar(eventId: string) {
  try {
    const event = await prisma.calendarEvent.findUnique({
      where: { id: eventId }
    });

    if (!event) throw new Error("Event not found");

    // Simulating Google Calendar API Create/Update
    await new Promise(resolve => setTimeout(resolve, 1000));
    const mockGoogleEventId = `gcal_evt_${Math.random().toString(36).substring(7)}`;

    await prisma.calendarEvent.update({
      where: { id: eventId },
      data: { googleCalendarEventId: mockGoogleEventId }
    });

    revalidatePath("/calendar");
    return { success: true, googleEventId: mockGoogleEventId };
  } catch (error: any) {
    console.error("Failed to sync to Calendar:", error);
    return { error: error.message || "Failed to sync to Calendar" };
  }
}

/**
 * Scans connected Gmail for Web3Forms enquiries and auto-creates Leads.
 */
export async function syncWeb3FormsEmails() {
  try {
    // Simulating Gmail API scanning:
    // const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    // const res = await gmail.users.messages.list({ userId: 'me', q: 'from:web3forms' });
    
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simulate finding a new unread email that hasn't been synced
    const mockEmailId = `email_${Math.random().toString(36).substring(7)}`;
    
    // Check if we already synced this simulated email (not really possible since it's random, but models the logic)
    const existing = await prisma.lead.findUnique({
      where: { sourceEmailId: mockEmailId }
    });

    if (existing) return { success: true, message: "No new emails found." };

    // Auto-create a Lead from parsed data
    const newLead = await prisma.lead.create({
      data: {
        businessName: "Web3Forms Enquiry - " + Math.floor(Math.random() * 1000),
        contactPerson: "Jane Doe",
        email: "frames.random.7@gmail.com",
        phone: "8073080077",
        leadSource: LeadSource.WEBSITE,
        status: LeadStatus.NEW,
        priority: LeadPriority.HIGH,
        sourceEmailId: mockEmailId,
        notes: "Automatically parsed from Web3Forms email via Gmail integration.",
      }
    });

    // Generate a notification for the new lead
    await prisma.notification.create({
      data: {
        title: "New Website Lead",
        message: `${newLead.businessName} submitted an enquiry via Web3Forms.`,
        type: "LEAD_FOLLOW_UP",
        leadId: newLead.id,
      }
    });

    revalidatePath("/leads");
    revalidatePath("/notifications");
    
    return { success: true, count: 1, message: "1 new lead created from Gmail." };
  } catch (error: any) {
    console.error("Failed to sync Gmail:", error);
    return { error: error.message || "Failed to sync Gmail" };
  }
}
