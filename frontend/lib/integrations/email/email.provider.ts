import { BaseProvider } from "../core/provider.interface";

export interface EmailOptions {
  to: string | string[];
  subject: string;
  body: string; // HTML body
  cc?: string | string[];
  attachments?: { filename: string; url?: string; buffer?: Buffer }[];
}

export abstract class EmailProvider extends BaseProvider {
  /**
   * Send an email via the provider.
   */
  public abstract sendEmail(options: EmailOptions): Promise<boolean>;
}
