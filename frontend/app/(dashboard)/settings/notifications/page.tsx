import React from "react";
import { SettingsPageLayout } from "@/components/settings/settings-page-layout";
import NotificationsTab from "@/components/settings/tabs/notifications-tab";
import { getSettings } from "@/app/actions/settings";

export const dynamic = "force-dynamic";

export default async function NotificationsSettingsPage() {
  const settings = await getSettings();

  return (
    <SettingsPageLayout title="Notifications">
      <NotificationsTab settings={settings} />
    </SettingsPageLayout>
  );
}
