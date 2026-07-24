import { EmailProvider, EmailOptions } from "./email.provider";
import { ProviderMetadata } from "../core/provider.interface";
import nodemailer from "nodemailer";

export class SMTPEmailProvider extends EmailProvider {
  public getMetadata(): ProviderMetadata {
    return {
      id: "SMTP_EMAIL",
      name: "SMTP Server",
      version: "1.0.0",
      type: "EMAIL",
      description: "Send emails via standard SMTP configuration.",
      authenticationMethod: "SMTP",
      supportedFeatures: ["send", "attachments"],
      capabilities: { bulk: false }
    };
  }

  public async checkHealth(): Promise<boolean> {
    return false;
  }

  public validateConfiguration(config: any): boolean {
    return !!(config?.host && config?.port && config?.user && config?.pass);
  }

  public async testConnection(config?: any): Promise<boolean> {
    return false; // Requires actual transporter verify in prod
  }

  public async sendEmail(options: EmailOptions): Promise<boolean> {
    throw new Error("SMTP Email Provider credentials not found.");
  }
}
