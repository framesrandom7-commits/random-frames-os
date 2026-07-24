import { BaseProvider, ProviderMetadata, ProviderCapabilities } from "./provider.interface";

export class IntegrationRegistry {
  private static providers: Map<string, BaseProvider> = new Map();

  /**
   * Register a new provider into the system.
   */
  public static registerProvider(provider: BaseProvider) {
    const metadata = provider.getMetadata();
    this.providers.set(metadata.id, provider);
  }

  /**
   * Retrieve a specific provider by its ID.
   */
  public static getProvider<T extends BaseProvider>(id: string): T {
    const provider = this.providers.get(id);
    if (!provider) {
      throw new Error(`Provider [${id}] is not registered in IntegrationRegistry.`);
    }
    return provider as T;
  }

  /**
   * Get all registered providers, optionally filtered by type.
   */
  public static getProviders(type?: ProviderMetadata["type"]): BaseProvider[] {
    const all = Array.from(this.providers.values());
    if (type) {
      return all.filter(p => p.getMetadata().type === type);
    }
    return all;
  }

  /**
   * Get metadata and connection status for a specific provider.
   */
  public static async getProviderStatus(id: string) {
    const provider = this.getProvider(id);
    const metadata = provider.getMetadata();
    const isHealthy = await provider.checkHealth();
    return {
      ...metadata,
      connectionStatus: isHealthy ? "CONNECTED" : "DISCONNECTED"
    };
  }

  /**
   * Validate configuration payload for a specific provider.
   */
  public static validateConfiguration(id: string, config: any): boolean {
    const provider = this.getProvider(id);
    return provider.validateConfiguration(config);
  }

  /**
   * Test the connection for a specific provider.
   */
  public static async testConnection(id: string, config?: any): Promise<boolean> {
    const provider = this.getProvider(id);
    return provider.testConnection(config);
  }

  /**
   * Retrieve the capabilities of a specific provider.
   */
  public static getCapabilities(id: string): ProviderCapabilities {
    const provider = this.getProvider(id);
    return provider.getMetadata().capabilities;
  }

  /**
   * Resolve the active provider for a specific domain type based on database configuration.
   * This mechanism ensures no business logic statically binds to a provider.
   */
  public static async resolveActiveProvider<T extends BaseProvider>(type: ProviderMetadata["type"]): Promise<T> {
    const providers = this.getProviders(type);
    
    // Fallback to the first available provider for the given type if specific active tracking isn't initialized yet
    // Production implementations check the DB for 'isConfigured' flags.
    const active = providers[0];
    
    if (!active) {
      throw new Error(`No active provider found for type: ${type}`);
    }

    return active as T;
  }
}
