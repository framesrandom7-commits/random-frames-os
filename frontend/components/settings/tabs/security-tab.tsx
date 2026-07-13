"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Shield, Key, History } from "lucide-react";

export default function SecurityTab() {
  const [isSaving, setIsSaving] = useState(false);

  const handlePasswordChange = () => {
    setIsSaving(true);
    setTimeout(() => {
      toast.success("Password updated successfully");
      setIsSaving(false);
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h3 className="text-lg font-medium text-white">Security</h3>
        <p className="text-sm text-zinc-400">Manage your password and active sessions.</p>
      </div>

      {/* Change Password */}
      <div className="space-y-4">
        <h4 className="text-white font-medium flex items-center gap-2">
          <Key className="w-4 h-4 text-zinc-400" /> Change Password
        </h4>
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input type="password" placeholder="••••••••" className="bg-black/50 border-white/10 max-w-md" />
          </div>
          <div className="space-y-2">
            <Label>New Password</Label>
            <Input type="password" placeholder="••••••••" className="bg-black/50 border-white/10 max-w-md" />
          </div>
          <div className="space-y-2">
            <Label>Confirm New Password</Label>
            <Input type="password" placeholder="••••••••" className="bg-black/50 border-white/10 max-w-md" />
          </div>
          <Button onClick={handlePasswordChange} disabled={isSaving} className="bg-white/10 hover:bg-white/20 text-white mt-2">
            {isSaving ? "Updating..." : "Update Password"}
          </Button>
        </div>
      </div>

      {/* Active Sessions */}
      <div className="space-y-4 pt-4">
        <h4 className="text-white font-medium flex items-center gap-2">
          <Shield className="w-4 h-4 text-zinc-400" /> Active Sessions
        </h4>
        <div className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
          
          <div className="p-4 flex items-center justify-between border-b border-white/10">
            <div>
              <p className="text-white font-medium">Mac OS • Chrome</p>
              <p className="text-xs text-zinc-400 mt-1">IP: 192.168.1.1 • Last active: Just now</p>
            </div>
            <div className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded">Current Session</div>
          </div>

          <div className="p-4 flex items-center justify-between">
            <div>
              <p className="text-white font-medium">iOS • Safari</p>
              <p className="text-xs text-zinc-400 mt-1">IP: 10.0.0.45 • Last active: 2 hours ago</p>
            </div>
            <Button variant="ghost" className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-sm h-8">
              Revoke
            </Button>
          </div>

        </div>
        <Button variant="outline" className="border-white/10 text-white w-full sm:w-auto">
          Sign out of all other sessions
        </Button>
      </div>

      {/* Login History */}
      <div className="space-y-4 pt-4">
        <h4 className="text-white font-medium flex items-center gap-2">
          <History className="w-4 h-4 text-zinc-400" /> Login History
        </h4>
        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
          <p className="text-sm text-zinc-500 italic">Login history tracking is disabled in Version 1.0.</p>
        </div>
      </div>

    </div>
  );
}
