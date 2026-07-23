import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LeadStatus, LeadSource, LeadPriority, ActivityType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Web3Forms payload structure is usually the form fields.
    // Example fields: name, email, phone, message.
    const name = data.name || data.businessName || "Unknown Website Lead";
    const email = data.email || "";
    const phone = data.phone || data.whatsapp || "";
    const message = data.message || data.notes || "";

    const lead = await prisma.lead.create({
      data: {
        businessName: name,
        contactPerson: name,
        email: email,
        phone: phone,
        notes: message,
        status: LeadStatus.NEW,
        leadSource: LeadSource.WEBSITE,
        priority: LeadPriority.MEDIUM,
      }
    });

    // Create Timeline Entry
    await prisma.activity.create({
      data: {
        leadId: lead.id,
        type: "STATUS_CHANGE", // Valid enum value
        description: "Lead created automatically from Website (Web3Forms)."
      }
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        title: "New Website Lead",
        message: `New inquiry received from ${name}`,
        type: "GENERAL_REMINDER", 
        leadId: lead.id,
      }
    });

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
