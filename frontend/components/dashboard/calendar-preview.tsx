"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";

export default function CalendarPreview() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  return (
    <Card className="border-white/10 bg-white/5 backdrop-blur-md shadow-lg h-full">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold text-white">Calendar Preview</CardTitle>
      </CardHeader>
      <CardContent className="pt-0 flex justify-center pb-4">
        <div className="rounded-md border border-white/10 bg-black/40 p-2">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            className="rounded-md pointer-events-none"
            classNames={{
              selected: "bg-[#C1121F] text-white hover:bg-[#a00f1a] hover:text-white focus:bg-[#C1121F] focus:text-white",
              today: "bg-white/10 text-white",
            }}
          />
        </div>
      </CardContent>
    </Card>
  );
}
