/**
 * WhatsApp Business Integration
 * 
 * Provides utility functions to generate click-to-chat links for WhatsApp Web/App.
 * This lays the foundation for upgrading to the official Meta WhatsApp API later.
 */

const formatPhone = (phone: string | null | undefined): string => {
  if (!phone) return "";
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");
  // Add default country code if missing (assuming India +91 for example, but better to just use what they input)
  // For now, just return cleaned. If it's a 10 digit number, maybe add 91.
  if (cleaned.length === 10) return `91${cleaned}`;
  return cleaned;
};

export const whatsappLinks = {
  /**
   * General message to a contact
   */
  generalMessage: (phone: string, text: string) => {
    return `https://wa.me/${formatPhone(phone)}?text=${encodeURIComponent(text)}`;
  },

  /**
   * Send a Quotation
   */
  sendQuotation: (phone: string, businessName: string, amount: number, link: string) => {
    const text = `Hi ${businessName},\n\nThank you for reaching out to Random Frames! Here is your requested quotation for the project.\n\nAmount: ${amount}\nView Quote: ${link}\n\nPlease let us know if you have any questions.\n\nBest,\nRandom Frames Team`;
    return `https://wa.me/${formatPhone(phone)}?text=${encodeURIComponent(text)}`;
  },

  /**
   * Send an Invoice
   */
  sendInvoice: (phone: string, businessName: string, invoiceNumber: string, amount: number, link: string) => {
    const text = `Hi ${businessName},\n\nHere is your invoice ${invoiceNumber} for the recent project.\n\nAmount Due: ${amount}\nView Invoice: ${link}\n\nThank you for your business!\n\nBest,\nRandom Frames Team`;
    return `https://wa.me/${formatPhone(phone)}?text=${encodeURIComponent(text)}`;
  },

  /**
   * Send Payment Receipt
   */
  sendReceipt: (phone: string, businessName: string, amount: number) => {
    const text = `Hi ${businessName},\n\nWe have successfully received your payment of ${amount}. Thank you!\n\nBest,\nRandom Frames Team`;
    return `https://wa.me/${formatPhone(phone)}?text=${encodeURIComponent(text)}`;
  },

  /**
   * Send Payment Reminder
   */
  sendPaymentReminder: (phone: string, businessName: string, invoiceNumber: string, amount: number, link: string) => {
    const text = `Hi ${businessName},\n\nThis is a gentle reminder regarding invoice ${invoiceNumber} for the amount of ${amount}.\n\nView Invoice: ${link}\n\nPlease let us know if you have any questions or need assistance with the payment.\n\nBest,\nRandom Frames Team`;
    return `https://wa.me/${formatPhone(phone)}?text=${encodeURIComponent(text)}`;
  },

  /**
   * Send Project Update
   */
  sendProjectUpdate: (phone: string, businessName: string, projectName: string, update: string) => {
    const text = `Hi ${businessName},\n\nHere is an update on your project "${projectName}":\n\n${update}\n\nBest,\nRandom Frames Team`;
    return `https://wa.me/${formatPhone(phone)}?text=${encodeURIComponent(text)}`;
  },

  /**
   * Send Google Drive Folder
   */
  sendDriveFolder: (phone: string, businessName: string, projectName: string, link: string) => {
    const text = `Hi ${businessName},\n\nYour project "${projectName}" files are ready! 📸\n\nYou can access all your RAW and Edited files in this Google Drive folder:\n${link}\n\nThank you for choosing Random Frames!\n\nBest,\nRandom Frames Team`;
    return `https://wa.me/${formatPhone(phone)}?text=${encodeURIComponent(text)}`;
  },
};
