export const WHATSAPP_CONSTANTS = {
  PROVIDER_ID: "WHATSAPP",
  API_VERSION: "v19.0",
  BASE_URL: "https://graph.facebook.com",
  SETTINGS_SHOOT_REMINDER_KEY: "workflow_automation_shoot_reminder",
  DEFAULT_SHOOT_REMINDER_HOURS: 24,
  MAX_RETRIES: 5,
  MEDIA_LIMITS: {
    IMAGE_MB: 5,
    VIDEO_MB: 16,
    DOCUMENT_MB: 100,
    AUDIO_MB: 16,
  },
};

export const WHATSAPP_TEMPLATES = {
  WELCOME_CLIENT: "rf_welcome_client",
  LEAD_FOLLOWUP: "rf_lead_followup",
  DISCOVERY_MEETING: "rf_discovery_meeting",
  QUOTATION_SENT: "rf_quote_sent",
  QUOTATION_APPROVED: "rf_quote_approved",
  ADVANCE_PAYMENT_RECEIVED: "rf_advance_payment_received",
  SHOOT_REMINDER: "rf_shoot_reminder",
  PROJECT_UPDATE: "rf_project_update",
  EDITING_STARTED: "rf_editing_started",
  PREVIEW_READY: "rf_preview_ready",
  REVISION_REQUEST: "rf_revision_request",
  FINAL_DELIVERY_READY: "rf_final_delivery_ready",
  FINAL_PAYMENT_PENDING: "rf_final_payment_pending",
  PAYMENT_RECEIVED: "rf_payment_received",
  THANK_YOU: "rf_thank_you",
  CUSTOM_MESSAGE: "rf_custom_message",
};

export const WHATSAPP_MESSAGE_TYPES = {
  TEXT: "TEXT",
  TEMPLATE: "TEMPLATE",
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
  DOCUMENT: "DOCUMENT",
  PDF: "PDF",
  INVOICE: "INVOICE",
  QUOTATION: "QUOTATION",
  RECEIPT: "RECEIPT",
  LOCATION: "LOCATION",
  VOICE_NOTE: "VOICE_NOTE",
  BUSINESS_CARD: "BUSINESS_CARD",
  INTERACTIVE: "INTERACTIVE",
};
