import { prisma } from "@/lib/prisma";
import { Logger } from "@/lib/logger";

export interface SyncedContactRecord {
  workspaceContactId: string;
  entityId: string;
  entityType: "CLIENT" | "VENDOR" | "PARTNER" | "EMPLOYEE" | "APPROVED_LEAD";
  name: string;
  email?: string;
  phone?: string;
  syncedAt: string;
}

export const CONTACTS_REGISTRY_KEY = "GOOGLE_CONTACTS_REGISTRY";

/**
 * Workspace Contacts Repository.
 * Manages contact deduplication indexes using Email, Phone, and Unique Workspace ID without modifying schema.
 */
export class WorkspaceContactsRepository {
  /**
   * Retrieves the current contact deduplication registry from persistent integration storage.
   */
  static async getRegistry(): Promise<Record<string, SyncedContactRecord>> {
    try {
      const setting = await prisma.integrationSettings.findUnique({
        where: { provider: CONTACTS_REGISTRY_KEY }
      });
      if (!setting || !setting.metadata) return {};
      return setting.metadata as unknown as Record<string, SyncedContactRecord>;
    } catch (e: any) {
      Logger.error("[WorkspaceContactsRepository] Error reading contacts registry:", e.message);
      return {};
    }
  }

  /**
   * Saves a newly synchronized contact into the deduplication registry.
   */
  static async saveContactRecord(record: SyncedContactRecord): Promise<void> {
    try {
      const registry = await this.getRegistry();
      // Use email or phone or entityId as primary index key
      const indexKey = record.email?.toLowerCase().trim() || record.phone?.replace(/\D/g, "") || record.entityId;
      registry[indexKey] = record;

      await prisma.integrationSettings.upsert({
        where: { provider: CONTACTS_REGISTRY_KEY },
        create: {
          provider: CONTACTS_REGISTRY_KEY,
          accessToken: "contacts_sync_vault",
          refreshToken: "none",
          metadata: registry as any
        },
        update: {
          metadata: registry as any,
          lastSyncAt: new Date()
        }
      });
    } catch (e: any) {
      Logger.error("[WorkspaceContactsRepository] Failed to save contact record:", e.message);
    }
  }

  /**
   * Checks for duplicates using Email, Phone, or Unique Workspace ID.
   */
  static async checkDuplicate(email?: string, phone?: string, workspaceId?: string): Promise<SyncedContactRecord | null> {
    const registry = await this.getRegistry();
    const cleanEmail = email?.toLowerCase().trim();
    const cleanPhone = phone?.replace(/\D/g, "");

    for (const record of Object.values(registry)) {
      if (workspaceId && record.workspaceContactId === workspaceId) return record;
      if (cleanEmail && record.email && record.email.toLowerCase().trim() === cleanEmail) return record;
      if (cleanPhone && record.phone && record.phone.replace(/\D/g, "") === cleanPhone) return record;
    }
    return null;
  }
}
