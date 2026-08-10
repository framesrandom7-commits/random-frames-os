"use client";

import React, { useState, useEffect } from "react";
import { Lock, FileText, Send, CheckCircle2, Loader2, UploadCloud } from "lucide-react";
import { useParams } from "next/navigation";

export default function RequirementFormPage() {
  const params = useParams();
  const token = params.token as string;
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      type: "REQUIREMENTS",
      contactPerson: formData.get("contactName"),
      email: formData.get("email"),
      businessName: formData.get("brandName"),
      message: formData.get("projectBrief"),
      deliverables: formData.get("deliverables"),
      budget: formData.get("budget"),
      shootDate: formData.get("deadline"),
      requirementToken: token,
      source: "CRM_SECURE_LINK",
      landingPage: `/requirements/${token}`,
      referrer: document.referrer || "Direct"
    };

    try {
      const res = await fetch("/api/website/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to submit requirements. Please try again or contact your producer.");
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black px-6 pt-20">
        <div className="max-w-md w-full p-8 rounded-2xl bg-neutral-900/50 border border-white/5 text-center">
          <div className="h-16 w-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Requirements Locked</h2>
          <p className="text-slate-400 mb-8">
            Your project brief has been securely transmitted to the production team. We will review the assets and upload the official Quotation to your Client Portal shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-24 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center gap-2 mb-6 text-amber-500">
          <Lock className="h-4 w-4" />
          <span className="text-sm font-bold uppercase tracking-wider">Secure CRM Link</span>
        </div>
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-5xl font-black text-white mb-6 tracking-tight">Project Requirements</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Please fill out this comprehensive brief to help our directors align with your brand's vision before pre-production begins.
          </p>
        </div>

        <div className="p-8 md:p-12 rounded-3xl bg-neutral-900/50 border border-amber-500/10 relative overflow-hidden shadow-xl shadow-amber-500/5">
          <form onSubmit={handleSubmit} className="relative z-10 space-y-10">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Brand Information */}
            <div>
              <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-500" /> Brand & Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Brand / Company Name *</label>
                  <input required name="brandName" type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Point of Contact *</label>
                  <input required name="contactName" type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Email Address *</label>
                  <input required name="email" type="email" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors" />
                </div>
              </div>
            </div>

            {/* Scope */}
            <div>
              <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-amber-500" /> Scope & Logistics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Required Deliverables *</label>
                  <input required name="deliverables" type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors" placeholder="e.g. 1x 60s Hero Video, 3x 15s Reels, 20 Stills" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Absolute Deadline</label>
                  <input name="deadline" type="date" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors [&::-webkit-calendar-picker-indicator]:invert-[1] [&::-webkit-calendar-picker-indicator]:opacity-50 cursor-pointer" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Creative Brief / Vision *</label>
                <textarea required name="projectBrief" rows={6} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors resize-none" placeholder="Describe the mood, locations, lighting style, and overall objective of this campaign." />
              </div>
            </div>

            {/* Uploads */}
            <div>
              <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-2">
                <UploadCloud className="h-5 w-5 text-amber-500" /> Reference Assets
              </h3>
              <div className="w-full border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:border-amber-500/50 transition-colors bg-black/20 cursor-pointer group">
                <UploadCloud className="h-10 w-10 text-slate-500 mx-auto mb-4 group-hover:text-amber-500 transition-colors" />
                <p className="text-slate-300 font-medium mb-2">Drag and drop moodboards, references, or brand guidelines here</p>
                <p className="text-slate-500 text-xs">PDF, JPG, PNG, or MP4 (Max 50MB per file)</p>
                {/* Note: File upload logic routes through temporary validation then to Drive. Simulating UI here. */}
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full md:w-auto px-10 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Transmitting...</> : <><Send className="h-5 w-5" /> Submit Requirements</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
