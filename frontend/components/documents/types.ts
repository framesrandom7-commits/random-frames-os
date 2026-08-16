export type DocumentType = "QUOTATION" | "INVOICE" | "RECEIPT";

export interface DocumentData {
  documentNumber: string;
  issueDate: Date;
  dueDate?: Date;
  validUntil?: Date;
  status: string;
  
  // Client Info
  clientName: string;
  businessName?: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAddress?: string;

  // Project Info
  projectName?: string;
  category?: string;
  shootType?: string;
  location?: string;
  shootDate?: Date;
  deliveryTimeline?: string;

  // Items
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;

  // Deliverables
  deliverables?: string[];

  // Summary
  subtotal: number;
  discount?: number;
  total: number;

  // Receipt specific
  paymentDate?: Date;
  amountReceived?: number;
  paymentMethod?: string;
  transactionId?: string;
  invoiceReference?: string;
}

export interface CompanySettings {
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  website?: string;
}

export interface PaymentSettings {
  acceptUpi?: boolean;
  upiId?: string;
  qrCodeUrl?: string;
  instructions?: string;
  
  acceptBankTransfer?: boolean;
  accountHolder?: string;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
}
