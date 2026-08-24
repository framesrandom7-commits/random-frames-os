"use client";

import React, { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { createQuickApprovedQuotation, QuotationItemData } from "@/app/actions/quotation";
import { toast } from "sonner";
import { FinanceService } from "@/lib/finance/finance.service";

interface QuickQuotationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId: string;
  onSuccess: (quotationId: string, total: number) => void;
}

export default function QuickQuotationModal({ open, onOpenChange, clientId, onSuccess }: QuickQuotationModalProps) {
  const [isPending, startTransition] = useTransition();
  const [discount, setDiscount] = useState<number | "">("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<QuotationItemData[]>([
    { description: "Base Project Services", quantity: 1, unitPrice: 0, total: 0 }
  ]);

  const handleItemChange = (index: number, field: keyof QuotationItemData, value: string) => {
    const newItems = [...items];
    const item = newItems[index];
    
    if (field === "description") {
      item.description = value;
    } else {
      const numValue = value === "" ? "" : parseFloat(value);
      (item as any)[field] = Number.isNaN(numValue as any) ? "" : numValue;
      if (item.quantity !== "" && item.unitPrice !== "") {
        item.total = Number(item.quantity) * Number(item.unitPrice);
      }
    }
    
    // Auto-calculate row total
    if (field === 'quantity' || field === 'unitPrice') {
      item.total = Number(item.quantity) * Number(item.unitPrice);
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const { subtotal, total } = FinanceService.calculateTotals(items, Number(discount) || 0, false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0 || items.some(i => !i.description)) {
      toast.error("Please provide descriptions for all line items.");
      return;
    }
    if (items.some(i => i.quantity === "" || i.unitPrice === "")) {
      toast.error("Please provide valid quantity and unit price for all items.");
      return;
    }

    startTransition(async () => {
      const res = await createQuickApprovedQuotation({
        clientId,
        discount: Number(discount) || 0,
        notes,
        items
      });

      if (res.success && res.quotation) {
        toast.success("Official quotation generated and approved.");
        onSuccess(res.quotation.id, Number(res.quotation.total));
      } else {
        toast.error(res.error || "Failed to create quotation.");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-zinc-950 border-white/10 text-white max-w-5xl sm:max-w-5xl w-[95vw] h-[90vh] flex flex-col overflow-hidden custom-scrollbar">
        <DialogHeader className="shrink-0">
          <DialogTitle className="text-xl">Generate Base Quotation</DialogTitle>
          <DialogDescription className="text-zinc-400">
            Create an official, approved quotation for this project. The system will automatically fetch client details, generate the quotation number, and apply default terms.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden mt-4">
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 pb-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm uppercase text-zinc-300">Line Items</h3>
                  <Button type="button" onClick={addItem} size="sm" variant="outline" className="text-xs bg-white/5 border-white/10 text-white hover:bg-white/10">
                    <Plus className="h-3 w-3 mr-1" /> Add Row
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 bg-zinc-900/50 p-2 rounded-lg border border-white/5">
                      <div className="flex-1 space-y-1">
                        <Label className="text-[10px] uppercase text-zinc-500">Description *</Label>
                        <Input 
                          value={item.description} 
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="bg-black/40 border-white/10 h-9 text-sm"
                        />
                      </div>
                      <div className="w-16 space-y-1 shrink-0">
                        <Label className="text-[10px] uppercase text-zinc-500">Qty</Label>
                        <Input 
                          type="number"
                          value={item.quantity === 0 ? "" : item.quantity} 
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="bg-black/40 border-white/10 h-9 text-sm px-2 text-center"
                        />
                      </div>
                      <div className="w-24 space-y-1 shrink-0">
                        <Label className="text-[10px] uppercase text-zinc-500">Unit Price</Label>
                        <Input 
                          type="number"
                          step="0.01"
                          value={item.unitPrice === 0 ? "" : item.unitPrice} 
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          className="bg-black/40 border-white/10 h-9 text-sm px-2 text-right"
                        />
                      </div>
                      <div className="pt-5 shrink-0">
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => removeItem(idx)}
                          disabled={items.length === 1}
                          className="h-9 w-9 text-red-400 hover:text-red-300 hover:bg-red-400/10 disabled:opacity-30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Notes (Optional)</Label>
                <Textarea 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Additional project-specific notes..."
                  className="bg-black/40 border-white/10 min-h-[100px]"
                />
              </div>
            </div>

            <div className="lg:col-span-1 space-y-6">
              <div className="space-y-4 bg-zinc-900/50 p-5 rounded-xl border border-white/5 h-fit sticky top-0">
                <h3 className="font-semibold text-sm uppercase text-zinc-300 mb-4">Summary</h3>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Subtotal</span>
                  <span className="text-white font-medium">₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center gap-4">
                  <Label className="text-zinc-400">Discount</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={discount} 
                    onChange={e => setDiscount(e.target.value ? parseFloat(e.target.value) : "")}
                    className="bg-black/40 border-white/10 w-28 text-right text-sm h-8"
                  />
                </div>
                <div className="pt-4 mt-2 border-t border-white/10 flex justify-between items-center">
                  <span className="font-semibold text-white">Final Total</span>
                  <span className="text-2xl font-bold text-[#C1121F]">₹{total.toFixed(2)}</span>
                </div>
              </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-white/10 flex justify-end gap-3 shrink-0 bg-zinc-950">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="bg-transparent border-white/20 text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-[#C1121F] text-white hover:bg-[#a00f1a]">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? "Generating..." : "Generate & Approve Quotation"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
