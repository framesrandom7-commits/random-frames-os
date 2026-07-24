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
    const quotation = await prisma.quotation.findUnique({
      where: { id },
      include: {
        client: true,
        project: true,
        items: true
      }
    });

    if (!quotation) {
      return new NextResponse("Quotation not found", { status: 404 });
    }

    const stream = await renderToStream(<QuotationPDF quotation={quotation as any} />);
    
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
        "Content-Disposition": `inline; filename="quotation-${quotation.quotationNumber}.pdf"`,
      },
    });

  } catch (error) {
    console.error("Error generating quotation PDF:", error);
    return new NextResponse("Failed to generate PDF", { status: 500 });
  }
}
