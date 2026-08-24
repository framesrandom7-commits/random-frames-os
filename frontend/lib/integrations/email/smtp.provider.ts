import { EmailProvider, EmailOptions } from "./email.provider";
import { ProviderMetadata } from "../core/provider.interface";
import { prisma } from "@/lib/prisma";
import { CryptoService } from "@/lib/core/security/crypto.service";
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

  private async getTransporter() {
    const settings = await prisma.integrationSettings.findUnique({
      where: { provider: "SMTP_EMAIL" }
    });

    if (!settings || !settings.accessToken) {
      throw new Error("SMTP Email Provider credentials not found.");
    }

    const metadata = (settings.metadata as any) || {};
    const pass = CryptoService.decrypt(settings.accessToken);

    return nodemailer.createTransport({
      host: metadata.host,
      port: Number(metadata.port),
      secure: metadata.secure || false,
      auth: {
        user: metadata.user,
        pass: pass
      }
    });
  }

  public async checkHealth(): Promise<boolean> {
    try {
      const transporter = await this.getTransporter();
      await transporter.verify();
      return true;
    } catch {
      return false;
    }
  }

  public validateConfiguration(config: any): boolean {
    return !!(config?.host && config?.port && config?.user && config?.pass);
  }

  public async testConnection(config?: any): Promise<boolean> {
    try {
      const transporter = await this.getTransporter();
      await transporter.verify();
      return true;
    } catch {
      return false;
    }
  }

  public async sendEmail(options: EmailOptions): Promise<boolean> {
    const transporter = await this.getTransporter();
    
    // We get the configured user email to use as the from address
    const settings = await prisma.integrationSettings.findUnique({
      where: { provider: "SMTP_EMAIL" }
    });
    const metadata = (settings?.metadata as any) || {};

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"Random Frames OS" <${metadata.user || 'noreply@randomframes.com'}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    if (options.attachments) {
      mailOptions.attachments = options.attachments.map(a => ({
        filename: a.filename,
        content: a.content,
        contentType: a.contentType
      }));
    }

    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error("[SMTPEmailProvider] Failed to send email:", error);
      return false;
    }
  }
}
