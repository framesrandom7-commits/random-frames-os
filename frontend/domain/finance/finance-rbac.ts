import { RbacDomainService } from "@/domain/rbac/service";
import { Logger } from "@/lib/logger";

/**
 * FinanceRbacEngine enforces the frozen RBAC rules for the Finance & Business Operations Module:
 * - Founder: Full finance access, override authority, discount/refund/write-off approvals, GST & numbering settings, financial account configuration.
 * - Co-Founder: Create quotations, generate invoices, record payments, track expenses, send documents, view reports.
 *   Cannot delete records, modify GST, change numbering, modify bank accounts, or access payment gateway credentials.
 */
export class FinanceRbacEngine {
  static isFounder(roleName?: string | null): boolean {
    return RbacDomainService.isFounder(roleName || "");
  }

  static isCoFounderOrHigher(roleName?: string | null): boolean {
    return (
      RbacDomainService.isFounder(roleName || "") ||
      RbacDomainService.isCoFounder(roleName || "")
    );
  }

  static canModifyGstSettings(roleName?: string | null): boolean {
    const allowed = this.isFounder(roleName);
    if (!allowed) {
      Logger.warn("[FinanceRbac] Access Denied: Only Founder can modify GST settings.");
    }
    return allowed;
  }

  static canModifyNumberingSystem(roleName?: string | null): boolean {
    const allowed = this.isFounder(roleName);
    if (!allowed) {
      Logger.warn("[FinanceRbac] Access Denied: Only Founder can modify document numbering prefixes.");
    }
    return allowed;
  }

  static canModifyBankAccounts(roleName?: string | null): boolean {
    const allowed = this.isFounder(roleName);
    if (!allowed) {
      Logger.warn("[FinanceRbac] Access Denied: Only Founder can add or modify bank accounts and UPI IDs.");
    }
    return allowed;
  }

  static canAccessPaymentCredentials(roleName?: string | null): boolean {
    const allowed = this.isFounder(roleName);
    if (!allowed) {
      Logger.warn("[FinanceRbac] Access Denied: Only Founder can view or edit payment gateway secret credentials.");
    }
    return allowed;
  }

  static canApproveDiscount(roleName?: string | null, discountAmount: number = 0): boolean {
    if (this.isFounder(roleName)) return true;
    if (this.isCoFounderOrHigher(roleName) && discountAmount <= 5000) return true;
    Logger.warn(`[FinanceRbac] Access Denied: Discount amount ${discountAmount} requires Founder approval.`);
    return false;
  }

  static canApproveRefund(roleName?: string | null): boolean {
    const allowed = this.isFounder(roleName);
    if (!allowed) {
      Logger.warn("[FinanceRbac] Access Denied: Only Founder can approve financial refunds.");
    }
    return allowed;
  }

  static canApproveWriteOff(roleName?: string | null): boolean {
    const allowed = this.isFounder(roleName);
    if (!allowed) {
      Logger.warn("[FinanceRbac] Access Denied: Only Founder can approve financial bad debt write-offs.");
    }
    return allowed;
  }

  static canDeleteFinancialRecord(roleName?: string | null): boolean {
    const allowed = this.isFounder(roleName);
    if (!allowed) {
      Logger.warn("[FinanceRbac] Access Denied: Co-Founder cannot delete financial records. Founder override required.");
    }
    return allowed;
  }

  static canOperateFinance(roleName?: string | null): boolean {
    return this.isCoFounderOrHigher(roleName);
  }
}
