import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderToStream } from "@react-pdf/renderer";
import { QuotationPDF } from "@/components/pdf/quotation-pdf";
import { getSettings } from "@/app/actions/settings";

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

        const settings = await getSettings();
    const { company: companyInfo, invoiceLogo, invoiceFooterNotes, currency, taxPercentage } = settings;

    const payment = {
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
      <QuotationPDF 
        quotation={quotation} 
        companyInfo={companyInfo as any} 
        paymentInfo={payment as any}
        invoiceLogo={invoiceLogo as string} 
        currency={currency as string}
        taxPercentage={taxPercentage as string}
        invoiceFooterNotes={invoiceFooterNotes as string}
      />
    );
    
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
