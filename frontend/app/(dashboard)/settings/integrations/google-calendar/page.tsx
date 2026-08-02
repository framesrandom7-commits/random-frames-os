"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar as CalendarIcon, CheckCircle2, AlertCircle, RefreshCw, Unplug, Settings, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { getCalendarSettings, fetchGoogleCalendars, saveSelectedCalendar, forceSyncCalendar } from "@/app/actions/calendar-settings";

export default function GoogleCalendarSettingsPage() {
  const [status, setStatus] = useState<any>(null);
  const [calendars, setCalendars] = useState<any[]>([]);
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const loadStatus = async () => {
    setLoading(true);
    const data: any = await getCalendarSettings();
    if (data.success) {
      setStatus(data);
      if (data.calendarId) {
        setSelectedCalendarId(data.calendarId);
      }
      if (data.connected) {
        const cals: any = await fetchGoogleCalendars();
        if (cals.success && cals.calendars) {
          setCalendars(cals.calendars);
        }
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadStatus();
  }, []);

  const handleConnect = () => {
    window.location.href = "/api/auth/google";
  };

  const handleSaveCalendar = async () => {
    if (!selectedCalendarId) {
      toast.error("Please select a calendar");
      return;
    }
    
    setLoading(true);
    const res: any = await saveSelectedCalendar(selectedCalendarId);
    if (res.success) {
      toast.success("Calendar settings saved successfully!");
      loadStatus();
    } else {
      toast.error(res.error || "Failed to save settings");
    }
    setLoading(false);
  };

  const handleForceSync = async () => {
    setSyncing(true);
    const res: any = await forceSyncCalendar();
    if (res.success) {
      toast.success(`Successfully queued ${res.queuedCount} future events for synchronization!`);
    } else {
      toast.error(res.error || "Failed to trigger sync");
    }
    setSyncing(false);
  };

  if (loading && !status) {
    return <div className="p-8 text-zinc-400">Loading settings...</div>;
  }

  const isConnected = status?.connected;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <PageHeader
        title="Google Calendar Integration"
        subtitle="Synchronize CRM events automatically to Google Calendar."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#111] border-white/5 shadow-2xl">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="flex items-center gap-2 text-white">
                  <CalendarIcon className="w-5 h-5" />
                  Connection Status
                </CardTitle>
                <CardDescription className="mt-1 text-zinc-400">
                  Manage your Google Calendar OAuth connection.
                </CardDescription>
              </div>
              <Badge variant="outline" className={isConnected ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"}>
                {isConnected ? "Connected" : "Disconnected"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!isConnected ? (
              <div className="flex flex-col items-center justify-center py-8 text-center bg-black/20 rounded-lg border border-dashed border-white/10">
                <AlertCircle className="w-8 h-8 text-zinc-500 mb-3" />
                <h3 className="text-sm font-medium text-white mb-1">Not Connected</h3>
                <p className="text-xs text-zinc-500 mb-4 max-w-[250px]">
                  Connect your Google account to automatically synchronize scheduling.
                </p>
                <Button onClick={handleConnect} className="bg-white text-black hover:bg-zinc-200">
                  Connect Google Account
                </Button>
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between p-3 bg-emerald-500/5 rounded-lg border border-emerald-500/10">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-sm font-medium text-emerald-500">Authentication Active</p>
                      <p className="text-xs text-zinc-400">Tokens are securely encrypted.</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white" onClick={handleConnect}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reconnect
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {isConnected && (
          <Card className="bg-[#111] border-white/5 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Settings className="w-5 h-5" />
                Calendar Preferences
              </CardTitle>
              <CardDescription className="mt-1 text-zinc-400">
                Select which Google Calendar to synchronize CRM events into.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm text-zinc-400">Destination Calendar</label>
                <select 
                  className="bg-black border border-white/10 rounded-md p-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-white/20"
                  value={selectedCalendarId}
                  onChange={(e) => setSelectedCalendarId(e.target.value)}
                >
                  <option value="" disabled>Select a calendar...</option>
                  {calendars.map(cal => (
                    <option key={cal.id} value={cal.id}>
                      {cal.summary} {cal.primary ? '(Primary)' : ''}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-zinc-500 mt-1">
                  All scheduled Shoots, Meetings, and Deadlines will be synced here.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t border-white/5 pt-4">
              <Button variant="outline" className="border-white/10 text-white bg-transparent hover:bg-white/5 gap-2" onClick={handleForceSync} disabled={syncing || !selectedCalendarId}>
                <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                Force Full Sync
              </Button>
              <Button onClick={handleSaveCalendar} disabled={loading} className="bg-white text-black hover:bg-zinc-200">
                Save Settings
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
}
