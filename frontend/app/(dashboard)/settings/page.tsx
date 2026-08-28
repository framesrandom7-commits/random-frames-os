import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import SettingsGrid from "@/components/settings/settings-grid";
import { getCurrentUserRbac } from "@/lib/core/permissions/rbac.service";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const rbac = await getCurrentUserRbac();

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Settings" 
        description="Manage your workspace preferences, integrations, and security." 
      />
      
      <SettingsGrid userRoleName={rbac?.roleName || null} />
    </div>
  );
}
