import { DocumentSequenceService } from "@/domain/document/sequence";

/**
 * NumberGenerator
 * 
 * Centralized service to generate unique, sequential identifiers for financial documents.
 */
export class NumberGenerator {
  
  /**
   * Generates next quotation number, e.g. RF-QT-202608_101
   */
  static async generateQuotationNumber(): Promise<string> {
    return DocumentSequenceService.getNextDocumentNumber("QUOTATION");
  }

  /**
   * Generates next invoice number, e.g. RF-INV-202608_101
   */
  static async generateInvoiceNumber(): Promise<string> {
    return DocumentSequenceService.getNextDocumentNumber("INVOICE");
  }

  /**
   * Generates next receipt number, e.g. RF-RCP-202608_101
   */
  static async generateReceiptNumber(): Promise<string> {
    return DocumentSequenceService.getNextDocumentNumber("RECEIPT");
  }

  /**
   * Generates payment reference if none provided, optionally embedding a client ID suffix.
   */
  static generatePaymentReference(clientId?: string): string {
    const timeHash = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000);
    
    if (clientId) {
      // Use the last 6 characters of the Client CUID/UUID to keep the ID concise
      const shortClient = clientId.slice(-6).toUpperCase();
      return `PAY-${shortClient}-${timeHash}-${random}`;
    }
    
    return `PAY-${timeHash}-${random}`;
  }
}
