"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BusinessTab from "./tabs/business-tab";
import BrandingTab from "./tabs/branding-tab";
import UsersTab from "./tabs/users-tab";
import RolesTab from "./tabs/roles-tab";
import InvoiceTab from "./tabs/invoice-tab";
import PaymentTab from "./tabs/payment-tab";
import NotificationsTab from "./tabs/notifications-tab";
import CalendarTab from "./tabs/calendar-tab";
import BackupTab from "./tabs/backup-tab";
import IntegrationsTab from "./tabs/integrations-tab";
import SecurityTab from "./tabs/security-tab";
import WorkflowAutomationTab from "./tabs/workflow-automation-tab";
import FormsManagerTab from "./tabs/forms-manager-tab";

import { FEATURES } from "@/lib/features";
import { RbacDomainService } from "@/domain/rbac/service";
import { SettingsTabId } from "@/domain/rbac/types";

interface SettingsDashboardProps {
  initialSettings: any;
  initialUsers: any[];
  initialRoles: any[];
  integrationSettings?: any;
  initialCustomFields?: any[];
  userRoleName?: string | null;
}

export default function SettingsDashboard({
  initialSettings,
  initialUsers,
  initialRoles,
  integrationSettings,
  initialCustomFields = [],
  userRoleName,
}: SettingsDashboardProps) {
  const canAccess = (tab: string) => RbacDomainService.canAccessSettingsTab(userRoleName, tab);
  const defaultTab = canAccess(SettingsTabId.BUSINESS) ? "business" : "calendar";

  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-6">
      <Tabs defaultValue={defaultTab} className="flex flex-col md:flex-row w-full gap-6" orientation="vertical">
        <TabsList className="flex flex-row md:flex-col h-auto w-full md:w-64 bg-white/5 border border-white/10 p-2 justify-start items-stretch gap-1 overflow-x-auto">
          {canAccess(SettingsTabId.BUSINESS) && (
            <TabsTrigger value="business" className="justify-start data-[state=active]:bg-[#C1121F] data-[state=active]:text-white text-zinc-400">
              Business
            </TabsTrigger>
          )}
          {canAccess(SettingsTabId.BRANDING) && (
            <TabsTrigger value="branding" className="justify-start data-[state=active]:bg-[#C1121F] data-[state=active]:text-white text-zinc-400">
              Branding
            </TabsTrigger>
          )}

          {FEATURES.ENABLE_TEAM_MANAGEMENT && canAccess(SettingsTabId.USERS) && (
            <TabsTrigger value="users" className="justify-start data-[state=active]:bg-[#C1121F] data-[state=active]:text-white text-zinc-400">
              Team Management
            </TabsTrigger>
          )}

          {FEATURES.ENABLE_ROLE_MANAGEMENT && canAccess(SettingsTabId.ROLES) && (
            <TabsTrigger value="roles" className="justify-start data-[state=active]:bg-[#C1121F] data-[state=active]:text-white text-zinc-400">
              Roles & Permissions
            </TabsTrigger>
          )}

          {canAccess(SettingsTabId.INVOICE) && (
            <TabsTrigger value="invoice" className="justify-start data-[state=active]:bg-[#C1121F] data-[state=active]:text-white text-zinc-400">
              Invoice Settings
            </TabsTrigger>
          )}
          {canAccess(SettingsTabId.PAYMENT) && (
            <TabsTrigger value="payment" className="justify-start data-[state=active]:bg-[#C1121F] data-[state=active]:text-white text-zinc-400">
              Payment Methods
            </TabsTrigger>
          )}
          
          {canAccess(SettingsTabId.NOTIFICATIONS) && (
            <TabsTrigger value="notifications" className="justify-start data-[state=active]:bg-[#C1121F] data-[state=active]:text-white text-zinc-400">
              Notifications
            </TabsTrigger>
          )}
          
          {canAccess(SettingsTabId.CALENDAR) && (
            <TabsTrigger value="calendar" className="justify-start data-[state=active]:bg-[#C1121F] data-[state=active]:text-white text-zinc-400">
              Calendar
            </TabsTrigger>
          )}

          {canAccess(SettingsTabId.FORMS) && (
            <TabsTrigger value="forms" className="justify-start data-[state=active]:bg-[#C1121F] data-[state=active]:text-white text-zinc-400">
              Form Manager
            </TabsTrigger>
          )}

          {canAccess(SettingsTabId.BACKUP) && (
            <TabsTrigger value="backup" className="justify-start data-[state=active]:bg-[#C1121F] data-[state=active]:text-white text-zinc-400">
              Backup & Restore
            </TabsTrigger>
          )}
          {canAccess(SettingsTabId.INTEGRATIONS) && (
            <TabsTrigger value="integrations" className="justify-start data-[state=active]:bg-[#C1121F] data-[state=active]:text-white text-zinc-400">
              Integrations
            </TabsTrigger>
          )}
          {canAccess(SettingsTabId.WORKFLOW_AUTOMATION) && (
            <TabsTrigger value="workflow_automation" className="justify-start data-[state=active]:bg-[#C1121F] data-[state=active]:text-white text-zinc-400">
              Workflow Automation
            </TabsTrigger>
          )}
          {canAccess(SettingsTabId.SECURITY) && (
            <TabsTrigger value="security" className="justify-start data-[state=active]:bg-[#C1121F] data-[state=active]:text-white text-zinc-400">
              Security
            </TabsTrigger>
          )}
        </TabsList>

        <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-md overflow-y-auto">
          {canAccess(SettingsTabId.BUSINESS) && (
            <TabsContent value="business" className="m-0 h-full">
              <BusinessTab settings={initialSettings} />
            </TabsContent>
          )}
          {canAccess(SettingsTabId.BRANDING) && (
            <TabsContent value="branding" className="m-0 h-full">
              <BrandingTab settings={initialSettings} />
            </TabsContent>
          )}

          {FEATURES.ENABLE_TEAM_MANAGEMENT && canAccess(SettingsTabId.USERS) && (
            <TabsContent value="users" className="m-0 h-full">
              <UsersTab users={initialUsers} roles={initialRoles} />
            </TabsContent>
          )}

          {FEATURES.ENABLE_ROLE_MANAGEMENT && canAccess(SettingsTabId.ROLES) && (
            <TabsContent value="roles" className="m-0 h-full">
              <RolesTab roles={initialRoles} />
            </TabsContent>
          )}
          
          {canAccess(SettingsTabId.INVOICE) && (
            <TabsContent value="invoice" className="m-0 h-full">
              <InvoiceTab settings={initialSettings} />
            </TabsContent>
          )}
          
          {canAccess(SettingsTabId.PAYMENT) && (
            <TabsContent value="payment" className="m-0 h-full">
              <PaymentTab settings={initialSettings} />
            </TabsContent>
          )}
          
          {canAccess(SettingsTabId.NOTIFICATIONS) && (
            <TabsContent value="notifications" className="m-0 h-full">
              <NotificationsTab settings={initialSettings} />
            </TabsContent>
          )}
          
          {canAccess(SettingsTabId.CALENDAR) && (
            <TabsContent value="calendar" className="m-0 h-full">
              <CalendarTab settings={initialSettings} />
            </TabsContent>
          )}

          {canAccess(SettingsTabId.FORMS) && (
            <TabsContent value="forms" className="m-0 h-full">
              <FormsManagerTab initialFields={initialCustomFields} />
            </TabsContent>
          )}

          {canAccess(SettingsTabId.BACKUP) && (
            <TabsContent value="backup" className="m-0 h-full">
              <BackupTab />
            </TabsContent>
          )}
          {canAccess(SettingsTabId.INTEGRATIONS) && (
            <TabsContent value="integrations" className="m-0 h-full">
              <IntegrationsTab />
            </TabsContent>
          )}
          {canAccess(SettingsTabId.WORKFLOW_AUTOMATION) && (
            <TabsContent value="workflow_automation" className="m-0 h-full">
              <WorkflowAutomationTab />
            </TabsContent>
          )}
          {canAccess(SettingsTabId.SECURITY) && (
            <TabsContent value="security" className="m-0 h-full">
              <SecurityTab />
            </TabsContent>
          )}
        </div>
      </Tabs>
    </div>
  );
}
