export interface EmailTemplateDefinition {
  id: string;
  name: string;
  subject: string;
  body: string;
  placeholders: string[];
}

export type EmailTemplateKey =
  | "WELCOME"
  | "LEAD_FOLLOWUP"
  | "QUOTATION"
  | "BOOKING_CONFIRMATION"
  | "INVOICE"
  | "PAYMENT_RECEIVED"
  | "SHOOT_CONFIRMATION"
  | "SHOOT_REMINDER"
  | "PREVIEW_READY"
  | "REVISION_REQUEST"
  | "FINAL_DELIVERY"
  | "THANK_YOU"
  | "CUSTOM";

/**
 * Official Gmail Email Template Registry for Random Frames OS.
 * Supports dynamic placeholder parameter substitution.
 */
export class GmailTemplateRegistry {
  static readonly TEMPLATES: Record<EmailTemplateKey, EmailTemplateDefinition> = {
    WELCOME: {
      id: "rf_gmail_welcome",
      name: "Client Welcome & Onboarding",
      subject: "Welcome to Random Frames OS — Your Creative Journey Begins",
      body: "Dear {{clientName}},\n\nWelcome to Random Frames! We are thrilled to partner with you on your creative journey. Your dedicated portal and client space have been configured.\n\nBest regards,\nThe Random Frames Team",
      placeholders: ["clientName"]
    },
    LEAD_FOLLOWUP: {
      id: "rf_gmail_lead_followup",
      name: "Lead Inquiry Follow-up",
      subject: "Following up on your inquiry with Random Frames",
      body: "Hello {{contactName}},\n\nThank you for reaching out regarding {{serviceInterested}}. We would love to discuss your creative vision in detail and schedule a consultation call.\n\nWarm regards,\nRandom Frames Studio",
      placeholders: ["contactName", "serviceInterested"]
    },
    QUOTATION: {
      id: "rf_gmail_quotation",
      name: "Quotation Dispatch",
      subject: "Quotation for {{projectTitle}} — Random Frames",
      body: "Dear {{clientName}},\n\nPlease find attached the official quotation for {{projectTitle}}. Total Amount: {{amount}}. You can review and confirm your booking via your client link: {{docUrl}}\n\nSincerely,\nRandom Frames Finance",
      placeholders: ["clientName", "projectTitle", "amount", "docUrl"]
    },
    BOOKING_CONFIRMATION: {
      id: "rf_gmail_booking_confirm",
      name: "Booking & Retainer Confirmation",
      subject: "Booking Confirmed: {{projectTitle}}",
      body: "Dear {{clientName}},\n\nYour booking for {{projectTitle}} is officially confirmed! Our pre-production team is now initializing your production schedule and cloud workspace.\n\nBest regards,\nRandom Frames Operations",
      placeholders: ["clientName", "projectTitle"]
    },
    INVOICE: {
      id: "rf_gmail_invoice",
      name: "Invoice Delivery",
      subject: "Invoice #{{invoiceNumber}} from Random Frames",
      body: "Dear {{clientName}},\n\nAttached is Invoice #{{invoiceNumber}} for {{projectTitle}}. Balance Due: {{balanceDue}}. Please view or settle via: {{paymentUrl}}\n\nThank you,\nRandom Frames Finance",
      placeholders: ["clientName", "invoiceNumber", "projectTitle", "balanceDue", "paymentUrl"]
    },
    PAYMENT_RECEIVED: {
      id: "rf_gmail_payment_receipt",
      name: "Payment Receipt",
      subject: "Payment Receipt — Invoice #{{invoiceNumber}}",
      body: "Dear {{clientName}},\n\nWe have successfully received your payment of {{amountPaid}} for Invoice #{{invoiceNumber}}. Your transaction receipt is attached.\n\nThank you for your business!\nRandom Frames",
      placeholders: ["clientName", "amountPaid", "invoiceNumber"]
    },
    SHOOT_CONFIRMATION: {
      id: "rf_gmail_shoot_confirm",
      name: "Shoot Schedule Confirmation",
      subject: "Shoot Scheduled: {{shootTitle}} on {{date}}",
      body: "Hello {{clientName}},\n\nYour shoot '{{shootTitle}}' has been officially scheduled for {{date}} at {{time}}. Location: {{location}}.\n\nWe look forward to collaborating on set!\nRandom Frames Production",
      placeholders: ["clientName", "shootTitle", "date", "time", "location"]
    },
    SHOOT_REMINDER: {
      id: "rf_gmail_shoot_reminder",
      name: "Shoot Reminder & Timetable",
      subject: "Reminder: Upcoming Shoot '{{shootTitle}}' Tomorrow",
      body: "Dear {{clientName}},\n\nThis is an automated operational reminder for your shoot '{{shootTitle}}' tomorrow at {{time}}. Location: {{location}}. Please ensure all stakeholders arrive 15 minutes early.\n\nSee you soon,\nRandom Frames Production",
      placeholders: ["clientName", "shootTitle", "time", "location"]
    },
    PREVIEW_READY: {
      id: "rf_gmail_preview_ready",
      name: "Preview Cut Ready for Review",
      subject: "Preview Ready for Review: {{projectTitle}}",
      body: "Dear {{clientName}},\n\nOur post-production team has uploaded the preview cut for {{projectTitle}}! Please access your secure cloud review link here: {{driveUrl}}\n\nKindly share your feedback within {{feedbackWindow}}.\n\nBest regards,\nRandom Frames Post-Production",
      placeholders: ["clientName", "projectTitle", "driveUrl", "feedbackWindow"]
    },
    REVISION_REQUEST: {
      id: "rf_gmail_revision_request",
      name: "Revision Receipt Acknowledged",
      subject: "Revisions Acknowledged: {{projectTitle}}",
      body: "Hello {{clientName}},\n\nWe have received your revision notes for {{projectTitle}}. Our editorial team is currently processing the changes and will notify you once updated.\n\nWarm regards,\nRandom Frames Editorial",
      placeholders: ["clientName", "projectTitle"]
    },
    FINAL_DELIVERY: {
      id: "rf_gmail_final_delivery",
      name: "Final Master Delivery",
      subject: "Final Deliverables Ready: {{projectTitle}}",
      body: "Dear {{clientName}},\n\nWe are excited to present your final deliverables for {{projectTitle}}! All high-resolution masters have been archived and shared to your client delivery box: {{deliveryUrl}}\n\nIt has been a pleasure bringing your vision to life!\nThe Random Frames Team",
      placeholders: ["clientName", "projectTitle", "deliveryUrl"]
    },
    THANK_YOU: {
      id: "rf_gmail_thank_you",
      name: "Project Completion & Feedback",
      subject: "Thank You from Random Frames — Your Feedback Matters",
      body: "Dear {{clientName}},\n\nThank you for choosing Random Frames for {{projectTitle}}. As we close out this production, we would greatly value your feedback on our collaboration. Please let us know how we did!\n\nUntil our next creation,\nRandom Frames Studio",
      placeholders: ["clientName", "projectTitle"]
    },
    CUSTOM: {
      id: "rf_gmail_custom",
      name: "Custom Communication",
      subject: "{{subject}}",
      body: "{{body}}",
      placeholders: ["subject", "body"]
    }
  };

  /**
   * Render a template subject and body by substituting placeholders in {{key}} format.
   */
  static render(templateKey: EmailTemplateKey, params: Record<string, string>): { subject: string; body: string; id: string } {
    const template = this.TEMPLATES[templateKey] || this.TEMPLATES.CUSTOM;
    let subject = template.subject;
    let body = template.body;

    for (const [key, value] of Object.entries(params)) {
      const regex = new RegExp(`{{${key}}}`, "g");
      subject = subject.replace(regex, value);
      body = body.replace(regex, value);
    }

    return {
      id: template.id,
      subject,
      body
    };
  }
}
