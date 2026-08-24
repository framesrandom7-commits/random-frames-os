import { prisma } from "@/lib/prisma";
import { DocumentData, DocumentType, CompanySettings, PaymentSettings } from "@/components/documents/types";
import { getSettings } from "@/app/actions/settings";

export class DocumentService {
  static async getDocumentData(
    type: DocumentType,
    id: string
  ): Promise<{ data: DocumentData; companyInfo: CompanySettings; paymentInfo?: PaymentSettings }> {
    let data: DocumentData;
    let paymentInfo: PaymentSettings | undefined;

    if (type === "QUOTATION") {
      const q = await prisma.quotation.findUnique({
        where: { id },
        include: { client: true, project: true, items: true }
      });
      if (!q) throw new Error("Quotation not found");

      data = {
        documentNumber: q.quotationNumber,
        issueDate: q.issueDate,
        validUntil: q.validUntil,
        status: q.status,
        clientName: q.client.businessName || q.client.contactPerson || "Unknown",
        clientPhone: q.client.phone || undefined,
        clientEmail: q.client.email || undefined,
        clientAddress: [q.client.address, q.client.city, q.client.state].filter(Boolean).join(", "),
        projectName: q.project?.title,
        category: q.project?.category,
        shootType: q.project?.shoots?.[0]?.shootType, // approx
        location: q.project?.shoots?.[0]?.location || undefined,
        shootDate: q.project?.shoots?.[0]?.date || undefined,
        deliveryTimeline: undefined,
        items: q.items.map(i => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
          total: Number(i.total),
        })),
        deliverables: q.deliverables ? (q.deliverables as string[]) : undefined,
        subtotal: Number(q.subtotal),
        discount: Number(q.discount || 0),
        total: Number(q.total),
      };
    } else if (type === "INVOICE") {
      const inv = await prisma.invoice.findUnique({
        where: { id },
        include: { client: true, project: true, items: true }
      });
      if (!inv) throw new Error("Invoice not found");

      data = {
        documentNumber: inv.invoiceNumber,
        issueDate: inv.issueDate,
        dueDate: inv.dueDate,
        status: inv.status,
        clientName: inv.client.businessName || inv.client.contactPerson || "Unknown",
        clientPhone: inv.client.phone || undefined,
        clientEmail: inv.client.email || undefined,
        clientAddress: [inv.client.address, inv.client.city, inv.client.state].filter(Boolean).join(", "),
        projectName: inv.project?.title,
        category: inv.project?.category,
        items: inv.items.map(i => ({
          description: i.description,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
          total: Number(i.total),
        })),
        deliverables: inv.deliverables ? (inv.deliverables as string[]) : undefined,
        subtotal: Number(inv.subtotal),
        discount: Number(inv.discount || 0),
        total: Number(inv.total),
      };

      paymentInfo = inv.paymentSnapshot ? (inv.paymentSnapshot as unknown as PaymentSettings) : undefined;
    } else {
      const rcp = await prisma.payment.findUnique({
        where: { id },
        include: { client: true, project: true, invoice: true }
      });
      if (!rcp) throw new Error("Receipt not found");
      
      data = {
        documentNumber: rcp.receiptNumber || `RF-RCP-${Date.now()}`,
        issueDate: rcp.paymentDate,
        status: "PAID",
        clientName: rcp.client.businessName || rcp.client.contactPerson || "Unknown",
        clientPhone: rcp.client.phone || undefined,
        clientEmail: rcp.client.email || undefined,
        clientAddress: [rcp.client.address, rcp.client.city, rcp.client.state].filter(Boolean).join(", "),
        items: [],
        subtotal: Number(rcp.amount),
        total: Number(rcp.amount),
        paymentDate: rcp.paymentDate,
        amountReceived: Number(rcp.amount),
        paymentMethod: rcp.paymentMethod,
        transactionId: rcp.upiTransactionId || rcp.bankReference || rcp.referenceNumber || undefined,
        invoiceReference: rcp.invoice?.invoiceNumber,
      };
    }

    const rawSettings = await getSettings();
    const companyInfo: CompanySettings = {
      businessName: rawSettings.BUSINESS_NAME || "Random Frames",
      ownerName: rawSettings.BUSINESS_OWNER || "Savan Somaiah T P",
      phone: rawSettings.BUSINESS_PHONE || "8073080077",
      email: rawSettings.BUSINESS_EMAIL || "frames.random.7@gmail.com",
      address: rawSettings.BUSINESS_ADDRESS || "Bangalore | Coorg, India",
      website: rawSettings.BUSINESS_WEBSITE || "random.frames.7",
      gstin: rawSettings.BUSINESS_GSTIN || undefined,
    };

    if (type === "INVOICE" && !paymentInfo) {
      paymentInfo = {
        acceptUpi: rawSettings.acceptUpi !== false,
        upiId: rawSettings.PAYMENT_UPI_ID || "randomframes@upi",
        acceptBankTransfer: rawSettings.acceptBankTransfer !== false,
        bankName: rawSettings.PAYMENT_BANK_NAME || "State Bank of India",
        accountHolder: rawSettings.PAYMENT_BANK_HOLDER || "Random Frames",
        accountNumber: rawSettings.PAYMENT_BANK_ACCOUNT || "123456789012",
        ifscCode: rawSettings.PAYMENT_BANK_IFSC || "SBIN0001234",
      };
    }

    return { data, companyInfo, paymentInfo };
  }
}
