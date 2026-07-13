"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateSetting } from "@/app/actions/settings";
import { Textarea } from "@/components/ui/textarea";

export default function InvoiceTab({ settings }: { settings: Record<string, any> }) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    invoicePrefix: settings.invoicePrefix || "RF-",
    invoiceStartingNumber: settings.invoiceStartingNumber || "1001",
    currency: settings.currency || "INR",
    taxPercentage: settings.taxPercentage || "0",
    paymentTerms: settings.paymentTerms || "Due on Receipt",
    invoiceFooterNotes: settings.invoiceFooterNotes || "Thank you for your business. Please make payments to the account details provided."
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all(Object.entries(formData).map(([key, value]) => updateSetting(key, value)));
      toast.success("Invoice settings saved successfully");
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-lg font-medium text-white">Invoice Settings</h3>
        <p className="text-sm text-zinc-400">Configure how your PDF invoices are generated.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Invoice Prefix</Label>
          <Input name="invoicePrefix" value={formData.invoicePrefix} onChange={handleChange} className="bg-black/50 border-white/10" placeholder="e.g. INV-" />
        </div>
        <div className="space-y-2">
          <Label>Starting Invoice Number</Label>
          <Input name="invoiceStartingNumber" value={formData.invoiceStartingNumber} onChange={handleChange} type="number" className="bg-black/50 border-white/10" />
        </div>
        <div className="space-y-2">
          <Label>Default Currency</Label>
          <Input name="currency" value={formData.currency} onChange={handleChange} className="bg-black/50 border-white/10" placeholder="e.g. USD, INR" />
        </div>
        <div className="space-y-2">
          <Label>Default Tax Percentage (%)</Label>
          <Input name="taxPercentage" type="number" value={formData.taxPercentage} onChange={handleChange} className="bg-black/50 border-white/10" />
        </div>
        <div className="space-y-2">
          <Label>Payment Terms</Label>
          <Input name="paymentTerms" value={formData.paymentTerms} onChange={handleChange} className="bg-black/50 border-white/10" placeholder="e.g. Net 15, Due on Receipt" />
        </div>
        
        <div className="md:col-span-2 space-y-2">
          <Label>Footer Notes (Terms & Conditions)</Label>
          <Textarea name="invoiceFooterNotes" value={formData.invoiceFooterNotes} onChange={handleChange} className="bg-black/50 border-white/10 min-h-[100px]" />
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
