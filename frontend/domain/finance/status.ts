import { InvoiceStatus, PaymentStatus, QuotationStatus } from "@prisma/client";

export const UNPAID_INVOICE_STATUSES: InvoiceStatus[] = [
  InvoiceStatus.DRAFT,
  InvoiceStatus.SENT,
  InvoiceStatus.PARTIAL,
  InvoiceStatus.OVERDUE
];

export const PAID_INVOICE_STATUSES: InvoiceStatus[] = [
  InvoiceStatus.PAID
];

export const PENDING_PAYMENT_STATUSES: PaymentStatus[] = [
  PaymentStatus.PENDING,
  PaymentStatus.PARTIAL
];

export const ACTIVE_QUOTATION_STATUSES: QuotationStatus[] = [
  QuotationStatus.DRAFT,
  QuotationStatus.SENT
];
