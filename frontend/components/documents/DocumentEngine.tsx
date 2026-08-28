import React from "react";
import { DocumentData, DocumentType, CompanySettings, PaymentSettings } from "./types";
import { DocumentHeader } from "./DocumentHeader";
import { ClientProjectBlock } from "./ClientProjectBlock";
import { ServicesTable } from "./ServicesTable";
import { SummaryBlock } from "./SummaryBlock";
import { DeliverablesChecklist } from "./DeliverablesChecklist";
import { PaymentBlock } from "./PaymentBlock";
import { TermsBlock } from "./TermsBlock";
import { DocumentFooter } from "./DocumentFooter";

interface DocumentEngineProps {
  type: DocumentType;
  data: DocumentData;
  companyInfo: CompanySettings;
  paymentInfo?: PaymentSettings;
}

export const DocumentEngine: React.FC<DocumentEngineProps> = ({
  type,
  data,
  companyInfo,
  paymentInfo,
}) => {
  return (
    <div 
      className="bg-white w-[210mm] min-h-[297mm] mx-auto relative flex flex-col font-montserrat shadow-[0_0_20px_rgba(0,0,0,0.1)] print:shadow-none overflow-hidden"
      style={{
        // A4 Paper proportions
        width: "210mm",
        minHeight: "297mm",
        color: "#111111", // Primary Black
      }}
    >
      {/* Faint Watermark */}
      <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
        <svg viewBox="0 0 100 100" className="w-[150mm] h-[150mm]" fill="none" stroke="currentColor" strokeWidth="2">
           <path d="M12 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
           <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
           {/* Simple Aperture-like shape for watermark since we don't have the exact vector */}
           <circle cx="50" cy="50" r="45" strokeWidth="3" />
           <path d="M50 5 L75 25 M95 50 L75 75 M50 95 L25 75 M5 50 L25 25 M75 25 L25 75" strokeWidth="2" />
           <text x="50" y="55" fontSize="24" fontWeight="bold" textAnchor="middle" strokeWidth="1" fill="currentColor">RF</text>
        </svg>
      </div>

      <div className="relative z-10 flex flex-col h-full flex-1">
        <DocumentHeader type={type} data={data} companyInfo={companyInfo} />

        <main className="flex-1 px-[15mm] py-[10mm] flex flex-col gap-6">
        <ClientProjectBlock type={type} data={data} companyInfo={companyInfo} />
        
        {type !== "RECEIPT" && (
          <ServicesTable items={data.items} />
        )}

        {type === "RECEIPT" && (
          <div className="border border-[#E6E6E6] rounded-xl overflow-hidden mb-8">
            <table className="w-full text-sm">
              <thead className="bg-[#F8F8F8] border-b border-[#E6E6E6]">
                <tr>
                  <th className="py-3 px-4 text-left font-semibold text-gray-500">PAYMENT DATE</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-500">METHOD</th>
                  <th className="py-3 px-4 text-left font-semibold text-gray-500">REFERENCE</th>
                  <th className="py-3 px-4 text-right font-semibold text-gray-500">AMOUNT RECEIVED</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-4 px-4 font-medium">{new Date(data.paymentDate || data.issueDate).toLocaleDateString()}</td>
                  <td className="py-4 px-4 font-medium">{data.paymentMethod?.replace('_', ' ') || 'OTHER'}</td>
                  <td className="py-4 px-4 font-medium">{data.transactionId || data.documentNumber || '-'}</td>
                  <td className="py-4 px-4 text-right font-bold text-[#C1121F]">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(Number(data.amountReceived || data.total))}
                  </td>
                </tr>
              </tbody>
            </table>
            
            {(data as any).notes && (
              <div className="bg-[#F8F8F8] border-t border-[#E6E6E6] p-4 text-sm">
                <span className="font-semibold text-gray-500 block mb-1">NOTES</span>
                <p className="text-gray-700">{(data as any).notes}</p>
              </div>
            )}
            
            {data.invoiceReference && (
              <div className="bg-white border-t border-[#E6E6E6] p-4 text-sm">
                <span className="font-semibold text-gray-500 block mb-1">RELATED TO INVOICE</span>
                <div className="flex justify-between items-center">
                  <p className="text-gray-700 font-medium">{data.invoiceReference}</p>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-row justify-between items-start gap-8">
          <div className="flex-1 w-full">
            {type === "QUOTATION" && data.deliverables && data.deliverables.length > 0 && (
              <DeliverablesChecklist deliverables={data.deliverables} />
            )}
            {type === "INVOICE" && paymentInfo && (
              <PaymentBlock paymentInfo={paymentInfo} />
            )}
          </div>
          
          <div className="w-1/2 shrink-0">
             <SummaryBlock data={data} />
          </div>
        </div>

        <div className="mt-auto">
           {type !== "RECEIPT" && <TermsBlock />}
        </div>
      </main>
      </div>

      <div className="relative z-10 mt-auto">
        <DocumentFooter companyInfo={companyInfo} />
      </div>
      
    </div>
  );
};
