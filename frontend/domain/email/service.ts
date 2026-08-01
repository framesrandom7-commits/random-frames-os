import { Logger } from "@/lib/logger";

export interface EmailPayload {
  to: string;
  subject: string;
  body: string;
}

export class EmailDomainService {
  /**
   * Mock implementation of an email sender.
   * In a real production scenario, this would use NodeMailer, Resend, or AWS SES.
   */
  static async sendEmail(payload: EmailPayload): Promise<{ success: boolean; messageId: string }> {
    Logger.info(`[EmailDomainService] Pretending to send email to ${payload.to}...`);
    Logger.info(`[EmailDomainService] Subject: ${payload.subject}`);
    Logger.info(`[EmailDomainService] Body: ${payload.body.substring(0, 50)}...`);

    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 800));

    Logger.info(`[EmailDomainService] Email successfully sent to ${payload.to}`);
    
    return {
      success: true,
      messageId: `mock-email-${Date.now()}`
    };
  }
}
