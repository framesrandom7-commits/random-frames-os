import React from "react";
import AppShell from "@/components/layout/app-shell";
import GreetingWidget from "./greeting-widget";
import SearchWidget from "./search-widget";
import TodaysFocusWidget from "./todays-focus-widget";
import ContinueWorkingWidget from "./continue-working-widget";
import UpcomingWidget from "./upcoming-widget";
import NotificationsWidget from "./notifications-widget";
import RecentActivityWidget from "./recent-activity-widget";

interface WorkspacePageProps {
  user: {
    firstName: string;
  };
}

export default function WorkspacePage({ user }: WorkspacePageProps) {
  return (
    <AppShell>
      <main className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar bg-[#050505]">
        <div className="max-w-6xl mx-auto space-y-10">
          
          <section className="space-y-6">
            <GreetingWidget user={user} />
            <SearchWidget />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-10">
              <TodaysFocusWidget />
              <ContinueWorkingWidget />
              <RecentActivityWidget />
            </div>
            
            <div className="space-y-10">
              <UpcomingWidget />
              <NotificationsWidget />
            </div>
          </div>
          
        </div>
      </main>
    </AppShell>
  );
}
