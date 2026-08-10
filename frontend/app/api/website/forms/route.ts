import { NextRequest, NextResponse } from "next/server";
import { WebsiteLeadIntakeService, WebsiteEnquiryPayload } from "../../../../domain/website/website-lead-intake";
import { Logger } from "../../../../lib/logger";

export async function POST(req: NextRequest) {
  try {
    const payload: WebsiteEnquiryPayload = await req.json();
    
    // 1. Basic CSRF and Security payload checks
    // In production, we would verify a reCAPTCHA token passed in the payload here.
    if (!payload.type || !payload.email || !payload.contactPerson) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // 2. Pass to Intake Service (which handles validation, deduplication, and EventBus decoupling)
    const result = await WebsiteLeadIntakeService.processEnquiry(payload);

    if (result.status === "DUPLICATE_REJECTED") {
      // Return 200 to not alert spam bots, but it was dropped internally
      return NextResponse.json({ success: true, message: "Enquiry received" }, { status: 200 });
    }

    return NextResponse.json({ success: true, message: "Enquiry received successfully" }, { status: 200 });

  } catch (error: any) {
    Logger.error("[WebsiteFormsAPI] Error processing website form submission:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
