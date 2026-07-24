import { RevenueAnalyticsService } from "./revenue.service";
import { SalesAnalyticsService } from "./sales.service";
import { ProjectAnalyticsService } from "./project.service";

export class DashboardService {
  /**
   * Get the Executive Dashboard KPIs
   */
  public static async getExecutiveDashboardData(startDate?: Date, endDate?: Date) {
    const [finance, sales, projects] = await Promise.all([
      RevenueAnalyticsService.getFinancialOverview(startDate, endDate),
      SalesAnalyticsService.getConversionFunnel(startDate, endDate),
      ProjectAnalyticsService.getProjectMetrics(startDate, endDate)
    ]);

    const revenueTrends = await RevenueAnalyticsService.getRevenueTrends(startDate?.getFullYear() || new Date().getFullYear());

    return {
      kpis: {
        revenue: finance.totalRevenue,
        profit: finance.profit,
        outstandingPayments: finance.outstandingPayments,
        conversionRate: sales.conversionRate,
        projectsCompleted: projects.completedProjects,
        projectsActive: projects.activeProjects,
      },
      charts: {
        revenueTrends,
        conversionFunnel: sales.funnel,
        projectStatus: projects.statusDistribution
      }
    };
  }
}
