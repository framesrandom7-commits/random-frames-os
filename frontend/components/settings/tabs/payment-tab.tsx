"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateSetting } from "@/app/actions/settings";
import { Switch } from "@/components/ui/switch";

export default function PaymentTab({ settings }: { settings: Record<string, any> }) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    acceptCash: settings.acceptCash !== false,
    acceptUpi: settings.acceptUpi !== false,
    upiId: settings.upiId || "",
    acceptBankTransfer: settings.acceptBankTransfer !== false,
    bankDetails: settings.bankDetails || "",
    acceptCard: settings.acceptCard !== false,
    customPaymentMethod: settings.customPaymentMethod || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleToggle = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }));
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all(Object.entries(formData).map(([key, value]) => updateSetting(key, value)));
      toast.success("Payment methods saved successfully");
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-lg font-medium text-white">Payment Methods</h3>
        <p className="text-sm text-zinc-400">Configure which payment methods are accepted and shown on invoices.</p>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-lg">
          <div>
            <Label className="text-white text-base">Cash</Label>
            <p className="text-sm text-zinc-400">Accept physical cash payments</p>
          </div>
          <Switch checked={formData.acceptCash} onCheckedChange={(c) => handleToggle('acceptCash', c)} />
        </div>

        <div className="flex flex-col gap-4 p-4 bg-white/5 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-base">UPI</Label>
              <p className="text-sm text-zinc-400">Accept payments via UPI (GPay, PhonePe, etc.)</p>
            </div>
            <Switch checked={formData.acceptUpi} onCheckedChange={(c) => handleToggle('acceptUpi', c)} />
          </div>
          {formData.acceptUpi && (
            <div className="pt-2">
              <Label>Merchant UPI ID</Label>
              <Input name="upiId" value={formData.upiId} onChange={handleChange} className="bg-black/50 border-white/10 mt-2" placeholder="merchant@upi" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4 p-4 bg-white/5 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-base">Bank Transfer</Label>
              <p className="text-sm text-zinc-400">Accept wire transfers (NEFT/RTGS/IMPS)</p>
            </div>
            <Switch checked={formData.acceptBankTransfer} onCheckedChange={(c) => handleToggle('acceptBankTransfer', c)} />
          </div>
          {formData.acceptBankTransfer && (
            <div className="pt-2">
              <Label>Bank Details</Label>
              <Input name="bankDetails" value={formData.bankDetails} onChange={handleChange} className="bg-black/50 border-white/10 mt-2" placeholder="Acct No, IFSC, Bank Name" />
            </div>
          )}
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
