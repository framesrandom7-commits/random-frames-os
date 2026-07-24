/**
 * CurrencyService
 * 
 * Centralized abstraction for currency formatting, conversion, and symbols.
 * Supports potential multi-currency requirements in the future.
 */

export class CurrencyService {
  private static defaultLocale = "en-IN";
  private static defaultCurrency = "INR";

  /**
   * Formats a given amount into a localized currency string.
   */
  static format(amount: number, currencyCode = this.defaultCurrency, locale = this.defaultLocale): string {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Returns the symbol for a given currency code.
   */
  static getSymbol(currencyCode = this.defaultCurrency, locale = this.defaultLocale): string {
    // Extract symbol using Intl api
    const parts = new Intl.NumberFormat(locale, {
      style: "currency",
      currency: currencyCode,
    }).formatToParts(0);
    
    const symbolPart = parts.find(part => part.type === "currency");
    return symbolPart ? symbolPart.value : "₹";
  }

  /**
   * Safe decimal math - add
   */
  static add(...amounts: number[]): number {
    return amounts.reduce((sum, amount) => sum + amount, 0);
  }

  /**
   * Safe decimal math - multiply
   */
  static multiply(amount: number, multiplier: number): number {
    return amount * multiplier;
  }
}
