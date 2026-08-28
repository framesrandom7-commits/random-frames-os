"use client";

import React, { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Prisma, InvoiceStatus, PaymentMethod } from "@prisma/client";
import { updateInvoice, InvoiceItemData } from "@/app/actions/invoice";
import { createPayment } from "@/app/actions/payment";
import { Printer, Download, Plus, Trash2, ArrowLeft, Building, MapPin, Phone, Mail, Calendar as CalendarIcon, Hash, CheckCircle, Upload, MessageCircle, Send, Save } from "lucide-react";
import { whatsappLinks } from "@/lib/integrations/whatsapp";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { updateClientPhone } from "@/app/actions/client";
import { FinanceService } from "@/lib/finance/finance.service";
import { CurrencyService } from "@/lib/finance/currency.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

type InvoiceWithRelations = Prisma.InvoiceGetPayload<{
  include: { client: true; project: true; payments: true; items: true }
}>;

interface InvoiceGeneratorProps {
  invoice: InvoiceWithRelations;
  clients: { id: string; businessName: string; address?: string | null; email?: string | null; phone?: string | null }[];
  projects: { id: string; title: string; clientId: string }[];
  settings?: Record<string, any>;
}

export default function InvoiceGenerator({ invoice, clients, projects, settings = {} }: InvoiceGeneratorProps) {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [formData, setFormData] = useState({
    invoiceNumber: invoice.invoiceNumber,
    issueDate: new Date(invoice.issueDate).toISOString().split('T')[0],
    dueDate: new Date(invoice.dueDate).toISOString().split('T')[0],
    status: invoice.status,
    notes: invoice.notes || "",
    clientId: invoice.clientId,
    projectId: invoice.projectId || "none",
    discount: Number(invoice.discount || 0),
  });

  const [items, setItems] = useState<InvoiceItemData[]>(
    invoice.items?.map(i => ({
      description: i.description,
      quantity: i.quantity,
      unitPrice: Number(i.unitPrice),
      total: Number(i.total)
    })) || []
  );

  const { subtotal, discount, tax, total } = FinanceService.calculateTotals(
    items,
    formData.discount,
    false
  );

  const [paymentData, setPaymentData] = useState({
    amount: total - invoice.payments.reduce((s, p) => s + Number(p.amount), 0),
    paymentMethod: "BANK_TRANSFER" as PaymentMethod,
    referenceNumber: "",
    upiTransactionId: "",
    bankReference: "",
    paymentScreenshotUrl: "",
  });

  const formatCurrency = (amount: number) => {
    return CurrencyService.format(amount);
  };

  const handleSave = () => {
    startTransition(async () => {
      await updateInvoice(invoice.id, {
        ...formData,
        issueDate: new Date(formData.issueDate),
        dueDate: new Date(formData.dueDate),
        projectId: formData.projectId === "none" ? "" : formData.projectId,
        subtotal,
        tax,
        discount,
        total,
        items
      });
      alert("Invoice updated successfully!");
    });
  };

  const handleRecordPayment = () => {
    startTransition(async () => {
      await createPayment({
        amount: paymentData.amount,
        paymentDate: new Date(),
        paymentMethod: paymentData.paymentMethod,
        referenceNumber: paymentData.referenceNumber,
        upiTransactionId: paymentData.upiTransactionId,
        bankReference: paymentData.bankReference,
        paymentScreenshotUrl: paymentData.paymentScreenshotUrl,
        invoiceId: invoice.id,
        projectId: formData.projectId,
        clientId: formData.clientId,
      });
      alert("Payment recorded!");
    });
  };

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      window.open(`/api/documents/invoice/${invoice.id}/pdf`, '_blank');
    } catch (error) {
      console.error("Failed to generate PDF", error);
      alert("Failed to generate PDF. See console for details.");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleAddItem = () => {
    setItems([...items, { description: "", quantity: 1, unitPrice: 0, total: 0 }]);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof InvoiceItemData, value: string | number) => {
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

  const activeClient = clients.find(c => c.id === formData.clientId);
  const activeProject = projects.find(p => p.id === formData.projectId);

  const balanceDue = total - invoice.payments.reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="h-full flex flex-col print:block print:h-auto overflow-hidden">
      
      <div className="flex items-center justify-between mb-4 print:hidden px-2">
        <Link href="/finance/invoices" className="text-zinc-400 hover:text-white flex items-center text-sm transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Link>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className={
            formData.status === 'PAID' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' :
            formData.status === 'OVERDUE' ? 'text-red-400 border-red-500/20 bg-red-500/10' :
            'text-zinc-300'
          }>
            {formData.status}
          </Badge>
          <Button onClick={handleSave} disabled={isPending} className="bg-zinc-800 hover:bg-zinc-700 text-white">
            <Save className="h-4 w-4 mr-2" /> Save Changes
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
            
            {/* INVOICE DETAILS */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Invoice Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Invoice Number</Label>
                  <Input 
                    value={formData.invoiceNumber} 
                    onChange={e => setFormData({...formData, invoiceNumber: e.target.value})}
                    className="bg-black/40 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(v) => setFormData({ ...formData, status: (v || "DRAFT") as InvoiceStatus })}
                  >
                    <SelectTrigger className="bg-black/40 border-white/10">
                      <SelectValue placeholder="- - -" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      {Object.values(InvoiceStatus).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
                  <Label>Due Date</Label>
                  <Input 
                    type="date"
                    value={formData.dueDate} 
                    onChange={e => setFormData({...formData, dueDate: e.target.value})}
                    className="bg-black/40 border-white/10"
                  />
                </div>
              </div>
            </div>

            {/* LINE ITEMS */}
            <div className="space-y-4 pt-6 border-t border-white/10">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Line Items</h3>
                <Button onClick={handleAddItem} size="sm" variant="outline" className="bg-white/5 border-white/10">
                  <Plus className="h-4 w-4 mr-1" /> Add Item
                </Button>
              </div>
              
              <div className="space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="p-4 bg-black/20 rounded-md border border-white/5 space-y-4 relative group">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleRemoveItem(idx)}
                      className="absolute top-2 right-2 h-8 w-8 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-6 space-y-1">
                        <Label className="text-xs">Description</Label>
                        <Input 
                          value={item.description} 
                          onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          className="bg-black/40 border-white/10"
                        />
                      </div>
                      <div className="md:col-span-3 space-y-1">
                        <Label className="text-xs">Quantity</Label>
                        <Input 
                          type="number"
                          value={item.quantity || ""} 
                          onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          className="bg-black/40 border-white/10"
                        />
                      </div>
                      <div className="md:col-span-3 space-y-1">
                        <Label className="text-xs">Unit Price</Label>
                        <Input 
                          type="number"
                          value={item.unitPrice || ""} 
                          onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                          className="bg-black/40 border-white/10"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FINANCIALS & TOTALS */}
            <div className="space-y-4 pt-6 border-t border-white/10">
              <h3 className="text-lg font-semibold text-white">Financials</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Discount Amount</Label>
                  <Input 
                    type="number"
                    value={formData.discount || ""} 
                    onChange={e => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0})}
                    className="bg-black/40 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="opacity-0 hidden md:block">Total Summary</Label>
                  <div className="p-3 bg-white/5 rounded-md border border-white/10 flex justify-between items-center h-10">
                    <span className="text-sm font-medium text-zinc-300">Total Invoice Amount</span>
                    <span className="text-lg font-bold text-white">{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* PAYMENTS */}
            {invoice.payments.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold text-white mb-4">Payment History</h3>
                <div className="grid gap-3">
                  {invoice.payments.map(p => (
                    <div key={p.id} className="flex justify-between text-sm text-zinc-300 items-center p-3 rounded-md bg-black/40 border border-white/5">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-emerald-500" />
                        <span className="font-medium">{new Date(p.paymentDate).toLocaleDateString()}</span>
                        <span className="text-xs font-semibold uppercase bg-white/10 text-white px-2 py-1 rounded">{p.paymentMethod.replace("_", " ")}</span>
                        {p.referenceNumber && <span className="text-xs text-zinc-400">Ref: {p.referenceNumber}</span>}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-white">{formatCurrency(Number(p.amount))}</span>
                        <a href={`/api/documents/receipt/${p.id}/pdf`} target="_blank" className="text-xs text-[#C1121F] hover:underline flex items-center print:hidden">
                          <Download className="h-4 w-4 mr-1" /> Receipt
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {balanceDue > 0 && formData.status !== "CANCELLED" && (
              <div className="space-y-4 pt-6 border-t border-white/10">
                <h3 className="text-lg font-semibold text-emerald-400">Record New Payment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input 
                      type="number"
                      max={balanceDue}
                      value={paymentData.amount || ""} 
                      onChange={e => setPaymentData({...paymentData, amount: parseFloat(e.target.value) || 0})}
                      className="bg-black/40 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Method</Label>
                    <Select 
                      value={paymentData.paymentMethod} 
                      onValueChange={(v) => setPaymentData({ ...paymentData, paymentMethod: (v || "BANK_TRANSFER") as PaymentMethod })}
                    >
                      <SelectTrigger className="bg-black/40 border-white/10">
                        <SelectValue placeholder="- - -" />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10 text-white">
                        {Object.values(PaymentMethod).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {paymentData.paymentMethod === 'UPI' && (
                    <div className="space-y-2">
                      <Label>UPI Transaction ID</Label>
                      <Input 
                        value={paymentData.upiTransactionId} 
                        onChange={e => setPaymentData({...paymentData, upiTransactionId: e.target.value})}
                        className="bg-black/40 border-white/10"
                      />
                    </div>
                  )}
                  
                  {paymentData.paymentMethod === 'BANK_TRANSFER' && (
                    <div className="space-y-2">
                      <Label>Bank Reference / UTR Number</Label>
                      <Input 
                        value={paymentData.bankReference} 
                        onChange={e => setPaymentData({...paymentData, bankReference: e.target.value})}
                        className="bg-black/40 border-white/10"
                      />
                    </div>
                  )}
                  
                  {(paymentData.paymentMethod === 'CASH' || paymentData.paymentMethod === 'CHEQUE' || paymentData.paymentMethod === 'OTHER') && (
                    <div className="space-y-2">
                      <Label>Reference No. (Optional)</Label>
                      <Input 
                        value={paymentData.referenceNumber} 
                        onChange={e => setPaymentData({...paymentData, referenceNumber: e.target.value})}
                        className="bg-black/40 border-white/10"
                      />
                    </div>
                  )}
                </div>
                <div className="flex justify-end pt-2">
                  <Button onClick={handleRecordPayment} disabled={isPending || paymentData.amount <= 0 || paymentData.amount > balanceDue} className="bg-emerald-600 hover:bg-emerald-500 text-white">
                    <CheckCircle className="h-4 w-4 mr-2" /> Mark as Paid
                  </Button>
                </div>
              </div>
            )}

            {/* NOTES & TERMS */}
            <div className="space-y-4 pt-6 border-t border-white/10">
              <h3 className="text-lg font-semibold text-white">Notes</h3>
              <div className="grid grid-cols-1 gap-6">
                <div className="space-y-2">
                  <Label>Notes (Terms, Instructions)</Label>
                  <Textarea 
                    value={formData.notes} 
                    onChange={e => setFormData({...formData, notes: e.target.value})}
                    className="bg-black/40 border-white/10 min-h-[120px]"
                  />
                </div>
              </div>
            </div>
            
          </div>
        </TabsContent>

        <TabsContent value="preview" className="flex-1 flex flex-col overflow-hidden m-0 outline-none min-h-[75vh]">
          <div className="flex items-center justify-end gap-2 mb-4 print:hidden px-2">
            
            {activeClient && (
              <>
                {activeClient.email && (
                  <a 
                    href={`mailto:${activeClient.email}?subject=Invoice ${formData.invoiceNumber} from Random Frames&body=Hi ${activeClient.businessName},%0D%0A%0D%0AHere is your invoice for ${invoice.total}.%0D%0A%0D%0AView Invoice: ${window.location.origin}/api/documents/invoice/${invoice.id}/pdf%0D%0A%0D%0AThank you!`}
                    className="inline-flex"
                  >
                    <Button variant="outline" className="border-white/10 text-zinc-300 hover:text-white hover:bg-white/5">
                      <Mail className="h-4 w-4 mr-2" /> Email
                    </Button>
                  </a>
                )}
                
                <WhatsAppButton
                  variant="outline"
                  className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20"
                  phone={activeClient.phone}
                  onSavePhone={async (phone) => {
                    return updateClientPhone(activeClient.id, phone);
                  }}
                  getMessageUrl={(phone) => whatsappLinks.sendInvoice(
                    phone,
                    activeClient.businessName,
                    formData.invoiceNumber,
                    total,
                    `${window.location.origin}/api/documents/invoice/${invoice.id}/pdf`
                  )}
                >
                  <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
                </WhatsAppButton>
              </>
            )}

            <Button variant="outline" onClick={handlePrint} className="border-white/10 text-zinc-300 hover:text-white hover:bg-white/5">
              <Printer className="h-4 w-4 mr-2" /> Print
            </Button>
            
            {settings?.PAYMENT_UPI_QR_URL && (
              <Button variant="outline" className="border-white/10 text-zinc-300 hover:text-white hover:bg-white/5" onClick={() => window.open(settings.PAYMENT_UPI_QR_URL, '_blank')}>
                View UPI QR Code
              </Button>
            )}

            <Button 
              onClick={handleDownloadPDF} 
              disabled={isDownloading}
              className="bg-[#C1121F] hover:bg-[#a00f1a] text-white"
            >
              <Download className="h-4 w-4 mr-2" /> {isDownloading ? "Generating..." : "Download Invoice"}
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto pb-12 print:p-0 flex justify-center h-[75vh]">
            <div className="w-full max-w-[794px] aspect-[210/297] border border-white/10 rounded-xl overflow-hidden bg-transparent shadow-2xl relative">
              <iframe 
                src={`/documents/invoice/${invoice.id}/preview`} 
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
