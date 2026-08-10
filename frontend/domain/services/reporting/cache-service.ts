import { Logger } from "@/lib/logger";

interface CacheEntry {
  data: any;
  expiresAt: number;
}

/**
 * ReportingCacheService provides enterprise caching with intelligent TTL management and instantaneous EventBus cache invalidation upon workflow triggers.
 */
export class ReportingCacheService {
  private static cache: Record<string, CacheEntry> = {};
  private static defaultTtlMs = 3600 * 1000; // 1 hour default TTL

  static set(key: string, data: any, ttlMs: number = ReportingCacheService.defaultTtlMs): void {
    ReportingCacheService.cache[key] = {
      data,
      expiresAt: Date.now() + ttlMs
    };
    Logger.info(`[ReportingCacheService] Cached dataset under key [${key}] (TTL: ${ttlMs / 1000}s)`);
  }

  static get<T = any>(key: string): T | null {
    const entry = ReportingCacheService.cache[key];
    if (!entry) {
      return null;
    }
    if (Date.now() > entry.expiresAt) {
      delete ReportingCacheService.cache[key];
      Logger.info(`[ReportingCacheService] Cache expired for key [${key}]. Evicted.`);
      return null;
    }
    Logger.info(`[ReportingCacheService] Cache HIT for key [${key}]`);
    return entry.data as T;
  }

  /**
   * Called by Workflow Engine / EventBus whenever financial or CRM operational state changes.
   */
  static invalidate(pattern: string = ""): void {
    if (!pattern) {
      const keys = Object.keys(ReportingCacheService.cache);
      ReportingCacheService.cache = {};
      Logger.info(`[ReportingCacheService] Invalidation event received: Cleared entire reporting cache (${keys.length} keys evicted).`);
      return;
    }
    const keys = Object.keys(ReportingCacheService.cache).filter(k => k.includes(pattern));
    for (const key of keys) {
      delete ReportingCacheService.cache[key];
    }
    Logger.info(`[ReportingCacheService] Invalidation event received for pattern [${pattern}]: Evicted ${keys.length} keys.`);
  }

  static getStats() {
    return {
      keysCount: Object.keys(ReportingCacheService.cache).length,
      keys: Object.keys(ReportingCacheService.cache)
    };
  }
}
