import React from "react";
import Topbar from "@/components/dashboard/topbar";
import SettingsDashboard from "@/components/settings/settings-dashboard";
import { getSettings } from "@/app/actions/settings";
import { getUsers } from "@/app/actions/user";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [settings, users] = await Promise.all([
    getSettings(),
    getUsers()
  ]);

  return (
    <>
      <Topbar title="Settings" />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#050505]">
        <div className="mb-6 flex items-center text-sm text-zinc-500">
          <span>Home</span>
          <span className="mx-2">/</span>
          <span className="text-zinc-300">Settings</span>
        </div>
        
        <SettingsDashboard initialSettings={settings} initialUsers={users} />
      </main>
    </>
  );
}
