import { prisma } from "@/lib/prisma";

/**
 * NumberGenerator
 * 
 * Centralized service to generate unique, sequential identifiers for financial documents.
 */
export class NumberGenerator {
  
  /**
   * Generates next quotation number, e.g. QUO-2026-001
   */
  static async generateQuotationNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `QUO-${year}-`;
    
    // Find the latest quotation number for this year
    const lastQuotation = await prisma.quotation.findFirst({
      where: {
        quotationNumber: { startsWith: prefix }
      },
      orderBy: {
        quotationNumber: 'desc'
      }
    });

    if (!lastQuotation) {
      return `${prefix}001`;
    }

    // Extract the sequence number
    const lastSequenceStr = lastQuotation.quotationNumber.replace(prefix, "");
    const lastSequence = parseInt(lastSequenceStr, 10);
    
    if (isNaN(lastSequence)) {
      // Fallback if formatting was manually overridden
      const count = await prisma.quotation.count({ where: { quotationNumber: { startsWith: prefix } }});
      return `${prefix}${(count + 1).toString().padStart(3, '0')}`;
    }

    const nextSequence = lastSequence + 1;
    return `${prefix}${nextSequence.toString().padStart(3, '0')}`;
  }

  /**
   * Generates next invoice number, e.g. INV-2026-001
   */
  static async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = `INV-${year}-`;
    
    const lastInvoice = await prisma.invoice.findFirst({
      where: {
        invoiceNumber: { startsWith: prefix }
      },
      orderBy: {
        invoiceNumber: 'desc'
      }
    });

    if (!lastInvoice) {
      return `${prefix}001`;
    }

    const lastSequenceStr = lastInvoice.invoiceNumber.replace(prefix, "");
    const lastSequence = parseInt(lastSequenceStr, 10);
    
    if (isNaN(lastSequence)) {
      const count = await prisma.invoice.count({ where: { invoiceNumber: { startsWith: prefix } }});
      return `${prefix}${(count + 1).toString().padStart(3, '0')}`;
    }

    const nextSequence = lastSequence + 1;
    return `${prefix}${nextSequence.toString().padStart(3, '0')}`;
  }

  /**
   * Generates payment reference if none provided.
   */
  static generatePaymentReference(): string {
    return `PAY-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;
  }
}
