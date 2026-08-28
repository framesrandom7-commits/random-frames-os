import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderToStream } from "@react-pdf/renderer";
import { ReceiptPDF } from "@/components/pdf/receipt-pdf";
import { getSettings } from "@/app/actions/settings";

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

        const settings = await getSettings();
    const { company, invoiceLogo, currency, invoiceFooterNotes } = settings;

    const paymentInfo = {
      acceptUpi: settings.acceptUpi !== false,
      upiId: settings.PAYMENT_UPI_ID || "",
      upiQrUrl: settings.PAYMENT_UPI_QR_URL || "",
      acceptBankTransfer: settings.acceptBankTransfer !== false,
      bankName: settings.PAYMENT_BANK_NAME || "",
      accountHolder: settings.PAYMENT_BANK_HOLDER || "",
      accountNumber: settings.PAYMENT_BANK_ACCOUNT || "",
      ifscCode: settings.PAYMENT_BANK_IFSC || ""
    };

    const stream = await renderToStream(
      <ReceiptPDF 
        payment={payment} 
        companyInfo={company as any} 
        paymentInfo={paymentInfo as any}
        invoiceLogo={invoiceLogo as string} 
        currency={currency as string}
        invoiceFooterNotes={invoiceFooterNotes as string}
      />
    );
    
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
