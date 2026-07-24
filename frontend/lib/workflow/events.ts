/**
 * Central Event Registry for Random Frames OS Workflow Automation Engine
 * 
 * Defines all strongly typed events that modules can publish or subscribe to.
 */

export enum WorkflowEvent {
  // CRM Events
  LEAD_CREATED = 'lead.created',
  LEAD_UPDATED = 'lead.updated',
  LEAD_CONVERTED = 'lead.converted',
  CLIENT_CREATED = 'client.created',
  CLIENT_UPDATED = 'client.updated',
  
  // Project & Shoot Events
  PROJECT_CREATED = 'project.created',
  PROJECT_UPDATED = 'project.updated',
  PROJECT_ARCHIVED = 'project.archived',
  SHOOT_SCHEDULED = 'shoot.scheduled',
  SHOOT_COMPLETED = 'shoot.completed',

  // Storage & Upload Events
  UPLOAD_STARTED = 'upload.started',
  UPLOAD_COMPLETED = 'upload.completed',
  UPLOAD_FAILED = 'upload.failed',
  FOLDER_CREATED = 'folder.created',
  STORAGE_SYNCED = 'storage.synced',
  DELIVERABLE_CREATED = 'deliverable.created',

  // Finance Events
  QUOTATION_CREATED = 'quotation.created',
  QUOTATION_APPROVED = 'quotation.approved',
  QUOTATION_REJECTED = 'quotation.rejected',
  INVOICE_CREATED = 'invoice.created',
  INVOICE_SENT = 'invoice.sent',
  INVOICE_PAID = 'invoice.paid',
  PAYMENT_RECEIVED = 'payment.received',
  PAYMENT_OVERDUE = 'payment.overdue',
  EXPENSE_LOGGED = 'expense.logged',

  // System Events
  TASK_CREATED = 'task.created',
  TASK_COMPLETED = 'task.completed',
  USER_LOGGED_IN = 'user.logged_in',
  OAUTH_CONNECTED = 'oauth.connected',
  OAUTH_DISCONNECTED = 'oauth.disconnected',
  BACKUP_COMPLETED = 'backup.completed'
}

export interface WorkflowEventPayloads {
  [WorkflowEvent.LEAD_CREATED]: { leadId: string; userId?: string };
  [WorkflowEvent.LEAD_UPDATED]: { leadId: string; updates: any; userId?: string };
  [WorkflowEvent.LEAD_CONVERTED]: { leadId: string; clientId: string; userId?: string };
  
  [WorkflowEvent.CLIENT_CREATED]: { clientId: string; userId?: string };
  [WorkflowEvent.CLIENT_UPDATED]: { clientId: string; updates: any; userId?: string };
  
  [WorkflowEvent.PROJECT_CREATED]: { projectId: string; clientId: string; userId?: string };
  [WorkflowEvent.PROJECT_UPDATED]: { projectId: string; updates: any; userId?: string };
  [WorkflowEvent.PROJECT_ARCHIVED]: { projectId: string; userId?: string };
  
  [WorkflowEvent.SHOOT_SCHEDULED]: { shootId: string; projectId: string; userId?: string };
  [WorkflowEvent.SHOOT_COMPLETED]: { shootId: string; projectId: string; userId?: string };

  [WorkflowEvent.UPLOAD_STARTED]: { fileId: string; userId?: string };
  [WorkflowEvent.UPLOAD_COMPLETED]: { fileId: string; folderId: string; url: string; userId?: string };
  [WorkflowEvent.UPLOAD_FAILED]: { fileId: string; error: string; userId?: string };
  
  [WorkflowEvent.FOLDER_CREATED]: { folderId: string; folderUrl: string; entityType: string; entityId: string; userId?: string };
  [WorkflowEvent.STORAGE_SYNCED]: { bytesUsed: number; userId?: string };
  
  [WorkflowEvent.DELIVERABLE_CREATED]: { deliverableId: string; shootId: string; userId?: string };

  [WorkflowEvent.QUOTATION_CREATED]: { quotationId: string; projectId: string; clientId: string; userId?: string };
  [WorkflowEvent.QUOTATION_APPROVED]: { quotationId: string; projectId: string; clientId: string; userId?: string };
  [WorkflowEvent.QUOTATION_REJECTED]: { quotationId: string; projectId: string; clientId: string; userId?: string };
  [WorkflowEvent.INVOICE_CREATED]: { invoiceId: string; projectId: string; clientId: string; userId?: string };
  [WorkflowEvent.INVOICE_SENT]: { invoiceId: string; projectId: string; clientId: string; userId?: string };
  [WorkflowEvent.INVOICE_PAID]: { invoiceId: string; amount: number; userId?: string };
  [WorkflowEvent.PAYMENT_RECEIVED]: { paymentId: string; invoiceId?: string; amount: number; projectId: string; clientId: string; userId?: string };
  [WorkflowEvent.PAYMENT_OVERDUE]: { invoiceId: string; userId?: string };
  [WorkflowEvent.EXPENSE_LOGGED]: { expenseId: string; amount: number; projectId: string; clientId?: string; userId?: string };

  [WorkflowEvent.TASK_CREATED]: { taskId: string; userId?: string };
  [WorkflowEvent.TASK_COMPLETED]: { taskId: string; userId?: string };
  
  [WorkflowEvent.USER_LOGGED_IN]: { userId: string };
  [WorkflowEvent.OAUTH_CONNECTED]: { provider: string; userId?: string };
  [WorkflowEvent.OAUTH_DISCONNECTED]: { provider: string; userId?: string };
  [WorkflowEvent.BACKUP_COMPLETED]: { timestamp: string };
}
