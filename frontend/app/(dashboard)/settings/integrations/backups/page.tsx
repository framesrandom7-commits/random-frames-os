"use client";

import React, { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { triggerManualBackup } from "@/app/actions/integrations";
import { executeDataDeletion, sendOtpForPinReset, verifyOtpAndSetPin, getCurrentUserSession } from "@/app/actions/security";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Database, Download, CloudUpload, Clock, AlertTriangle, Trash2, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { IntegrationsNav } from "@/components/settings/integrations-nav";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function BackupCenterPage() {
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [lastBackup, setLastBackup] = useState<{ filepath: string; size: number } | null>(null);
  
  // Danger Zone State
  const [isFounder, setIsFounder] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [deleteTarget, setDeleteTarget] = useState("");
  const [isDangerModalOpen, setIsDangerModalOpen] = useState(false);
  
  const [pin, setPin] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  
  // OTP Reset State
  const [otpMode, setOtpMode] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPin, setNewPin] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  useEffect(() => {
    // Check role from session to only show Danger Zone to Founders
    const checkRole = async () => {
      try {
        const result = await getCurrentUserSession();
        if (result.success && result.user?.role === "FOUNDER") {
          setIsFounder(true);
          setUserEmail(result.user.email || "");
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkRole();
  }, []);

  const handleBackup = async () => {
    setIsBackingUp(true);
    try {
      const response = await triggerManualBackup();
      if (response.success && response.data) {
        setLastBackup(response.data);
        toast.success("Database Backup created successfully.");
      } else {
        toast.error("Failed to generate backup.");
      }
    } catch (e) {
      toast.error("An error occurred during backup generation.");
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleOpenDeleteModal = () => {
    if (!deleteTarget) {
      toast.error("Please select what data you want to delete.");
      return;
    }
    setPin("");
    setOtpMode(false);
    setIsDangerModalOpen(true);
  };

  const handleDeleteExecute = async () => {
    if (pin.length !== 4) {
      toast.error("PIN must be 4 digits.");
      return;
    }

    setIsDeleting(true);
    try {
      const result = await executeDataDeletion(deleteTarget, pin);
      if (result.success) {
        toast.success("Data successfully deleted!");
        setIsDangerModalOpen(false);
        setPin("");
        setDeleteTarget("");
      } else {
        toast.error(result.error || "Failed to delete data.");
      }
    } catch (e) {
      toast.error("An error occurred during deletion.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRequestOtp = async () => {
    setIsSendingOtp(true);
    try {
      const result = await sendOtpForPinReset(userEmail);
      if (result.success) {
        setOtpMode(true);
        if (result.warning) {
          toast.warning(result.warning); // Log warning if email is skipped in dev mode
        } else {
          toast.success(`OTP sent to ${userEmail}`);
        }
      } else {
        toast.error(result.error || "Failed to send OTP.");
      }
    } catch (e) {
      toast.error("Error requesting OTP.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtpAndSetPin = async () => {
    if (newPin.length !== 4) {
      toast.error("New PIN must be 4 digits.");
      return;
    }
    if (otp.length !== 6) {
      toast.error("OTP must be 6 digits.");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const result = await verifyOtpAndSetPin(userEmail, otp, newPin);
      if (result.success) {
        toast.success("Security PIN successfully updated!");
        setOtpMode(false);
        setOtp("");
        setNewPin("");
      } else {
        toast.error(result.error || "Failed to verify OTP.");
      }
    } catch (e) {
      toast.error("Error setting PIN.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <IntegrationsNav />
      <PageHeader title="Backups & Data" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-[#111] border-white/10 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Database className="text-emerald-500" />
              </div>
              <div>
                <CardTitle className="text-white text-base">Manual Backup</CardTitle>
                <CardDescription className="text-zinc-400 text-sm mt-1">
                  Generate a full JSON dump of your database containing all core business models.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 border-t border-white/5 flex flex-col gap-4">
            {lastBackup ? (
              <div className="bg-white/5 rounded-lg p-4 flex items-center justify-between">
                <div>
                  <div className="text-sm text-white font-medium mb-1">Backup Ready</div>
                  <div className="text-xs text-zinc-400">Size: {(lastBackup.size / 1024).toFixed(2)} KB</div>
                </div>
                <a href={lastBackup.filepath} download>
                  <Button variant="outline" size="sm" className="border-emerald-500/50 text-emerald-500 hover:bg-emerald-500/10">
                    <Download size={14} className="mr-2" /> Download
                  </Button>
                </a>
              </div>
            ) : (
              <Button 
                onClick={handleBackup} 
                disabled={isBackingUp}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isBackingUp ? <Clock className="animate-spin mr-2" size={16} /> : <Download size={16} className="mr-2" />}
                {isBackingUp ? "Generating Backup..." : "Generate Backup Now"}
              </Button>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#111] border-white/10 shadow-md">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <CloudUpload className="text-blue-500" />
              </div>
              <div>
                <CardTitle className="text-white text-base">Restore Data</CardTitle>
                <CardDescription className="text-zinc-400 text-sm mt-1">
                  Restore your system state from a previously generated JSON backup file.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 border-t border-white/5 flex flex-col items-center justify-center text-center py-8">
            <div className="bg-white/5 border border-dashed border-white/20 rounded-xl p-8 w-full cursor-not-allowed opacity-50">
              <CloudUpload className="mx-auto h-8 w-8 text-zinc-500 mb-2" />
              <div className="text-sm font-medium text-white mb-1">Drag and drop JSON file</div>
              <div className="text-xs text-zinc-400">Restore functionality is locked in this environment.</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {isFounder && (
        <Card className="bg-[#111] border-red-500/30 shadow-md mt-4">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertTriangle className="text-red-500" />
              </div>
              <div>
                <CardTitle className="text-red-500 text-base">Danger Zone</CardTitle>
                <CardDescription className="text-zinc-400 text-sm mt-1">
                  Permanently delete data from your system. This action is irreversible. Requires Founder PIN.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4 border-t border-red-500/10 flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <Label className="text-zinc-400 text-xs">Select data to delete</Label>
              <Select value={deleteTarget} onValueChange={setDeleteTarget}>
                <SelectTrigger className="bg-black/50 border-white/10 text-white">
                  <SelectValue placeholder="Select Data Type..." />
                </SelectTrigger>
                <SelectContent side="top" className="bg-zinc-900 border-white/10 text-white">
                  <SelectItem value="LEADS">Leads</SelectItem>
                  <SelectItem value="CLIENTS">Clients</SelectItem>
                  <SelectItem value="QUOTATIONS">Quotations</SelectItem>
                  <SelectItem value="INVOICES">Invoices</SelectItem>
                  <SelectItem value="PAYMENTS">Payments</SelectItem>
                  <SelectItem value="EXPENSES">Expenses</SelectItem>
                  <SelectItem value="PROJECTS">Projects</SelectItem>
                  <SelectItem value="SHOOTS">Shoots</SelectItem>
                  <SelectItem value="DELIVERABLES">Deliverables</SelectItem>
                  <SelectItem value="ALL" className="text-red-400 font-medium">All Transactional Data (Everything)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="destructive" 
              onClick={handleOpenDeleteModal}
              className="w-full sm:w-auto"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Delete Data
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Security PIN Modal */}
      <Dialog open={isDangerModalOpen} onOpenChange={setIsDangerModalOpen}>
        <DialogContent className="bg-zinc-900 border border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" /> 
              {otpMode ? "Change Security PIN" : "Security Verification Required"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              {otpMode 
                ? "Enter the 6-digit OTP sent to your email to set a new PIN." 
                : "You are about to permanently delete data. Please enter your 4-digit Founder PIN to confirm."}
            </DialogDescription>
          </DialogHeader>

          {!otpMode ? (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="pin">4-Digit PIN</Label>
                <Input 
                  id="pin" 
                  type="password" 
                  maxLength={4} 
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\\D/g, ''))}
                  className="bg-black/50 border-white/10 text-center text-2xl tracking-widest h-14" 
                />
              </div>
              <div className="flex justify-between items-center mt-2">
                <Button 
                  variant="link" 
                  onClick={handleRequestOtp} 
                  disabled={isSendingOtp}
                  className="text-xs text-blue-400 p-0 h-auto"
                >
                  {isSendingOtp ? "Sending OTP..." : "Forgot PIN? Reset via OTP"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="otp">6-Digit OTP</Label>
                <Input 
                  id="otp" 
                  maxLength={6} 
                  placeholder="••••••"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\\D/g, ''))}
                  className="bg-black/50 border-white/10 text-center text-xl tracking-widest" 
                />
              </div>
              <div className="space-y-2 mt-2">
                <Label htmlFor="newPin">New 4-Digit PIN</Label>
                <Input 
                  id="newPin" 
                  type="password"
                  maxLength={4} 
                  placeholder="••••"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\\D/g, ''))}
                  className="bg-black/50 border-white/10 text-center text-xl tracking-widest" 
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="ghost" onClick={() => setIsDangerModalOpen(false)} className="text-zinc-400 hover:text-white sm:mt-0">
              Cancel
            </Button>
            
            {!otpMode ? (
              <Button 
                variant="destructive" 
                onClick={handleDeleteExecute}
                disabled={pin.length !== 4 || isDeleting}
              >
                {isDeleting ? "Deleting..." : "Confirm Deletion"}
              </Button>
            ) : (
              <Button 
                onClick={handleVerifyOtpAndSetPin}
                disabled={otp.length !== 6 || newPin.length !== 4 || isVerifyingOtp}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isVerifyingOtp ? "Verifying..." : "Save New PIN"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
