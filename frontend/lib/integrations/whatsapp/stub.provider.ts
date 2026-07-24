import { WhatsAppProvider, WhatsAppOptions } from "./whatsapp.provider";
import { ProviderMetadata } from "../core/provider.interface";
import { EventBus } from "@/lib/workflow/event-bus";
import { WorkflowEvent } from "@/lib/workflow/events";

export class WhatsAppStubProvider extends WhatsAppProvider {
  public getMetadata(): ProviderMetadata {
    return {
      id: "WHATSAPP_STUB",
      name: "WhatsApp Integration",
      version: "1.0.0",
      type: "WHATSAPP",
      description: "Generates deep links for WhatsApp Web/App. Ready for future Business API.",
      authenticationMethod: "NONE",
      supportedFeatures: ["shareLink"],
      capabilities: { api: false }
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

  public generateShareLink(options: WhatsAppOptions): string {
    const text = encodeURIComponent(options.message);
    const phone = options.phone.replace(/\D/g, "");
    return `https://wa.me/${phone}?text=${text}`;
  }

  public async sendMessage(options: WhatsAppOptions): Promise<boolean> {
    console.log("=========================================");
    console.log(`💬 [WHATSAPP STUB] TO: ${options.phone}`);
    console.log(`📝 [WHATSAPP STUB] MESSAGE: ${options.message}`);
    console.log("=========================================");
    
    // Simulate real provider webhook delivery event
    EventBus.publish("WEBHOOK_SENT" as any, { channel: "WHATSAPP", phone: options.phone });
    return true;
  }
}
