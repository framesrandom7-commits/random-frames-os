"use client";

import React, { useState, useTransition, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient, updateClient } from "@/app/actions/client";
import { checkUniqueContact } from "@/app/actions/validation";
import { toast } from "sonner";
import { BusinessType, Client, PreferredContact } from "@prisma/client";

interface ClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
}

export default function ClientForm({ open, onOpenChange, client }: ClientFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<Partial<Client>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [hasCommercialAgreement, setHasCommercialAgreement] = useState(false);
  const [commercialData, setCommercialData] = useState({
    agreedAmount: "",
    currency: "INR",
    quotationDate: new Date().toISOString().split('T')[0],
    approvalMethod: "",
    notes: ""
  });

  useEffect(() => {
    if (client && open) {
      // eslint-disable-next-line
      setFormData(client);
      setErrors({});
      setHasCommercialAgreement(false);
    } else if (open) {
      setFormData({
        businessType: "OTHER",
      });
      setErrors({});
      setHasCommercialAgreement(false);
      setCommercialData({
        agreedAmount: "",
        currency: "INR",
        quotationDate: new Date().toISOString().split('T')[0],
        approvalMethod: "",
        notes: ""
      });
    }
  }, [client, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const checkDuplicates = async (field: "email" | "phone") => {
    const value = formData[field];
    if (!value) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
      return;
    }

    const result = await checkUniqueContact(field, value, client?.id);
    if (!result.isUnique) {
      setErrors(prev => ({ ...prev, [field]: `${field === "email" ? "Email" : "Phone"} already exists in ${result.conflictingEntity}` }));
    } else {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    if (!formData.businessName) {
      toast.error("Business Name is required");
      return;
    }

    startTransition(async () => {
      const dataToSubmit = { ...formData } as any;
      
      // Inject commercial agreement data into the creation payload if applicable
      if (!client && hasCommercialAgreement) {
        dataToSubmit.commercialAgreement = {
          agreedAmount: Number(commercialData.agreedAmount),
          currency: commercialData.currency,
          quotationDate: new Date(commercialData.quotationDate),
          approvalMethod: commercialData.approvalMethod,
          notes: commercialData.notes,
        };
      }

      if (client?.id) {
        const result = await updateClient(client.id, dataToSubmit);
        if (result.success) {
          onOpenChange(false);
          toast.success("Client updated successfully");
        } else {
          toast.error(result.error || "Failed to update client");
        }
      } else {
        const result = await createClient(dataToSubmit);
        if (result.success) {
          toast.success("Client created successfully");
          onOpenChange(false);
        } else {
          toast.error((result as any).error || "Failed to create client");
        }
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-4xl sm:max-w-4xl md:max-w-5xl max-h-[90vh] flex flex-col overflow-hidden bg-zinc-950/10 backdrop-blur-lg border-white/10 text-white p-0">
        <DialogHeader className="px-6 py-5 border-b border-white/10 shrink-0 bg-transparent">
          <DialogTitle className="text-2xl font-bold">{client ? "Edit Client" : "Add New Client"}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden min-h-0 flex flex-col">
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="businessName" className="text-zinc-300">Business Name *</Label>
              <Input
                id="businessName"
                name="businessName"
                placeholder="Enter business name"
                value={formData.businessName || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPerson" className="text-zinc-300">Contact Person</Label>
              <Input
                id="contactPerson"
                name="contactPerson"
                placeholder="Enter contact person"
                value={formData.contactPerson || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessType" className="text-zinc-300">Business Type</Label>
              <Select value={formData.businessType || ""} onValueChange={(val) => handleSelectChange("businessType", val || "")}>
                <SelectTrigger className="bg-black/40 border-white/10 text-white h-9 focus:ring-[#C1121F]">
                  <SelectValue placeholder="- - -" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                  {Object.values(BusinessType).map((type) => (
                    <SelectItem key={type} value={type}>{type.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-zinc-300">Phone</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone || ""}
                onChange={handleChange}
                onBlur={() => checkDuplicates("phone")}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
              {errors.phone && <p className="text-xs text-red-400">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email || ""}
                onChange={handleChange}
                onBlur={() => checkDuplicates("email")}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
              {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp" className="text-zinc-300">WhatsApp</Label>
              <Input
                id="whatsapp"
                name="whatsapp"
                placeholder="Enter WhatsApp number"
                value={formData.whatsapp || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredContactMethod" className="text-zinc-300">Preferred Contact Method</Label>
              <Select value={formData.preferredContactMethod || ""} onValueChange={(val) => handleSelectChange("preferredContactMethod", val || "")}>
                <SelectTrigger className="bg-black/40 border-white/10 text-white h-9 focus:ring-[#C1121F]">
                  <SelectValue placeholder="- - -" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                  {Object.values(PreferredContact).map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serviceType" className="text-zinc-300">Service Type</Label>
              <Input
                id="serviceType"
                name="serviceType"
                placeholder="e.g. Wedding, Commercial, etc."
                value={formData.serviceType || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="instagram" className="text-zinc-300">Instagram Handle</Label>
              <Input
                id="instagram"
                name="instagram"
                placeholder="@username"
                value={formData.instagram || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website" className="text-zinc-300">Website URL</Label>
              <Input
                id="website"
                name="website"
                placeholder="https://..."
                value={formData.website || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="googleMapsLink" className="text-zinc-300">Google Maps Link</Label>
              <Input
                id="googleMapsLink"
                name="googleMapsLink"
                placeholder="https://maps.app.goo.gl/..."
                value={formData.googleMapsLink || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address" className="text-zinc-300">Address</Label>
              <Input
                id="address"
                name="address"
                placeholder="Street address"
                value={formData.address || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city" className="text-zinc-300">City</Label>
              <Input
                id="city"
                name="city"
                placeholder="City"
                value={formData.city || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state" className="text-zinc-300">State/Region</Label>
              <Input
                id="state"
                name="state"
                placeholder="State or Region"
                value={formData.state || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="country" className="text-zinc-300">Country</Label>
              <Input
                id="country"
                name="country"
                placeholder="Country"
                value={formData.country || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="postalCode" className="text-zinc-300">Postal Code</Label>
              <Input
                id="postalCode"
                name="postalCode"
                placeholder="Postal / Zip code"
                value={formData.postalCode || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gstNumber" className="text-zinc-300">GST Number</Label>
              <Input
                id="gstNumber"
                name="gstNumber"
                placeholder="Enter GST number"
                value={formData.gstNumber || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notes" className="text-zinc-300">Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Add any additional notes about this client..."
                value={formData.notes || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F] min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="ownerNotes" className="text-zinc-300">Owner Notes (Private)</Label>
              <Textarea
                id="ownerNotes"
                name="ownerNotes"
                placeholder="Private notes only visible to owners..."
                value={formData.ownerNotes || ""}
                onChange={handleChange}
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F] min-h-[100px]"
              />
            </div>
            
            {/* Commercial Agreement Section (Only for new clients) */}
            {!client && (
              <div className="col-span-1 md:col-span-2 mt-6">
                <h4 className="text-sm font-semibold text-zinc-400 border-b border-white/10 pb-2 mb-4">Commercial Agreement</h4>
                
                <div className="flex items-center space-x-2 mb-6">
                  <input
                    type="checkbox"
                    id="hasCommercialAgreement"
                    checked={hasCommercialAgreement}
                    onChange={(e) => setHasCommercialAgreement(e.target.checked)}
                    className="w-4 h-4 rounded border-white/20 bg-black/40 text-[#C1121F] focus:ring-[#C1121F]"
                  />
                  <Label htmlFor="hasCommercialAgreement" className="text-zinc-300 cursor-pointer">
                    Commercial Terms Already Agreed
                  </Label>
                </div>

                {hasCommercialAgreement && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border border-white/10 rounded-lg bg-black/20">
                    <div className="space-y-2">
                      <Label htmlFor="agreedAmount" className="text-zinc-300">Agreed Amount *</Label>
                      <Input
                        id="agreedAmount"
                        type="number"
                        min="0"
                        step="0.01"
                        required
                        value={commercialData.agreedAmount}
                        onChange={(e) => setCommercialData(prev => ({ ...prev, agreedAmount: e.target.value }))}
                        className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-zinc-300">Currency</Label>
                      <Input
                        id="currency"
                        disabled
                        value={commercialData.currency}
                        className="bg-black/20 border-white/5 text-zinc-500 cursor-not-allowed"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quotationDate" className="text-zinc-300">Quotation Date</Label>
                      <Input
                        id="quotationDate"
                        type="date"
                        value={commercialData.quotationDate}
                        onChange={(e) => setCommercialData(prev => ({ ...prev, quotationDate: e.target.value }))}
                        className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="approvalMethod" className="text-zinc-300">Approval Method *</Label>
                      <Select 
                        required
                        value={commercialData.approvalMethod} 
                        onValueChange={(val) => setCommercialData(prev => ({ ...prev, approvalMethod: val }))}
                      >
                        <SelectTrigger className="bg-black/40 border-white/10 text-white h-9 focus:ring-[#C1121F]">
                          <SelectValue placeholder="Select Method" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                          <SelectItem value="WhatsApp Confirmation">WhatsApp Confirmation</SelectItem>
                          <SelectItem value="Email Confirmation">Email Confirmation</SelectItem>
                          <SelectItem value="Signed Quotation">Signed Quotation</SelectItem>
                          <SelectItem value="Verbal Approval">Verbal Approval</SelectItem>
                          <SelectItem value="Internal Approval">Internal Approval</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="commercialNotes" className="text-zinc-300">Notes (Optional)</Label>
                      <Textarea
                        id="commercialNotes"
                        placeholder="Terms, deliverables agreed..."
                        value={commercialData.notes}
                        onChange={(e) => setCommercialData(prev => ({ ...prev, notes: e.target.value }))}
                        className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F] min-h-[80px]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>
            </div>

            {/* Footer */}
            <div className="shrink-0 p-4 bg-zinc-900 border-t border-white/10 flex justify-end gap-2 z-50">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent border-white/20 text-white hover:bg-white/10">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-[#C1121F] text-white hover:bg-[#a00f1a]">
                {isPending ? "Saving..." : client ? "Update Client" : "Create Client"}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
