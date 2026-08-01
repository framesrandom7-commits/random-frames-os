import { AssignmentRole, WorkItemAssignment } from "./types";
import { Logger } from "@/lib/logger";

/**
 * Multi-Assignee Engine
 * Decouples work items from single-user assumptions.
 * Supports Primary Assignee, Secondary Assignee, Reviewer, Approver, and Observer across all domain entities.
 * Fully prepared for future collaborative workflows without database schema redesigns or UI changes.
 */
export class MultiAssigneeService {
  // In-memory / domain repository registry representing multi-assignee junction structure
  private static assignments: Map<string, WorkItemAssignment[]> = new Map();

  private static getCompositeKey(workItemType: string, workItemId: string): string {
    return `${workItemType.toUpperCase()}:${workItemId}`;
  }

  /**
   * Assigns a user to a work item with a defined assignment role.
   * Supports multiple concurrent assignees (e.g., Editor A + Editor B as Secondary Assignees, Founder as Approver).
   */
  public static assignUser(assignment: WorkItemAssignment): { success: boolean; message: string } {
    const key = this.getCompositeKey(assignment.workItemType, assignment.workItemId);
    const list = this.assignments.get(key) || [];

    // Check if user already holds this exact assignment role on this item
    const existingIndex = list.findIndex(
      (a) => a.userId === assignment.userId && a.assignmentRole === assignment.assignmentRole
    );

    if (existingIndex >= 0) {
      // Update status or reapply
      list[existingIndex] = { ...list[existingIndex], ...assignment, assignedAt: new Date() };
      this.assignments.set(key, list);
      Logger.info(`[MultiAssignee] Updated existing ${assignment.assignmentRole} for user ${assignment.userId} on ${key}`);
      return { success: true, message: `Updated assignment role ${assignment.assignmentRole}` };
    }

    // If attaching a new PRIMARY_ASSIGNEE, mark prior Primary as REASSIGNED or SECONDARY if needed
    if (assignment.assignmentRole === AssignmentRole.PRIMARY_ASSIGNEE) {
      list.forEach((existing) => {
        if (existing.assignmentRole === AssignmentRole.PRIMARY_ASSIGNEE && existing.userId !== assignment.userId) {
          existing.status = "REASSIGNED";
        }
      });
    }

    list.push({
      ...assignment,
      id: assignment.id || `assign_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      assignedAt: assignment.assignedAt || new Date(),
      status: assignment.status || "ACTIVE",
    });

    this.assignments.set(key, list);
    Logger.info(
      `[MultiAssignee] Attached ${assignment.assignmentRole} (${assignment.roleName}) user ${assignment.userId} to ${key}`
    );
    return { success: true, message: "User assigned successfully" };
  }

  /**
   * Retrieves all assignees currently attached to a work item.
   */
  public static getAssignees(workItemId: string, workItemType: string): WorkItemAssignment[] {
    const key = this.getCompositeKey(workItemType, workItemId);
    return (this.assignments.get(key) || []).filter((a) => a.status !== "REASSIGNED");
  }

  /**
   * Retrieves specific users holding a given assignment role on an item.
   */
  public static getAssigneesByRole(workItemId: string, workItemType: string, role: AssignmentRole): WorkItemAssignment[] {
    return this.getAssignees(workItemId, workItemType).filter((a) => a.assignmentRole === role);
  }

  /**
   * Verifies whether a specific user holds an assignment role on a work item.
   */
  public static hasAssignmentRole(workItemId: string, workItemType: string, userId: string, role?: AssignmentRole): boolean {
    const assignees = this.getAssignees(workItemId, workItemType);
    if (role) {
      return assignees.some((a) => a.userId === userId && a.assignmentRole === role);
    }
    return assignees.some((a) => a.userId === userId);
  }

  /**
   * Reassigns primary responsibility to a new user without losing historical assignees.
   */
  public static reassignPrimary(
    workItemId: string,
    workItemType: WorkItemAssignment["workItemType"],
    newUserId: string,
    newRoleName: string,
    actorUserId: string
  ): boolean {
    const res = this.assignUser({
      workItemId,
      workItemType,
      userId: newUserId,
      roleName: newRoleName,
      assignmentRole: AssignmentRole.PRIMARY_ASSIGNEE,
      assignedByUserId: actorUserId,
      assignedAt: new Date(),
      status: "ACTIVE",
    });
    Logger.info(`[MultiAssignee] Primary assignee on ${workItemType}:${workItemId} reassigned to ${newUserId} by ${actorUserId}`);
    return res.success;
  }

  /**
   * Delegates a task from an assigned user to a subordinate or peer while preserving delegation traceability.
   */
  public static delegateTask(
    workItemId: string,
    workItemType: WorkItemAssignment["workItemType"],
    fromUserId: string,
    toUserId: string,
    toRoleName: string,
    role: AssignmentRole = AssignmentRole.SECONDARY_ASSIGNEE
  ): boolean {
    const res = this.assignUser({
      workItemId,
      workItemType,
      userId: toUserId,
      roleName: toRoleName,
      assignmentRole: role,
      assignedByUserId: fromUserId,
      delegatedFromUserId: fromUserId,
      assignedAt: new Date(),
      status: "ACTIVE",
    });
    Logger.info(`[MultiAssignee] Task ${workItemType}:${workItemId} delegated from ${fromUserId} to ${toUserId}`);
    return res.success;
  }

  /**
   * Clears assignment registry for testing resets.
   */
  public static clearRegistry(): void {
    this.assignments.clear();
  }
}
