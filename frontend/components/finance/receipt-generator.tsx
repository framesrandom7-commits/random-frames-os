"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Prisma, PaymentMethod, PaymentType } from "@prisma/client";
import { updatePayment } from "@/app/actions/payment";
import { ArrowLeft, Download, Send, Printer, Mail, MessageCircle, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { whatsappLinks } from "@/lib/integrations/whatsapp";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { updateClientPhone } from "@/app/actions/client";


type PaymentWithRelations = Prisma.PaymentGetPayload<{
  include: { client: true; project: true; invoice: true }
}>;

interface ReceiptGeneratorProps {
  payment: PaymentWithRelations;
  clients: { id: string; businessName: string; phone?: string | null; email?: string | null }[];
  projects: { id: string; title: string; clientId: string }[];
}

export default function ReceiptGenerator({ payment, clients, projects }: ReceiptGeneratorProps) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  
  
  const [formData, setFormData] = useState({
    referenceNumber: payment.referenceNumber || "",
    paymentDate: new Date(payment.paymentDate).toISOString().split('T')[0],
    amount: Number(payment.amount).toString(),
    paymentMethod: payment.paymentMethod,
    paymentType: payment.paymentType,
    notes: payment.notes || "",
    clientId: payment.clientId,
    projectId: payment.projectId || "none",
  });

  const handleSave = () => {
    startTransition(async () => {
      const result = await updatePayment(payment.id, {
        referenceNumber: formData.referenceNumber,
        paymentDate: new Date(formData.paymentDate),
        amount: Number(formData.amount),
        paymentMethod: formData.paymentMethod as PaymentMethod,
        notes: formData.notes,
        clientId: formData.clientId,
        projectId: formData.projectId === "none" ? undefined : formData.projectId,
      });
      
      if (result.success) {
        alert("Receipt updated successfully");
        const iframe = document.getElementById('receipt-preview-iframe') as HTMLIFrameElement;
        if (iframe) {
          iframe.src = iframe.src;
        }
      } else {
        alert(result.error);
      }
    });
  };

  const handlePrint = () => {
    const iframe = document.getElementById('receipt-preview-iframe') as HTMLIFrameElement;
    if (iframe && iframe.contentWindow) {
      iframe.contentWindow.print();
    }
  };

  const activeClient = clients.find(c => c.id === formData.clientId);

  return (
    <div className="h-full flex flex-col print:block print:h-auto overflow-hidden">
      
      <div className="flex items-center justify-between mb-4 print:hidden px-2">
        <Link href="/finance/payments" className="text-zinc-400 hover:text-white flex items-center text-sm transition-colors">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Link>
        <div className="flex items-center gap-4">
          <Button onClick={handleSave} disabled={isPending} className="bg-zinc-800 hover:bg-zinc-700 text-white">
            <Save className="h-4 w-4 mr-2" /> {isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="edit" className="flex-1 flex flex-col overflow-hidden">
        <div className="flex justify-center mb-4 print:hidden">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger value="edit">Edit Details</TabsTrigger>
            <TabsTrigger value="preview">Preview Receipt</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="edit" className="flex-1 overflow-y-auto custom-scrollbar p-2 m-0 outline-none">
          <div className="max-w-4xl mx-auto space-y-8 bg-white/5 border border-white/10 p-6 md:p-8 rounded-xl backdrop-blur-md">
            
            {/* PAYMENT DETAILS */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Payment Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label>Reference Number</Label>
                  <Input 
                    value={formData.referenceNumber} 
                    onChange={e => setFormData({...formData, referenceNumber: e.target.value})}
                    className="bg-black/40 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Date</Label>
                  <Input 
                    type="date"
                    value={formData.paymentDate} 
                    onChange={e => setFormData({...formData, paymentDate: e.target.value})}
                    className="bg-black/40 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input 
                    type="number"
                    value={formData.amount} 
                    onChange={e => setFormData({...formData, amount: e.target.value})}
                    className="bg-black/40 border-white/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select 
                    value={formData.paymentMethod} 
                    onValueChange={(v) => setFormData({ ...formData, paymentMethod: v as PaymentMethod })}
                  >
                    <SelectTrigger className="bg-black/40 border-white/10">
                      <SelectValue placeholder="- - -" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      {Object.values(PaymentMethod).map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
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
                      {projects.filter(p => p.clientId === formData.clientId).map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="h-px bg-white/10 w-full my-8"></div>

            {/* NOTES / SERVICES EQUIVALENT */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Additional Notes</h3>
              <p className="text-xs text-zinc-400 mb-2">Since receipts do not have itemized services like an Invoice, use this field to describe the payment or write a thank you note.</p>
              <Textarea 
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
                placeholder="Thank you for your payment..."
                className="bg-black/40 border-white/10 min-h-[100px]"
              />
            </div>
            
          </div>
        </TabsContent>

        <TabsContent value="preview" className="flex-1 flex flex-col overflow-hidden m-0 outline-none min-h-[75vh]">
          <div className="flex items-center justify-end gap-2 mb-4 print:hidden px-2">
            
            {activeClient && (
              <>
                {activeClient.email && (
                  <a 
                    href={`mailto:${activeClient.email}?subject=Receipt ${formData.referenceNumber} from Random Frames&body=Hi ${activeClient.businessName},%0D%0A%0D%0AHere is the receipt for your recent payment of ${formData.amount}.%0D%0A%0D%0AView Receipt: ${window.location.origin}/api/documents/receipt/${payment.id}/pdf%0D%0A%0D%0AThank you!`}
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
                  phone={activeClient.phone || ""}
                  onSavePhone={async (phone) => {
                    return updateClientPhone(activeClient.id, phone);
                  }}
                  getMessageUrl={(phone) => whatsappLinks.sendReceipt(
                    phone,
                    activeClient.businessName,
                    formData.referenceNumber || "",
                    Number(formData.amount),
                    `${window.location.origin}/api/documents/receipt/${payment.id}/pdf`
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
              onClick={() => window.open(`/api/documents/receipt/${payment.id}/pdf`, '_blank')} 
              className="bg-[#C1121F] hover:bg-[#a00f1a] text-white"
            >
              <Download className="h-4 w-4 mr-2" /> Download Receipt
            </Button>
          </div>
          
          <div className="flex-1 overflow-y-auto pb-12 print:p-0 flex justify-center h-[75vh]">
            <div className="w-full max-w-[794px] aspect-[210/297] border border-white/10 rounded-xl overflow-hidden bg-transparent shadow-2xl relative">
              <iframe 
                id="receipt-preview-iframe"
                src={`/documents/receipt/${payment.id}/preview`} 
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
