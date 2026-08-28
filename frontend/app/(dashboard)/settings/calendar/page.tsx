import React from "react";
import { SettingsPageLayout } from "@/components/settings/settings-page-layout";
import CalendarTab from "@/components/settings/tabs/calendar-tab";
import { getSettings } from "@/app/actions/settings";

export const dynamic = "force-dynamic";

export default async function CalendarSettingsPage() {
  const settings = await getSettings();

  return (
    <SettingsPageLayout title="Calendar">
      <CalendarTab settings={settings} />
    </SettingsPageLayout>
  );
}
