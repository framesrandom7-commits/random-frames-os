import React from "react";
import { SettingsPageLayout } from "@/components/settings/settings-page-layout";
import FormsManagerTab from "@/components/settings/tabs/forms-manager-tab";
import { getCustomFields } from "@/app/actions/custom-fields";

export const dynamic = "force-dynamic";

export default async function FormsSettingsPage() {
  const fields = await getCustomFields();

  return (
    <SettingsPageLayout title="Form Manager">
      <FormsManagerTab initialFields={fields} />
    </SettingsPageLayout>
  );
}
