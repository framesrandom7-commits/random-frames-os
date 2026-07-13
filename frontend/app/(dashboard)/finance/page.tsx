import React from "react";
import { getFinanceDashboardStats } from "@/app/actions/finance";
import FinanceDashboard from "@/components/finance/finance-dashboard";

export const dynamic = "force-dynamic";

export default async function FinancePage() {
  const stats = await getFinanceDashboardStats();

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-full text-zinc-500">
        Failed to load finance data.
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar pb-8">
      <FinanceDashboard stats={stats} />
    </div>
  );
}
