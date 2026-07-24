import { AccountingProvider, InvoicePayload } from "./accounting.provider";
import { ProviderMetadata } from "../core/provider.interface";
import { EventBus } from "@/lib/workflow/event-bus";
import { WorkflowEvent } from "@/lib/workflow/events";

export class DummyAccountingProvider extends AccountingProvider {
  public getMetadata(): ProviderMetadata {
    return {
      id: "DUMMY_ACCOUNTING",
      name: "Standard Accounting Stub",
      version: "1.0.0",
      type: "ACCOUNTING",
      description: "Logs accounting sync events. Prepares architecture for Xero/QuickBooks.",
      authenticationMethod: "NONE",
      supportedFeatures: ["syncInvoice", "syncPayment"],
      capabilities: { twoWaySync: false }
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

  public async syncInvoice(payload: InvoicePayload): Promise<boolean> {
    console.log("=========================================");
    console.log(`🧾 [ACCOUNTING] Syncing Invoice: ${payload.invoiceNumber}`);
    console.log(`💰 [ACCOUNTING] Amount: $${payload.totalAmount}`);
    console.log("=========================================");
    
    // Simulate real provider webhook/event
    EventBus.publish("SYNC_COMPLETED" as any, { type: "INVOICE", id: payload.invoiceNumber });
    return true;
  }

  public async syncPayment(paymentId: string, amount: number): Promise<boolean> {
    console.log("=========================================");
    console.log(`💵 [ACCOUNTING] Syncing Payment: ${paymentId}`);
    console.log(`💰 [ACCOUNTING] Amount: $${amount}`);
    console.log("=========================================");
    
    // Simulate real provider webhook/event
    EventBus.publish("SYNC_COMPLETED" as any, { type: "PAYMENT", id: paymentId });
    return true;
  }
}
