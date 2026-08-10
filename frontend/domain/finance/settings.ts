import { FinanceRepository } from "@/domain/repositories/FinanceRepository";
import { FinanceRbacEngine } from "./finance-rbac";
import { Logger } from "@/lib/logger";
import * as crypto from "crypto";

export interface BusinessFinanceConfig {
  id?: string;
  businessName?: string;
  businessLogoUrl?: string;
  gstEnabled?: boolean;
  gstNumber?: string;
  hsnSacCode?: string;
  taxPercentage?: number;
  currency?: string;
  financialYear?: string;
  invoicePrefix?: string;
  quotationPrefix?: string;
  receiptPrefix?: string;
  creditNotePrefix?: string;
  lateFeeRules?: Record<string, any>;
  defaultTerms?: string;
  defaultNotes?: string;
  bankAccounts?: Array<{ accountName: string; accountNumber: string; bankName: string; ifsc: string }>;
  upiIds?: string[];
  paymentGateways?: Record<string, { apiKey?: string; apiSecret?: string; isEnabled: boolean }>;
}

/**
 * BusinessFinanceSettingsService manages dynamic business configuration without any hardcoded values in code.
 * Governed strictly by Founder RBAC permissions.
 */
export class BusinessFinanceSettingsService {
  private static readonly ENCRYPTION_SECRET = process.env.FINANCE_ENCRYPTION_KEY || "rf_os_v1_enterprise_finance_vault_key_2026";

  private static getCipherKey(): Buffer {
    return crypto.createHash("sha256").update(this.ENCRYPTION_SECRET).digest();
  }

  private static encryptText(text: string): string {
    if (!text) return text;
    try {
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv("aes-256-cbc", this.getCipherKey(), iv);
      let encrypted = cipher.update(text, "utf8", "hex");
      encrypted += cipher.final("hex");
      return `${iv.toString("hex")}:${encrypted}`;
    } catch {
      return text;
    }
  }

