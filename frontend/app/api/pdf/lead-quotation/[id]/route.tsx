import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderToStream } from "@react-pdf/renderer";
import { LeadQuotationPDF } from "@/components/pdf/lead-quotation-pdf";
import { getSettings } from "@/app/actions/settings";
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const lead = await prisma.lead.findUnique({
      where: { id }
    });

    if (!lead) {
      return new NextResponse("Lead not found", { status: 404 });
    }

    const { invoiceLogo } = await getSettings();

    const stream = await renderToStream(<LeadQuotationPDF lead={lead} invoiceLogo={invoiceLogo as string} />);
    
    // Convert NodeJS ReadableStream to Web ReadableStream
    const readableStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => controller.error(err));
      }
    });

    const businessName = lead.businessName || lead.contactPerson || "Lead";
    const filename = `Quotation-${businessName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;

    return new NextResponse(readableStream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="${filename}"`,
      },
    });

  } catch (error) {
    console.error("Error generating lead quotation PDF:", error);
    return new NextResponse("Failed to generate PDF", { status: 500 });
  }
}
