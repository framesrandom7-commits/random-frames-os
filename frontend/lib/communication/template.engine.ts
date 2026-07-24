import { CommunicationTemplate, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { VariableResolver } from "./variable-resolver";

export class TemplateEngine {
  
  /**
   * Fetch a template by ID
   */
  public static async getTemplate(templateId: string): Promise<CommunicationTemplate | null> {
    return prisma.communicationTemplate.findUnique({
      where: { id: templateId }
    });
  }

  /**
   * Find templates by category
   */
  public static async getTemplatesByCategory(category: any): Promise<CommunicationTemplate[]> {
    return prisma.communicationTemplate.findMany({
      where: { category, isActive: true },
      orderBy: { title: 'asc' }
    });
  }

  /**
   * Render a template with dynamically injected variables based on context
   */
  public static async renderTemplate(
    templateBody: string, 
    context: {
      clientId?: string;
      projectId?: string;
      leadId?: string;
      invoiceId?: string;
      quotationId?: string;
      deliveryLink?: string;
      shootId?: string;
      eventId?: string;
    }
  ): Promise<string> {
    return VariableResolver.resolve(templateBody, context);
  }

  /**
   * Preview a template before sending
   */
  public static async previewTemplate(templateId: string, context: any): Promise<string | null> {
    const template = await this.getTemplate(templateId);
    if (!template) return null;
    return this.renderTemplate(template.body, context);
  }

  /**
   * Create or update a template, bumping version automatically
   */
  public static async saveTemplate(data: {
    id?: string;
    title: string;
    category: any;
    type: any;
    subject?: string;
    body: string;
    createdBy?: string;
  }): Promise<CommunicationTemplate> {
    if (data.id) {
      const existing = await this.getTemplate(data.id);
      return prisma.communicationTemplate.update({
        where: { id: data.id },
        data: {
          title: data.title,
          category: data.category,
          type: data.type,
          subject: data.subject,
          body: data.body,
          version: existing ? existing.version + 1 : 1
        }
      });
    }

    return prisma.communicationTemplate.create({
      data: {
        title: data.title,
        category: data.category,
        type: data.type,
        subject: data.subject,
        body: data.body,
        createdBy: data.createdBy
      }
    });
  }
}
