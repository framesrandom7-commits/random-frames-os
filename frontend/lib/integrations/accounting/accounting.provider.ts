import { BaseProvider } from "../core/provider.interface";

export interface InvoicePayload {
  invoiceNumber: string;
  totalAmount: number;
  clientId: string;
  date: Date;
  status: string;
}

export abstract class AccountingProvider extends BaseProvider {
  /**
   * Sync an invoice to the external accounting software.
   */
  public abstract syncInvoice(payload: InvoicePayload): Promise<boolean>;
  
  /**
   * Sync a payment to the external accounting software.
   */
  public abstract syncPayment(paymentId: string, amount: number): Promise<boolean>;
}
