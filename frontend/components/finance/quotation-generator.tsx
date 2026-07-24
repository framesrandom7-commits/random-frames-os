"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Prisma, QuotationStatus } from "@prisma/client";
import { updateQuotation, QuotationItemData } from "@/app/actions/quotation";
import { ArrowLeft, Plus, Trash2, Download, Send } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { whatsappLinks } from "@/lib/integrations/whatsapp";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { updateClientPhone } from "@/app/actions/client";
import { FinanceService } from "@/lib/finance/finance.service";
import { CurrencyService } from "@/lib/finance/currency.service";
import { TaxService } from "@/lib/finance/tax.service";

type QuotationWithRelations = Prisma.QuotationGetPayload<{
  include: { client: true; project: true; items: true }
}>;

interface QuotationGeneratorProps {
  quotation: QuotationWithRelations;
  clients: { id: string; businessName: string }[];
  projects: { id: string; title: string; clientId: string }[];
}

export default function QuotationGenerator({ quotation, clients, projects }: QuotationGeneratorProps) {
  const [isPending, startTransition] = useTransition();
  
  const [formData, setFormData] = useState({
    quotationNumber: quotation.quotationNumber,
    issueDate: new Date(quotation.issueDate).toISOString().split('T')[0],
    validUntil: new Date(quotation.validUntil).toISOString().split('T')[0],
    status: quotation.status,
    notes: quotation.notes || "",
    termsAndConditions: quotation.termsAndConditions || "",
    clientId: quotation.clientId,
    projectId: quotation.projectId || "none",
    discount: Number(quotation.discount || 0),
  });

  const [items, setItems] = useState<QuotationItemData[]>(
    quotation.items.map(i => ({
      description: i.description,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
      total: Number(i.total)
    }))
  );

  // Recalculate totals dynamically
  const { subtotal, discount, tax, total } = FinanceService.calculateTotals(
    items, 
    formData.discount,
    false // Assume domestic tax for now
  );

  const handleAddItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof QuotationItemData, value: string | number) => {
    const newItems = [...items];
    const item = newItems[index];
    
    if (field === 'description') {
      item.description = value as string;
    } else if (field === 'quantity') {
      item.quantity = Number(value) || 0;
      item.total = item.quantity * item.unitPrice;
    } else if (field === 'unitPrice') {
      item.unitPrice = Number(value) || 0;
      item.total = item.quantity * item.unitPrice;
    }
    
    setItems(newItems);
  };

  const handleSave = () => {
    startTransition(async () => {
      const result = await updateQuotation(quotation.id, {
        ...formData,
        issueDate: new Date(formData.issueDate),
        validUntil: new Date(formData.validUntil),
        projectId: formData.projectId === "none" ? "" : formData.projectId,
        subtotal,
        discount,
        tax,
        total,
        items
      });
      if (result.success) {
        alert("Quotation updated successfully!");
      } else {
        alert("Failed to save quotation.");
      }
    });
  };

  const getStatusColor = (status: QuotationStatus) => {
    switch (status) {
      case "APPROVED": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "REJECTED": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "SENT": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "DRAFT": return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
      case "EXPIRED": return "bg-zinc-800 text-zinc-500 border-zinc-700";
      default: return "bg-zinc-500/10 text-zinc-400 border-zinc-500/20";
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden gap-6 print:block print:h-auto print:overflow-visible">
      
      {/* LEFT: Editor Panel (Hidden on Print) */}
      <div className="w-full lg:w-1/3 xl:w-1/3 bg-white/5 border border-white/10 rounded-xl flex flex-col overflow-hidden backdrop-blur-md print:hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <Link href="/finance/quotations" className="text-zinc-400 hover:text-white flex items-center text-sm transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
          <Badge variant="outline" className={getStatusColor(formData.status)}>
            {formData.status}
          </Badge>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Details</h3>
            
            <div className="space-y-2">
              <Label>Quotation Number</Label>
              <Input 
                value={formData.quotationNumber} 
                onChange={e => setFormData({...formData, quotationNumber: e.target.value})}
                className="bg-black/40 border-white/10"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Issue Date</Label>
                <Input 
                  type="date"
                  value={formData.issueDate} 
                  onChange={e => setFormData({...formData, issueDate: e.target.value})}
                  className="bg-black/40 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label>Valid Until</Label>
                <Input 
                  type="date"
                  value={formData.validUntil} 
                  onChange={e => setFormData({...formData, validUntil: e.target.value})}
                  className="bg-black/40 border-white/10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Client</Label>
              <Select 
                value={formData.clientId} 
                onValueChange={(v) => setFormData({ ...formData, clientId: v || "" })}
              >
                <SelectTrigger className="bg-black/40 border-white/10">
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white max-h-40">
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.businessName}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Project (Optional)</Label>
              <Select 
                value={formData.projectId} 
                onValueChange={(v) => setFormData({ ...formData, projectId: v || "none" })}
              >
                <SelectTrigger className="bg-black/40 border-white/10">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white max-h-40">
                  <SelectItem value="none">None</SelectItem>
                  {projects.filter(p => p.clientId === formData.clientId).map(p => 
                    <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select 
                value={formData.status} 
                onValueChange={(v) => setFormData({ ...formData, status: (v || "DRAFT") as QuotationStatus })}
              >
                <SelectTrigger className="bg-black/40 border-white/10">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  {Object.values(QuotationStatus).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Totals</h3>
            <div className="space-y-2">
              <Label>Discount</Label>
              <Input 
                type="number"
                value={formData.discount} 
                onChange={e => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0})}
                className="bg-black/40 border-white/10"
              />
            </div>
          </div>
          
          <div className="space-y-4 pt-4 border-t border-white/10">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Notes</h3>
            <Textarea 
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              placeholder="Private notes..."
              className="bg-black/40 border-white/10 min-h-[100px]"
            />
            <Label>Terms and Conditions</Label>
            <Textarea 
              value={formData.termsAndConditions}
              onChange={e => setFormData({...formData, termsAndConditions: e.target.value})}
              placeholder="Terms and conditions..."
              className="bg-black/40 border-white/10 min-h-[100px]"
            />
          </div>
        </div>

        <div className="p-4 border-t border-white/10 bg-black/40">
          <Button onClick={handleSave} disabled={isPending} className="w-full bg-[#C1121F] hover:bg-[#a00f1a] text-white">
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      {/* RIGHT: Document Preview (Visible on Print) */}
      <div className="flex-1 overflow-y-auto custom-scrollbar lg:pr-2 xl:pr-4 pb-12 print:p-0 print:overflow-visible">
        <div className="flex items-center justify-end gap-2 mb-4 print:hidden">
            <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              <Download className="h-4 w-4 mr-2" /> Download PDF
            </Button>
            {activeClient && (
              <WhatsAppButton
                variant="outline"
                className="bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20"
                phone={activeClient.phone}
                onSavePhone={async (phone) => {
                  return updateClientPhone(activeClient.id, phone);
                }}
                getMessageUrl={(phone) => whatsappLinks.sendQuotation(
                  phone,
                  activeClient.businessName,
                  formData.quotationNumber,
                  total,
                  `${window.location.origin}/api/pdf/quotation/${quotation.id}`
                )}
              >
                <Send className="h-4 w-4 mr-2" /> Share via WhatsApp
              </WhatsAppButton>
            )}
        </div>
        <div className="bg-white text-black min-h-[842px] max-w-[794px] w-full mx-auto p-8 md:p-12 shadow-xl print:shadow-none print:m-0 print:p-0 print:w-full print:max-w-full relative">
          
          <div className="flex justify-between items-start mb-12">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900 mb-2">QUOTATION</h1>
              <div className="text-zinc-500 font-medium">#{formData.quotationNumber}</div>
            </div>
            <div className="text-right">
              {/* Logo placeholder */}
              <div className="text-2xl font-black tracking-tighter uppercase mb-4 text-zinc-800">
                Random<span className="text-[#C1121F]">Frames</span>
              </div>
            </div>
          </div>

          {/* Dynamic Line Items Table */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4 print:hidden">
              <h3 className="font-semibold">Line Items</h3>
              <Button onClick={handleAddItem} size="sm" variant="outline" className="text-xs">
                <Plus className="h-3 w-3 mr-1" /> Add Row
              </Button>
            </div>
            
            <table className="w-full text-left text-sm mb-4">
              <thead>
                <tr className="border-b-2 border-zinc-900 text-zinc-900">
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Qty</th>
                  <th className="py-2 text-right">Unit Price</th>
                  <th className="py-2 text-right">Total</th>
                  <th className="print:hidden"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {items.map((item, idx) => (
                  <tr key={idx} className="group">
                    <td className="py-3 pr-2">
                      <Input 
                        value={item.description} 
                        onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                        placeholder="Item description"
                        className="border-transparent bg-transparent hover:border-zinc-300 focus:border-zinc-300 focus:bg-white transition-all shadow-none h-8 print:border-none print:p-0 print:pointer-events-none text-black"
                      />
                    </td>
                    <td className="py-3 px-2 w-20 text-right">
                      <Input 
                        type="number"
                        value={item.quantity} 
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="text-right border-transparent bg-transparent hover:border-zinc-300 focus:border-zinc-300 focus:bg-white transition-all shadow-none h-8 print:border-none print:p-0 print:pointer-events-none text-black"
                      />
                    </td>
                    <td className="py-3 px-2 w-32 text-right">
                      <Input 
                        type="number"
                        value={item.unitPrice} 
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        className="text-right border-transparent bg-transparent hover:border-zinc-300 focus:border-zinc-300 focus:bg-white transition-all shadow-none h-8 print:border-none print:p-0 print:pointer-events-none text-black"
                      />
                    </td>
                    <td className="py-3 text-right font-medium">
                      {CurrencyService.format(item.total)}
                    </td>
                    <td className="py-3 w-10 text-center print:hidden opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(idx)} className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500 italic">No items added yet.</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Totals Section */}
            <div className="flex justify-end mt-8">
              <div className="w-64 space-y-3">
                <div className="flex justify-between text-sm text-zinc-600">
                  <span>Subtotal</span>
                  <span>{CurrencyService.format(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-zinc-600">
                    <span>Discount</span>
                    <span className="text-red-500">-{CurrencyService.format(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-zinc-600">
                  <span>GST/Tax (18%)</span>
                  <span>{CurrencyService.format(tax)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold text-zinc-900 border-t-2 border-zinc-900 pt-2">
                  <span>Total</span>
                  <span>{CurrencyService.format(total)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-16 text-sm text-zinc-500 space-y-4">
            {formData.termsAndConditions && (
              <div>
                <p className="font-semibold text-zinc-700">Terms & Conditions</p>
                <p className="whitespace-pre-wrap">{formData.termsAndConditions}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
