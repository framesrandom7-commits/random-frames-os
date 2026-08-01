import { PresenceStatus, UserPresenceState } from "./types";
import { Logger } from "@/lib/logger";

/**
 * Live User Presence Service
 * Manages active user states (Online, Offline, Last Active, Currently Viewing, Currently Editing) across unlimited concurrent sessions.
 * Architecture purely prepared for real-time collaboration without exposing UI presence elements in Version 1.
 */
export class LivePresenceService {
  private static presenceRegistry: Map<string, UserPresenceState> = new Map();

  /**
   * Updates a user's presence state and optional active document focus.
   */
  public static updatePresence(
    userId: string,
    roleName: string,
    status: PresenceStatus,
    activeEntityId?: string,
    activeEntityType?: string
  ): UserPresenceState {
    const state: UserPresenceState = {
      userId,
      roleName,
      status,
      lastActiveAt: new Date(),
      activeEntityId,
      activeEntityType,
    };

    this.presenceRegistry.set(userId, state);
    Logger.info(`[Presence] User ${userId} (${roleName}) status transitioned to ${status}${activeEntityId ? ` on ${activeEntityType}:${activeEntityId}` : ""}`);
    return state;
  }

  /**
   * Retrieves the current presence status for a specific user.
   */
  public static getUserPresence(userId: string): UserPresenceState | undefined {
    return this.presenceRegistry.get(userId);
  }

  /**
   * Returns all concurrent collaborators actively viewing or editing a specific record.
   */
  public static getActiveCollaborators(entityId: string, entityType: string): UserPresenceState[] {
    const results: UserPresenceState[] = [];
    this.presenceRegistry.forEach((state) => {
      if (
        state.activeEntityId === entityId &&
        state.activeEntityType === entityType &&
        (state.status === PresenceStatus.CURRENTLY_VIEWING || state.status === PresenceStatus.CURRENTLY_EDITING)
      ) {
        results.push(state);
      }
    });
    return results;
  }

  /**
   * Returns total count of concurrent online users across the operating system.
   */
  public static getOnlineUserCount(): number {
    let count = 0;
    this.presenceRegistry.forEach((state) => {
      if (state.status !== PresenceStatus.OFFLINE) {
        count++;
      }
    });
    return count;
  }

  /**
   * Marks a user as OFFLINE on session terminate or logout.
   */
  public static disconnectUser(userId: string): void {
    const existing = this.presenceRegistry.get(userId);
    if (existing) {
      existing.status = PresenceStatus.OFFLINE;
      existing.activeEntityId = undefined;
      existing.activeEntityType = undefined;
      existing.lastActiveAt = new Date();
      this.presenceRegistry.set(userId, existing);
      Logger.info(`[Presence] User ${userId} disconnected and marked OFFLINE`);
    }
  }

  /**
   * Clears registry for clean testing resets.
   */
  public static clearRegistry(): void {
    this.presenceRegistry.clear();
  }
}
