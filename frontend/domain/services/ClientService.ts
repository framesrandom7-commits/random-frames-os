import { ClientRepository, GetClientsParams } from "../repositories/ClientRepository";
import { CreateClientData, OnboardClientData } from "@/app/actions/client";
import { prisma } from "@/lib/prisma";
import { ProjectService } from "./ProjectService";

export class ClientService {
  static async getDashboardRecentClients(limit: number = 5) {
    return ClientRepository.findRecent(limit);
  }

  static async generateCode(): Promise<string> {
    const count = await prisma.client.count();
    const sequential = (count + 1).toString().padStart(3, '0');
    return `RF-C${sequential}`;
  }

  static async create(data: CreateClientData & { commercialAgreement?: any }) {
    const { commercialAgreement, ...clientData } = data;
    const clientCode = await ClientService.generateCode();
    
    const client = await prisma.$transaction(async (tx) => {
      const createdClient = await tx.client.create({
        data: {
          ...clientData,
          clientCode,
        }
      });
      
      if (commercialAgreement) {
         const date = new Date();
         const qYear = date.getFullYear().toString().slice(-2);
         const qMonth = (date.getMonth() + 1).toString().padStart(2, '0');
         
         const qCount = await tx.quotation.count({
           where: {
             createdAt: {
               gte: new Date(date.getFullYear(), date.getMonth(), 1),
             }
           }
         });
         
         const qSeq = (qCount + 1).toString().padStart(3, '0');
         const quotationNumber = `QT${qYear}${qMonth}${qSeq}`;

         await tx.quotation.create({
           data: {
             quotationNumber,
             clientId: createdClient.id,
             issueDate: commercialAgreement.quotationDate,
             validUntil: new Date(commercialAgreement.quotationDate.getTime() + 30 * 24 * 60 * 60 * 1000), // Valid for 30 days
             subtotal: commercialAgreement.agreedAmount,
             total: commercialAgreement.agreedAmount,
             status: "APPROVED",
             approvedAt: new Date(),
             approvalMethod: commercialAgreement.approvalMethod,
             notes: commercialAgreement.notes
           }
         });
      }
      return createdClient;
    });
    
    const { logActivity } = await import('@/lib/timeline');
    await logActivity({
      type: "SYSTEM",
      description: `Client profile created`,
      clientId: client.id,
    });
    
    const { EventBus } = await import("@/lib/workflow/event-bus");
    const { WorkflowEvent } = await import("@/lib/workflow/events");
    EventBus.publish(WorkflowEvent.CLIENT_CREATED, { clientId: client.id, userId: client.createdBy || undefined });

    return client;
  }

  static async update(id: string, data: Partial<CreateClientData>) {
    return ClientRepository.update(id, data);
  }

  static async updatePhone(id: string, phone: string) {
    const client = await ClientRepository.update(id, { phone });
    
    const { logActivity } = await import('@/lib/timeline');
    await logActivity({
      type: "SYSTEM",
      description: `Phone number updated to ${phone}`,
      clientId: id
    });
    
    return client;
  }

  static async softDelete(id: string) {
    return ClientRepository.softDelete(id);
  }

  static async getById(id: string) {
    const client = await ClientRepository.findById(id);
    if (!client) return null;
    return {
      ...client,
      storageUsageBytes: client.storageUsageBytes ? Number(client.storageUsageBytes) : 0,
    };
  }

  static async getMany(params: GetClientsParams) {
    const result = await ClientRepository.findMany(params);
    return {
      ...result,
      clients: result.clients.map((c: any) => ({
        ...c,
        storageUsageBytes: c.storageUsageBytes ? Number(c.storageUsageBytes) : 0,
      }))
    };
  }

  static async onboard(data: OnboardClientData) {
    const lead = await prisma.lead.findUnique({ where: { id: data.leadId } });
    if (!lead) throw new Error("Lead not found");
    if (lead.convertedToClientId) throw new Error("Lead already converted");

    const clientCode = await ClientService.generateCode();
    const projectCode = await ProjectService.generateCode();

    const result = await prisma.$transaction(async (tx: any) => {
      let combinedNotes = data.clientNotes || "";
      if (data.whatsapp) combinedNotes += `\nWhatsApp: ${data.whatsapp}`;
      if (data.gstNumber) combinedNotes += `\nGST Number: ${data.gstNumber}`;

      const newClient = await tx.client.create({
        data: {
          clientCode,
          businessName: data.businessName,
          contactPerson: data.contactPerson,
          phone: data.phone,
          email: data.email,
          instagram: data.instagram,
          website: data.website,
          address: data.address,
          notes: combinedNotes,
        }
      });

      const newProject = await tx.project.create({
        data: {
          projectCode,
          title: data.projectTitle,
          description: data.projectDescription,
          category: data.projectCategory || "ONE_TIME_SHOOT",
          priority: data.projectPriority || "MEDIUM",
          clientId: newClient.id,
          quotationAmount: 0,
          advanceAmount: 0,
          totalAmount: 0,
          balanceAmount: 0,
          paymentStatus: "PENDING",
        }
      });

      await tx.lead.update({
        where: { id: data.leadId },
        data: {
          status: "CONVERTED",
          convertedToClientId: newClient.id
        }
      });

      return { newClient, newProject };
    });

    const { logActivity } = await import('@/lib/timeline');
    await logActivity({
      type: "SYSTEM",
      description: `Client onboarded. Created project: ${data.projectTitle}`,
      clientId: result.newClient.id,
      projectId: result.newProject.id,
      leadId: data.leadId,
    });
    
    const { EventBus } = await import("@/lib/workflow/event-bus");
    const { WorkflowEvent } = await import("@/lib/workflow/events");
    EventBus.publish(WorkflowEvent.CLIENT_CREATED, { clientId: result.newClient.id, userId: result.newClient.createdBy || undefined });
    // Note: Project Drive Folders require Client Drive Folders to exist first.
    // The storage-handler handles PROJECT_CREATED, but it might fail if Client folders aren't created yet.
    // The QueueManager retries will handle this ordering dependency.
    EventBus.publish(WorkflowEvent.PROJECT_CREATED, { projectId: result.newProject.id, clientId: result.newClient.id, userId: result.newClient.createdBy || undefined });

    return result.newClient;
  }

  static async getStats() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [totalClients, newClientsThisMonth, archivedClients] = await Promise.all([
      ClientRepository.count(),
      prisma.client.count({ where: { archivedAt: null, createdAt: { gte: startOfMonth } } }),
      prisma.client.count({ where: { archivedAt: { not: null } } }),
    ]);

    return {
      totalClients,
      newClientsThisMonth,
      activeClients: totalClients, 
      inactiveClients: archivedClients
    };
  }
}
