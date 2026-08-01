import { WhatsAppTemplateComponent, WhatsAppTemplateParameter } from "./types";
import { WHATSAPP_TEMPLATES } from "./constants";

export interface TemplateDefinition {
  id: string;
  name: string;
  category: "AUTHENTICATION" | "MARKETING" | "UTILITY";
  description: string;
  placeholders: string[];
  defaultLanguage: string;
}

/**
 * Complete Enterprise WhatsApp Template Registry
 * Permanently locks and regulates all 16 required production templates with dynamic placeholder formatting.
 */
export class WhatsAppTemplateRegistry {
  public static readonly TEMPLATES: Record<string, TemplateDefinition> = {
    WELCOME_CLIENT: {
      id: WHATSAPP_TEMPLATES.WELCOME_CLIENT,
      name: "Welcome Client",
      category: "UTILITY",
      description: "Welcome message sent when a Lead is converted to a Client.",
      placeholders: ["client_name", "account_manager"],
      defaultLanguage: "en",
    },
    LEAD_FOLLOWUP: {
      id: WHATSAPP_TEMPLATES.LEAD_FOLLOWUP,
      name: "Lead Followup",
      category: "MARKETING",
      description: "Follow-up message sent to active inquiries.",
      placeholders: ["lead_name", "services_offered", "calendar_link"],
      defaultLanguage: "en",
    },
    DISCOVERY_MEETING: {
      id: WHATSAPP_TEMPLATES.DISCOVERY_MEETING,
      name: "Discovery Meeting Confirmation",
      category: "UTILITY",
      description: "Confirms scheduled creative consultation or discovery calls.",
      placeholders: ["client_name", "meeting_date", "meeting_time", "meeting_link"],
      defaultLanguage: "en",
    },
    QUOTATION_SENT: {
      id: WHATSAPP_TEMPLATES.QUOTATION_SENT,
      name: "Quotation Delivered",
      category: "UTILITY",
      description: "Notification sent with attached PDF quotation document link.",
      placeholders: ["client_name", "project_title", "quote_amount", "document_link"],
      defaultLanguage: "en",
    },
    QUOTATION_APPROVED: {
      id: WHATSAPP_TEMPLATES.QUOTATION_APPROVED,
      name: "Quotation Approved Confirmation",
      category: "UTILITY",
      description: "Confirmation of quote sign-off and next steps for advance booking.",
      placeholders: ["client_name", "project_title", "advance_percentage"],
      defaultLanguage: "en",
    },
    ADVANCE_PAYMENT_RECEIVED: {
      id: WHATSAPP_TEMPLATES.ADVANCE_PAYMENT_RECEIVED,
      name: "Advance Payment Receipt",
      category: "UTILITY",
      description: "Confirms receipt of retainer payment and official date booking.",
      placeholders: ["client_name", "amount_paid", "project_title", "receipt_link"],
      defaultLanguage: "en",
    },
    SHOOT_REMINDER: {
      id: WHATSAPP_TEMPLATES.SHOOT_REMINDER,
      name: "Shoot Day Reminder (24h Policy)",
      category: "UTILITY",
      description: "Exclusive automated single reminder sent 24h prior to shoot execution.",
      placeholders: [
        "client_name",
        "project_name",
        "shoot_date",
        "shoot_time",
        "shoot_location",
        "contact_person",
        "special_notes",
        "reply_instructions",
      ],
      defaultLanguage: "en",
    },
    PROJECT_UPDATE: {
      id: WHATSAPP_TEMPLATES.PROJECT_UPDATE,
      name: "Project Progress Update",
      category: "UTILITY",
      description: "General pipeline milestone update on active creative projects.",
      placeholders: ["client_name", "project_title", "status_update", "next_milestone"],
      defaultLanguage: "en",
    },
    EDITING_STARTED: {
      id: WHATSAPP_TEMPLATES.EDITING_STARTED,
      name: "Post-Production Started",
      category: "UTILITY",
      description: "Notify client that raw footage has entered post-production color and editing.",
      placeholders: ["client_name", "project_title", "estimated_preview_date"],
      defaultLanguage: "en",
    },
    PREVIEW_READY: {
      id: WHATSAPP_TEMPLATES.PREVIEW_READY,
      name: "Preview Cut Ready",
      category: "UTILITY",
      description: "First look preview cut delivered with revision feedback loop instructions.",
      placeholders: ["client_name", "project_title", "preview_link", "feedback_deadline"],
      defaultLanguage: "en",
    },
    REVISION_REQUEST: {
      id: WHATSAPP_TEMPLATES.REVISION_REQUEST,
      name: "Revision Request Acknowledged",
      category: "UTILITY",
      description: "Acknowledges client review notes and outlines turnaround time for updates.",
      placeholders: ["client_name", "project_title", "revision_number", "delivery_date"],
      defaultLanguage: "en",
    },
    FINAL_DELIVERY_READY: {
      id: WHATSAPP_TEMPLATES.FINAL_DELIVERY_READY,
      name: "Final Master Deliverable Ready",
      category: "UTILITY",
      description: "Notice that final high-res photography and master films are rendered.",
      placeholders: ["client_name", "project_title", "deliverables_summary"],
      defaultLanguage: "en",
    },
    FINAL_PAYMENT_PENDING: {
      id: WHATSAPP_TEMPLATES.FINAL_PAYMENT_PENDING,
      name: "Final Payment Due Reminder",
      category: "UTILITY",
      description: "Payment reminder sent prior to unblocking high-resolution download access.",
      placeholders: ["client_name", "invoice_number", "balance_due", "payment_link"],
      defaultLanguage: "en",
    },
    PAYMENT_RECEIVED: {
      id: WHATSAPP_TEMPLATES.PAYMENT_RECEIVED,
      name: "Full Payment & Receipt Confirmation",
      category: "UTILITY",
      description: "Confirms 100% payment completion and attaches permanent financial receipt.",
      placeholders: ["client_name", "total_paid", "invoice_number", "receipt_link"],
      defaultLanguage: "en",
    },
    THANK_YOU: {
      id: WHATSAPP_TEMPLATES.THANK_YOU,
      name: "Project Completion & Thank You",
      category: "MARKETING",
      description: "Closing gratitude message requesting feedback or testimonials.",
      placeholders: ["client_name", "project_title", "review_link"],
      defaultLanguage: "en",
    },
    CUSTOM_MESSAGE: {
      id: WHATSAPP_TEMPLATES.CUSTOM_MESSAGE,
      name: "Custom Freeform Template",
      category: "UTILITY",
      description: "Generic dynamic fallback template supporting variable administrative notes.",
      placeholders: ["subject", "custom_body", "sender_name"],
      defaultLanguage: "en",
    },
  };

