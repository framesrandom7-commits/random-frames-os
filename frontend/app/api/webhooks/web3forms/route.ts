import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { LeadStatus, LeadSource, LeadPriority, ActivityType } from "@prisma/client";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Web3Forms payload structure is usually the form fields.
    // Example fields: name, email, phone, message.
    const name = data.name || data.businessName || "Unknown Website Lead";
    const email = data.email || "";
    const phone = data.phone || data.whatsapp || "";
    const message = data.message || data.notes || data.requirement || "";

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
        description: "Lead created automatically from Website form."
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

    try {
      const { revalidatePath } = require("next/cache");
      revalidatePath("/leads");
      revalidatePath("/dashboard");
    } catch (e) {
      console.error("Cache revalidation failed", e);
    }

    return NextResponse.json({ success: true, leadId: lead.id }, { headers: corsHeaders });
  } catch (error) {
    console.error("Webhook Error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500, headers: corsHeaders });
  }
}
