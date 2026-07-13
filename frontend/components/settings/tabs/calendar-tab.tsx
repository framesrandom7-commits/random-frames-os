"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateSetting } from "@/app/actions/settings";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function CalendarTab({ settings }: { settings: Record<string, any> }) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    timeZone: settings.timeZone || "Asia/Kolkata",
    workingDays: settings.workingDays || "Monday - Saturday",
    workingHoursStart: settings.workingHoursStart || "09:00",
    workingHoursEnd: settings.workingHoursEnd || "19:00",
    defaultEventDuration: settings.defaultEventDuration || "60"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all(Object.entries(formData).map(([key, value]) => updateSetting(key, value)));
      toast.success("Calendar settings saved");
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-lg font-medium text-white">Calendar Settings</h3>
        <p className="text-sm text-zinc-400">Configure your default schedule and timezones.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Time Zone</Label>
          <Select value={formData.timeZone} onValueChange={(v) => handleSelectChange('timeZone', v)}>
            <SelectTrigger className="bg-black/50 border-white/10">
              <SelectValue placeholder="Select Timezone" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10 text-white">
              <SelectItem value="Asia/Kolkata">IST (Asia/Kolkata)</SelectItem>
              <SelectItem value="America/New_York">EST (America/New_York)</SelectItem>
              <SelectItem value="Europe/London">GMT (Europe/London)</SelectItem>
              <SelectItem value="UTC">UTC</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Working Days</Label>
          <Input name="workingDays" value={formData.workingDays} onChange={handleChange} className="bg-black/50 border-white/10" placeholder="e.g. Monday - Friday" />
        </div>

        <div className="space-y-2">
          <Label>Working Hours Start</Label>
          <Input type="time" name="workingHoursStart" value={formData.workingHoursStart} onChange={handleChange} className="bg-black/50 border-white/10" />
        </div>

        <div className="space-y-2">
          <Label>Working Hours End</Label>
          <Input type="time" name="workingHoursEnd" value={formData.workingHoursEnd} onChange={handleChange} className="bg-black/50 border-white/10" />
        </div>

        <div className="space-y-2">
          <Label>Default Event Duration (minutes)</Label>
          <Input type="number" name="defaultEventDuration" value={formData.defaultEventDuration} onChange={handleChange} className="bg-black/50 border-white/10" />
        </div>
      </div>

      <div className="pt-6 border-t border-white/10 flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="bg-[#C1121F] hover:bg-[#a00f1a] text-white">
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
