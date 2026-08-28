import React from "react";
import { SettingsPageLayout } from "@/components/settings/settings-page-layout";
import UsersTab from "@/components/settings/tabs/users-tab";
import { getUsers, getRoles } from "@/app/actions/user";

export const dynamic = "force-dynamic";

export default async function TeamSettingsPage() {
  const [users, roles] = await Promise.all([getUsers(), getRoles()]);

  return (
    <SettingsPageLayout title="Team Management">
      <UsersTab users={users} roles={roles} />
    </SettingsPageLayout>
  );
}
