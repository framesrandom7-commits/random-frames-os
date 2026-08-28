import React from "react";
import { SettingsPageLayout } from "@/components/settings/settings-page-layout";
import PaymentTab from "@/components/settings/tabs/payment-tab";
import { getSettings } from "@/app/actions/settings";

export const dynamic = "force-dynamic";

export default async function PaymentSettingsPage() {
  const settings = await getSettings();

  return (
    <SettingsPageLayout title="Payment Methods">
      <PaymentTab settings={settings} />
    </SettingsPageLayout>
  );
}
