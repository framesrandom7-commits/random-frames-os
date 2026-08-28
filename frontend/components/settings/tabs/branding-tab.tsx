"use client";

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updateSetting } from "@/app/actions/settings";
import { UploadCloud } from "lucide-react";

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
            <p className="text-xs text-zinc-400 pointer-events-none">{hint}</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function BrandingTab({ settings }: { settings: Record<string, any> }) {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    primaryColor: settings.primaryColor || "#C1121F",
    secondaryColor: settings.secondaryColor || "#050505",
    accentColor: settings.accentColor || "#FFFFFF",
    mainLogo: settings.mainLogo || "",
    favicon: settings.favicon || "",
    invoiceLogo: settings.invoiceLogo || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageChange = (key: string, base64: string) => {
    setFormData(prev => ({ ...prev, [key]: base64 }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all(Object.entries(formData).map(([key, value]) => updateSetting(key, value)));
      toast.success("Branding settings saved successfully");
    } catch (e) {
      toast.error("Failed to save branding");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h3 className="text-lg font-medium text-white">Branding</h3>
        <p className="text-sm text-zinc-400">Manage your visual identity, logos, and theme colors.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ImageUploadField 
          label="Main Logo" 
          hint="Click to upload or drag and drop" 
          value={formData.mainLogo} 
          onChange={(val) => handleImageChange('mainLogo', val)} 
        />
        <ImageUploadField 
          label="Favicon" 
          hint="PNG or ICO, 32x32px" 
          value={formData.favicon} 
          onChange={(val) => handleImageChange('favicon', val)} 
        />
        <ImageUploadField 
          label="Invoice Logo" 
          hint="Dark version recommended" 
          value={formData.invoiceLogo} 
          onChange={(val) => handleImageChange('invoiceLogo', val)} 
        />
      </div>

      <div className="space-y-6 pt-4">
        <h4 className="text-md font-medium text-white">Theme Colors</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Primary Color</Label>
            <div className="flex gap-2">
              <Input type="color" name="primaryColor" value={formData.primaryColor} onChange={handleChange} className="w-12 p-1 bg-black/50 border-white/10 h-10 cursor-pointer" />
              <Input value={formData.primaryColor} onChange={handleChange} name="primaryColor" className="bg-black/50 border-white/10 flex-1 uppercase" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Secondary Color</Label>
            <div className="flex gap-2">
              <Input type="color" name="secondaryColor" value={formData.secondaryColor} onChange={handleChange} className="w-12 p-1 bg-black/50 border-white/10 h-10 cursor-pointer" />
              <Input value={formData.secondaryColor} onChange={handleChange} name="secondaryColor" className="bg-black/50 border-white/10 flex-1 uppercase" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Accent Color</Label>
            <div className="flex gap-2">
              <Input type="color" name="accentColor" value={formData.accentColor} onChange={handleChange} className="w-12 p-1 bg-black/50 border-white/10 h-10 cursor-pointer" />
              <Input value={formData.accentColor} onChange={handleChange} name="accentColor" className="bg-black/50 border-white/10 flex-1 uppercase" />
            </div>
          </div>
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
