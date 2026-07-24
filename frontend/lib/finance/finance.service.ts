import { Decimal } from "@prisma/client/runtime/library";
import { TaxService, TaxRule } from "./tax.service";
import { CurrencyService } from "./currency.service";

/**
 * FinanceService
 * 
 * Centralized calculation engine for all financial totals.
 * Owns calculations for Quotations, Invoices, Profit, and Balances.
 */
export class FinanceService {
  /**
   * Calculate totals for a quotation or invoice given a list of line items.
   */
  static calculateTotals(
    items: { unitPrice: number | Decimal; quantity: number }[],
    discountValue: number | Decimal = 0,
    isExport: boolean = false
  ) {
    const subtotal = items.reduce((acc, item) => {
      return acc + (Number(item.unitPrice) * item.quantity);
    }, 0);

    const discount = Number(discountValue);
    const postDiscountSubtotal = Math.max(0, subtotal - discount);

    const applicableTaxRules = TaxService.getApplicableTaxRules(isExport);
    const tax = TaxService.calculateTax(postDiscountSubtotal, applicableTaxRules);
    
    const total = postDiscountSubtotal + tax;

    return {
      subtotal,
      discount,
      tax,
      total
    };
  }

  /**
   * Calculate outstanding balance of an invoice.
   */
  static calculateInvoiceBalance(
    invoiceTotal: number | Decimal,
    payments: { amount: number | Decimal }[]
  ) {
    const total = Number(invoiceTotal);
    const totalPaid = payments.reduce((acc, payment) => acc + Number(payment.amount), 0);
    return Math.max(0, total - totalPaid);
  }

  /**
   * Calculate net profit for a project.
   */
  static calculateNetProfit(
    revenue: number | Decimal,
    expenses: { amount: number | Decimal }[]
  ) {
    const totalRevenue = Number(revenue);
    const totalExpenses = expenses.reduce((acc, expense) => acc + Number(expense.amount), 0);
    return totalRevenue - totalExpenses;
  }
}
