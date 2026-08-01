export type WhatsAppTemplateParameter = {
  type: "text" | "currency" | "date_time" | "document" | "image" | "video" | "location";
  text?: string;
  document?: {
    link: string;
    filename?: string;
  };
  image?: {
    link: string;
    caption?: string;
  };
  video?: {
    link: string;
    caption?: string;
  };
  currency?: {
    fallback_value: string;
    code: string;
    amount_1000: number;
  };
  date_time?: {
    fallback_value: string;
  };
  location?: {
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
  };
};

export type WhatsAppTemplateComponent = {
  type: "header" | "body" | "button";
  sub_type?: "url" | "quick_reply";
  index?: string | number;
  parameters: WhatsAppTemplateParameter[];
};

export interface WhatsAppTemplatePayload {
  messaging_product: "whatsapp";
  to: string;
  type: "template";
  template: {
    name: string;
    language: {
      code: string;
    };
    components?: WhatsAppTemplateComponent[];
  };
}

export interface WhatsAppMessageLinks {
  leadId?: string;
  clientId?: string;
  projectId?: string;
  shootId?: string;
  quotationId?: string;
  invoiceId?: string;
  paymentId?: string;
}

export interface WhatsAppConversationRecord {
  id?: string;
  messageId?: string;
  direction: "INBOUND" | "OUTBOUND";
  sender?: string;
  recipientPhone: string;
  messageType: string; // TEXT, TEMPLATE, IMAGE, VIDEO, PDF, INVOICE, etc.
  content: string;
  templateName?: string;
  status: "PENDING" | "SENT" | "DELIVERED" | "READ" | "FAILED";
  errorMessage?: string;
  replyToId?: string;
  assignedUserId?: string;
  scheduledAt?: Date;
  metadata?: any;
  links?: WhatsAppMessageLinks;
  createdAt?: Date;
}

export interface WhatsAppIntegrationConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  webhookSecret?: string;
  isConnected: boolean;
  apiVersion?: string;
  lastSync?: Date;
  lastError?: string;
  rateLimitTier?: string;
}

export interface ShootReminderPolicyConfig {
  enabled: boolean;
  timingHoursBefore: number;
}
