import { EventBus } from "../events/EventBus";
import { Logger } from "../../lib/logger";

export type EnquiryType = "CONTACT" | "QUOTE" | "BOOKING" | "REQUIREMENTS";

export interface WebsiteEnquiryPayload {
  type: EnquiryType;
  businessName?: string;
  contactPerson: string;
  email: string;
  phone?: string;
  message?: string;
  source: string; // e.g. "WEBSITE", "INSTAGRAM", "GOOGLE"
  utmCampaign?: string;
  referrer?: string;
  landingPage?: string;
  budget?: string;
  shootDate?: string;
  deliverables?: string;
  requirementToken?: string;
  uploadedFiles?: { name: string; url: string; size: number }[];
}

export class WebsiteLeadIntakeService {
  /**
   * Validates and normalizes incoming website enquiries before dispatching to the Workflow Engine.
   * Performs deduplication and rate limiting simulation.
   */
  static async processEnquiry(payload: WebsiteEnquiryPayload) {
    Logger.info(`[WebsiteLeadIntakeService] Processing incoming ${payload.type} enquiry from ${payload.email}`);

    // 1. Validation & Sanitization
    this.validateEmail(payload.email);
    if (payload.phone) this.validatePhone(payload.phone);

    // 2. Security: Simulate duplicate detection & flood protection
    await this.checkRateLimit(payload.email);
    const isDuplicate = await this.detectDuplicate(payload.email, payload.type);

    if (isDuplicate) {
      Logger.warn(`[WebsiteLeadIntakeService] Duplicate enquiry detected for ${payload.email}. Discarding to prevent CRM spam.`);
      return { status: "DUPLICATE_REJECTED" };
    }

    // 3. Dispatch to Workflow Engine via Event Bus
    // The Intake Service DOES NOT create CRM records directly, preserving architecture constraints.
    await EventBus.emit("WEBSITE_ENQUIRY_RECEIVED", {
      ...payload,
      timestamp: new Date().toISOString()
    });

    Logger.info(`[WebsiteLeadIntakeService] Enquiry validated and dispatched to WorkflowEngine for ${payload.email}`);
    
    return { status: "SUCCESS" };
  }

  private static validateEmail(email: string) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error(`Invalid email format: ${email}`);
    }
  }

  private static validatePhone(phone: string) {
    // Extensible phone verification interface
    const phoneRegex = /^\+?[\d\s-]{7,15}$/;
    if (!phoneRegex.test(phone)) {
      throw new Error(`Invalid phone format: ${phone}`);
    }
  }

  private static async checkRateLimit(identifier: string) {
    // Simulated rate limiting check (e.g. Redis based in production)
    // Limits to 5 submissions per IP/Email per hour
    return true;
  }

  private static async detectDuplicate(email: string, type: EnquiryType) {
    // Simulated duplicate check
    // In production, queries Prisma: prisma.lead.findFirst({ where: { email, createdAt: { gt: last24Hours } } })
    return false;
  }
}
