"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateSetting } from "@/app/actions/settings";

export default function BusinessTab({ settings }: { settings: Record<string, any> }) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    businessName: settings.businessName || "Random Frames",
    ownerName: settings.ownerName || "Savan Somaiah T P",
    email: settings.businessEmail || "frames.random.7@gmail.com",
    phone: settings.businessPhone || "8073080077",
    website: settings.businessWebsite || "https://randomframesbysavan.in",
    gstNumber: settings.gstNumber || "",
    address: settings.businessAddress || "",
    city: settings.businessCity || "Bengaluru",
    state: settings.businessState || "Karnataka",
    country: settings.businessCountry || "India",
    postalCode: settings.businessPostalCode || ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all(Object.entries(formData).map(([key, value]) => updateSetting(key, value)));
      toast.success("Business settings saved successfully");
    } catch (e) {
      toast.error("Failed to save settings");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h3 className="text-lg font-medium text-white">Business Settings</h3>
        <p className="text-sm text-zinc-400">Update your company's core details and address.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>Business Name</Label>
          <Input name="businessName" value={formData.businessName} onChange={handleChange} className="bg-black/50 border-white/10" />
        </div>
        <div className="space-y-2">
          <Label>Owner Name</Label>
          <Input name="ownerName" value={formData.ownerName} onChange={handleChange} className="bg-black/50 border-white/10" />
        </div>
        <div className="space-y-2">
          <Label>Business Email</Label>
          <Input name="email" type="email" value={formData.email} onChange={handleChange} className="bg-black/50 border-white/10" />
        </div>
        <div className="space-y-2">
          <Label>Phone Number</Label>
          <Input name="phone" value={formData.phone} onChange={handleChange} className="bg-black/50 border-white/10" />
        </div>
        <div className="space-y-2">
          <Label>Website</Label>
          <Input name="website" value={formData.website} onChange={handleChange} className="bg-black/50 border-white/10" />
        </div>
        <div className="space-y-2">
          <Label>GST Number</Label>
          <Input name="gstNumber" value={formData.gstNumber} onChange={handleChange} className="bg-black/50 border-white/10" />
        </div>
        
        <div className="md:col-span-2 space-y-2 pt-4">
          <Label className="text-md text-white font-medium">Location</Label>
        </div>
        
        <div className="md:col-span-2 space-y-2">
          <Label>Street Address</Label>
          <Input name="address" value={formData.address} onChange={handleChange} className="bg-black/50 border-white/10" />
        </div>
        <div className="space-y-2">
          <Label>City</Label>
          <Input name="city" value={formData.city} onChange={handleChange} className="bg-black/50 border-white/10" />
        </div>
        <div className="space-y-2">
          <Label>State</Label>
          <Input name="state" value={formData.state} onChange={handleChange} className="bg-black/50 border-white/10" />
        </div>
        <div className="space-y-2">
          <Label>Country</Label>
          <Input name="country" value={formData.country} onChange={handleChange} className="bg-black/50 border-white/10" />
        </div>
        <div className="space-y-2">
          <Label>Postal Code</Label>
          <Input name="postalCode" value={formData.postalCode} onChange={handleChange} className="bg-black/50 border-white/10" />
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
