/**
 * EmailProvider Interface
 * 
 * Ensures decoupling from specific email delivery services (Resend, Nodemailer, etc.).
 */
export interface EmailProvider {
  sendEmail(options: SendEmailOptions): Promise<boolean>;
}

export interface SendEmailOptions {
  to: string | string[];
  cc?: string[];
  subject: string;
  html: string;
  attachments?: {
    filename: string;
    content: Buffer | string; // Base64 or Buffer
    contentType?: string;
  }[];
}

/**
 * ConsoleEmailProvider (Stub for development/Phase 7)
 */
export class ConsoleEmailProvider implements EmailProvider {
  async sendEmail(options: SendEmailOptions): Promise<boolean> {
    console.log(`[EmailService] Sending email to ${options.to}`);
    console.log(`[EmailService] Subject: ${options.subject}`);
    console.log(`[EmailService] Attachments: ${options.attachments?.length || 0}`);
    return true;
  }
}

/**
 * EmailService
 * 
 * Central hub for all email sending operations.
 * Inject or swap EmailProviders here without modifying business logic.
 */
export class EmailService {
  // Use ConsoleEmailProvider by default in development, can be replaced by ResendProvider later
  private static provider: EmailProvider = new ConsoleEmailProvider();

  static setProvider(provider: EmailProvider) {
    this.provider = provider;
  }

  static async sendDocument(
    to: string, 
    subject: string, 
    messageHtml: string, 
    documentBuffer: Buffer, 
    documentName: string
  ): Promise<boolean> {
    return this.provider.sendEmail({
      to,
      subject,
      html: messageHtml,
      attachments: [{
        filename: documentName,
        content: documentBuffer,
        contentType: "application/pdf"
      }]
    });
  }

  static async sendStandardNotification(
    to: string,
    subject: string,
    messageHtml: string
  ): Promise<boolean> {
    return this.provider.sendEmail({
      to,
      subject,
      html: messageHtml
    });
  }
}
