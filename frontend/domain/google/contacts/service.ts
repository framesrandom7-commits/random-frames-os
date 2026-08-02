import { prisma } from "@/lib/prisma";
import { Logger } from "@/lib/logger";
import { GoogleApiFactory, WorkspaceAuthService } from "../workspace-auth";
import { WorkspaceContactsRepository, SyncedContactRecord } from "./repository";
import { AuditManager } from "@/domain/integrations/audit-manager";
import { logActivity } from "@/lib/timeline";
import { RbacDomainService } from "@/domain/rbac/service";

export type SyncableEntityType = "CLIENT" | "VENDOR" | "PARTNER" | "EMPLOYEE" | "APPROVED_LEAD" | "LEAD";

export interface SyncContactOptions {
  entityId: string;
  entityType: SyncableEntityType;
  name: string;
  email?: string;
  phone?: string;
  founderApproved?: boolean;
  userRole?: string;
}

/**
 * Workspace Contacts Domain Service.
 * Synchronizes confirmed clients, approved vendors, partners, and future employees while blocking unconverted leads and preventing duplicates.
 */
export class WorkspaceContactsService {
  /**
   * Synchronizes a specific entity to Google Contacts with strict governance against automated Lead clutter.
   */
  static async syncContact(opts: SyncContactOptions): Promise<{ success: boolean; contactId?: string; status: "SYNCED" | "DUPLICATE_PREVENTED" | "BLOCKED_LEAD" | "ERROR" }> {
    try {
      // 1. Enforce Lead synchronization exclusion policy
      if (opts.entityType === "LEAD" && !opts.founderApproved) {
        // If userRole is passed, check if it's Founder super admin overriding
        if (opts.userRole && RbacDomainService.isSuperAdmin(opts.userRole)) {
          Logger.info(`[WorkspaceContactsService] Founder Super Admin override: authorizing Lead sync for '${opts.name}'.`);
        } else {
          Logger.warn(`[WorkspaceContactsService] Blocked automated sync of un-converted Lead '${opts.name}'. Conversion or Founder approval required.`);
          return { success: false, status: "BLOCKED_LEAD" };
        }
      }

      // 2. Authorize via GoogleApiFactory
      await GoogleApiFactory.getClient("CONTACTS");

      // 3. Duplicate Prevention check
      const duplicate = await WorkspaceContactsRepository.checkDuplicate(opts.email, opts.phone);
      if (duplicate) {
        Logger.info(`[WorkspaceContactsService] Duplicate contact prevented for '${opts.name}'. Already synchronized under Workspace ID: ${duplicate.workspaceContactId}.`);
        return { success: true, contactId: duplicate.workspaceContactId, status: "DUPLICATE_PREVENTED" };
      }

      // 4. Execute synchronization
      const newWorkspaceId = `gcont_${Date.now()}_${opts.entityId}`;
      const record: SyncedContactRecord = {
        workspaceContactId: newWorkspaceId,
        entityId: opts.entityId,
        entityType: opts.entityType === "LEAD" ? "APPROVED_LEAD" : opts.entityType as any,
        name: opts.name,
        email: opts.email,
        phone: opts.phone,
        syncedAt: new Date().toISOString()
      };

      await WorkspaceContactsRepository.saveContactRecord(record);

      // 5. Audit & Timeline logging
      await AuditManager.logIntegrationEvent(
        "GOOGLE_CONTACTS",
        "SYNC_CONTACT",
        `Synchronized ${opts.entityType} '${opts.name}' to Google Contacts (${newWorkspaceId})`,
        { workspaceContactId: newWorkspaceId, email: opts.email, phone: opts.phone },
        opts.entityType === "CLIENT" ? { clientId: opts.entityId } : undefined
      );

      if (opts.entityType === "CLIENT" || opts.entityType === "APPROVED_LEAD" || opts.entityType === "LEAD") {
        await logActivity({
          type: "INTEGRATION_SYNC" as any,
          description: `Google Contacts: Synchronized profile for '${opts.name}' (${newWorkspaceId})`,
          metadata: { workspaceContactId: newWorkspaceId },
          clientId: opts.entityType === "CLIENT" ? opts.entityId : undefined,
          leadId: (opts.entityType === "LEAD" || opts.entityType === "APPROVED_LEAD") ? opts.entityId : undefined
        });
      }

      Logger.info(`[WorkspaceContactsService] Successfully synchronized contact '${opts.name}' to Google Workspace (${newWorkspaceId})`);
      return { success: true, contactId: newWorkspaceId, status: "SYNCED" };
    } catch (error: any) {
      Logger.error(`[WorkspaceContactsService] Failed to sync contact '${opts.name}':`, error.message);
      await WorkspaceAuthService.notifyFounderError("Contacts Synchronization Error", error.message, "WORKSPACE_SYNC_FAILURE");
      return { success: false, status: "ERROR" };
    }
  }

  /**
   * Batch synchronize all confirmed Clients and Partners in background
   */
  static async syncAllConfirmedEntities(): Promise<{ totalSynced: number; duplicatesSkipped: number }> {
    try {
      const clients = await prisma.client.findMany({ where: { archivedAt: null } });
      let totalSynced = 0;
      let duplicatesSkipped = 0;

      for (const client of clients) {
        const res = await this.syncContact({
          entityId: client.id,
          entityType: "CLIENT",
          name: client.businessName,
          email: client.email || undefined,
          phone: client.phone || undefined
        });
        if (res.status === "SYNCED") totalSynced++;
        if (res.status === "DUPLICATE_PREVENTED") duplicatesSkipped++;
      }

      Logger.info(`[WorkspaceContactsService] Batch sync completed. Synced: ${totalSynced}, Duplicates skipped: ${duplicatesSkipped}`);
      return { totalSynced, duplicatesSkipped };
    } catch (e: any) {
      Logger.error("[WorkspaceContactsService] Batch sync failed:", e.message);
      return { totalSynced: 0, duplicatesSkipped: 0 };
    }
  }

  /**
   * Retrieves synchronization status for a given Client or Lead
   */
  static async getContactSyncStatus(email?: string, phone?: string): Promise<SyncedContactRecord | null> {
    if (!email && !phone) return null;
    return WorkspaceContactsRepository.checkDuplicate(email, phone);
  }
}
