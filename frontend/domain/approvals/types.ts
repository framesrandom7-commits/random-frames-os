/**
 * Domain types for Centralized Approval Matrix and Approval Center.
 * Governs critical business actions where Founder is the sole final approving authority.
 */

export enum ApprovalType {
  HIGH_VALUE_QUOTE = "HIGH_VALUE_QUOTE",
  DISCOUNT_APPROVAL = "DISCOUNT_APPROVAL",
  REFUND = "REFUND",
  PROJECT_CANCELLATION = "PROJECT_CANCELLATION",
  EQUIPMENT_PURCHASE = "EQUIPMENT_PURCHASE",
  PRICING_CHANGE = "PRICING_CHANGE",
  BUSINESS_SETTINGS = "BUSINESS_SETTINGS",
  WORKFLOW_CHANGE = "WORKFLOW_CHANGE",
  ROLE_CHANGE = "ROLE_CHANGE",
  SYSTEM_CONFIGURATION = "SYSTEM_CONFIGURATION",
  FINANCIAL_OVERRIDE = "FINANCIAL_OVERRIDE",
}

export enum ApprovalStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CHANGES_REQUESTED = "CHANGES_REQUESTED",
}

export interface ApprovalRequestDTO {
  id?: string;
  type: ApprovalType;
  title: string;
  description: string;
  requestedByUserId: string;
  requestedByRoleName: string;
  targetEntityId?: string;
  targetEntityType?: string;
  metadata?: Record<string, any>;
  status?: ApprovalStatus;
  internalNotes?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ApprovalActionDTO {
  requestId: string;
  action: "APPROVE" | "REJECT" | "REQUEST_CHANGES";
  actorUserId: string;
  actorRoleName: string;
  note?: string;
}
