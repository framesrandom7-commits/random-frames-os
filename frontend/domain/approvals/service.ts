import { ApprovalType, ApprovalStatus, ApprovalRequestDTO, ApprovalActionDTO } from "./types";
import { RbacDomainService } from "@/domain/rbac/service";
import { Logger } from "@/lib/logger";

/**
 * Service orchestrating the Centralized Approval Matrix and Approval Center.
 * Enforces the inviolable rule that Founder is the sole approving authority,
 * who never requests approval and only receives approval requests.
 */
export class ApprovalDomainService {
  /**
   * Determines whether an operational or system action requires formal approval before execution.
   * Founder NEVER requires approval and bypasses every restriction.
   */
  static requiresApproval(type: ApprovalType, actorRoleName: string | null | undefined): boolean {
    if (RbacDomainService.isFounder(actorRoleName)) {
      return false; // Founder executes immediately without approval
    }
    // Any non-Founder role executing a critical ApprovalType requires Founder sign-off
    return true;
  }

  /**
   * Verifies whether an actor has authorization to approve, reject, or request changes on an approval item.
   * Only the Founder possesses final approval authority.
   */
  static canAuthorizeApproval(roleName: string | null | undefined): boolean {
    return RbacDomainService.isFounder(roleName);
  }

  /**
   * Validates and processes a new approval request initiation from Co-Founder or team members.
   */
  static processApprovalRequest(request: ApprovalRequestDTO): { success: boolean; status: ApprovalStatus; message: string } {
    if (RbacDomainService.isFounder(request.requestedByRoleName)) {
      Logger.info(`[Approval] Auto-approved request of type ${request.type} initiated directly by Super Admin Founder`);
      return {
        success: true,
        status: ApprovalStatus.APPROVED,
        message: "Founder Super Admin actions bypass approval queue and execute immediately.",
      };
    }

    Logger.info(`[Approval] Created approval request for ${request.type}: "${request.title}" by ${request.requestedByRoleName}`);
    
    // In production runtime, this queues high priority notification to Founder via NotificationEngine
    return {
      success: true,
      status: ApprovalStatus.PENDING,
      message: "Approval request successfully routed to Founder for authorization.",
    };
  }

  /**
   * Executes a formal authorization action (Approve, Reject, or Request Changes) by the Founder.
   */
  static authorizeRequest(action: ApprovalActionDTO): { success: boolean; newStatus: ApprovalStatus; error?: string } {
    if (!this.canAuthorizeApproval(action.actorRoleName)) {
      Logger.info(`[Approval] Denied unauthorized approval attempt on request ${action.requestId} by role: ${action.actorRoleName}`);
      return {
        success: false,
        newStatus: ApprovalStatus.PENDING,
        error: "Only the Founder has authority to approve or reject requests.",
      };
    }

    let newStatus: ApprovalStatus;
    switch (action.action) {
      case "APPROVE":
        newStatus = ApprovalStatus.APPROVED;
        break;
      case "REJECT":
        newStatus = ApprovalStatus.REJECTED;
        break;
      case "REQUEST_CHANGES":
        newStatus = ApprovalStatus.CHANGES_REQUESTED;
        break;
      default:
        newStatus = ApprovalStatus.PENDING;
    }

    Logger.info(`[Approval] Request ${action.requestId} updated to ${newStatus} by Founder Super Admin (Note: ${action.note || "none"})`);
    return { success: true, newStatus };
  }
}
