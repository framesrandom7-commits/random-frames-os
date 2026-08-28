import React from "react";
import { SettingsPageLayout } from "@/components/settings/settings-page-layout";
import BusinessTab from "@/components/settings/tabs/business-tab";
import { getSettings } from "@/app/actions/settings";

export const dynamic = "force-dynamic";

export default async function BusinessSettingsPage() {
  const settings = await getSettings();

  return (
    <SettingsPageLayout title="Business Settings">
      <BusinessTab settings={settings} />
    </SettingsPageLayout>
  );
}
