import React from "react";
import { SettingsPageLayout } from "@/components/settings/settings-page-layout";
import BrandingTab from "@/components/settings/tabs/branding-tab";
import { getSettings } from "@/app/actions/settings";

export const dynamic = "force-dynamic";

export default async function BrandingSettingsPage() {
  const settings = await getSettings();

  return (
    <SettingsPageLayout title="Branding">
      <BrandingTab settings={settings} />
    </SettingsPageLayout>
  );
}
