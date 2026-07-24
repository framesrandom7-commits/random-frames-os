export class WhatsAppProvider {
  /**
   * Abstracted method to handle WhatsApp messages.
   * In V1, this might return a wa.me link or log the intent if triggered by UI.
   * Future implementation: WhatsApp Business API integration.
   */
  public async sendMessage(phone: string, text: string): Promise<string> {
    console.log(`[WhatsAppProvider] Preparing message for ${phone}`);
    
    // Basic formatting for the share link (V1)
    const encodedText = encodeURIComponent(text);
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const shareLink = `https://wa.me/${cleanPhone}?text=${encodedText}`;
    
    console.log(`[WhatsAppProvider] Generated Link: ${shareLink}`);
    
    return shareLink;
  }
}
