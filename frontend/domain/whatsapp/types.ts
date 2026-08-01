export type WhatsAppTemplateParameter = {
  type: "text" | "currency" | "date_time" | "document" | "image" | "video";
  text?: string;
  document?: {
    link: string;
    filename?: string;
  };
  image?: {
    link: string;
  };
  video?: {
    link: string;
  };
};

export type WhatsAppTemplateComponent = {
  type: "header" | "body" | "button";
  sub_type?: "url" | "quick_reply";
  index?: string;
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
