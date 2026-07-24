import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import FinanceReportsGenerator from "@/components/finance/finance-reports-generator";

export const dynamic = "force-dynamic";

export default function FinanceReportsPage() {
  return (
    <div className="flex flex-col gap-6 pb-8 h-full">
      <PageHeader 
        title="Financial Reports"
        subtitle="Generate Profit & Loss statements"
      />
      <div className="flex-1 overflow-hidden">
        <FinanceReportsGenerator />
      </div>
    </div>
  );
}
