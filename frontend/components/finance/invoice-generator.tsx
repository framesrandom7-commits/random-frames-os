"use client";

import React, { useRef, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
}

export default function InvoiceGenerator({ invoice, clients, projects }: InvoiceGeneratorProps) {
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
      window.open(`/api/pdf/invoice/${invoice.id}`, '_blank');
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
    <div className="flex flex-col lg:flex-row h-full overflow-hidden gap-6 print:block print:h-auto print:overflow-visible">
      
      {/* LEFT: Editor Panel (Hidden on Print) */}
      <div className="w-full lg:w-1/3 xl:w-1/4 bg-white/5 border border-white/10 rounded-xl flex flex-col overflow-hidden backdrop-blur-md print:hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
          <Link href="/finance/invoices" className="text-zinc-400 hover:text-white flex items-center text-sm transition-colors">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
          <Badge variant="outline" className={
            formData.status === 'PAID' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' :
            formData.status === 'OVERDUE' ? 'text-red-400 border-red-500/20 bg-red-500/10' :
            'text-zinc-300'
          }>
            {formData.status}
          </Badge>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Invoice Details</h3>
            
            <div className="space-y-2">
              <Label>Invoice Number</Label>
              <Input 
                value={formData.invoiceNumber} 
                onChange={e => setFormData({...formData, invoiceNumber: e.target.value})}
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
                <Label>Due Date</Label>
                <Input 
                  type="date"
                  value={formData.dueDate} 
                  onChange={e => setFormData({...formData, dueDate: e.target.value})}
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
                onValueChange={(v) => setFormData({ ...formData, status: (v || "DRAFT") as InvoiceStatus })}
              >
                <SelectTrigger className="bg-black/40 border-white/10">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  {Object.values(InvoiceStatus).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Line Items</h3>
              <Button onClick={handleAddItem} size="sm" variant="outline" className="text-xs h-7 bg-white/5 border-white/10">
                <Plus className="h-3 w-3 mr-1" /> Add
              </Button>
            </div>
            
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="p-3 bg-black/20 rounded-md border border-white/5 space-y-3 relative group">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveItem(idx)}
                    className="absolute top-1 right-1 h-6 w-6 text-zinc-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  <div className="space-y-1">
                    <Label className="text-xs">Description</Label>
                    <Input 
                      value={item.description} 
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      className="bg-black/40 border-white/10 h-8"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Quantity</Label>
                      <Input 
                        type="number"
                        value={item.quantity} 
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="bg-black/40 border-white/10 h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Unit Price</Label>
                      <Input 
                        type="number"
                        value={item.unitPrice} 
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        className="bg-black/40 border-white/10 h-8"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mt-6">Totals</h3>
            <div className="space-y-2">
              <Label>Discount</Label>
              <Input 
                type="number"
                value={formData.discount} 
                onChange={e => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0})}
                className="bg-black/40 border-white/10"
              />
            </div>
            <div className="p-3 bg-white/5 rounded-md border border-white/10 flex justify-between items-center">
              <span className="text-sm font-medium text-zinc-300">Total</span>
              <span className="text-lg font-bold text-white">{formatCurrency(total)}</span>
            </div>
            <div className="space-y-2">
              <Label>Notes (Terms, Instructions)</Label>
              <Textarea 
                value={formData.notes} 
                onChange={e => setFormData({...formData, notes: e.target.value})}
                className="bg-black/40 border-white/10 min-h-[80px]"
              />
            </div>
            <Button onClick={handleSave} disabled={isPending} className="w-full bg-zinc-800 hover:bg-zinc-700 text-white">
              <Save className="h-4 w-4 mr-2" /> Save Changes
            </Button>
          </div>

          {balanceDue > 0 && formData.status !== "CANCELLED" && (
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider">Record Payment</h3>
              <div className="space-y-2">
                <Label>Amount</Label>
                <Input 
                  type="number"
                  max={balanceDue}
                  value={paymentData.amount} 
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
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 text-white">
                    {Object.values(PaymentMethod).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Reference No. (Optional)</Label>
                <Input 
                  value={paymentData.referenceNumber} 
                  onChange={e => setPaymentData({...paymentData, referenceNumber: e.target.value})}
                  className="bg-black/40 border-white/10"
                />
              </div>
              <Button onClick={handleRecordPayment} disabled={isPending || paymentData.amount <= 0 || paymentData.amount > balanceDue} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
                <Plus className="h-4 w-4 mr-2" /> Record Payment
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT: PDF Preview / Document */}
      <div className="flex-1 flex flex-col bg-zinc-950/50 rounded-xl overflow-hidden print:w-full print:bg-white print:overflow-visible">
        
        {/* Toolbar (Hidden on Print) */}
        <div className="p-4 border-b border-white/10 flex items-center justify-end gap-2 bg-black/40 print:hidden">
          
          {activeClient && (
            <>
              {activeClient.email && (
                <a 
                  href={`mailto:${activeClient.email}?subject=Invoice ${formData.invoiceNumber} from Random Frames&body=Hi ${activeClient.businessName},%0D%0A%0D%0AHere is your invoice for ${formData.total}.%0D%0A%0D%0AView Invoice: ${window.location.origin}/api/pdf/invoice/${invoice.id}%0D%0A%0D%0AThank you!`}
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
                  `${window.location.origin}/api/pdf/invoice/${invoice.id}`
                )}
              >
                <MessageCircle className="h-4 w-4 mr-2" /> WhatsApp
              </WhatsAppButton>
            </>
          )}

          <Button variant="outline" onClick={handlePrint} className="border-white/10 text-zinc-300 hover:text-white hover:bg-white/5">
            <Printer className="h-4 w-4 mr-2" /> Print
          </Button>
          <Button 
            onClick={handleDownloadPDF} 
            disabled={isDownloading}
            className="bg-[#C1121F] hover:bg-[#a00f1a] text-white"
          >
            <Download className="h-4 w-4 mr-2" /> {isDownloading ? "Generating..." : "Download PDF"}
          </Button>
        </div>

        {/* Invoice Canvas */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 flex justify-center bg-zinc-900 print:p-0 print:bg-white print:block print:overflow-visible">
          <div 
            ref={invoiceRef} 
            className="bg-white text-black w-full max-w-[800px] min-h-[1056px] p-12 shadow-2xl relative print:shadow-none print:w-full print:max-w-none print:min-h-0 print:p-0"
            style={{ boxSizing: 'border-box' }}
          >
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-zinc-200 pb-8 mb-8">
              <div>
                <h1 className="text-4xl font-bold text-[#C1121F] tracking-tighter mb-1">RANDOM FRAMES</h1>
                <p className="text-zinc-500 text-sm font-medium tracking-widest uppercase">Commercial & Brand Photography</p>
                
                <div className="mt-6 text-sm text-zinc-600 space-y-1">
                  <p>Bengaluru, Karnataka, India</p>
                  <p>frames.random.7@gmail.com</p>
                  <p>+91 8073080077</p>
                  <p>randomframesbysavan.in</p>
                </div>
              </div>
              <div className="text-right">
                <h2 className="text-3xl font-light text-zinc-400 mb-6">INVOICE</h2>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm text-zinc-600">
                  <span className="font-semibold text-zinc-800">Invoice No:</span>
                  <span>{formData.invoiceNumber}</span>
                  <span className="font-semibold text-zinc-800">Issue Date:</span>
                  <span>{new Date(formData.issueDate).toLocaleDateString()}</span>
                  <span className="font-semibold text-zinc-800">Due Date:</span>
                  <span>{new Date(formData.dueDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Bill To */}
            <div className="flex justify-between mb-12">
              <div>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Bill To</h3>
                <p className="text-lg font-bold text-zinc-800">{activeClient?.businessName || "Client Name"}</p>
                <div className="text-sm text-zinc-600 space-y-1 mt-2">
                  {activeClient?.address && <p>{activeClient.address}</p>}
                  {activeClient?.email && <p>{activeClient.email}</p>}
                  {activeClient?.phone && <p>{activeClient.phone}</p>}
                </div>
              </div>
              {activeProject && (
                <div className="text-right">
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-3">Project</h3>
                  <p className="text-lg font-semibold text-zinc-800">{activeProject.title}</p>
                </div>
              )}
            </div>

            {/* Items Table */}
            <table className="w-full mb-8">
              <thead>
                <tr className="border-b-2 border-zinc-800 text-left">
                  <th className="py-3 text-sm font-semibold text-zinc-800">Description</th>
                  <th className="py-3 text-sm font-semibold text-zinc-800 text-right w-20">Qty</th>
                  <th className="py-3 text-sm font-semibold text-zinc-800 text-right w-32">Unit Price</th>
                  <th className="py-3 text-sm font-semibold text-zinc-800 text-right w-32">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-4 text-sm text-zinc-700 font-medium">
                      {item.description}
                    </td>
                    <td className="py-4 text-sm text-zinc-700 text-right">
                      {item.quantity}
                    </td>
                    <td className="py-4 text-sm text-zinc-700 text-right">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="py-4 text-sm text-zinc-900 text-right font-medium">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-4 text-sm text-zinc-500 italic text-center">No items</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Totals */}
            <div className="flex justify-end mb-12">
              <div className="w-1/2 md:w-1/3">
                <div className="flex justify-between py-2 text-sm text-zinc-600">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between py-2 text-sm text-red-500">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                {tax > 0 && (
                  <div className="flex justify-between py-2 text-sm text-zinc-600">
                    <span>Tax (18%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                )}
                <div className="flex justify-between py-4 mt-2 border-t-2 border-zinc-800">
                  <span className="text-lg font-bold text-zinc-900">Total</span>
                  <span className="text-lg font-bold text-zinc-900">{formatCurrency(total)}</span>
                </div>
                <div className="flex justify-between py-2 text-sm text-emerald-600">
                  <span>Amount Paid</span>
                  <span>-{formatCurrency(total - balanceDue)}</span>
                </div>
                <div className="flex justify-between py-3 mt-2 bg-zinc-100 px-4 rounded-md">
                  <span className="font-bold text-[#C1121F]">Balance Due</span>
                  <span className="font-bold text-[#C1121F]">{formatCurrency(balanceDue)}</span>
                </div>
              </div>
            </div>

            {/* Payments History */}
            {invoice.payments.length > 0 && (
              <div className="mb-12 border-t border-zinc-200 pt-8">
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4">Payment History</h3>
                <div className="space-y-2">
                  {invoice.payments.map(p => (
                    <div key={p.id} className="flex justify-between text-sm text-zinc-600 items-center p-2 rounded bg-zinc-50">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4 text-emerald-500" />
                        <span>{new Date(p.paymentDate).toLocaleDateString()}</span>
                        <span className="text-xs uppercase bg-zinc-200 px-2 py-0.5 rounded">{p.paymentMethod.replace("_", " ")}</span>
                        {p.referenceNumber && <span className="text-xs text-zinc-400">Ref: {p.referenceNumber}</span>}
                      </div>
                      <span className="font-medium">{formatCurrency(Number(p.amount))}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="absolute bottom-12 left-12 right-12 border-t border-zinc-200 pt-6">
              <div className="text-center text-xs text-zinc-500 space-y-1">
                <p>Thank you for your business!</p>
                <p>Payment is due within {Math.ceil((new Date(formData.dueDate).getTime() - new Date(formData.issueDate).getTime()) / (1000 * 3600 * 24))} days.</p>
                <p className="font-medium mt-2">Make all checks payable to Random Frames OS or wire transfer to Account: 1234567890</p>
              </div>
            </div>

            {/* Status Stamp overlay (Visual only) */}
            {formData.status === "PAID" && (
              <div className="absolute top-1/3 right-1/4 transform rotate-12 opacity-20 pointer-events-none text-emerald-500 border-8 border-emerald-500 px-8 py-4 rounded-xl text-6xl font-black uppercase tracking-widest print:opacity-30">
                PAID
              </div>
            )}
            {formData.status === "CANCELLED" && (
              <div className="absolute top-1/3 right-1/4 transform rotate-12 opacity-20 pointer-events-none text-red-500 border-8 border-red-500 px-8 py-4 rounded-xl text-6xl font-black uppercase tracking-widest print:opacity-30">
                VOID
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
