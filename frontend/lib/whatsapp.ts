import axios, { AxiosInstance } from "axios";

export interface MetaWhatsAppClientConfig {
  accessToken: string;
  phoneNumberId: string;
  businessAccountId: string;
  apiVersion?: string;
  baseUrl?: string;
}

export interface SendMessageResponse {
  messaging_product: "whatsapp";
  contacts: Array<{ input: string; wa_id: string }>;
  messages: Array<{ id: string; message_status?: string }>;
}

/**
 * MetaWhatsAppClient
 * PURE Meta Cloud API communication layer.
 * STRICT ARCHITECTURAL INVARIANTS:
 * - NO business logic
 * - NO Prisma or database imports
 * - NO Workflow or Notification engine coupling
 * - PURE HTTP communication with Facebook/Meta Graph API endpoints
 */
export class MetaWhatsAppClient {
  private axiosInstance: AxiosInstance;
  private phoneNumberId: string;
  private businessAccountId: string;
  private apiVersion: string;
  private baseUrl: string;

  constructor(config: MetaWhatsAppClientConfig) {
    this.phoneNumberId = config.phoneNumberId;
    this.businessAccountId = config.businessAccountId;
    this.apiVersion = config.apiVersion || "v19.0";
    this.baseUrl = config.baseUrl || "https://graph.facebook.com";

    this.axiosInstance = axios.create({
      baseURL: `${this.baseUrl}/${this.apiVersion}`,
      headers: {
        Authorization: `Bearer ${config.accessToken}`,
        "Content-Type": "application/json",
      },
      timeout: 15000,
    });
  }

