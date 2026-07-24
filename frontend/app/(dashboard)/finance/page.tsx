import React from "react";
import { getFinanceDashboardStats } from "@/app/actions/finance";
import FinanceDashboard from "@/components/finance/finance-dashboard";
import { PageHeader } from "@/components/layout/page-header";

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
    <div className="flex flex-col gap-6 pb-8">
      <PageHeader 
        title="Finance"
        subtitle="Manage invoices, payments, and expenses"
      />
      <FinanceDashboard stats={stats} />
    </div>
  );
}
