/**
 * Domain types for Random Frames OS Role-Based Access Control (RBAC),
 * Organizational Hierarchy (Departments), Entity Ownership, and Notification Priorities.
 * Serves as the Single Source of Truth for roles, permissions, and routing visibility.
 * Hardened for scalable enterprise collaboration (100+ concurrent users).
 */

export enum RoleName {
  FOUNDER = "Founder",
  CO_FOUNDER = "Co-Founder",
  PHOTOGRAPHER = "Photographer",
  VIDEOGRAPHER = "Videographer",
  EDITOR = "Editor",
  SALES = "Sales",
  FINANCE = "Finance",
  GRAPHIC_DESIGNER = "Graphic Designer",
  CONTENT_WRITER = "Content Writer",
  SOCIAL_MEDIA_MANAGER = "Social Media Manager",
  BUSINESS_DEVELOPMENT = "Business Development",
  FINANCE_EXECUTIVE = "Finance Executive",
  INTERN = "Intern",
  // Legacy aliases supported for backward compatibility during transitions
  OWNER = "Owner",
  ADMIN = "Admin",
  OPERATIONS_MANAGER = "Operations Manager",
}

export enum DepartmentName {
  OPERATIONS = "Operations",
  PRODUCTION = "Production",
  MARKETING = "Marketing",
  SALES = "Sales",
  FINANCE = "Finance",
  ADMINISTRATION = "Administration",
}

export enum NotificationPriority {
  CRITICAL = "CRITICAL",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
  INFORMATION = "INFORMATION",
}

export enum EntityOwnershipType {
  CREATIVE_OWNER = "Creative Owner",
  OPERATIONS_OWNER = "Operations Owner",
  SALES_OWNER = "Sales Owner",
  FINANCE_OWNER = "Finance Owner",
  PRODUCTION_OWNER = "Production Owner",
  CREATIVE_APPROVER = "Creative Approver",
  RELATIONSHIP_OWNER = "Relationship Owner",
}

export interface EntityOwnershipMapping {
  entityType: "LEAD" | "PROJECT" | "SHOOT" | "CONTENT" | "INVOICE" | "CLIENT";
  supportedRoles: EntityOwnershipType[];
  defaultAssignments: {
    [key in EntityOwnershipType]?: RoleName | "Shared" | "Assigned";
  };
}

export type PermissionModule = 
  | "Dashboard"
  | "Leads"
  | "Clients"
  | "Projects"
  | "Shoots"
  | "Deliverables"
  | "Calendar"
  | "Finance"
  | "Content"
  | "Reports"
  | "Settings"
  | "System";

export interface PermissionDefinition {
  action: string;
  module: PermissionModule;
  description: string;
}

export interface RoleDefinition {
  name: string;
  description: string;
  isSystem: boolean;
  isUiVisible: boolean; // Enforces Version 1 rule: ONLY Founder & Co-Founder visible in UI; future roles concealed until enabled
  department?: DepartmentName;
  permissions: string[];
}

export interface RbacContext {
  userId: string;
  roleName?: string;
  departmentName?: string;
  permissions: string[];
}

export enum SettingsTabId {
  BUSINESS = "business",
  BRANDING = "branding",
  USERS = "users",
  ROLES = "roles",
  INVOICE = "invoice",
  PAYMENT = "payment",
  NOTIFICATIONS = "notifications",
  CALENDAR = "calendar",
  BACKUP = "backup",
  INTEGRATIONS = "integrations",
  SECURITY = "security",
  WORKFLOW_AUTOMATION = "workflow_automation",
}
