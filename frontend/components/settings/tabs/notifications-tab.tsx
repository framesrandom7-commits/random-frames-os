"use client";

import React, { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateSetting } from "@/app/actions/settings";
import { Switch } from "@/components/ui/switch";

export default function NotificationsTab({ settings }: { settings: Record<string, any> }) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    emailNotifications: settings.emailNotifications !== false,
    browserNotifications: settings.browserNotifications || false,
    paymentReminders: settings.paymentReminders !== false,
    followUpReminders: settings.followUpReminders !== false,
    deliveryReminders: settings.deliveryReminders !== false,
  });

  const handleToggle = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all(Object.entries(formData).map(([key, value]) => updateSetting(key, value)));
      toast.success("Notification settings saved");
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-lg font-medium text-white">Notifications</h3>
        <p className="text-sm text-zinc-400">Control when and how you are alerted.</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
          <div>
            <Label className="text-white text-base">Email Notifications</Label>
            <p className="text-sm text-zinc-400">Receive daily summaries and critical alerts via email.</p>
          </div>
          <Switch checked={formData.emailNotifications} onCheckedChange={(c) => handleToggle('emailNotifications', c)} />
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
          <div>
            <Label className="text-white text-base">Browser Notifications</Label>
            <p className="text-sm text-zinc-400">Show push notifications in your browser when the app is open.</p>
          </div>
          <Switch checked={formData.browserNotifications} onCheckedChange={(c) => handleToggle('browserNotifications', c)} />
        </div>
        
        <h4 className="text-white font-medium pt-4">Automated Reminders</h4>

        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
          <div>
            <Label className="text-white text-base">Payment Reminders</Label>
            <p className="text-sm text-zinc-400">Alert me when invoices become overdue.</p>
          </div>
          <Switch checked={formData.paymentReminders} onCheckedChange={(c) => handleToggle('paymentReminders', c)} />
        </div>

        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
          <div>
            <Label className="text-white text-base">Lead Follow-ups</Label>
            <p className="text-sm text-zinc-400">Alert me when a lead hasn't been contacted in 3 days.</p>
          </div>
          <Switch checked={formData.followUpReminders} onCheckedChange={(c) => handleToggle('followUpReminders', c)} />
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
