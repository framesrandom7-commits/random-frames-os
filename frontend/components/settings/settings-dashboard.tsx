"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BusinessTab from "./tabs/business-tab";
import BrandingTab from "./tabs/branding-tab";
import UsersTab from "./tabs/users-tab";
import InvoiceTab from "./tabs/invoice-tab";
import PaymentTab from "./tabs/payment-tab";
import NotificationsTab from "./tabs/notifications-tab";
import CalendarTab from "./tabs/calendar-tab";
import BackupTab from "./tabs/backup-tab";
import IntegrationsTab from "./tabs/integrations-tab";
import SecurityTab from "./tabs/security-tab";

interface SettingsDashboardProps {
  initialSettings: Record<string, any>;
  initialUsers: any[];
}

export default function SettingsDashboard({ initialSettings, initialUsers }: SettingsDashboardProps) {
  return (
    <div className="w-full h-full flex flex-col md:flex-row gap-6">
      <Tabs defaultValue="business" className="flex flex-col md:flex-row w-full gap-6" orientation="vertical">
        <TabsList className="flex flex-row md:flex-col h-auto w-full md:w-64 bg-white/5 border border-white/10 p-2 justify-start items-stretch gap-1 overflow-x-auto">
          <TabsTrigger value="business" className="justify-start data-[state=active]:bg-[#C1121F] data-[state=active]:text-white text-zinc-400">Business</TabsTrigger>
          <TabsTrigger value="branding" className="justify-start data-[state=active]:bg-[#C1121F] data-[state=active]:text-white text-zinc-400">Branding</TabsTrigger>
          <TabsTrigger value="users" className="justify-start data-[state=active]:bg-[#C1121F] data-[state=active]:text-white text-zinc-400">Users & Roles</TabsTrigger>
          <TabsTrigger value="invoice" className="justify-start data-[state=active]:bg-[#C1121F] data-[state=active]:text-white text-zinc-400">Invoice Settings</TabsTrigger>
          <TabsTrigger value="payment" className="justify-start data-[state=active]:bg-[#C1121F] data-[state=active]:text-white text-zinc-400">Payment Methods</TabsTrigger>
          <TabsTrigger value="notifications" className="justify-start data-[state=active]:bg-[#C1121F] data-[state=active]:text-white text-zinc-400">Notifications</TabsTrigger>
          <TabsTrigger value="calendar" className="justify-start data-[state=active]:bg-[#C1121F] data-[state=active]:text-white text-zinc-400">Calendar</TabsTrigger>
          <TabsTrigger value="backup" className="justify-start data-[state=active]:bg-[#C1121F] data-[state=active]:text-white text-zinc-400">Backup & Restore</TabsTrigger>
          <TabsTrigger value="integrations" className="justify-start data-[state=active]:bg-[#C1121F] data-[state=active]:text-white text-zinc-400">Integrations</TabsTrigger>
          <TabsTrigger value="security" className="justify-start data-[state=active]:bg-[#C1121F] data-[state=active]:text-white text-zinc-400">Security</TabsTrigger>
        </TabsList>
        
        <div className="flex-1 bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-md overflow-y-auto">
          <TabsContent value="business" className="m-0 h-full"><BusinessTab settings={initialSettings} /></TabsContent>
          <TabsContent value="branding" className="m-0 h-full"><BrandingTab settings={initialSettings} /></TabsContent>
          <TabsContent value="users" className="m-0 h-full"><UsersTab users={initialUsers} /></TabsContent>
          <TabsContent value="invoice" className="m-0 h-full"><InvoiceTab settings={initialSettings} /></TabsContent>
          <TabsContent value="payment" className="m-0 h-full"><PaymentTab settings={initialSettings} /></TabsContent>
          <TabsContent value="notifications" className="m-0 h-full"><NotificationsTab settings={initialSettings} /></TabsContent>
          <TabsContent value="calendar" className="m-0 h-full"><CalendarTab settings={initialSettings} /></TabsContent>
          <TabsContent value="backup" className="m-0 h-full"><BackupTab /></TabsContent>
          <TabsContent value="integrations" className="m-0 h-full"><IntegrationsTab /></TabsContent>
          <TabsContent value="security" className="m-0 h-full"><SecurityTab /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
