"use server";

import { FinanceService } from "@/domain/services/FinanceService";
import { GlobalErrorService } from "@/lib/core/errors/global-error.service";

export async function getFinanceDashboardStats() {
  try {
    return await FinanceService.getDashboardStats();
  } catch (error) {
    console.error("Error fetching finance stats:", error);
    return GlobalErrorService.handleError(error, "Action:getFinanceDashboardStats");
  }
}
