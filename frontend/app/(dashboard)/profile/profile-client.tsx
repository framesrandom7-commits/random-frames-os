"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { User, Camera, Mail, Lock, Shield } from "lucide-react";
import { toast } from "sonner";
import { updateProfile } from "@/app/actions/user";

interface ProfileProps {
  profile: {
    name: string | null;
    email: string;
    contactEmail: string | null;
    role: { name: string } | null;
  };
}

export default function ProfileClient({ profile }: ProfileProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a local preview URL for the selected image
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
      toast.success("Image selected for upload. Remember to click Save Changes.");
    }
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    
    const formData = new FormData(e.currentTarget);
    const res = await updateProfile(formData);
    
    if (res.error) {
      toast.error(res.error);
    } else if (res.success) {
      toast.success(res.success);
    }
    
    setIsSaving(false);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  // Split name for the form if needed (the backend expects full name, but UI shows first/last)
  // For simplicity, we'll just have one "Full Name" field or recombine them on submit.
  // The original UI had first/last. Let's adapt it to use a single name field since the schema only has `name`.

  return (
    <form onSubmit={handleSave} className="flex h-full w-full flex-col p-8 overflow-y-auto">
      <PageHeader 
        title="My Profile" 
        subtitle="Manage your personal information and account security."
        action={
          <button 
            type="submit"
            disabled={isSaving}
            className="flex h-10 items-center gap-2 rounded-lg bg-[#E53935] px-4 text-sm font-bold text-white transition-all hover:bg-red-700 shadow-[0_0_20px_rgba(229,57,53,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12">
        
        {/* Left Column - Avatar & Role */}
        <div className="flex flex-col gap-6">
          <div className="rounded-xl border border-white/5 bg-[#171A21] p-6 shadow-xl flex flex-col items-center text-center">
            <div 
              className="relative group cursor-pointer mb-4"
              onClick={() => document.getElementById('avatar-upload')?.click()}
            >
              {avatarPreview ? (
                <div className="h-32 w-32 rounded-full border-4 border-[#171A21] overflow-hidden">
                  <img src={avatarPreview} alt="Avatar Preview" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="h-32 w-32 rounded-full bg-gradient-to-br from-[#E53935] to-red-800 flex items-center justify-center text-4xl font-bold text-white shadow-lg overflow-hidden border-4 border-[#171A21]">
                  {getInitials(profile.name)}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-6 w-6 text-white mb-1" />
                <span className="text-xs font-medium text-white">Upload</span>
              </div>
              <input 
                type="file" 
                id="avatar-upload" 
                className="hidden" 
                accept="image/*"
                onChange={handleImageChange}
              />
            </div>
            <h2 className="text-xl font-bold text-white">{profile.name || "User"}</h2>
            <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E53935]/10 text-[#E53935] border border-[#E53935]/20 text-xs font-medium">
              <Shield className="h-3 w-3" />
              {profile.role?.name || "Unknown Role"}
            </div>
          </div>
        </div>

        {/* Right Column - Forms */}
        <div className="md:col-span-2 flex flex-col gap-6">
          
          {/* Personal Information */}
          <div className="rounded-xl border border-white/5 bg-[#171A21] p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-[#E53935]" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-sm font-medium text-zinc-400">Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  defaultValue={profile.name || ""}
                  className="h-10 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white placeholder:text-zinc-600 focus:border-[#E53935] focus:outline-none focus:ring-1 focus:ring-[#E53935]"
                />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2 mt-4">
                <label className="text-sm font-medium text-zinc-400">Bio</label>
                <textarea 
                  rows={3}
                  placeholder="A short description about yourself..."
                  className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-white placeholder:text-zinc-600 focus:border-[#E53935] focus:outline-none focus:ring-1 focus:ring-[#E53935] resize-none"
                ></textarea>
              </div>
            </div>
          </div>

          {/* Account Settings */}
          <div className="rounded-xl border border-white/5 bg-[#171A21] p-6 shadow-xl">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <Lock className="h-5 w-5 text-[#E53935]" />
              Account Settings
            </h3>
            <div className="grid grid-cols-1 gap-6">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <Shield className="h-3.5 w-3.5" /> Login Email (System ID)
                </label>
                <input 
                  type="email" 
                  disabled
                  value={profile.email}
                  className="h-10 rounded-lg border border-white/10 bg-black/40 px-3 text-sm text-zinc-500 cursor-not-allowed"
                />
                <p className="text-xs text-zinc-500 mt-1">This is your designated login ID. It cannot be changed.</p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" /> Contact Email (Recovery & Notifications)
                </label>
                <input 
                  type="email" 
                  name="contactEmail"
                  defaultValue={profile.contactEmail || ""}
                  placeholder="you@personal.com"
                  className="h-10 rounded-lg border border-white/10 bg-black/20 px-3 text-sm text-white placeholder:text-zinc-600 focus:border-[#E53935] focus:outline-none focus:ring-1 focus:ring-[#E53935]"
                />
                <p className="text-xs text-zinc-500 mt-1">We'll use this for password resets and system notifications.</p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </form>
  );
}
