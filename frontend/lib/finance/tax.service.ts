/**
 * TaxService
 * 
 * Central engine for tax calculations.
 * Completely decoupled from React components.
 */

export interface TaxRule {
  name: string;
  rate: number; // e.g., 0.18 for 18% GST
}

export class TaxService {
  private static defaultTaxRules: TaxRule[] = [
    { name: "GST 18%", rate: 0.18 },
  ];

  /**
   * Calculate total tax amount for a given subtotal based on active tax rules.
   */
  static calculateTax(subtotal: number, customRules?: TaxRule[]): number {
    const rulesToApply = customRules || this.defaultTaxRules;
    let totalTax = 0;
    
    for (const rule of rulesToApply) {
      totalTax += subtotal * rule.rate;
    }
    
    return totalTax;
  }

  /**
   * Helper to determine if tax should be applied based on business logic.
   * (e.g. Export services might be 0-rated)
   */
  static getApplicableTaxRules(isExport = false): TaxRule[] {
    if (isExport) {
      return [{ name: "Export (0-rated)", rate: 0 }];
    }
    return this.defaultTaxRules;
  }
}
