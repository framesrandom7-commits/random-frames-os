import { RoleName, DepartmentName, EntityOwnershipMapping, RoleDefinition } from "./types";
import { 
  ADMIN_SETTINGS_TABS, 
  ADMINISTRATIVE_NOTIFICATION_KEYWORDS, 
  CRITICAL_NOTIFICATION_KEYWORDS,
  ROLES_CONFIG,
  ENTITY_OWNERSHIP_MATRIX 
} from "./constants";
import { Logger } from "@/lib/logger";

export class RbacDomainService {
  /**
   * Evaluates if a given role represents the Business Founder / Super Administrator.
   * Founder has unrestricted system authority and bypasses every permission restriction.
   */
  static isFounder(roleName?: string | null): boolean {
    if (!roleName) return false;
    return (
      roleName === RoleName.FOUNDER ||
      roleName.toLowerCase() === "founder" ||
      roleName === RoleName.OWNER ||
      roleName.toLowerCase() === "owner" ||
      roleName.toUpperCase() === "SUPER_ADMIN" ||
      roleName.toLowerCase() === "super admin"
    );
  }

  /**
   * Alias for isFounder for Super Admin checks across integrations
   */
  static isSuperAdmin(roleName?: string | null): boolean {
    return this.isFounder(roleName);
  }

  /**
   * Evaluates if a given role represents the Co-Founder (Head of Operations).
   */
  static isCoFounder(roleName?: string | null): boolean {
    if (!roleName) return false;
    return (
      roleName === RoleName.CO_FOUNDER ||
      roleName.toLowerCase() === "co-founder" ||
      roleName === RoleName.OPERATIONS_MANAGER ||
      roleName.toLowerCase() === "operations manager" ||
      roleName.toLowerCase() === "admin"
    );
  }

  /**
   * Core permission verification logic.
   * Founder ALWAYS passes every permission check without requiring explicit assignment.
   */
  static hasPermission(roleName: string | undefined | null, action: string, grantedPermissions?: string[]): boolean {
    if (this.isFounder(roleName)) {
      return true;
    }

    if (grantedPermissions && grantedPermissions.includes(action)) {
      return true;
    }

    if (!roleName) return false;

    const roleConfig = ROLES_CONFIG.find(
      (r) => r.name.toLowerCase() === roleName.toLowerCase()
    );

    if (roleConfig) {
      if (roleConfig.permissions.includes(action)) {
        return true;
      }
    }

    Logger.info(`[RBAC] Permission check denied for action: ${action} on role: ${roleName}`);
    return false;
  }

  /**
   * Resolves whether a specific settings tab should be displayed to the user.
   * Administrative settings are exclusively visible to Founder Super Admin.
   */
  static canAccessSettingsTab(roleName: string | undefined | null, tabId: string): boolean {
    if (this.isFounder(roleName)) {
      return true;
    }

    if (ADMIN_SETTINGS_TABS.includes(tabId)) {
      return false;
    }

    return true;
  }

  /**
   * Determines if a user can receive a system or operational notification.
   * Founder receives EVERYTHING.
   * Co-Founder receives operational notifications plus Critical notifications.
   */
  static canReceiveNotification(
    roleName: string | undefined | null,
    notification: { type?: string; title?: string; message?: string; priority?: string }
  ): boolean {
    if (this.isFounder(roleName)) {
      return true;
    }

    const contentStr = `${notification.type || ""} ${notification.title || ""} ${notification.message || ""}`.toUpperCase();
    const priority = notification.priority?.toUpperCase() || "";

    // Co-Founder always receives CRITICAL notifications regardless of system type
    if (priority === "CRITICAL" || CRITICAL_NOTIFICATION_KEYWORDS.some((kw) => contentStr.includes(kw))) {
      return true;
    }

    // Check if the notification contains system admin or developer monitoring keywords
    for (const keyword of ADMINISTRATIVE_NOTIFICATION_KEYWORDS) {
      if (contentStr.includes(keyword)) {
        return false;
      }
    }

    // If it is pure system technical logging, hide from operations
    if (notification.type === "SYSTEM_HEALTH" || notification.type === "INTEGRATION_SYNC_ERROR") {
      return false;
    }

    return true;
  }

