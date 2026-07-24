import { prisma } from "@/lib/prisma";
import { Logger } from "@/lib/logger";

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
        userId: data.userId,
        actionUrl: data.actionUrl,
      }
    });
  }
}

export class EmailNotificationProvider implements NotificationProvider {
  async dispatch(data: CreateNotificationDto): Promise<void> {
    // In a real implementation, we would use EmailService here
    Logger.info(`[EmailNotificationProvider] Sending email: ${data.title}`);
  }
}

export class WhatsAppNotificationProvider implements NotificationProvider {
  async dispatch(data: CreateNotificationDto): Promise<void> {
    // In a real implementation, we would use WhatsAppService / WhatsAppShareLinkProvider here
    Logger.info(`[WhatsAppNotificationProvider] Generating WhatsApp template: ${data.title}`);
  }
}

export class NotificationEngineService {
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

      Logger.info(`[NotificationEngine] Dispatched notification: ${data.title} via ${channels.join(', ')}`);
    } catch (error) {
      Logger.error(`[NotificationEngine] Failed to dispatch notification: ${data.title}`, error);
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

export const NotificationEngine = new NotificationEngineService();
