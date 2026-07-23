"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { submitCustomerForm, getLead, CustomerFormData } from "@/app/actions/lead";
import { toast } from "sonner";
import { Loader2, CheckCircle } from "lucide-react";
import { notFound } from "next/navigation";

export default function CustomerOnboardingPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [leadName, setLeadName] = useState("");
  const [leadId, setLeadId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CustomerFormData>({
    contactPerson: "",
    phone: "",
    whatsapp: "",
    email: "",
    businessName: "",
    address: "",
    gstNumber: "",
    instagram: "",
    website: "",
    notes: ""
  });

  useEffect(() => {
    const fetchLead = async () => {
      try {
        const lead = await getLead(resolvedParams.id);
        if (!lead) {
          notFound();
          return;
        }
        setLeadName(lead.businessName);
        setFormData({
          contactPerson: lead.contactPerson || "",
          phone: lead.phone || "",
          whatsapp: lead.phone || "", // Pre-fill whatsapp with phone by default
          email: lead.email || "",
          businessName: lead.businessName || "",
          address: lead.address || "",
          gstNumber: "",
          instagram: lead.instagram || "",
          website: lead.website || "",
          notes: ""
        });
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLead();
  }, [resolvedParams.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const result = await submitCustomerForm(resolvedParams.id, formData);
    setIsSubmitting(false);

    if (result.success) {
      setIsSuccess(true);
      toast.success("Thank you! Your information has been submitted successfully.");
    } else {
      toast.error(result.error || "Something went wrong.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4">
        <div className="bg-zinc-900 border border-white/10 rounded-xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-white">Thank You!</h1>
          <p className="text-zinc-400 text-sm">
            We have received your details. Our team will get back to you shortly with the next steps for your project.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-4 py-12 sm:p-8">
      <div className="w-full max-w-2xl bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-6 sm:p-10 shadow-2xl">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-black text-white tracking-tight uppercase mb-2">Random Frames</h1>
          <p className="text-zinc-400 text-sm">Client Information Form for {leadName}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-zinc-300">Contact Person Name *</Label>
              <Input required value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} className="bg-black/50 border-white/10 text-white h-11" placeholder="John Doe" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Business/Brand Name *</Label>
              <Input required value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} className="bg-black/50 border-white/10 text-white h-11" placeholder="Your Brand LLC" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Phone Number *</Label>
              <Input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-black/50 border-white/10 text-white h-11" placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">WhatsApp Number *</Label>
              <Input required type="tel" value={formData.whatsapp} onChange={e => setFormData({...formData, whatsapp: e.target.value})} className="bg-black/50 border-white/10 text-white h-11" placeholder="+91 98765 43210" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-zinc-300">Email Address *</Label>
              <Input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-black/50 border-white/10 text-white h-11" placeholder="hello@example.com" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-zinc-300">Complete Billing Address *</Label>
              <Textarea required value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="bg-black/50 border-white/10 text-white min-h-[100px]" placeholder="123 Business Street, City, State, ZIP" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">GST Number (Optional)</Label>
              <Input value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} className="bg-black/50 border-white/10 text-white h-11" placeholder="29ABCDE1234F1Z5" />
            </div>
            <div className="space-y-2">
              <Label className="text-zinc-300">Instagram Handle (Optional)</Label>
              <Input value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} className="bg-black/50 border-white/10 text-white h-11" placeholder="@yourbrand" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-zinc-300">Website URL (Optional)</Label>
              <Input type="url" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="bg-black/50 border-white/10 text-white h-11" placeholder="https://yourbrand.com" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-zinc-300">Additional Notes / Requirements (Optional)</Label>
              <Textarea value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} className="bg-black/50 border-white/10 text-white min-h-[100px]" placeholder="Any specific instructions..." />
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/10">
            <Button type="submit" disabled={isSubmitting} className="w-full h-12 text-base font-bold bg-[#C1121F] hover:bg-[#a00f1a] text-white rounded-lg transition-all">
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Submit Details"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
