
"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, MessageCircle, FileDown } from "lucide-react";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { whatsappLinks } from "@/lib/integrations/whatsapp";
import { updateLeadPhone } from "@/app/actions/lead";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface QuotationActionsProps {
  lead: any;
}

export default function QuotationActions({ lead }: QuotationActionsProps) {
  const isQuoteState = [
    "REQUIREMENT_DISCUSSION",
    "QUOTATION_SENT",
    "NEGOTIATION",
    "QUOTATION_ACCEPTED"
  ].includes(lead.status);

  if (!isQuoteState) return null;

  const getWhatsAppMessage = (phone: string) => {
    // Generate the URL to the Lead PDF endpoint
    const pdfUrl = `${window.location.origin}/api/pdf/lead-quotation/${lead.id}`;
    return whatsappLinks.sendQuotation(
      phone,
      lead.contactPerson || lead.businessName,
      lead.budget ? Number(lead.budget) : 0,
      pdfUrl
    );
  };

  const pdfUrl = `/api/pdf/lead-quotation/${lead.id}`;
  const filename = `Quotation-${(lead.businessName || lead.contactPerson || "Lead").replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;

  return (
    <div className="flex items-center gap-2">
      <Dialog>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className="border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 gap-2"
          >
            <FileText className="w-4 h-4" />
            Generate Quote
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-[1000px] sm:max-w-[1000px] w-[95vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-black/40 backdrop-blur-md border-white/10 shadow-2xl">
          <DialogHeader className="p-4 border-b border-white/10 shrink-0 bg-zinc-950/80 backdrop-blur-md">
            <DialogTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" />
              Generated Quotation Preview
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-hidden relative rounded-b-lg">
            <iframe
              src={`${pdfUrl}#toolbar=1&view=FitH`}
              className="w-full h-full border-0 absolute inset-0 bg-transparent"
              title="Quotation PDF Preview"
            />
          </div>

          <DialogFooter className="p-4 border-t border-white/10 shrink-0 bg-zinc-950/80 backdrop-blur-md flex items-center justify-between sm:justify-between">
            <div className="text-sm text-zinc-400">
              Please review the generated quotation. You can download it as a PDF or send it directly via WhatsApp.
            </div>
            <a href={pdfUrl} download={filename}>
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2">
                <FileDown className="w-4 h-4" />
                Download PDF
              </Button>
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <WhatsAppButton
        variant="outline"
        className="border-emerald-500/30 text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 gap-2"
        phone={lead.phone}
        onSavePhone={async (phone) => {
          return updateLeadPhone(lead.id, phone);
        }}
        getMessageUrl={getWhatsAppMessage}
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        WhatsApp Quote
      </WhatsAppButton>
    </div>
  );
}