  /**
   * Verifies connection health and Business Account credentials
   */
  async verifyBusinessAccount(): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/${this.businessAccountId}`, {
        params: { fields: "id,name,currency,timezone_id,message_template_namespace" }
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error?.message || error.message,
        code: error.response?.data?.error?.code || 500 
      };
    }
  }

  /**
   * Verifies Phone Number status, quality rating, and messaging limit
   */
  async verifyPhoneNumber(): Promise<any> {
    try {
      const response = await this.axiosInstance.get(`/${this.phoneNumberId}`, {
        params: { fields: "id,display_phone_number,name,quality_rating,status,messaging_limit_tier" }
      });
      return { success: true, data: response.data };
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.error?.message || error.message,
        code: error.response?.data?.error?.code || 500 
      };
    }
  }

  /**
   * Sends a structured template message with optional components (headers, body parameters, buttons)
   */
  async sendTemplate(
    recipientPhone: string,
    templateName: string,
    languageCode: string = "en",
    components: Array<any> = []
  ): Promise<{ success: boolean; messageId?: string; error?: string; raw?: any }> {
    const payload = {
      messaging_product: "whatsapp",
      to: this.formatPhone(recipientPhone),
      type: "template",
      template: {
        name: templateName,
        language: { code: languageCode },
        ...(components.length > 0 ? { components } : {}),
      },
    };

    return this.postMessage(payload);
  }

  /**
   * Sends a plain text session message (valid within 24h customer service window)
   */
  async sendTextMessage(
    recipientPhone: string,
    text: string,
    previewUrl: boolean = true,
    replyToMessageId?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string; raw?: any }> {
    const payload: any = {
      messaging_product: "whatsapp",
      to: this.formatPhone(recipientPhone),
      type: "text",
      text: { body: text, preview_url: previewUrl },
    };

    if (replyToMessageId) {
      payload.context = { message_id: replyToMessageId };
    }

    return this.postMessage(payload);
  }

  /**
   * Sends an image message via URL or uploaded Media ID
   */
  async sendImageMessage(
    recipientPhone: string,
    imageSource: { link?: string; id?: string; caption?: string }
  ): Promise<{ success: boolean; messageId?: string; error?: string; raw?: any }> {
    const payload = {
      messaging_product: "whatsapp",
      to: this.formatPhone(recipientPhone),
      type: "image",
      image: imageSource,
    };
    return this.postMessage(payload);
  }

  /**
   * Sends a video message via URL or Media ID
   */
  async sendVideoMessage(
    recipientPhone: string,
    videoSource: { link?: string; id?: string; caption?: string }
  ): Promise<{ success: boolean; messageId?: string; error?: string; raw?: any }> {
    const payload = {
      messaging_product: "whatsapp",
      to: this.formatPhone(recipientPhone),
      type: "video",
      video: videoSource,
    };
    return this.postMessage(payload);
  }

  /**
   * Sends a document or PDF message via URL or Media ID
   */
  async sendDocumentMessage(
    recipientPhone: string,
    documentSource: { link?: string; id?: string; caption?: string; filename?: string }
  ): Promise<{ success: boolean; messageId?: string; error?: string; raw?: any }> {
    const payload = {
      messaging_product: "whatsapp",
      to: this.formatPhone(recipientPhone),
      type: "document",
      document: documentSource,
    };
    return this.postMessage(payload);
  }

  /**
   * Sends a voice note or audio file
   */
  async sendAudioMessage(
    recipientPhone: string,
    audioSource: { link?: string; id?: string }
  ): Promise<{ success: boolean; messageId?: string; error?: string; raw?: any }> {
    const payload = {
      messaging_product: "whatsapp",
      to: this.formatPhone(recipientPhone),
      type: "audio",
      audio: audioSource,
    };
    return this.postMessage(payload);
  }

  /**
   * Sends location pin (latitude, longitude, name, address)
   */
  async sendLocationMessage(
    recipientPhone: string,
    location: { latitude: number; longitude: number; name?: string; address?: string }
  ): Promise<{ success: boolean; messageId?: string; error?: string; raw?: any }> {
    const payload = {
      messaging_product: "whatsapp",
      to: this.formatPhone(recipientPhone),
      type: "location",
      location,
    };
    return this.postMessage(payload);
  }

  /**
   * Sends interactive button message or quick replies
   */
  async sendInteractiveMessage(
    recipientPhone: string,
    interactivePayload: any
  ): Promise<{ success: boolean; messageId?: string; error?: string; raw?: any }> {
    const payload = {
      messaging_product: "whatsapp",
      to: this.formatPhone(recipientPhone),
      type: "interactive",
      interactive: interactivePayload,
    };
    return this.postMessage(payload);
  }

  /**
   * Sends a test message to verify pipeline functionality
   */
  async sendTestMessage(
    recipientPhone: string,
    customMessage?: string
  ): Promise<{ success: boolean; messageId?: string; error?: string; raw?: any }> {
    const text = customMessage || "Random Frames OS WhatsApp Business Cloud API Connection Verified ✅";
    return this.sendTextMessage(recipientPhone, text);
  }

  /**
   * Uploads media file to Meta Cloud storage for messaging
   */
  async uploadMedia(formData: any, contentType: string): Promise<{ success: boolean; mediaId?: string; error?: string }> {
    try {
      const response = await this.axiosInstance.post(`/${this.phoneNumberId}/media`, formData, {
        headers: {
          "Content-Type": contentType || "multipart/form-data",
        },
      });
      return { success: true, mediaId: response.data.id };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error?.message || error.message };
    }
  }

  /**
   * Retrieves URL and binary stream for an uploaded Media ID
   */
  async getMediaUrl(mediaId: string): Promise<{ success: boolean; url?: string; mimeType?: string; error?: string }> {
    try {
      const response = await this.axiosInstance.get(`/${mediaId}`);
      return { success: true, url: response.data.url, mimeType: response.data.mime_type };
    } catch (error: any) {
      return { success: false, error: error.response?.data?.error?.message || error.message };
    }
  }

  /**
   * Marks an incoming WhatsApp message as read
   */
  async markMessageAsRead(messageId: string): Promise<boolean> {
    try {
      await this.axiosInstance.post(`/${this.phoneNumberId}/messages`, {
        messaging_product: "whatsapp",
        status: "read",
        message_id: messageId,
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Pure HTTP transmission wrapper with standardized error formatting
   */
  private async postMessage(payload: any): Promise<{ success: boolean; messageId?: string; error?: string; raw?: any }> {
    try {
      const response = await this.axiosInstance.post(`/${this.phoneNumberId}/messages`, payload);
      const data: SendMessageResponse = response.data;
      const messageId = data?.messages?.[0]?.id || `wamid.mock.${Date.now()}`;
      return { success: true, messageId, raw: data };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error?.message || error.message || "Unknown Meta Cloud API Error";
      return { success: false, error: errorMessage, raw: error.response?.data };
    }
  }

  /**
   * Helper to format international phone number digits
   */
  private formatPhone(phone: string): string {
    return phone.replace(/[^0-9]/g, "");
  }

  /**
   * Helper utility to parse inbound Webhook payloads from Meta Cloud API
   */
  static parseWebhookEvent(body: any): Array<{
    type: 'MESSAGE' | 'STATUS_UPDATE';
    messageId?: string;
    sender?: string;
    timestamp?: Date;
    content?: any;
    status?: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
    recipientPhone?: string;
    raw: any;
  }> {
    const events: any[] = [];
    const entries = body?.entry || [];

    for (const entry of entries) {
      const changes = entry?.changes || [];
      for (const change of changes) {
        const value = change?.value;
        if (!value) continue;

        // Process incoming client messages
        if (value.messages && Array.isArray(value.messages)) {
          for (const msg of value.messages) {
            events.push({
              type: 'MESSAGE',
              messageId: msg.id,
              sender: msg.from,
              timestamp: new Date((parseInt(msg.timestamp) || 0) * 1000),
              content: msg,
              raw: msg,
            });
          }
        }

        // Process message delivery status updates
        if (value.statuses && Array.isArray(value.statuses)) {
          for (const status of value.statuses) {
            let statusEnum: any = 'SENT';
            if (status.status === 'delivered') statusEnum = 'DELIVERED';
            if (status.status === 'read') statusEnum = 'READ';
            if (status.status === 'failed') statusEnum = 'FAILED';

            events.push({
              type: 'STATUS_UPDATE',
              messageId: status.id,
              status: statusEnum,
              recipientPhone: status.recipient_id,
              raw: status,
            });
          }
        }
      }
    }

    return events;
  }
}
