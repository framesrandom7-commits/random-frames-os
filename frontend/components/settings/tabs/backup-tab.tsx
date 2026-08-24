"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { exportDatabaseBackup } from "@/app/actions/settings";
import { Download, Upload, ShieldAlert, Database, AlertTriangle, Trash2 } from "lucide-react";
import { executeDataDeletion, sendOtpForPinReset, verifyOtpAndSetPin, getCurrentUserSession } from "@/app/actions/security";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function BackupTab() {
  const [isExporting, setIsExporting] = useState(false);

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
  const [modalMessage, setModalMessage] = useState<{type: "success" | "error", text: string} | null>(null);

  useEffect(() => {
    const checkRole = async () => {
      try {
        const result = await getCurrentUserSession();
        if (result.success && result.user?.role?.toUpperCase() === "FOUNDER") {
          setIsFounder(true);
          setUserEmail(result.user.email || "");
        }
      } catch (e) {
        console.error(e);
      }
    };
    checkRole();
  }, []);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const backupData = await exportDatabaseBackup();
      const jsonString = JSON.stringify(backupData, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement("a");
      a.href = url;
      a.download = `RandomFramesOS_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success("Database exported successfully");
    } catch (e) {
      toast.error("Failed to export database");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    toast.error("Import functionality requires backend restoration which is not available in V1.0");
  };

  const handleOpenDeleteModal = () => {
    if (!deleteTarget) {
      toast.error("Please select what data you want to delete.");
      return;
    }
    setPin("");
    setOtpMode(false);
    setModalMessage(null);
    setIsDangerModalOpen(true);
  };

  const handleDeleteExecute = async () => {
    if (pin.length !== 4) {
      setModalMessage({ type: "error", text: "PIN must be 4 digits." });
      return;
    }

    setIsDeleting(true);
    setModalMessage(null);
    try {
      const result = await executeDataDeletion(deleteTarget, pin);
      if (result.success) {
        toast.success("Data successfully deleted!");
        setIsDangerModalOpen(false);
        setPin("");
        setDeleteTarget("");
      } else {
        setModalMessage({ type: "error", text: result.error || "Failed to delete data." });
      }
    } catch (e) {
      setModalMessage({ type: "error", text: "An error occurred during deletion." });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRequestOtp = async () => {
    setIsSendingOtp(true);
    setModalMessage(null);
    try {
      const result = await sendOtpForPinReset(userEmail);
      if (result.success) {
        setOtpMode(true);
        if (result.warning) {
          setModalMessage({ type: "success", text: result.warning });
        } else {
          setModalMessage({ type: "success", text: `OTP sent to ${userEmail}` });
        }
      } else {
        setModalMessage({ type: "error", text: result.error || "Failed to send OTP." });
      }
    } catch (e) {
      setModalMessage({ type: "error", text: "Error requesting OTP." });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtpAndSetPin = async () => {
    if (newPin.length !== 4) {
      setModalMessage({ type: "error", text: "New PIN must be 4 digits." });
      return;
    }
    if (otp.length !== 6) {
      setModalMessage({ type: "error", text: "OTP must be 6 digits." });
      return;
    }

    setIsVerifyingOtp(true);
    setModalMessage(null);
    try {
      const result = await verifyOtpAndSetPin(userEmail, otp, newPin);
      if (result.success) {
        setModalMessage({ type: "success", text: "Security PIN successfully updated!" });
        // After 2 seconds, close OTP mode
        setTimeout(() => {
          setOtpMode(false);
          setOtp("");
          setNewPin("");
          setModalMessage(null);
        }, 2000);
      } else {
        setModalMessage({ type: "error", text: result.error || "Failed to verify OTP." });
      }
    } catch (e) {
      setModalMessage({ type: "error", text: "Error setting PIN." });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-lg font-medium text-white">Backup & Restore</h3>
        <p className="text-sm text-zinc-400">Export your data or restore from a previous backup.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="bg-white/5 border border-white/10 rounded-lg p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mb-4">
            <Download className="w-6 h-6" />
          </div>
          <h4 className="text-white font-medium text-lg mb-2">Export Database</h4>
          <p className="text-zinc-400 text-sm mb-6">
            Download a complete JSON snapshot of all your Leads, Clients, Projects, Settings, and Financial records.
          </p>
          <Button onClick={handleExport} disabled={isExporting} className="w-full bg-white/10 hover:bg-white/20 text-white">
            {isExporting ? "Exporting..." : "Download Backup"}
          </Button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-lg p-6 flex flex-col items-center text-center">
          <div className="w-12 h-12 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center mb-4">
            <Upload className="w-6 h-6" />
          </div>
          <h4 className="text-white font-medium text-lg mb-2">Restore Database</h4>
          <p className="text-zinc-400 text-sm mb-6">
            Upload a previously exported JSON backup file to restore your entire workspace.
          </p>
          <Button onClick={handleImportClick} variant="outline" className="w-full border-white/10 text-zinc-300 hover:text-white">
            Upload Backup File
          </Button>
        </div>

      </div>

      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
        <div>
          <h5 className="text-amber-500 font-medium">Important Warning</h5>
          <p className="text-amber-500/80 text-sm mt-1">
            Keep your backup files secure. They contain sensitive client and financial data. Restoring a backup will completely overwrite your current database.
          </p>
        </div>
      </div>

      {isFounder && (
        <div className="mt-8 border border-red-500/30 bg-[#111] rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <AlertTriangle className="text-red-500 w-5 h-5" />
            </div>
            <div>
              <h4 className="text-red-500 font-medium text-lg">Danger Zone</h4>
              <p className="text-zinc-400 text-sm">
                Permanently delete data from your system. This action is irreversible. Requires Founder PIN.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-end mt-6">
            <div className="flex-1 space-y-2 w-full">
              <Label className="text-zinc-400 text-xs">Select data to delete</Label>
              <Select value={deleteTarget} onValueChange={setDeleteTarget}>
                <SelectTrigger className="bg-black/50 border-white/10 text-white">
                  <SelectValue placeholder="Select Data Type..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  <SelectItem value="LEADS">Leads & Clients Only</SelectItem>
                  <SelectItem value="FINANCIALS">Financials (Quotations, Invoices, Expenses)</SelectItem>
                  <SelectItem value="PROJECTS_SHOOTS">Projects, Shoots & Deliverables</SelectItem>
                  <SelectItem value="ALL" className="text-red-500 font-bold bg-red-500/10 hover:bg-red-500/20">Delete All (Wipe Everything)</SelectItem>
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
          </div>
        </div>
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

          {modalMessage && (
            <div className={`text-sm px-3 py-2 rounded-md ${modalMessage.type === "success" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
              {modalMessage.text}
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
