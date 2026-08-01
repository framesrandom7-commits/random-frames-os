import { registerWhatsAppDomainEvents } from "@/domain/whatsapp/events";

/**
 * Registers all WhatsApp workflow handlers by delegating directly to the 
 * Enterprise Domain-Driven Design layer in domain/whatsapp/events.ts.
 */
export function registerWhatsAppHandlers(): void {
  registerWhatsAppDomainEvents();
}
