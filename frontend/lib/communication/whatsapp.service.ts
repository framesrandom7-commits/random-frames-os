/**
 * WhatsAppService
 * 
 * Provides WhatsApp sharing links and message templates.
 * Designed to easily switch to WhatsApp Business API in the future.
 */

export interface WhatsAppMessage {
  phone: string;
  text: string;
}

export class WhatsAppService {
  
  /**
   * Generates a web-friendly WhatsApp share link (https://wa.me/...)
   */
  static generateShareLink(phone: string, text: string): string {
    // Remove all non-numeric characters from phone
    const cleanPhone = phone.replace(/\D/g, "");
    const encodedText = encodeURIComponent(text);
    return `https://wa.me/${cleanPhone}?text=${encodedText}`;
  }

  /**
   * Template for sharing a Quotation
   */
  static buildQuotationMessage(
    clientName: string, 
    quotationNumber: string, 
    amount: string, 
    documentUrl: string
  ): string {
    return `Hi ${clientName},\n\nPlease find your quotation (${quotationNumber}) for the amount of ${amount} attached below:\n\n${documentUrl}\n\nLet us know if you have any questions.\n\nBest regards,\nRandom Frames`;
  }

  /**
   * Template for sharing an Invoice
   */
  static buildInvoiceMessage(
    clientName: string, 
    invoiceNumber: string, 
    amount: string, 
    dueDate: string,
    documentUrl: string
  ): string {
    return `Hi ${clientName},\n\nHere is your invoice (${invoiceNumber}) for the amount of ${amount}. It is due on ${dueDate}.\n\nYou can view and download the invoice here:\n${documentUrl}\n\nThank you for your business!\n\nBest regards,\nRandom Frames`;
  }

  /**
   * Stub method for future WhatsApp Business API integration
   */
  static async sendDirectMessage(message: WhatsAppMessage): Promise<boolean> {
    console.log(`[WhatsApp API Stub] Sending to ${message.phone}: ${message.text}`);
    return true; // Pretend it succeeded
  }
}
