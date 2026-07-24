import { prisma } from "@/lib/prisma";

export interface GlobalSearchResult {
  id: string;
  type: 'CLIENT' | 'LEAD' | 'PROJECT' | 'INVOICE' | 'QUOTATION' | 'PAYMENT' | 'TASK' | 'CALENDAR_EVENT' | 'COMMUNICATION' | 'DELIVERY' | 'FILE';
  title: string;
  subtitle?: string;
  description?: string;
  url: string;
  icon?: string;
  metadata?: any;
}

export class GlobalSearchService {
  /**
   * Performs a global search across all supported entities.
   */
  public static async search(query: string): Promise<GlobalSearchResult[]> {
    if (!query || query.trim().length < 2) return [];

    const searchQuery = query.trim();
    const results: GlobalSearchResult[] = [];

    // Run searches in parallel
    const [clients, leads, projects, invoices, tasks] = await Promise.all([
      // Clients
      prisma.client.findMany({
        where: {
          OR: [
            { businessName: { contains: searchQuery, mode: 'insensitive' } },
            { contactPerson: { contains: searchQuery, mode: 'insensitive' } },
            { email: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        take: 5
      }),
      // Leads
      prisma.lead.findMany({
        where: {
          OR: [
            { businessName: { contains: searchQuery, mode: 'insensitive' } },
            { contactPerson: { contains: searchQuery, mode: 'insensitive' } },
            { email: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        take: 5
      }),
      // Projects
      prisma.project.findMany({
        where: {
          OR: [
            { title: { contains: searchQuery, mode: 'insensitive' } },
            { description: { contains: searchQuery, mode: 'insensitive' } }
          ]
        },
        take: 5
      }),
      // Invoices
      prisma.invoice.findMany({
        where: {
          invoiceNumber: { contains: searchQuery, mode: 'insensitive' }
        },
        take: 5
      }),
      // Tasks
      prisma.task.findMany({
        where: {
          title: { contains: searchQuery, mode: 'insensitive' }
        },
        take: 5
      })
    ]);

    clients.forEach(c => results.push({
      id: c.id,
      type: 'CLIENT',
      title: c.businessName || c.contactPerson || 'Unknown Client',
      subtitle: c.email || undefined,
      url: `/clients/${c.id}`
    }));

    leads.forEach(l => results.push({
      id: l.id,
      type: 'LEAD',
      title: l.businessName || l.contactPerson || 'Unknown Lead',
      subtitle: l.email || undefined,
      url: `/leads/${l.id}`
    }));

    projects.forEach(p => results.push({
      id: p.id,
      type: 'PROJECT',
      title: p.title,
      description: p.description || undefined,
      url: `/projects/${p.id}`
    }));

    invoices.forEach(i => results.push({
      id: i.id,
      type: 'INVOICE',
      title: `Invoice ${i.invoiceNumber}`,
      subtitle: i.total ? `$${i.total.toString()}` : undefined,
      url: `/finance/invoices/${i.id}`
    }));

    tasks.forEach(t => results.push({
      id: t.id,
      type: 'TASK',
      title: t.title,
      subtitle: t.status,
      url: `/projects/${t.projectId || ''}?tab=tasks`
    }));

    return results;
  }
}
