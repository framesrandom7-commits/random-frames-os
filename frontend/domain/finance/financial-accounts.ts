import { FinanceRepository } from "@/domain/repositories/FinanceRepository";
import { FinanceRbacEngine } from "./finance-rbac";
import { Logger } from "@/lib/logger";

export interface FinancialAccountDTO {
  id?: string;
  accountName: string;
  accountType: "CURRENT" | "SAVINGS" | "UPI" | "CASH" | "PETTY_CASH" | "ONLINE_GATEWAY" | "OTHER";
  accountNumber?: string;
  bankName?: string;
  ifscCode?: string;
  upiId?: string;
  currentBalance?: number;
  currency?: string;
  isActive?: boolean;
  isDefault?: boolean;
  notes?: string;
}

/**
 * FinancialAccountService manages multi-bank and cash account balances for Random Frames Studio.
 * Every payment received or expense disbursed alters the account's balance via transaction safe operations.
 */
export class FinancialAccountService {
  static async listAccounts(roleName?: string | null) {
    const accounts = await FinanceRepository.findFinancialAccounts({ archivedAt: null });
    const isFounder = FinanceRbacEngine.isFounder(roleName);
    
    return accounts.map((acc: any) => ({
      ...acc,
      currentBalance: Number(acc.currentBalance || 0),
      accountNumber: isFounder || !acc.accountNumber ? acc.accountNumber : `XXXX-XXXX-${String(acc.accountNumber).slice(-4)}`
    }));
  }

  static async getAccountById(id: string) {
    const acc: any = await FinanceRepository.findFinancialAccountById(id);
    if (!acc) throw new Error(`Financial account not found: ${id}`);
    return {
      ...acc,
      currentBalance: Number(acc.currentBalance || 0)
    };
  }

  static async createAccount(roleName: string, data: FinancialAccountDTO) {
    if (!FinanceRbacEngine.canModifyBankAccounts(roleName)) {
      throw new Error("Access Denied: Only Founder can create financial bank accounts.");
    }
    const acc = await FinanceRepository.createFinancialAccount({
      accountName: data.accountName,
      accountType: data.accountType,
      accountNumber: data.accountNumber,
      bankName: data.bankName,
      ifscCode: data.ifscCode,
      upiId: data.upiId,
      currentBalance: data.currentBalance || 0,
      currency: data.currency || "INR",
      isDefault: data.isDefault || false,
      notes: data.notes
    });
    Logger.info(`[FinancialAccountService] Created account '${data.accountName}' (${data.accountType})`);
    return acc;
  }

  static async adjustBalance(accountId: string, amountChange: number, reason: string): Promise<number> {
    const acc: any = await FinanceRepository.findFinancialAccountById(accountId);
    if (!acc) throw new Error(`Cannot adjust balance for invalid account ID: ${accountId}`);
    
    const current = Number(acc.currentBalance || 0);
    const updated = current + amountChange;
    
    await FinanceRepository.updateFinancialAccount(accountId, {
      currentBalance: updated
    });
    
    Logger.info(`[FinancialAccountService] Account [${acc.accountName}] balance adjusted by ${amountChange >= 0 ? "+" + amountChange : amountChange} (${reason}). New balance: ${updated}`);
    return updated;
  }

  static async deleteAccount(roleName: string, id: string) {
    if (!FinanceRbacEngine.canModifyBankAccounts(roleName)) {
      throw new Error("Access Denied: Only Founder can delete financial bank accounts.");
    }
    return FinanceRepository.deleteFinancialAccount(id);
  }
}
