import React from "react";
import { SettingsPageLayout } from "@/components/settings/settings-page-layout";
import RolesTab from "@/components/settings/tabs/roles-tab";
import { getRoles } from "@/app/actions/user";

export const dynamic = "force-dynamic";

export default async function RolesSettingsPage() {
  const roles = await getRoles();

  return (
    <SettingsPageLayout title="Roles & Permissions">
      <RolesTab roles={roles} />
    </SettingsPageLayout>
  );
}
