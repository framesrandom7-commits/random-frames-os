import React from "react";
import { SettingsPageLayout } from "@/components/settings/settings-page-layout";
import WorkflowAutomationTab from "@/components/settings/tabs/workflow-automation-tab";

export const dynamic = "force-dynamic";

export default async function WorkflowSettingsPage() {

  return (
    <SettingsPageLayout title="Workflow Automation">
      <WorkflowAutomationTab />
    </SettingsPageLayout>
  );
}
