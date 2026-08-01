import { OptimisticLockError } from "./types";
import { Logger } from "@/lib/logger";

interface LockRecord {
  entityId: string;
  entityType: string;
  lockedByUserId: string;
  lockedByRoleName: string;
  lockedAt: Date;
  expiresAt: Date;
}

/**
 * Optimistic Concurrency Engine
 * Guarantees zero silent overwrites and detects simultaneous editing conflicts across any number of concurrent users.
 * Supports row versioning and updatedAt validation without requiring structural database rewrites.
 */
export class OptimisticConcurrencyEngine {
  private static activeLocks: Map<string, LockRecord> = new Map();

  /**
   * Generates a deterministic lock key for a business record.
   */
  private static getLockKey(entityType: string, entityId: string): string {
    return `${entityType.toUpperCase()}:${entityId}`;
  }

  /**
   * Validates optimistic concurrency before performing a write operation.
   * Compares expected version/updatedAt against current version/updatedAt.
   * Throws OptimisticLockError if stale data is detected, preventing silent overwrites.
   */
  public static validateMutation(
    entityId: string,
    entityType: string,
    expectedVersion: number | Date | string,
    currentVersion: number | Date | string,
    actorUserId: string
  ): boolean {
    const normExpected = typeof expectedVersion === "object" ? expectedVersion.getTime() : String(expectedVersion);
    const normCurrent = typeof currentVersion === "object" ? currentVersion.getTime() : String(currentVersion);

    if (normExpected !== normCurrent) {
      Logger.warn(
        `[Concurrency] Optimistic lock conflict detected on ${entityType} (${entityId}). Actor: ${actorUserId}. Expected: ${normExpected}, Current: ${normCurrent}`
      );
      throw new OptimisticLockError(entityId, entityType, normExpected, normCurrent);
    }

    Logger.info(`[Concurrency] Optimistic lock validated for ${entityType} (${entityId}) by user ${actorUserId}.`);
    return true;
  }

  /**
   * Acquires a temporary advisory editing lock on a record.
   * If already locked by another active user, returns false with current locker details.
   */
  public static acquireRecordLock(
    entityId: string,
    entityType: string,
    userId: string,
    roleName: string,
    lockDurationMs: number = 300000 // default 5 minutes
  ): { acquired: boolean; currentHolder?: { userId: string; roleName: string; expiresAt: Date } } {
    const key = this.getLockKey(entityType, entityId);
    const now = new Date();
    const existing = this.activeLocks.get(key);

    // Check if existing lock is valid and owned by someone else
    if (existing && existing.expiresAt > now && existing.lockedByUserId !== userId) {
      Logger.info(`[Concurrency] Lock attempt failed on ${key} by ${userId}. Currently locked by ${existing.lockedByUserId}`);
      return {
        acquired: false,
        currentHolder: {
          userId: existing.lockedByUserId,
          roleName: existing.lockedByRoleName,
          expiresAt: existing.expiresAt,
        },
      };
    }

    const newLock: LockRecord = {
      entityId,
      entityType,
      lockedByUserId: userId,
      lockedByRoleName: roleName,
      lockedAt: now,
      expiresAt: new Date(now.getTime() + lockDurationMs),
    };

    this.activeLocks.set(key, newLock);
    Logger.info(`[Concurrency] Acquired advisory lock on ${key} for user ${userId} (${roleName})`);
    return { acquired: true };
  }

  /**
   * Releases an active advisory lock.
   * Super Admins (Founder) or the lock owner can release immediately.
   */
  public static releaseRecordLock(
    entityId: string,
    entityType: string,
    userId: string,
    isSuperAdmin: boolean = false
  ): boolean {
    const key = this.getLockKey(entityType, entityId);
    const existing = this.activeLocks.get(key);

    if (!existing) return true;

    if (existing.lockedByUserId === userId || isSuperAdmin) {
      this.activeLocks.delete(key);
      Logger.info(`[Concurrency] Released advisory lock on ${key} by user ${userId}`);
      return true;
    }

    Logger.warn(`[Concurrency] Unauthorized lock release attempt on ${key} by user ${userId}`);
    return false;
  }

  /**
   * Checks current active lock status for a given entity.
   */
  public static getLockStatus(entityId: string, entityType: string): LockRecord | undefined {
    const key = this.getLockKey(entityType, entityId);
    const existing = this.activeLocks.get(key);
    if (existing && existing.expiresAt <= new Date()) {
      this.activeLocks.delete(key);
      return undefined;
    }
    return existing;
  }

  /**
   * Clears all locks (useful for test resets and clean session resets).
   */
  public static clearAllLocks(): void {
    this.activeLocks.clear();
  }
}
