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

  /**
   * Converts a number to words (Indian Numbering System)
   */
  static numberToWords(amount: number): string {
    const a = ['', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ', 'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const numToWords = (num: number): string => {
      if (num === 0) return '';
      if (num < 20) return a[num];
      if (num < 100) return b[Math.floor(num / 10)] + (num % 10 !== 0 ? ' ' + a[num % 10] : ' ');
      if (num < 1000) return a[Math.floor(num / 100)] + 'Hundred ' + (num % 100 !== 0 ? 'and ' + numToWords(num % 100) : '');
      if (num < 100000) return numToWords(Math.floor(num / 1000)) + 'Thousand ' + (num % 1000 !== 0 ? numToWords(num % 1000) : '');
      if (num < 10000000) return numToWords(Math.floor(num / 100000)) + 'Lakh ' + (num % 100000 !== 0 ? numToWords(num % 100000) : '');
      return numToWords(Math.floor(num / 10000000)) + 'Crore ' + (num % 10000000 !== 0 ? numToWords(num % 10000000) : '');
    };

    const wholePart = Math.floor(amount);
    const words = numToWords(wholePart);
    return words ? words.trim() : 'Zero';
  }
}
