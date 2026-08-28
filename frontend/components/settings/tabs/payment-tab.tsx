"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { updateSetting } from "@/app/actions/settings";
import { Switch } from "@/components/ui/switch";
import { Upload, UploadCloud } from "lucide-react";

function ImageUploadField({ 
  label, 
  hint, 
  value, 
  onChange 
}: { 
  label: string, 
  hint: string, 
  value: string, 
  onChange: (base64: string) => void 
}) {
  const [drag, setDrag] = useState(false);

  const handleFile = (file: File) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => onChange(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-4">
      <Label className="text-white">{label}</Label>
      <div 
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { 
          e.preventDefault(); 
          setDrag(false); 
          if(e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]); 
          }
        }}
        className={`relative border-2 border-dashed ${drag ? 'border-white bg-white/10' : 'border-white/10'} rounded-lg p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/5 transition-colors h-32 overflow-hidden group`}
      >
        <input 
          type="file" 
          accept="image/*" 
          className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full" 
          onChange={(e) => { 
            if(e.target.files && e.target.files.length > 0) {
              handleFile(e.target.files[0]);
            }
          }} 
        />
        {value ? (
          <img src={value} alt={label} className="h-full w-full object-contain pointer-events-none" />
        ) : (
          <>
            <UploadCloud className="w-8 h-8 text-zinc-500 mb-2 group-hover:text-zinc-300 transition-colors pointer-events-none" />
            <span className="text-xs text-zinc-400 pointer-events-none">{hint}</span>
          </>
        )}
      </div>
    </div>
  );
}

export default function PaymentTab({ settings }: { settings: Record<string, any> }) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    acceptUpi: settings.acceptUpi !== false,
    PAYMENT_UPI_ID: settings.PAYMENT_UPI_ID || "",
    PAYMENT_UPI_QR_URL: settings.PAYMENT_UPI_QR_URL || "",
    PAYMENT_INSTRUCTIONS: settings.PAYMENT_INSTRUCTIONS || "",
    
    acceptBankTransfer: settings.acceptBankTransfer !== false,
    PAYMENT_BANK_HOLDER: settings.PAYMENT_BANK_HOLDER || "",
    PAYMENT_BANK_NAME: settings.PAYMENT_BANK_NAME || "",
    PAYMENT_BANK_ACCOUNT: settings.PAYMENT_BANK_ACCOUNT || "",
    PAYMENT_BANK_IFSC: settings.PAYMENT_BANK_IFSC || "",
    PAYMENT_BANK_BRANCH: settings.PAYMENT_BANK_BRANCH || "",
    
    acceptCash: settings.acceptCash !== false,
    acceptCheque: settings.acceptCheque !== false,
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
      toast.success("Payment configuration saved successfully");
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <div>
        <h3 className="text-lg font-medium text-white">Manual Payment Settings</h3>
        <p className="text-sm text-zinc-400">Configure offline payment methods that will be displayed on your invoices.</p>
      </div>

      <div className="space-y-6">
        
        {/* UPI Configuration */}
        <div className="flex flex-col gap-4 p-5 bg-white/5 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-base">UPI Payments</Label>
              <p className="text-sm text-zinc-400">Accept payments via GPay, PhonePe, Paytm, etc.</p>
            </div>
            <Switch checked={formData.acceptUpi} onCheckedChange={(c) => handleToggle('acceptUpi', c)} />
          </div>
          {formData.acceptUpi && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5 mt-2">
              <div className="col-span-2 md:col-span-1">
                <Label>Merchant UPI ID</Label>
                <Input name="PAYMENT_UPI_ID" value={formData.PAYMENT_UPI_ID} onChange={handleChange} className="bg-black/50 border-white/10 mt-2" placeholder="merchant@upi" />
              </div>
              <div className="col-span-2 md:col-span-1">
                <ImageUploadField 
                  label="QR Code Image" 
                  hint="Drag & drop or click to upload QR Code" 
                  value={formData.PAYMENT_UPI_QR_URL} 
                  onChange={(val) => setFormData(prev => ({ ...prev, PAYMENT_UPI_QR_URL: val }))} 
                />
              </div>
              <div className="col-span-2">
                <Label>Payment Instructions (Optional)</Label>
                <Textarea name="PAYMENT_INSTRUCTIONS" value={formData.PAYMENT_INSTRUCTIONS} onChange={handleChange} className="bg-black/50 border-white/10 mt-2 min-h-[80px]" placeholder="e.g. Please share screenshot on WhatsApp after payment." />
              </div>
            </div>
          )}
        </div>

        {/* Bank Transfer Configuration */}
        <div className="flex flex-col gap-4 p-5 bg-white/5 border border-white/10 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white text-base">Bank Transfer (NEFT/RTGS/IMPS)</Label>
              <p className="text-sm text-zinc-400">Accept direct wire transfers into your bank account</p>
            </div>
            <Switch checked={formData.acceptBankTransfer} onCheckedChange={(c) => handleToggle('acceptBankTransfer', c)} />
          </div>
          {formData.acceptBankTransfer && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5 mt-2">
              <div>
                <Label>Account Holder Name</Label>
                <Input name="PAYMENT_BANK_HOLDER" value={formData.PAYMENT_BANK_HOLDER} onChange={handleChange} className="bg-black/50 border-white/10 mt-2" />
              </div>
              <div>
                <Label>Bank Name</Label>
                <Input name="PAYMENT_BANK_NAME" value={formData.PAYMENT_BANK_NAME} onChange={handleChange} className="bg-black/50 border-white/10 mt-2" />
              </div>
              <div>
                <Label>Account Number</Label>
                <Input name="PAYMENT_BANK_ACCOUNT" value={formData.PAYMENT_BANK_ACCOUNT} onChange={handleChange} className="bg-black/50 border-white/10 mt-2" />
              </div>
              <div>
                <Label>IFSC Code</Label>
                <Input name="PAYMENT_BANK_IFSC" value={formData.PAYMENT_BANK_IFSC} onChange={handleChange} className="bg-black/50 border-white/10 mt-2" />
              </div>
              <div className="col-span-2">
                <Label>Branch Name</Label>
                <Input name="PAYMENT_BANK_BRANCH" value={formData.PAYMENT_BANK_BRANCH} onChange={handleChange} className="bg-black/50 border-white/10 mt-2" />
              </div>
            </div>
          )}
        </div>

        {/* Offline Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-lg">
            <div>
              <Label className="text-white text-base">Cash</Label>
              <p className="text-sm text-zinc-400">Accept physical cash</p>
            </div>
            <Switch checked={formData.acceptCash} onCheckedChange={(c) => handleToggle('acceptCash', c)} />
          </div>
          <div className="flex items-center justify-between p-5 bg-white/5 border border-white/10 rounded-lg">
            <div>
              <Label className="text-white text-base">Cheque</Label>
              <p className="text-sm text-zinc-400">Accept bank cheques</p>
            </div>
            <Switch checked={formData.acceptCheque} onCheckedChange={(c) => handleToggle('acceptCheque', c)} />
          </div>
        </div>

      </div>

      <div className="pt-6 border-t border-white/10 flex justify-end">
        <Button onClick={handleSave} disabled={isSaving} className="bg-[#E53935] hover:bg-[#D32F2F] text-white px-6">
          {isSaving ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
}
