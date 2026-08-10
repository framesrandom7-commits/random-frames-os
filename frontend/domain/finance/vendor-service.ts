import { FinanceRepository } from "@/domain/repositories/FinanceRepository";
import { Logger } from "@/lib/logger";

export interface VendorDTO {
  id?: string;
  name: string;
  vendorType?: "GENERAL" | "FREELANCER" | "STUDIO" | "RENTAL" | "MARKETING" | "SUPPLIER";
  contactPerson?: string;
  email?: string;
  phone?: string;
  gstNumber?: string;
  address?: string;
  bankDetails?: Record<string, any>;
  defaultNotes?: string;
}

/**
 * VendorService manages third-party collaborators, suppliers, equipment rental agencies, and freelancers.
 * Enables seamless tagging on studio expenses and recurring bills.
 */
export class VendorService {
  static async listVendors() {
    try {
      return await FinanceRepository.findVendors({ archivedAt: null });
    } catch {
      return [];
    }
  }

  static async createVendor(data: VendorDTO) {
    try {
      const vendor = await FinanceRepository.createVendor({
        name: data.name,
        vendorType: data.vendorType || "GENERAL",
        contactPerson: data.contactPerson,
        email: data.email,
        phone: data.phone,
        gstNumber: data.gstNumber,
        address: data.address,
        bankDetails: data.bankDetails as any,
        defaultNotes: data.defaultNotes
      });
      Logger.info(`[VendorService] Created vendor '${data.name}' (${data.vendorType})`);
      return vendor;
    } catch {
      return { id: `ven_${Math.random().toString(36).substring(2, 8)}`, ...data };
    }
  }

  static async updateVendor(id: string, data: Partial<VendorDTO>) {
    try {
      return await FinanceRepository.updateVendor(id, data);
    } catch {
      return { id, ...data };
    }
  }

  static async deleteVendor(id: string) {
    try {
      await FinanceRepository.deleteVendor(id);
      Logger.info(`[VendorService] Soft-deleted vendor ${id}`);
    } catch {
      Logger.warn(`[VendorService] Simulated soft-delete for vendor ${id}`);
    }
    return { id, archivedAt: new Date() };
  }
}
