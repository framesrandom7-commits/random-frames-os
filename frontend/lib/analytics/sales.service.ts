import { prisma } from "@/lib/prisma";

export class SalesAnalyticsService {
  /**
   * Get lead conversion funnel metrics
   */
  public static async getConversionFunnel(startDate?: Date, endDate?: Date) {
    const baseWhere = {
      archivedAt: null,
      ...(startDate || endDate ? {
        createdAt: {
          ...(startDate ? { gte: startDate } : {}),
          ...(endDate ? { lte: endDate } : {}),
        }
      } : {})
    };

    const totalLeads = await prisma.lead.count({ where: baseWhere });
    
    // Group leads by status
    const leadsByStatus = await prisma.lead.groupBy({
      by: ['status'],
      _count: true,
      where: baseWhere
    });

    const statusCounts = leadsByStatus.reduce((acc, curr) => {
      acc[curr.status as string] = curr._count;
      return acc;
    }, {} as Record<string, number>);

    // Construct Funnel
    const funnel = [
      { name: "Total Leads", value: totalLeads },
      { name: "Contacted", value: (statusCounts["ATTENDED"] || 0) + (statusCounts["REQUIREMENT_DISCUSSION"] || 0) },
      { name: "Quoted", value: (statusCounts["QUOTATION_SENT"] || 0) + (statusCounts["NEGOTIATION"] || 0) },
      { name: "Converted", value: (statusCounts["CONVERTED_TO_CLIENT"] || 0) + (statusCounts["PROJECT_CREATED"] || 0) + (statusCounts["COMPLETED"] || 0) },
      { name: "Lost", value: statusCounts["CLOSED_LOST"] || 0 }
    ];

    const conversionRate = totalLeads > 0 ? (funnel[3].value / totalLeads) * 100 : 0;

    return {
      totalLeads,
      funnel,
      conversionRate: Number(conversionRate.toFixed(1))
    };
  }

  /**
   * Get leads grouped by source
   */
  public static async getLeadSources(startDate?: Date, endDate?: Date) {
    const sources = await prisma.lead.groupBy({
      by: ['leadSource'],
      _count: true,
      where: {
        archivedAt: null,
        ...(startDate || endDate ? {
          createdAt: {
            ...(startDate ? { gte: startDate } : {}),
            ...(endDate ? { lte: endDate } : {}),
          }
        } : {})
      },
      orderBy: { _count: { leadSource: 'desc' } }
    });

    return sources.map(s => ({
      name: s.leadSource?.replace(/_/g, ' ') || 'Unknown',
      value: s._count
    }));
  }
}
