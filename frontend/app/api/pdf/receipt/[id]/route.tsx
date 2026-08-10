import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderToStream } from "@react-pdf/renderer";
import { ReceiptPDF } from "@/components/pdf/receipt-pdf";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        client: true,
        project: true,
        invoice: true
      }
    });

    if (!payment) {
      return new NextResponse("Payment receipt not found", { status: 404 });
    }

    const stream = await renderToStream(<ReceiptPDF payment={payment} />);
    
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
        "Content-Disposition": `inline; filename="receipt-${payment.receiptNumber || id}.pdf"`,
      },
    });

  } catch (error) {
    console.error("Error generating payment receipt PDF:", error);
    return new NextResponse("Failed to generate receipt PDF", { status: 500 });
  }
}
