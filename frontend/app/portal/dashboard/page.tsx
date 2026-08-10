"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ClientPortalDashboard from "@/components/portal/client-portal-dashboard";

function DashboardContent() {
  const searchParams = useSearchParams();
  const clientId = searchParams?.get("clientId") || "cli_vogue_india_1";
  const onboarded = searchParams?.get("onboarded") === "true";

  return <ClientPortalDashboard initialClientId={clientId} initialOnboarded={onboarded} />;
}

export default function PortalDashboardPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400 font-sans">Loading Client Portal Dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
