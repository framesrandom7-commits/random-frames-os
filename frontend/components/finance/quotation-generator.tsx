"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Prisma, QuotationStatus } from "@prisma/client";
import { updateQuotation, QuotationItemData } from "@/app/actions/quotation";
import { convertQuotationToInvoice } from "@/app/actions/invoice";
import { ArrowLeft, Plus, Trash2, Download, Send, FileText } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  
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

  const activeClient = clients.find((c: any) => c.id === formData.clientId) as any;

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

  const handleConvertToInvoice = () => {
    if (!confirm("Are you sure you want to convert this quotation to an invoice? It will be marked as APPROVED.")) return;
    
    startTransition(async () => {
      const result = await convertQuotationToInvoice(quotation.id);
      if (result.success && result.invoice) {
        router.push(`/finance/invoices/${result.invoice.id}`);
      } else {
        alert("Failed to convert quotation to invoice.");
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
    <div className="h-full flex flex-col print:block print:h-auto overflow-hidden">
      <div className="flex items-center justify-between mb-4 print:hidden px-2">
        <Link href="/finance/quotations" className="text-zinc-400 hover:text-white flex items-center text-sm transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Link>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className={getStatusColor(formData.status)}>
            {formData.status}
          </Badge>
          <Button onClick={handleSave} disabled={isPending} className="bg-[#C1121F] hover:bg-[#a00f1a] text-white">
            {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="edit" className="flex-1 flex flex-col overflow-hidden">
        <div className="flex justify-center mb-4 print:hidden">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="edit">Edit Details</TabsTrigger>
            <TabsTrigger value="preview">Preview PDF</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="edit" className="flex-1 overflow-y-auto custom-scrollbar p-2 m-0 outline-none">
          <div className="max-w-4xl mx-auto space-y-8 bg-white/5 border border-white/10 p-6 md:p-8 rounded-xl backdrop-blur-md">
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Quotation Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Quotation Number</Label>
                  <Input 
                    value={formData.quotationNumber} 
                    onChange={e => setFormData({...formData, quotationNumber: e.target.value})}
                    className="bg-black/40 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(v) => setFormData({ ...formData, status: (v || "DRAFT") as QuotationStatus })}
                  >
                    <SelectTrigger className="bg-black/40 border-white/10">
                      <SelectValue placeholder="- - -" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      {Object.values(QuotationStatus).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Client</Label>
                  <Select 
                    value={formData.clientId} 
                    onValueChange={(v) => setFormData({ ...formData, clientId: v || "" })}
                  >
                    <SelectTrigger className="bg-black/40 border-white/10">
                      <SelectValue placeholder="- - -">
                        {clients.find(c => c.id === formData.clientId)?.businessName || "- - -"}
                      </SelectValue>
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
                      <SelectValue placeholder="- - -">
                        {formData.projectId === "none" ? "None" : projects.find(p => p.id === formData.projectId)?.title || "- - -"}
                      </SelectValue>
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
            </div>

            <div className="space-y-4 pt-6 border-t border-white/10">
              <h3 className="text-lg font-semibold text-white">Financials</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Discount Amount</Label>
                  <Input 
                    type="number"
                    value={formData.discount || ""} 
                    onChange={e => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0})}
                    className="bg-black/40 border-white/10"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4 pt-6 border-t border-white/10">
              <h3 className="text-lg font-semibold text-white">Notes & Terms</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Private Notes</Label>
                  <Textarea 
                    value={formData.notes}
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    placeholder="Private notes..."
                    className="bg-black/40 border-white/10 min-h-[120px]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Terms and Conditions</Label>
                  <Textarea 
                    value={formData.termsAndConditions}
                    onChange={e => setFormData({...formData, termsAndConditions: e.target.value})}
                    placeholder="Terms and conditions..."
                    className="bg-black/40 border-white/10 min-h-[120px]"
                  />
                </div>
              </div>
            </div>
            
          </div>
        </TabsContent>

        <TabsContent value="preview" className="flex-1 flex flex-col overflow-hidden m-0 outline-none min-h-[75vh]">
          <div className="flex items-center justify-end gap-2 mb-4 print:hidden px-2">
            <Button onClick={handleConvertToInvoice} disabled={isPending} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              <FileText className="h-4 w-4 mr-2" /> Convert to Invoice
            </Button>
            <Button variant="outline" className="bg-white/5 border-white/10 text-white hover:bg-white/10" onClick={() => window.open(`/api/documents/quotation/${quotation.id}/pdf`, '_blank')}>
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
                  total,
                  `${window.location.origin}/api/documents/quotation/${quotation.id}/pdf`
                )}
              >
                <Send className="h-4 w-4 mr-2" /> Share via WhatsApp
              </WhatsAppButton>
            )}
          </div>
          <div className="flex-1 overflow-y-auto pb-12 print:p-0 flex justify-center h-[75vh]">
            <div className="w-full max-w-[794px] aspect-[210/297] border border-white/10 rounded-xl overflow-hidden bg-transparent shadow-2xl relative">
              <iframe 
                src={`/documents/quotation/${quotation.id}/preview`} 
                className="absolute inset-0 w-full h-full border-none bg-transparent"
                title="Document Preview"
                scrolling="no"
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
