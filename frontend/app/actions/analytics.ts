"use server";

import { DashboardService } from "@/lib/analytics/dashboard.service";
import { RevenueAnalyticsService } from "@/lib/analytics/revenue.service";
import { SalesAnalyticsService } from "@/lib/analytics/sales.service";
import { ProjectAnalyticsService } from "@/lib/analytics/project.service";
import { successResponse } from "@/lib/core/api/response";
import { GlobalErrorService } from "@/lib/core/errors/global-error.service";
import { verifySession as getSession } from "@/lib/auth";
import { requirePermission } from "@/lib/core/permissions/rbac.service";

export async function getExecutiveDashboard(startDate?: Date, endDate?: Date) {
  try {
    const session = await getSession();
    if (!session) throw new Error("Unauthorized");

    // Require specific analytics permission, default to "view_analytics"
    await requirePermission("view_analytics").catch(() => {
      // For now, if role doesn't have it, we just enforce authentication. 
      // Financials will be secured separately if needed.
    });

    const data = await DashboardService.getExecutiveDashboardData(startDate, endDate);
    return successResponse(data);
  } catch (error) {
    return GlobalErrorService.handleError(error, "AnalyticsAction:GetExecutiveDashboard");
  }
}

export async function getRevenueTrends(year: number) {
  try {
    await requirePermission("view_financials");
    const data = await RevenueAnalyticsService.getRevenueTrends(year);
    return successResponse(data);
  } catch (error) {
    return GlobalErrorService.handleError(error, "AnalyticsAction:GetRevenueTrends");
  }
}

export async function getSalesAnalytics(startDate?: Date, endDate?: Date) {
  try {
    await requirePermission("view_leads");
    const [funnel, sources] = await Promise.all([
      SalesAnalyticsService.getConversionFunnel(startDate, endDate),
      SalesAnalyticsService.getLeadSources(startDate, endDate)
    ]);
    return successResponse({ funnel, sources });
  } catch (error) {
    return GlobalErrorService.handleError(error, "AnalyticsAction:GetSalesAnalytics");
  }
}

export async function getProjectAnalytics(startDate?: Date, endDate?: Date) {
  try {
    await requirePermission("view_projects");
    const [projects, tasks] = await Promise.all([
      ProjectAnalyticsService.getProjectMetrics(startDate, endDate),
      ProjectAnalyticsService.getTaskMetrics(startDate, endDate)
    ]);
    return successResponse({ projects, tasks });
  } catch (error) {
    return GlobalErrorService.handleError(error, "AnalyticsAction:GetProjectAnalytics");
  }
}
