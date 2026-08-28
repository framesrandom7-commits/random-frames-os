import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/validations/lead";
import { LeadService } from "@/domain/services/LeadService";
import { prisma } from "@/lib/prisma";
import { CommunicationType } from "@prisma/client";

export async function POST(req: Request) {
  try {
    // Basic API Key validation
    const authHeader = req.headers.get("Authorization");
    const expectedKey = process.env.LEAD_CAPTURE_API_KEY;

    if (!expectedKey || authHeader !== `Bearer ${expectedKey}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Force creation type to AUTOMATED and status to NEW
    const validatedData = leadSchema.parse({
      ...body,
      creationType: "AUTOMATED",
      status: "NEW",
    });

    // Duplicate Check
    const { duplicate, matches } = await LeadService.checkDuplicates(
      validatedData.email,
      validatedData.phone || validatedData.whatsapp
    );

    if (duplicate && matches.length > 0) {
      const matchId = matches[0].id;
      
      // Log activity on existing lead instead of creating a new one
      await prisma.leadCommunication.create({
        data: {
          leadId: matchId,
          type: CommunicationType.NOTE,
          summary: "Automated Lead Capture (Duplicate Detected)",
          details: `An external source attempted to capture this lead again via ${validatedData.leadSource}. Data provided: ${JSON.stringify(body)}`,
          createdBy: "SYSTEM",
        }
      });

      return NextResponse.json({
        success: true,
        message: "Duplicate detected. Activity logged on existing lead.",
        leadId: matchId,
        isDuplicate: true,
      });
    }

    // Create the Lead
    const newLead = await LeadService.createLead(validatedData);

    return NextResponse.json({
      success: true,
      leadId: newLead?.id,
      isDuplicate: false,
    });

  } catch (error: any) {
    console.error("Error in lead capture API:", error);
    return NextResponse.json(
      { error: "Failed to process lead capture", details: error.message },
      { status: 400 }
    );
  }
}
