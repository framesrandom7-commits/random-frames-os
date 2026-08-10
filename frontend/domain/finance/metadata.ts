import { InvoiceStatus, PaymentStatus, QuotationStatus } from "@prisma/client";
import { StatusMetadata } from "../types/metadata";

export function getInvoiceStatusMetadata(status: InvoiceStatus): StatusMetadata {
  const metadata: Record<InvoiceStatus, StatusMetadata> = {
    [InvoiceStatus.DRAFT]: { label: "Draft", color: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20", icon: "FileText", description: "Invoice drafted", order: 1, variant: "outline" },
    [InvoiceStatus.SENT]: { label: "Sent", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: "Send", description: "Invoice sent to client", order: 2, variant: "outline" },
    [InvoiceStatus.PARTIAL]: { label: "Partial", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: "PieChart", description: "Partially paid", order: 3, variant: "outline" },
    [InvoiceStatus.PAID]: { label: "Paid", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: "CheckCircle", description: "Fully paid", order: 4, variant: "outline" },
    [InvoiceStatus.OVERDUE]: { label: "Overdue", color: "bg-rose-500/10 text-rose-500 border-rose-500/20", icon: "Clock", description: "Payment is overdue", order: 5, variant: "destructive" },
    [InvoiceStatus.CANCELLED]: { label: "Cancelled", color: "bg-zinc-800 text-zinc-400 border-zinc-700", icon: "XCircle", description: "Invoice cancelled", order: 6, variant: "secondary" }
  };
  return metadata[status];
}

export function getPaymentStatusMetadata(status: PaymentStatus): StatusMetadata {
  const metadata: Record<PaymentStatus, StatusMetadata> = {
    [PaymentStatus.PENDING]: { label: "Pending", color: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20", icon: "Clock", description: "Payment pending", order: 1, variant: "outline" },
    [PaymentStatus.PARTIAL]: { label: "Partial", color: "bg-amber-500/10 text-amber-500 border-amber-500/20", icon: "PieChart", description: "Partial payment", order: 2, variant: "outline" },
    [PaymentStatus.PAID]: { label: "Paid", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: "CheckCircle", description: "Payment complete", order: 3, variant: "outline" }
  };
  return metadata[status];
}

export function getQuotationStatusMetadata(status: QuotationStatus): StatusMetadata {
  const metadata: Record<QuotationStatus, StatusMetadata> = {
    [QuotationStatus.DRAFT]: { label: "Draft", color: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20", icon: "FileEdit", description: "Quotation drafted", order: 1, variant: "outline" },
    [QuotationStatus.SENT]: { label: "Sent", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: "Send", description: "Sent to client", order: 2, variant: "outline" },
    [QuotationStatus.VIEWED]: { label: "Viewed", color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20", icon: "Eye", description: "Viewed by client", order: 3, variant: "outline" },
    [QuotationStatus.APPROVED]: { label: "Approved", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: "CheckCircle", description: "Approved by client", order: 4, variant: "outline" },
    [QuotationStatus.REJECTED]: { label: "Rejected", color: "bg-rose-500/10 text-rose-500 border-rose-500/20", icon: "XCircle", description: "Rejected by client", order: 5, variant: "destructive" },
    [QuotationStatus.EXPIRED]: { label: "Expired", color: "bg-zinc-800 text-zinc-400 border-zinc-700", icon: "Clock", description: "Quotation expired", order: 6, variant: "secondary" }
  };
  return metadata[status];
}
