"use client";

import React, { useState, useTransition, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createClient, updateClient } from "@/app/actions/client";
import { toast } from "sonner";
import { BusinessType, Client } from "@prisma/client";

interface ClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client;
}

export default function ClientForm({ open, onOpenChange, client }: ClientFormProps) {
  const [isPending, startTransition] = useTransition();
  const [formData, setFormData] = useState<Partial<Client>>({});

  useEffect(() => {
    if (client && open) {
      // eslint-disable-next-line
      setFormData(client);
    } else if (open) {
      setFormData({
        businessType: "OTHER",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.businessName) {
      toast.error("Business Name is required");
      return;
    }

    startTransition(async () => {
      const dataToSubmit = {
        businessName: formData.businessName!,
        contactPerson: formData.contactPerson,
        phone: formData.phone,
        email: formData.email,
        instagram: formData.instagram,
        website: formData.website,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        country: formData.country,
        postalCode: formData.postalCode,
        businessType: formData.businessType as BusinessType,
        gstNumber: formData.gstNumber,
        notes: formData.notes,
      };

      if (client?.id) {
        const result = await updateClient(client.id, dataToSubmit);
        if (result.success) {
          toast.success("Client updated successfully");
          onOpenChange(false);
        } else {
          toast.error((result as any).error || "Failed to update client");
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
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-[#111] border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{client ? "Edit Client" : "Add New Client"}</DialogTitle>
          <DialogDescription className="text-zinc-400">
            {client ? "Update the details of your client below." : "Fill in the details to add a new client."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
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
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-[#1a1a1a] border-white/10 text-white">
                  {Object.values(BusinessType).map((type) => (
                    <SelectItem key={type} value={type}>{type.replace(/_/g, " ")}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                className="bg-black/40 border-white/10 text-white focus-visible:ring-[#C1121F]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-zinc-300">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone || ""}
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
          </div>

          <DialogFooter className="pt-4 border-t border-white/10">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent border-white/20 text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-[#C1121F] text-white hover:bg-[#a00f1a]">
              {isPending ? "Saving..." : client ? "Update Client" : "Create Client"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
