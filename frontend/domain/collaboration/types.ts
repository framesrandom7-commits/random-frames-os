/**
 * Domain types for Enterprise Collaboration, Optimistic Concurrency, and Multi-Assignee Architecture.
 * Serves as the Single Source of Truth for record locking, multi-user assignment, version history, and real-time state broadcasts.
 */

export enum AssignmentRole {
  PRIMARY_ASSIGNEE = "PRIMARY_ASSIGNEE",
  SECONDARY_ASSIGNEE = "SECONDARY_ASSIGNEE",
  REVIEWER = "REVIEWER",
  APPROVER = "APPROVER",
  OBSERVER = "OBSERVER",
}

export interface WorkItemAssignment {
  id?: string;
  workItemId: string;
  workItemType:
    | "LEAD"
    | "CLIENT"
    | "PROJECT"
    | "SHOOT"
    | "DELIVERABLE"
    | "TASK"
    | "INVOICE"
    | "CALENDAR_EVENT"
    | "CONTENT_PLAN"
    | "EXPENSE"
    | "PAYMENT"
    | "QUOTATION"
    | "DOCUMENT"
    | "ASSET"
    | string;
  userId: string;
  roleName: string;
  assignmentRole: AssignmentRole;
  assignedAt: Date;
  assignedByUserId: string;
  status?: "ACTIVE" | "COMPLETED" | "ESCALATED" | "REASSIGNED";
  delegatedFromUserId?: string;
}

export enum PresenceStatus {
  ONLINE = "ONLINE",
  OFFLINE = "OFFLINE",
  LAST_ACTIVE = "LAST_ACTIVE",
  CURRENTLY_VIEWING = "CURRENTLY_VIEWING",
  CURRENTLY_EDITING = "CURRENTLY_EDITING",
}

export interface UserPresenceState {
  userId: string;
  roleName: string;
  status: PresenceStatus;
  lastActiveAt: Date;
  activeEntityId?: string;
  activeEntityType?: string;
  lockExpiration?: Date;
}

export enum VersionAction {
  CREATED = "CREATED",
  MODIFIED = "MODIFIED",
  REVIEWED = "REVIEWED",
  APPROVED = "APPROVED",
  ARCHIVED = "ARCHIVED",
  ROLLED_BACK = "ROLLED_BACK",
}

export interface VersionHistoryRecord {
  id: string;
  entityId: string;
  entityType: string;
  versionNumber: number;
  action: VersionAction;
  actorUserId: string;
  actorRoleName: string;
  timestamp: Date;
  diffSummary?: string;
  snapshotData: Record<string, any>;
}

export enum RealtimeProtocol {
  WEBSOCKET = "WEBSOCKET",
  SSE = "SSE",
  SUBSCRIPTION = "SUBSCRIPTION",
}

export interface RealtimeBroadcastMessage {
  protocol: RealtimeProtocol;
  topic: string;
  event: string;
  payload: Record<string, any>;
  timestamp: Date;
}

export class OptimisticLockError extends Error {
  public readonly entityId: string;
  public readonly entityType: string;
  public readonly expectedVersion: number | string;
  public readonly currentVersion: number | string;
  public readonly lastModifiedByUserId?: string;

  constructor(
    entityId: string,
    entityType: string,
    expectedVersion: number | string,
    currentVersion: number | string,
    lastModifiedByUserId?: string
  ) {
    const msg = `[OptimisticLockError] Concurrent edit conflict detected on ${entityType} '${entityId}'. Stale version: ${expectedVersion}, Current version: ${currentVersion}. Refresh or resolve conflicts required.`;
    super(msg);
    this.name = "OptimisticLockError";
    this.entityId = entityId;
    this.entityType = entityType;
    this.expectedVersion = expectedVersion;
    this.currentVersion = currentVersion;
    this.lastModifiedByUserId = lastModifiedByUserId;
  }
}
