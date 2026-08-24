"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Clock, CheckCircle2, ShieldAlert, Save, Zap } from "lucide-react";
import { toast } from "sonner";
import { getWhatsAppSettings, saveShootReminderPolicy } from "@/app/actions/whatsapp-settings";

export default function WorkflowAutomationTab() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [enabled, setEnabled] = useState(true);
  const [timingHoursBefore, setTimingHoursBefore] = useState(24);

  const loadPolicy = async () => {
    setLoading(true);
    const res: any = await getWhatsAppSettings();
    if (res.success && res.shootReminderPolicy) {
      setEnabled(res.shootReminderPolicy.enabled ?? true);
      setTimingHoursBefore(res.shootReminderPolicy.timingHoursBefore ?? 24);
    }
    setLoading(false);
  };

  useEffect(() => {
     
    loadPolicy();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const res: any = await saveShootReminderPolicy(enabled, Number(timingHoursBefore));
    if (res.success) {
      toast.success("Workflow automation reminder policy updated successfully!");
    } else {
      toast.error(res.error || "Failed to update reminder policy.");
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="p-8 text-zinc-400">Loading automation configurations...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-xl font-semibold text-white tracking-tight flex items-center gap-2">
          <Zap className="w-5 h-5 text-[#C1121F]" />
          Workflow Automation
        </h3>
        <p className="text-sm text-zinc-400 mt-1">
          Configure automated event lifecycle triggers, notification rules, and communication policies without modifying source code.
        </p>
      </div>

      <Card className="bg-[#111] border-white/5 shadow-2xl">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center gap-2 text-white">
                <Clock className="w-5 h-5 text-emerald-500" />
                Shoot Reminder Policy
              </CardTitle>
              <CardDescription className="mt-1 text-zinc-400">
                Random Frames OS executes an exclusive single reminder policy to prevent client spam while guaranteeing punctual arrival.
              </CardDescription>
            </div>
            <Badge variant="outline" className={enabled ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"}>
              {enabled ? "Active Policy" : "Disabled"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-black/50 border border-white/5 rounded-lg">
            <div className="space-y-0.5">
              <label className="text-sm font-medium text-white block">Enable Automatic Shoot Reminders</label>
              <p className="text-xs text-zinc-400">
                When enabled, the Job Queue automatically dispatches verified WhatsApp reminders before scheduled call times.
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          <div className="space-y-2 max-w-md">
            <label className="text-sm font-medium text-zinc-300 block">Reminder Timing Window (Hours Before Shoot)</label>
            <select
              value={timingHoursBefore}
              onChange={(e) => setTimingHoursBefore(Number(e.target.value))}
              disabled={!enabled}
              className="w-full bg-black border border-white/10 rounded-md p-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            >
              <option value={72}>72 Hours Before (3 Days)</option>
              <option value={48}>48 Hours Before (2 Days)</option>
              <option value={36}>36 Hours Before (1.5 Days)</option>
              <option value={24}>24 Hours Before (1 Day — Official Policy Default)</option>
              <option value={12}>12 Hours Before (Half Day)</option>
              <option value={6}>6 Hours Before</option>
            </select>
            <p className="text-xs text-zinc-500 mt-1">
              Note: Changing this option dynamically reschedules upcoming queue reminders without developer intervention or database schema alterations.
            </p>
          </div>

          <div className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-lg space-y-2 text-xs text-zinc-400">
            <p className="font-semibold text-zinc-300 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Automated Reminder Payload Inclusion:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-zinc-400">
              <li>Client Name, Project Name & Assigned Account Manager</li>
              <li>Confirmed Shoot Date, Start Time & Location coordinates</li>
              <li>Special Production Notes & Weather instructions</li>
              <li>Direct instant instructions: <span className="text-white italic">&ldquo;Reply immediately to reschedule&rdquo;</span></li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex justify-end border-t border-white/5 pt-4">
          <Button onClick={handleSave} disabled={saving} className="bg-[#C1121F] text-white hover:bg-red-700">
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Updating Policy..." : "Save Automation Policy"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
