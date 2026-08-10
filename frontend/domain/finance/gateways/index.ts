import { Logger } from "@/lib/logger";

export interface PaymentGatewayRequest {
  invoiceId: string;
  invoiceNumber: string;
  amount: number;
  currency: string;
  clientName: string;
  clientEmail?: string;
  clientPhone?: string;
  callbackUrl?: string;
}

export interface PaymentGatewayResponse {
  success: boolean;
  gatewayTransactionId?: string;
  portalUrl?: string;
  error?: string;
  provider: "RAZORPAY" | "STRIPE" | "PHONEPE" | "CASHFREE";
}

/**
 * PaymentGatewayProvider defines a standard interface for external payment processors,
 * ensuring Random Frames OS remains payment-gateway agnostic with zero architectural refactoring.
 */
export interface PaymentGatewayProvider {
  createPaymentSession(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse>;
  verifyPaymentWebhook(payload: any, signature: string, secret: string): boolean;
}

export class RazorpayAdapter implements PaymentGatewayProvider {
  async createPaymentSession(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse> {
    Logger.info(`[RazorpayAdapter] Initiating session for ${request.invoiceNumber} (${request.currency} ${request.amount})`);
    return {
      success: true,
      provider: "RAZORPAY",
      gatewayTransactionId: `rzp_order_${Math.random().toString(36).substring(2, 9)}`,
      portalUrl: `https://api.razorpay.com/v1/checkout/embedded?order_id=rzp_${request.invoiceNumber}`
    };
  }
  verifyPaymentWebhook(payload: any, signature: string, secret: string): boolean {
    return Boolean(signature && secret);
  }
}

export class StripeAdapter implements PaymentGatewayProvider {
  async createPaymentSession(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse> {
    Logger.info(`[StripeAdapter] Initiating session for ${request.invoiceNumber} (${request.currency} ${request.amount})`);
    return {
      success: true,
      provider: "STRIPE",
      gatewayTransactionId: `cs_test_${Math.random().toString(36).substring(2, 9)}`,
      portalUrl: `https://checkout.stripe.com/c/pay/${request.invoiceNumber}`
    };
  }
  verifyPaymentWebhook(payload: any, signature: string, secret: string): boolean {
    return Boolean(signature && secret);
  }
}

export class PhonePeAdapter implements PaymentGatewayProvider {
  async createPaymentSession(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse> {
    Logger.info(`[PhonePeAdapter] Initiating UPI/Card session for ${request.invoiceNumber}`);
    return {
      success: true,
      provider: "PHONEPE",
      gatewayTransactionId: `pp_txn_${Math.random().toString(36).substring(2, 9)}`,
      portalUrl: `https://mercury-t2.phonepe.com/transact/pay/${request.invoiceNumber}`
    };
  }
  verifyPaymentWebhook(): boolean { return true; }
}

export class CashfreeAdapter implements PaymentGatewayProvider {
  async createPaymentSession(request: PaymentGatewayRequest): Promise<PaymentGatewayResponse> {
    Logger.info(`[CashfreeAdapter] Initiating payment link for ${request.invoiceNumber}`);
    return {
      success: true,
      provider: "CASHFREE",
      gatewayTransactionId: `cf_link_${Math.random().toString(36).substring(2, 9)}`,
      portalUrl: `https://payments.cashfree.com/links/${request.invoiceNumber}`
    };
  }
  verifyPaymentWebhook(): boolean { return true; }
}

export class PaymentGatewayFactory {
  static getProvider(providerName: "RAZORPAY" | "STRIPE" | "PHONEPE" | "CASHFREE"): PaymentGatewayProvider {
    switch (providerName) {
      case "RAZORPAY": return new RazorpayAdapter();
      case "STRIPE": return new StripeAdapter();
      case "PHONEPE": return new PhonePeAdapter();
      case "CASHFREE": return new CashfreeAdapter();
      default: return new RazorpayAdapter();
    }
  }
}
