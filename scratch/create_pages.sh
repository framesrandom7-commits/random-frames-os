#!/bin/bash
BASE="frontend/app/(dashboard)/settings"

# Branding
cat << 'INNER_EOF' > "$BASE/branding/page.tsx"
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
INNER_EOF

# Team
cat << 'INNER_EOF' > "$BASE/team/page.tsx"
import React from "react";
import { SettingsPageLayout } from "@/components/settings/settings-page-layout";
import UsersTab from "@/components/settings/tabs/users-tab";
import { getUsers, getRoles } from "@/app/actions/user";

export const dynamic = "force-dynamic";

export default async function TeamSettingsPage() {
  const [users, roles] = await Promise.all([getUsers(), getRoles()]);

  return (
    <SettingsPageLayout title="Team Management">
      <UsersTab users={users} roles={roles} />
    </SettingsPageLayout>
  );
}
INNER_EOF

# Roles
cat << 'INNER_EOF' > "$BASE/roles/page.tsx"
import React from "react";
import { SettingsPageLayout } from "@/components/settings/settings-page-layout";
import RolesTab from "@/components/settings/tabs/roles-tab";
import { getRoles } from "@/app/actions/user";

export const dynamic = "force-dynamic";

export default async function RolesSettingsPage() {
  const roles = await getRoles();

  return (
    <SettingsPageLayout title="Roles & Permissions">
      <RolesTab roles={roles} />
    </SettingsPageLayout>
  );
}
INNER_EOF

# Invoice
cat << 'INNER_EOF' > "$BASE/invoice/page.tsx"
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
INNER_EOF

# Payment
cat << 'INNER_EOF' > "$BASE/payment/page.tsx"
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
INNER_EOF

# Notifications
cat << 'INNER_EOF' > "$BASE/notifications/page.tsx"
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
INNER_EOF

# Calendar
cat << 'INNER_EOF' > "$BASE/calendar/page.tsx"
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
INNER_EOF

# Forms
cat << 'INNER_EOF' > "$BASE/forms/page.tsx"
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
INNER_EOF

# Backup
cat << 'INNER_EOF' > "$BASE/backup/page.tsx"
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
INNER_EOF

# Workflow
cat << 'INNER_EOF' > "$BASE/workflow/page.tsx"
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
INNER_EOF

# Security
cat << 'INNER_EOF' > "$BASE/security/page.tsx"
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
INNER_EOF

