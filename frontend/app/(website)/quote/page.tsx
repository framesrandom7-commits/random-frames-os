"use client";

import React, { useState } from "react";
import { Camera, Calendar, DollarSign, Send, Loader2, CheckCircle2 } from "lucide-react";

export default function QuotePage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      type: "QUOTE",
      businessName: formData.get("businessName"),
      contactPerson: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      budget: formData.get("budget"),
      shootDate: formData.get("shootDate"),
      message: formData.get("projectDetails"),
      source: "WEBSITE",
      landingPage: "/quote",
      referrer: document.referrer || "Direct"
    };

    try {
      const res = await fetch("/api/website/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to submit quote request. Please try again later.");
      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-black px-6">
        <div className="max-w-md w-full p-8 rounded-2xl bg-neutral-900/50 border border-white/5 text-center">
          <div className="h-16 w-16 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Request Received</h2>
          <p className="text-slate-400 mb-8">
            Thank you for requesting a quote. Our production team will review your project details and reach out within 24 hours.
          </p>
          <button onClick={() => window.location.href = "/"} className="px-6 py-3 rounded-full bg-white text-black font-bold hover:bg-slate-200 transition-colors w-full">
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black pt-12 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Request a Quote</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Provide details about your upcoming project and our team will prepare a custom proposal tailored to your needs.
          </p>
        </div>

        <div className="p-8 md:p-12 rounded-3xl bg-neutral-900/50 border border-white/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          
          <form onSubmit={handleSubmit} className="relative z-10 space-y-8">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Client Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Contact Name *</label>
                  <input required name="name" type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Business / Brand Name</label>
                  <input name="businessName" type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors" placeholder="ACME Corp" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Email Address *</label>
                  <input required name="email" type="email" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors" placeholder="john@example.com" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Phone Number</label>
                  <input name="phone" type="tel" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors" placeholder="+1 (555) 000-0000" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Project Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Estimated Budget Range</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <select name="budget" className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors appearance-none cursor-pointer">
                      <option value="Under $5k">Under $5,000</option>
                      <option value="$5k - $15k">$5,000 - $15,000</option>
                      <option value="$15k - $50k">$15,000 - $50,000</option>
                      <option value="$50k+">$50,000+</option>
                      <option value="Not Sure Yet">Not Sure Yet</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Target Shoot Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input name="shootDate" type="date" className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors [&::-webkit-calendar-picker-indicator]:invert-[1] [&::-webkit-calendar-picker-indicator]:opacity-50 cursor-pointer" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Project Overview *</label>
                <textarea required name="projectDetails" rows={5} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors resize-none" placeholder="Describe the scope, deliverables, and vision for your project..." />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full md:w-auto px-10 py-4 rounded-xl bg-white hover:bg-slate-200 text-black font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Submitting...</> : <><Send className="h-5 w-5" /> Request Quote</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