  /**
   * Returns the organizational Department associated with a specific role.
   */
  static getDepartmentForRole(roleName?: string | null): DepartmentName | null {
    if (!roleName) return null;
    const config = ROLES_CONFIG.find((r) => r.name.toLowerCase() === roleName.toLowerCase());
    return config?.department || null;
  }

  /**
   * Resolves default ownership role mapping for a given domain entity type.
   */
  static getEntityOwnershipDefaults(entityType: "LEAD" | "PROJECT" | "SHOOT" | "CONTENT" | "INVOICE" | "CLIENT"): EntityOwnershipMapping | undefined {
    return ENTITY_OWNERSHIP_MATRIX.find((m) => m.entityType === entityType);
  }

  /**
   * Governs Google Drive folder access according to ownership and role boundaries.
   * Founder receives complete access; Co-Founder receives operational folder access; Creative staff access assigned scopes.
   */
  static canAccessDriveFolder(
    roleName: string | undefined | null,
    folderScope: "CLIENTS" | "OPERATIONS" | "EDITING" | "SYSTEM"
  ): boolean {
    if (this.isFounder(roleName)) {
      return true;
    }
    if (!roleName) return false;

    if (folderScope === "SYSTEM") {
      return false; // System configs & OAuth vaults only for Founder
    }

    if (this.isCoFounder(roleName)) {
      return folderScope === "CLIENTS" || folderScope === "OPERATIONS" || folderScope === "EDITING";
    }

    const norm = roleName.toLowerCase();
    const isCreative = [
      "editor",
      "graphic designer",
      "photographer",
      "videographer",
      "content writer",
      "social media manager",
    ].includes(norm);

    if (folderScope === "EDITING") {
      return isCreative; // Any assigned creative collaborator can access editing folders
    }

    // All staff members access assigned operational work item folders without two-user limitations
    return folderScope === "OPERATIONS" || (folderScope === "CLIENTS" && ["sales", "business development", "finance", "finance executive"].includes(norm));
  }

  /**
   * Resolves appropriate display tags and greeting context for home page personalization
   * without modifying any UI layout or widget architecture.
   */
  static getPersonalizedDashboardContext(roleName?: string | null, userName?: string | null): {
    title: string;
    focusTitle: string;
    subtitle: string;
    isExecutiveView: boolean;
  } {
    const isOwner = this.isFounder(roleName);
    const firstName = userName ? userName.split(" ")[0] : isOwner ? "Savan" : "Pooja";

    return {
      title: `Welcome ${firstName}`,
      focusTitle: isOwner ? "Executive Decisions & Actions" : "Today's Operational Tasks",
      subtitle: isOwner
        ? "Business Overview"
        : "Client & Pipeline Activities",
      isExecutiveView: isOwner,
    };
  }

  /**
   * Enforces Version 1 rule: ONLY Founder and Co-Founder are exposed in UI elements.
   * All future roles remain hidden in UI screens until explicitly enabled in future versions.
   */
  static getUiVisibleRoles(): RoleDefinition[] {
    return ROLES_CONFIG.filter((r) => r.isUiVisible);
  }

  /**
   * Retrieves complete enterprise role roster (15+ roles) prepared for limitless multi-user expansion.
   */
  static getAllConfiguredRoles(): RoleDefinition[] {
    return [...ROLES_CONFIG];
  }

  /**
   * Certifies architectural readiness for unlimited concurrent authenticated user sessions without restriction.
   */
  static validateConcurrentSession(userId: string, roleName: string): { allowed: boolean; maxSessions: string } {
    Logger.info(`[RBAC Concurrent] Authenticated session validated for user ${userId} (${roleName}). Scaling capacity: UNLIMITED.`);
    return { allowed: true, maxSessions: "UNLIMITED" };
  }
}
