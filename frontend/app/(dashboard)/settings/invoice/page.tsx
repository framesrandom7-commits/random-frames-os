import React from "react";
import { SettingsPageLayout } from "@/components/settings/settings-page-layout";
import InvoiceTab from "@/components/settings/tabs/invoice-tab";
import { getSettings } from "@/app/actions/settings";

export const dynamic = "force-dynamic";

export default async function InvoiceSettingsPage() {
  const settings = await getSettings();

  return (
    <SettingsPageLayout title="Invoice Settings">
      <InvoiceTab settings={settings} />
    </SettingsPageLayout>
  );
}
