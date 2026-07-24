import React, { Suspense } from "react";
import AppShell from "@/components/layout/app-shell";
import GreetingWidget from "./greeting-widget";
import TodaysFocusWidget from "./todays-focus-widget";
import ContinueWorkingWidget from "./continue-working-widget";
import UpcomingWidget from "./upcoming-widget";
import NotificationsWidget from "./notifications-widget";
import RecentActivityWidget from "./recent-activity-widget";
import { Skeleton } from "@/components/ui/skeleton";

export default function WorkspacePage({ user }: { user: { name: string, roleName: string } }) {
  return (
    <AppShell>
      <div className="space-y-10">
        <Suspense fallback={<Skeleton className="h-24 w-full rounded-2xl bg-white/5" />}>
          <GreetingWidget user={user} />
        </Suspense>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Workspace Column (Left) */}
          <div className="xl:col-span-8 space-y-10">
            <Suspense fallback={<Skeleton className="h-[200px] w-full rounded-[24px] bg-white/5" />}>
              <TodaysFocusWidget />
            </Suspense>

            <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-[24px] bg-white/5" />}>
              <ContinueWorkingWidget />
            </Suspense>

            <Suspense fallback={<Skeleton className="h-[150px] w-full rounded-[24px] bg-white/5" />}>
              <RecentActivityWidget />
            </Suspense>
          </div>

          {/* Right Sidebar Column */}
          <div className="xl:col-span-4 space-y-10 xl:-mt-8">
            <Suspense fallback={<Skeleton className="h-[400px] w-full rounded-[24px] bg-white/5" />}>
              <UpcomingWidget />
            </Suspense>
            
            <Suspense fallback={<Skeleton className="h-[300px] w-full rounded-[24px] bg-white/5" />}>
              <NotificationsWidget />
            </Suspense>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