  /**
   * Helper method to generate standard Body text components from an array of string substitutions
   */
  public static buildTextComponents(values: (string | undefined | null)[]): WhatsAppTemplateComponent[] {
    const safeValues = values.filter((v): v is string => v !== undefined && v !== null);
    if (safeValues.length === 0) return [];

    return [
      {
        type: "body",
        parameters: safeValues.map((val) => ({
          type: "text",
          text: String(val),
        })),
      },
    ];
  }

  /**
   * Helper method to attach a Header document or PDF parameter (e.g. Invoices, Quotations, Receipts)
   */
  public static buildDocumentComponent(documentUrl: string, fileName: string): WhatsAppTemplateComponent {
    return {
      type: "header",
      parameters: [
        {
          type: "document",
          document: {
            link: documentUrl,
            filename: fileName,
          },
        },
      ],
    };
  }

  /**
   * Helper method to attach interactive URL or Quick Reply buttons
   */
  public static buildButtonComponent(subType: "url" | "quick_reply", index: number, buttonTextOrPayload: string): WhatsAppTemplateComponent {
    const param: WhatsAppTemplateParameter = subType === "url" 
      ? { type: "text", text: buttonTextOrPayload }
      : { type: "text", text: buttonTextOrPayload };

    return {
      type: "button",
      sub_type: subType,
      index: index.toString(),
      parameters: [param],
    };
  }

  /**
   * Validates that the provided template name is recognized in the official Random Frames OS registry
   */
  public static isValidTemplate(templateName: string): boolean {
    return Object.values(this.TEMPLATES).some((t) => t.id === templateName || t.name === templateName);
  }
}
