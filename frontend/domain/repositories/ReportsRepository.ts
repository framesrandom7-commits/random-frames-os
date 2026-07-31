import { prisma } from "@/lib/prisma";

export class ReportsRepository {
  static async getDashboardMetrics(createdAtFilter: any, dateFilter: any) {
    return Promise.all([
      prisma.lead.groupBy({ by: ['status'], where: createdAtFilter, _count: true }),
      prisma.project.groupBy({ by: ['status'], where: createdAtFilter, _count: true }),
      prisma.client.count({ where: createdAtFilter }),
      prisma.shoot.count({ where: dateFilter ? { date: dateFilter } : undefined }),
      prisma.lead.groupBy({ by: ['leadSource'], where: createdAtFilter, _count: true }),
      prisma.project.groupBy({ by: ['paymentStatus'], where: createdAtFilter, _count: true }),
      prisma.invoice.findMany({ where: dateFilter ? { issueDate: dateFilter } : undefined, select: { total: true, status: true, issueDate: true, payments: { select: { amount: true, paymentDate: true } } } }),
      prisma.expense.findMany({ where: dateFilter ? { date: dateFilter } : undefined, select: { amount: true, date: true } })
    ]);
  }

  static async getTopListsData(createdAtFilter: any) {
    return Promise.all([
      prisma.project.findMany({
        where: createdAtFilter,
        include: { client: true }
      }),
      prisma.project.findMany({
        where: {
          deliveryDate: { gte: new Date() },
          status: { notIn: ["COMPLETED", "DELIVERED", "CANCELLED"] }
        },
        orderBy: { deliveryDate: 'asc' },
        take: 5,
        include: { client: true }
      }),
      prisma.invoice.findMany({
        where: {
          OR: [
            { status: "OVERDUE" },
            { status: { notIn: ["PAID", "CANCELLED"] }, dueDate: { lt: new Date() } }
          ]
        },
        orderBy: { dueDate: 'asc' },
        take: 5,
        include: { client: true, project: true, payments: true }
      })
    ]);
  }

  static async getFinancialReports() {
    return prisma.financialReport.findMany({
      orderBy: { createdAt: "desc" },
      take: 10
    });
  }
}
