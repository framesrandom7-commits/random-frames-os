"use client";

import React, { useState } from "react";
import { Calendar, Clock, Video, Send, Loader2, CheckCircle2 } from "lucide-react";

export default function BookShootPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      type: "BOOKING",
      businessName: formData.get("businessName"),
      contactPerson: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      shootDate: formData.get("shootDate"),
      message: `Preferred Time: ${formData.get("shootTime")}\nSession Type: ${formData.get("sessionType")}\n\nDetails: ${formData.get("details")}`,
      source: "WEBSITE",
      landingPage: "/book",
      referrer: document.referrer || "Direct"
    };

    try {
      const res = await fetch("/api/website/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to submit booking request. Please try again later.");
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
          <h2 className="text-2xl font-bold text-white mb-4">Booking Requested</h2>
          <p className="text-slate-400 mb-8">
            Your booking request has been securely logged. Our production team is currently reviewing Google Calendar availability and will confirm your slot shortly.
          </p>
          <button onClick={() => window.location.href = "/"} className="px-6 py-3 rounded-full bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors w-full">
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
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Book a Shoot</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Reserve your studio session or location shoot. Our automated system will cross-reference calendar availability and confirm your booking.
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
              <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Client Details</h3>
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
                  <label className="text-sm font-medium text-slate-300">Phone Number *</label>
                  <input required name="phone" type="tel" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors" placeholder="+1 (555) 000-0000" />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-6 border-b border-white/10 pb-4">Session Requirements</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Requested Date *</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <input required name="shootDate" type="date" className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors [&::-webkit-calendar-picker-indicator]:invert-[1] [&::-webkit-calendar-picker-indicator]:opacity-50 cursor-pointer" />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Preferred Time</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <select name="shootTime" className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors appearance-none cursor-pointer">
                      <option value="Morning (9AM - 1PM)">Morning (9AM - 1PM)</option>
                      <option value="Afternoon (1PM - 5PM)">Afternoon (1PM - 5PM)</option>
                      <option value="Evening (5PM - 9PM)">Evening (5PM - 9PM)</option>
                      <option value="Full Day">Full Day</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Session Type</label>
                  <div className="relative">
                    <Video className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                    <select name="sessionType" className="w-full bg-black/50 border border-white/10 rounded-xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors appearance-none cursor-pointer">
                      <option value="Automotive Rig Shoot">Automotive Rig Shoot</option>
                      <option value="Fashion Editorial">Fashion Editorial</option>
                      <option value="Commercial Product">Commercial Product</option>
                      <option value="Consultation">Consultation (Google Meet)</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Additional Details</label>
                <textarea name="details" rows={4} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors resize-none" placeholder="Any specific requirements for your booking?" />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-white/10">
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full md:w-auto px-10 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Submitting...</> : <><Send className="h-5 w-5" /> Request Booking</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
