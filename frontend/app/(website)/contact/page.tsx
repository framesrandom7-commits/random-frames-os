"use client";

import React, { useState } from "react";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const payload = {
      type: "CONTACT",
      contactPerson: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      message: formData.get("message"),
      source: "WEBSITE",
      landingPage: "/contact",
      referrer: document.referrer || "Direct"
    };

    try {
      const res = await fetch("/api/website/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to submit enquiry. Please try again later.");
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
          <h2 className="text-2xl font-bold text-white mb-4">Message Received</h2>
          <p className="text-slate-400 mb-8">
            Thank you for reaching out to Random Frames Studio. Our team will review your enquiry and get back to you shortly.
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
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Contact Studio</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Get in touch with our production team for general enquiries, media requests, or studio information.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div className="p-6 rounded-2xl bg-neutral-900/50 border border-white/5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-2">Studio Headquarters</h3>
                <p className="text-slate-400 text-sm">124 Cinematic Way, Block C<br />Creative District, NY 10012</p>
              </div>
            </div>
            
            <div className="p-6 rounded-2xl bg-neutral-900/50 border border-white/5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-2">Email Us</h3>
                <p className="text-slate-400 text-sm">hello@randomframes.os<br />production@randomframes.os</p>
              </div>
            </div>
            
            <div className="p-6 rounded-2xl bg-neutral-900/50 border border-white/5 flex items-start gap-4">
              <div className="h-10 w-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-white font-bold mb-2">Call Us</h3>
                <p className="text-slate-400 text-sm">+1 (555) 123-4567<br />Mon-Fri, 9am - 6pm EST</p>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2 p-8 md:p-10 rounded-3xl bg-neutral-900/50 border border-white/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Full Name *</label>
                  <input required name="name" type="text" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Email Address *</label>
                  <input required name="email" type="email" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors" placeholder="john@example.com" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Phone Number (Optional)</label>
                <input name="phone" type="tel" className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors" placeholder="+1 (555) 000-0000" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">Message *</label>
                <textarea required name="message" rows={5} className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors resize-none" placeholder="How can we help you?" />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSubmitting ? <><Loader2 className="h-5 w-5 animate-spin" /> Sending...</> : <><Send className="h-5 w-5" /> Send Message</>}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
