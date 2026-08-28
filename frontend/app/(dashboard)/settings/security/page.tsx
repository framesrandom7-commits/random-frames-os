import React from "react";
import { SettingsPageLayout } from "@/components/settings/settings-page-layout";
import SecurityTab from "@/components/settings/tabs/security-tab";

export const dynamic = "force-dynamic";

export default async function SecuritySettingsPage() {

  return (
    <SettingsPageLayout title="Security">
      <SecurityTab />
    </SettingsPageLayout>
  );
}
