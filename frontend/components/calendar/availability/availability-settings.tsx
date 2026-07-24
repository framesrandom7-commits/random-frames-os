"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock, Save, Plus, Trash2 } from "lucide-react";

interface AvailabilitySettingsProps {
  initialWorkingHours: any[];
  holidays: any[];
  blockedOverrides: any[];
}

const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export function AvailabilitySettings({ initialWorkingHours, holidays, blockedOverrides }: AvailabilitySettingsProps) {
  const [workingHours, setWorkingHours] = useState(
    DAYS.map((day, index) => {
      const existing = initialWorkingHours.find(h => h.dayOfWeek === index);
      return existing || { dayOfWeek: index, isActive: index !== 0 && index !== 6, startTime: "09:00", endTime: "18:00" };
    })
  );

  const handleSaveWorkingHours = async () => {
    // In a real app, send to server action
    console.log("Saving working hours", workingHours);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar pr-2 space-y-10 text-white">
      
      {/* Working Hours Section */}
      <section>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-medium">Standard Working Hours</h3>
            <p className="text-sm text-white/50">Define your default availability for scheduling and conflict detection.</p>
          </div>
          <Button onClick={handleSaveWorkingHours} className="bg-white text-black hover:bg-white/90">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <div className="space-y-4">
          {workingHours.map((wh, idx) => (
            <div key={idx} className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10">
              <div className="w-32 flex items-center gap-3">
                <Switch 
                  checked={wh.isActive} 
                  onCheckedChange={(checked) => {
                    const updated = [...workingHours];
                    updated[idx].isActive = checked;
                    setWorkingHours(updated);
                  }}
                />
                <span className={`text-sm ${wh.isActive ? 'text-white' : 'text-white/40'}`}>{DAYS[wh.dayOfWeek]}</span>
              </div>
              
              {wh.isActive ? (
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input 
                      type="time" 
                      value={wh.startTime} 
                      onChange={(e) => {
                        const updated = [...workingHours];
                        updated[idx].startTime = e.target.value;
                        setWorkingHours(updated);
                      }}
                      className="pl-10 w-32 bg-black/20 border-white/10" 
                    />
                  </div>
                  <span className="text-white/40">to</span>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input 
                      type="time" 
                      value={wh.endTime} 
                      onChange={(e) => {
                        const updated = [...workingHours];
                        updated[idx].endTime = e.target.value;
                        setWorkingHours(updated);
                      }}
                      className="pl-10 w-32 bg-black/20 border-white/10" 
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 text-sm text-white/30 italic">
                  Unavailable
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Holidays & Blocked Dates */}
      <section className="grid md:grid-cols-2 gap-8">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Holidays</h3>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" /> Add
            </Button>
          </div>
          
          <div className="space-y-3">
            {holidays.length === 0 ? (
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center text-sm text-white/50">
                No holidays configured.
              </div>
            ) : (
              holidays.map((h, i) => (
                <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10">
                  <div>
                    <p className="font-medium">{h.name}</p>
                    <p className="text-xs text-white/50">{format(new Date(h.date), 'MMMM d, yyyy')}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Blocked Overrides</h3>
            <Button variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" /> Add
            </Button>
          </div>
          
          <div className="space-y-3">
            {blockedOverrides.length === 0 ? (
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center text-sm text-white/50">
                No blocked dates configured.
              </div>
            ) : (
              blockedOverrides.map((b, i) => (
                <div key={i} className="flex justify-between items-center bg-white/5 p-3 rounded-lg border border-white/10">
                  <div>
                    <p className="font-medium">{format(new Date(b.date), 'MMMM d, yyyy')}</p>
                    <p className="text-xs text-white/50">{b.reason || "Personal Leave"}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-400 hover:text-red-300 hover:bg-red-400/10">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

    </div>
  );
}
