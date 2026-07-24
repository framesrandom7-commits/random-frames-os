import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import ReportsDashboard from "@/components/reports/reports-dashboard";

export const dynamic = "force-dynamic";

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Reports"
        subtitle="Business performance insights"
      />
      
      <ReportsDashboard />
    </div>
  );
}
