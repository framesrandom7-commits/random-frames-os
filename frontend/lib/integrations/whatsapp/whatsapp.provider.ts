import { BaseProvider } from "../core/provider.interface";

export interface WhatsAppOptions {
  phone: string;
  message: string;
  templateId?: string;
}

export abstract class WhatsAppProvider extends BaseProvider {
  /**
   * Generate a generic WhatsApp Web/Mobile share link
   */
  public abstract generateShareLink(options: WhatsAppOptions): string;
  
  /**
   * For Future Business API: Send direct message
   */
  public abstract sendMessage(options: WhatsAppOptions): Promise<boolean>;
}
