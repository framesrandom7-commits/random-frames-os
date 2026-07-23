"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Download, FileText, MessageCircle } from "lucide-react";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { whatsappLinks } from "@/lib/integrations/whatsapp";
import { updateLeadPhone } from "@/app/actions/lead";

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

  const handleDownloadPDF = () => {
    window.open(`/api/pdf/quotation/${lead.id}`, '_blank');
  };

  const getWhatsAppMessage = (phone: string) => {
    // Generate the URL to the PDF endpoint
    const pdfUrl = `${window.location.origin}/api/pdf/quotation/${lead.id}`;
    return whatsappLinks.sendQuotation(
      phone,
      lead.contactPerson || lead.businessName,
      lead.estimatedValue || 0,
      pdfUrl
    );
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        className="border-white/10 text-zinc-300 hover:text-white hover:bg-white/5 gap-2"
        onClick={handleDownloadPDF}
      >
        <Download className="w-4 h-4" />
        Download Quote
      </Button>

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
