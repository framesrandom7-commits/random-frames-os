import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import SettingsDashboard from "@/components/settings/settings-dashboard";
import { getSettings } from "@/app/actions/settings";
import { getUsers, getRoles } from "@/app/actions/user";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settings, users, roles, integrationSettings] = await Promise.all([
    getSettings(),
    getUsers(),
    getRoles(),
    prisma.integrationSettings.findUnique({ where: { provider: 'GOOGLE_DRIVE' } })
  ]);

  return (
    <div className="flex flex-col gap-6">
      <PageHeader 
        title="Settings"
        subtitle="Manage your workspace"
      />
      
      <SettingsDashboard initialSettings={settings} initialUsers={users} initialRoles={roles} integrationSettings={integrationSettings} />
    </div>
  );
}
