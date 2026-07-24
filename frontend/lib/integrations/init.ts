import { IntegrationRegistry } from "./core/registry";

// Storage
import { LocalStorageProvider } from "./storage/local.provider";
import { GoogleDriveProvider } from "./storage/google-drive.provider";

// Email
import { DummyEmailProvider } from "./email/dummy.provider";
import { SMTPEmailProvider } from "./email/smtp.provider";

// Accounting
import { DummyAccountingProvider } from "./accounting/dummy.provider";

// WhatsApp
import { WhatsAppStubProvider } from "./whatsapp/stub.provider";

let isInitialized = false;

/**
 * Initializes the Integration Registry.
 * Automatically discovers and registers all active providers in the codebase.
 * This should be called once during application startup.
 */
export function initializeIntegrations() {
  if (isInitialized) return;
  
  // Register Storage Providers
  IntegrationRegistry.registerProvider(new LocalStorageProvider());
  IntegrationRegistry.registerProvider(new GoogleDriveProvider());
  
  // Register Email Providers
  IntegrationRegistry.registerProvider(new DummyEmailProvider());
  IntegrationRegistry.registerProvider(new SMTPEmailProvider());
  
  // Register Accounting Providers
  IntegrationRegistry.registerProvider(new DummyAccountingProvider());
  
  // Register WhatsApp Providers
  IntegrationRegistry.registerProvider(new WhatsAppStubProvider());
  
  isInitialized = true;
  console.log("[IntegrationRegistry] Successfully initialized and registered all providers.");
}

// Auto-execute during module load (application initialization)
initializeIntegrations();
