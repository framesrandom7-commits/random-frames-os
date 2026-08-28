import React from "react";
import { SettingsPageLayout } from "@/components/settings/settings-page-layout";
import BackupTab from "@/components/settings/tabs/backup-tab";

export const dynamic = "force-dynamic";

export default async function BackupSettingsPage() {

  return (
    <SettingsPageLayout title="Backup & Restore">
      <BackupTab />
    </SettingsPageLayout>
  );
}
