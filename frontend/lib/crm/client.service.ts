import { prisma } from "@/lib/prisma";
import { EventBus } from "@/lib/workflow/event-bus";
import { WorkflowEvent } from "@/lib/workflow/events";
import { logActivity } from "@/lib/timeline";

export class ClientService {
  /**
   * Generates a sequential client code like CL2407001
   */
  public static async generateClientCode(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    
    const count = await prisma.client.count({
      where: {
        createdAt: {
          gte: new Date(date.getFullYear(), date.getMonth(), 1),
        }
      }
    });

    const sequential = (count + 1).toString().padStart(3, '0');
    return `CL${year}${month}${sequential}`;
  }

  /**
   * Create a new client and emit events
   */
  public static async createClient(data: any, userId?: string) {
    const clientCode = await this.generateClientCode();
    
    const client = await prisma.client.create({
      data: {
        ...data,
        clientCode,
      }
    });
    
    await logActivity({
      type: "SYSTEM",
      description: `Client profile created`,
      clientId: client.id,
    });
    
    EventBus.publish(WorkflowEvent.CLIENT_CREATED, {
      clientId: client.id,
      userId: userId,
    });

    return client;
  }

  /**
   * Update an existing client
   */
  public static async updateClient(id: string, data: any) {
    return prisma.client.update({
      where: { id },
      data,
    });
  }

  /**
   * Retrieve paginated clients with optional search/filters
   */
  public static async getClients(params: {
    skip?: number;
    take?: number;
    search?: string;
  }) {
    const { skip = 0, take = 20, search } = params;
    
    const where = search ? {
      OR: [
        { businessName: { contains: search, mode: 'insensitive' as const } },
        { contactPerson: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.client.count({ where })
    ]);

    return { clients, total };
  }
}
