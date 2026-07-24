import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { AvailabilityService } from "@/lib/scheduling/availability.service";
import { AvailabilitySettings } from "@/components/calendar/availability/availability-settings";

export const dynamic = "force-dynamic";

export default async function AvailabilityPage() {
  const workingHours = await AvailabilityService.getWorkingHours();
  const blockedDates = await AvailabilityService.getBlockedDates(new Date(), new Date(new Date().setFullYear(new Date().getFullYear() + 1)));

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] gap-6">
      <PageHeader 
        title="Availability & Scheduling"
        subtitle="Configure your working hours, holidays, and blocked dates"
      />
      
      <div className="flex-1 overflow-hidden flex flex-col bg-white/5 border border-white/10 rounded-xl backdrop-blur-md p-6">
        <AvailabilitySettings 
          initialWorkingHours={workingHours}
          holidays={blockedDates.holidays}
          blockedOverrides={blockedDates.blockedOverrides}
        />
      </div>
    </div>
  );
}
