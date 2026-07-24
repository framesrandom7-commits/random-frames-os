import { EmailProvider, EmailOptions } from "./email.provider";
import { ProviderMetadata } from "../core/provider.interface";

export class DummyEmailProvider extends EmailProvider {
  public getMetadata(): ProviderMetadata {
    return {
      id: "DUMMY_EMAIL",
      name: "Dummy Email",
      version: "1.0.0",
      type: "EMAIL",
      description: "Logs emails to the server console instead of sending them. Useful for local testing.",
      authenticationMethod: "NONE",
      supportedFeatures: ["send", "attachments"],
      capabilities: { logOnly: true }
    };
  }

  public async checkHealth(): Promise<boolean> {
    return true;
  }

  public validateConfiguration(config: any): boolean {
    return true;
  }

  public async testConnection(config?: any): Promise<boolean> {
    return true;
  }

  public async sendEmail(options: EmailOptions): Promise<boolean> {
    console.log("=========================================");
    console.log(`📧 [DUMMY EMAIL] TO: ${options.to}`);
    console.log(`📝 [DUMMY EMAIL] SUBJECT: ${options.subject}`);
    console.log(`📎 [DUMMY EMAIL] ATTACHMENTS: ${options.attachments?.length || 0}`);
    console.log("=========================================");
    return true;
  }
}
