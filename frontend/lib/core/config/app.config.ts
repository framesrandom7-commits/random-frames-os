import { prisma } from "@/lib/prisma";

export interface AppConfig {
  BUSINESS_NAME: string;
  TAX_RATE: number;
  CURRENCY: string;
  WORKING_HOURS_START: string;
  WORKING_HOURS_END: string;
  DEFAULT_NOTIFICATION_PREFERENCES: Record<string, boolean>;
}

const DEFAULT_CONFIG: AppConfig = {
  BUSINESS_NAME: "Random Frames",
  TAX_RATE: 0.1, // 10%
  CURRENCY: "USD",
  WORKING_HOURS_START: "09:00",
  WORKING_HOURS_END: "18:00",
  DEFAULT_NOTIFICATION_PREFERENCES: {
    email: true,
    inApp: true,
    whatsapp: false
  }
};

export class ConfigService {
  /**
   * Fetches the current configuration, overriding defaults with DB settings if available.
   */
  public static async getConfig(): Promise<AppConfig> {
    const dbSettings = await prisma.setting.findMany();
    const overrides: Partial<AppConfig> = {};
    
    for (const setting of dbSettings) {
      if (setting.key in DEFAULT_CONFIG) {
        try {
          if (typeof setting.value === 'string') {
            overrides[setting.key as keyof AppConfig] = JSON.parse(setting.value);
          } else {
            overrides[setting.key as keyof AppConfig] = setting.value as any;
          }
        } catch (e) {
          overrides[setting.key as keyof AppConfig] = setting.value as any;
        }
      }
    }

    return {
      ...DEFAULT_CONFIG,
      ...overrides
    };
  }

  /**
   * Updates a business setting in the database
   */
  public static async updateSetting(key: keyof AppConfig, value: any) {
    const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
    
    return prisma.setting.upsert({
      where: { key },
      update: { value: stringValue },
      create: { key, value: stringValue }
    });
  }
}
