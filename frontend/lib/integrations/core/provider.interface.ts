export interface ProviderCapabilities {
  [feature: string]: boolean;
}

export interface ProviderMetadata {
  id: string; // e.g., "GOOGLE_DRIVE", "SMTP"
  name: string; // e.g., "Google Drive"
  version: string;
  type: "STORAGE" | "EMAIL" | "ACCOUNTING" | "CALENDAR" | "WHATSAPP" | "COMMUNICATION";
  description: string;
  authenticationMethod: "OAUTH2" | "API_KEY" | "SMTP" | "NONE" | "CUSTOM";
  supportedFeatures: string[];
  capabilities: ProviderCapabilities;
}

export abstract class BaseProvider {
  /**
   * Returns the static metadata for this provider.
   */
  public abstract getMetadata(): ProviderMetadata;

  /**
   * Quick health check to see if the provider service is reachable/configured.
   */
  public abstract checkHealth(): Promise<boolean>;

  /**
   * Validates if the given configuration payload is structurally sound for this provider.
   */
  public abstract validateConfiguration(config: any): boolean;

  /**
   * Deep connection test (e.g. attempting to authenticate using the provided tokens).
   */
  public abstract testConnection(config?: any): Promise<boolean>;
}
