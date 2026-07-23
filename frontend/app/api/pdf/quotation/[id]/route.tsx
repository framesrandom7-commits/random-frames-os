import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderToStream } from "@react-pdf/renderer";
import { QuotationPDF } from "@/components/pdf/quotation-pdf";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const lead = await prisma.lead.findUnique({
      where: { id },
    });

    if (!lead) {
      return new NextResponse("Lead not found", { status: 404 });
    }

    const stream = await renderToStream(<QuotationPDF lead={lead} />);
    
    // Convert NodeJS ReadableStream to Web ReadableStream
    const readableStream = new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => controller.error(err));
      }
    });

    return new NextResponse(readableStream, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="quotation-${lead.businessName || 'client'}.pdf"`,
      },
    });

  } catch (error) {
    console.error("Error generating quotation PDF:", error);
    return new NextResponse("Failed to generate PDF", { status: 500 });
  }
}
