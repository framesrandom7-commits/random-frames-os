import { prisma } from "@/lib/prisma";
import { Logger } from "@/lib/logger";
import { QueueManager } from "./queue-manager";

export interface CreateNotificationDto {
  title: string;
  message?: string;
  type: any; // NotificationType enum from Prisma
  priority?: any; // NotificationPriority enum
  
  // Drill-down relations
  leadId?: string;
  clientId?: string;
  projectId?: string;
  shootId?: string;
  invoiceId?: string;
  userId?: string;
  
  actionUrl?: string;
  
  // Channels to dispatch on
  channels?: NotificationChannel[];
  
  // Optional payloads for specific channels
  emailPayload?: {
    to: string;
    subject: string;
    body: string;
  };
  whatsappPayload?: {
    recipientPhone: string;
    templateName: string;
    templateData: any;
  };
}

export enum NotificationChannel {
  IN_APP = "IN_APP",
  EMAIL = "EMAIL",
  WHATSAPP = "WHATSAPP",
}

export interface NotificationProvider {
  dispatch(data: CreateNotificationDto, inAppNotificationId?: string): Promise<void>;
}

export class InAppNotificationProvider implements NotificationProvider {
  async dispatch(data: CreateNotificationDto): Promise<void> {
    await prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type || 'SYSTEM',
        status: 'PENDING',
        priority: data.priority || 'MEDIUM',
        isRead: false,
        leadId: data.leadId,
        clientId: data.clientId,
        projectId: data.projectId,
        shootId: data.shootId,
        invoiceId: data.invoiceId,
        userId: data.userId === 'system' ? undefined : data.userId,
        actionUrl: data.actionUrl,
      }
    });
  }
}

export class EmailNotificationProvider implements NotificationProvider {
  async dispatch(data: CreateNotificationDto): Promise<void> {
    if (!data.emailPayload) {
      Logger.warn(`[EmailNotificationProvider] Skipping email dispatch for '${data.title}' (no emailPayload provided)`);
      return;
    }
    await QueueManager.pushJob('EMAIL', 'SEND_EMAIL', data.emailPayload);
    Logger.info(`[EmailNotificationProvider] Queued SEND_EMAIL job for: ${data.title}`);
  }
}

export class WhatsAppNotificationProvider implements NotificationProvider {
  async dispatch(data: CreateNotificationDto): Promise<void> {
    if (!data.whatsappPayload) {
      Logger.warn(`[WhatsAppNotificationProvider] Skipping WhatsApp dispatch for '${data.title}' (no whatsappPayload provided)`);
      return;
    }
    // Convert generic templateData format into WhatsApp templates via WHATSAPP queue
    await QueueManager.pushJob('WHATSAPP', 'SEND_TEMPLATE', {
      recipientPhone: data.whatsappPayload.recipientPhone,
      templateName: data.whatsappPayload.templateName,
      dynamicVariables: data.whatsappPayload.templateData
    });
    Logger.info(`[WhatsAppNotificationProvider] Queued WhatsApp SEND_TEMPLATE job for: ${data.title}`);
  }
}

export class NotificationCenterClass {
  private providers: Map<NotificationChannel, NotificationProvider>;

  constructor() {
    this.providers = new Map();
    this.providers.set(NotificationChannel.IN_APP, new InAppNotificationProvider());
    this.providers.set(NotificationChannel.EMAIL, new EmailNotificationProvider());
    this.providers.set(NotificationChannel.WHATSAPP, new WhatsAppNotificationProvider());
  }

  /**
   * Dispatch a notification across specified channels.
   */
  public async dispatch(data: CreateNotificationDto) {
    try {
      const channels = data.channels || [NotificationChannel.IN_APP];

      for (const channel of channels) {
        const provider = this.providers.get(channel);
        if (provider) {
          await provider.dispatch(data);
        }
      }

      Logger.info(`[NotificationCenter] Dispatched notification: ${data.title} via ${channels.join(', ')}`);
    } catch (error) {
      Logger.error(`[NotificationCenter] Failed to dispatch notification: ${data.title}`, error);
      throw error;
    }
  }

  /**
   * Mark an in-app notification as read.
   */
  public async markAsRead(id: string) {
    await prisma.notification.update({
      where: { id },
      data: { isRead: true, status: 'COMPLETED' }
    });
  }
}

export const NotificationCenter = new NotificationCenterClass();