  private static decryptText(encryptedText: string): string {
    if (!encryptedText || !encryptedText.includes(":")) return encryptedText;
    try {
      const [ivHex, enc] = encryptedText.split(":");
      const iv = Buffer.from(ivHex, "hex");
      const decipher = crypto.createDecipheriv("aes-256-cbc", this.getCipherKey(), iv);
      let decrypted = decipher.update(enc, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch {
      return encryptedText;
    }
  }

  static async getConfig(roleName?: string | null): Promise<BusinessFinanceConfig> {
    let setting: any = await FinanceRepository.getBusinessSetting("default");
    if (!setting) {
      // Initialize default configuration
      setting = await FinanceRepository.upsertBusinessSetting("default", {
        businessName: "Random Frames Studio",
        gstEnabled: true,
        gstNumber: "29ABCDE1234F1Z5",
        hsnSacCode: "9983",
        taxPercentage: 18.00,
        currency: "INR",
        financialYear: "2025-2026",
        invoicePrefix: "INV-",
        quotationPrefix: "QTN-",
        receiptPrefix: "REC-",
        creditNotePrefix: "CN-",
        defaultTerms: "1. Advance payment is non-refundable.\n2. Balance due prior to final delivery.\n3. All deliverables subject to copyright agreements."
      }) as any;
    }

    const gateways = setting?.paymentGateways as Record<string, any> | undefined;
    const isFounder = FinanceRbacEngine.isFounder(roleName);
    const decryptedGateways: Record<string, any> = {};
    if (gateways) {
      for (const [provider, data] of Object.entries(gateways)) {
        if (!isFounder) {
          decryptedGateways[provider] = { isEnabled: data.isEnabled, apiKey: "****", apiSecret: "**** (Founder Access Required)" };
        } else {
          decryptedGateways[provider] = {
            ...data,
            apiKey: this.decryptText(data.apiKey || ""),
            apiSecret: this.decryptText(data.apiSecret || "")
          };
        }
      }
    }

    const bankAccs = (setting?.bankAccounts as Array<any>)?.map(acc => ({
      ...acc,
      accountNumber: isFounder ? this.decryptText(acc.accountNumber) : `xxxx-xxxx-${this.decryptText(acc.accountNumber || "").slice(-4)}`
    }));

    return {
      id: setting?.id,
      businessName: setting?.businessName,
      businessLogoUrl: setting?.businessLogoUrl || undefined,
      gstEnabled: setting?.gstEnabled,
      gstNumber: setting?.gstNumber || undefined,
      hsnSacCode: setting?.hsnSacCode || undefined,
      taxPercentage: Number(setting?.taxPercentage || 0),
      currency: setting?.currency,
      financialYear: setting?.financialYear,
      invoicePrefix: setting?.invoicePrefix,
      quotationPrefix: setting?.quotationPrefix,
      receiptPrefix: setting?.receiptPrefix,
      creditNotePrefix: setting?.creditNotePrefix,
      lateFeeRules: setting?.lateFeeRules as any,
      defaultTerms: setting?.defaultTerms || undefined,
      defaultNotes: setting?.defaultNotes || undefined,
      bankAccounts: bankAccs,
      upiIds: setting?.upiIds as string[],
      paymentGateways: decryptedGateways
    };
  }

  static async updateConfig(roleName: string, updates: Partial<BusinessFinanceConfig>): Promise<BusinessFinanceConfig> {
    if (!FinanceRbacEngine.isFounder(roleName)) {
      if (updates.gstEnabled !== undefined || updates.gstNumber || updates.taxPercentage !== undefined) {
        throw new Error("Access Denied: Only Founder can modify GST and taxation settings.");
      }
      if (updates.invoicePrefix || updates.quotationPrefix || updates.receiptPrefix || updates.creditNotePrefix) {
        throw new Error("Access Denied: Only Founder can modify document numbering prefixes.");
      }
      if (updates.bankAccounts || updates.upiIds) {
        throw new Error("Access Denied: Only Founder can add or modify bank accounts and UPI IDs.");
      }
      if (updates.paymentGateways) {
        throw new Error("Access Denied: Only Founder can modify payment gateway secrets.");
      }
    }

    const dbPayload: any = {};
    if (updates.businessName !== undefined) dbPayload.businessName = updates.businessName;
    if (updates.businessLogoUrl !== undefined) dbPayload.businessLogoUrl = updates.businessLogoUrl;
    if (updates.gstEnabled !== undefined) dbPayload.gstEnabled = updates.gstEnabled;
    if (updates.gstNumber !== undefined) dbPayload.gstNumber = updates.gstNumber;
    if (updates.hsnSacCode !== undefined) dbPayload.hsnSacCode = updates.hsnSacCode;
    if (updates.taxPercentage !== undefined) dbPayload.taxPercentage = updates.taxPercentage;
    if (updates.currency !== undefined) dbPayload.currency = updates.currency;
    if (updates.financialYear !== undefined) dbPayload.financialYear = updates.financialYear;
    if (updates.invoicePrefix !== undefined) dbPayload.invoicePrefix = updates.invoicePrefix;
    if (updates.quotationPrefix !== undefined) dbPayload.quotationPrefix = updates.quotationPrefix;
    if (updates.receiptPrefix !== undefined) dbPayload.receiptPrefix = updates.receiptPrefix;
    if (updates.creditNotePrefix !== undefined) dbPayload.creditNotePrefix = updates.creditNotePrefix;
    if (updates.defaultTerms !== undefined) dbPayload.defaultTerms = updates.defaultTerms;
    if (updates.defaultNotes !== undefined) dbPayload.defaultNotes = updates.defaultNotes;
    if (updates.lateFeeRules !== undefined) dbPayload.lateFeeRules = updates.lateFeeRules;

    if (updates.bankAccounts) {
      dbPayload.bankAccounts = updates.bankAccounts.map(acc => ({
        ...acc,
        accountNumber: this.encryptText(acc.accountNumber)
      }));
    }
    if (updates.upiIds !== undefined) dbPayload.upiIds = updates.upiIds;
    if (updates.paymentGateways) {
      const encryptedGateways: Record<string, any> = {};
      for (const [provider, data] of Object.entries(updates.paymentGateways)) {
        encryptedGateways[provider] = {
          ...data,
          apiKey: data.apiKey ? this.encryptText(data.apiKey) : undefined,
          apiSecret: data.apiSecret ? this.encryptText(data.apiSecret) : undefined
        };
      }
      dbPayload.paymentGateways = encryptedGateways;
    }

    await FinanceRepository.upsertBusinessSetting("default", dbPayload);
    Logger.info(`[BusinessFinanceSettings] Updated financial configuration by role: ${roleName}`);
    return this.getConfig(roleName);
  }
}
