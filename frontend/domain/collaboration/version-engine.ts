import { VersionAction, VersionHistoryRecord } from "./types";
import { Logger } from "@/lib/logger";

/**
 * Version History Engine
 * Provides immutable chronological mutation auditing (Created, Modified, Reviewed, Approved, Archived) and rollback support.
 * Prepares all major entities for deep audit inspection and point-in-time recovery without UI alteration.
 */
export class VersionHistoryEngine {
  private static versionRegistry: Map<string, VersionHistoryRecord[]> = new Map();

  private static getRegistryKey(entityType: string, entityId: string): string {
    return `${entityType.toUpperCase()}:${entityId}`;
  }

  /**
   * Records a new immutable version snapshot for a business record.
   */
  public static recordVersion(
    entityId: string,
    entityType: string,
    action: VersionAction,
    actorUserId: string,
    actorRoleName: string,
    snapshotData: Record<string, any>,
    diffSummary?: string
  ): VersionHistoryRecord {
    const key = this.getRegistryKey(entityType, entityId);
    const history = this.versionRegistry.get(key) || [];
    const newVersionNum = history.length > 0 ? history[history.length - 1].versionNumber + 1 : 1;

    const record: VersionHistoryRecord = {
      id: `ver_${Date.now()}_${newVersionNum}`,
      entityId,
      entityType,
      versionNumber: newVersionNum,
      action,
      actorUserId,
      actorRoleName,
      timestamp: new Date(),
      diffSummary,
      snapshotData: JSON.parse(JSON.stringify(snapshotData)), // immutable cloning
    };

    history.push(record);
    this.versionRegistry.set(key, history);
    Logger.info(
      `[VersionHistory] Recorded v${newVersionNum} (${action}) for ${entityType}:${entityId} by ${actorUserId} (${actorRoleName})`
    );
    return record;
  }

  /**
   * Retrieves the full chronological version history for an entity.
   */
  public static getHistory(entityId: string, entityType: string): VersionHistoryRecord[] {
    const key = this.getRegistryKey(entityType, entityId);
    return [...(this.versionRegistry.get(key) || [])];
  }

  /**
   * Retrieves a specific historical version snapshot.
   */
  public static getVersion(entityId: string, entityType: string, versionNumber: number): VersionHistoryRecord | undefined {
    const history = this.getHistory(entityId, entityType);
    return history.find((r) => r.versionNumber === versionNumber);
  }

  /**
   * Simulates a clean point-in-time state rollback by recording a new ROLLED_BACK snapshot copied from target version.
   */
  public static rollbackToVersion(
    entityId: string,
    entityType: string,
    targetVersionNumber: number,
    actorUserId: string,
    actorRoleName: string
  ): { success: boolean; newRecord?: VersionHistoryRecord; message?: string } {
    const target = this.getVersion(entityId, entityType, targetVersionNumber);
    if (!target) {
      return { success: false, message: `Target version v${targetVersionNumber} not found` };
    }

    const newRecord = this.recordVersion(
      entityId,
      entityType,
      VersionAction.ROLLED_BACK,
      actorUserId,
      actorRoleName,
      target.snapshotData,
      `Rolled back record state to match v${targetVersionNumber}`
    );

    Logger.info(`[VersionHistory] Successful rollback of ${entityType}:${entityId} to v${targetVersionNumber} by ${actorUserId}`);
    return { success: true, newRecord };
  }

  /**
   * Clears version registry for clean test reset.
   */
  public static clearRegistry(): void {
    this.versionRegistry.clear();
  }
}
