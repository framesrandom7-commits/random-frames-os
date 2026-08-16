import React from "react";
import { DocumentData, DocumentType, CompanySettings } from "./types";
import { FileText, Calendar, Clock, Tag } from "lucide-react";
import { format } from "date-fns";

export const DocumentHeader: React.FC<{
  type: DocumentType;
  data: DocumentData;
  companyInfo: CompanySettings;
}> = ({ type, data, companyInfo }) => {
  return (
    <div className="relative bg-[#111111] text-white pt-[15mm] pb-[10mm] px-[15mm] overflow-hidden">
      {/* Red angled accent at the bottom */}
      <div 
        className="absolute bottom-0 left-0 w-full h-[5px] bg-[#C1121F]"
      ></div>
      <div 
        className="absolute -bottom-[20px] left-1/3 w-1/2 h-[40px] bg-white"
        style={{ transform: 'skewX(-45deg)' }}
      ></div>

      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-4">
          <div className="bg-white text-black font-black text-2xl w-14 h-14 flex items-center justify-center rounded-md">
            RF
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-widest">{companyInfo.businessName.toUpperCase()}</h1>
            <p className="text-xs text-zinc-400 tracking-[0.2em] mt-1 uppercase">Commercial Photography & Videography</p>
            <div className="h-[2px] w-12 bg-[#C1121F] mt-3"></div>
          </div>
        </div>

        <div className="text-right">
          <h2 className="text-4xl font-black text-[#C1121F] uppercase mb-6">{type}</h2>
          
          <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm text-zinc-300">
            <div className="flex items-center gap-2 justify-end text-zinc-400"><FileText size={16}/> {type === 'RECEIPT' ? 'Receipt No.' : type === 'INVOICE' ? 'Invoice No.' : 'Quotation No.'}</div>
            <div className="text-white font-medium text-left">: &nbsp;&nbsp;{data.documentNumber}</div>
            
            <div className="flex items-center gap-2 justify-end text-zinc-400"><Calendar size={16}/> {type === 'RECEIPT' ? 'Receipt Date' : 'Issue Date'}</div>
            <div className="text-white font-medium text-left">: &nbsp;&nbsp;{format(data.issueDate, "dd MMM yyyy")}</div>
            
            {data.dueDate && type === 'INVOICE' && (
              <>
                <div className="flex items-center gap-2 justify-end text-zinc-400"><Clock size={16}/> Due Date</div>
                <div className="text-white font-medium text-left">: &nbsp;&nbsp;{format(data.dueDate, "dd MMM yyyy")}</div>
              </>
            )}
            
            {data.validUntil && type === 'QUOTATION' && (
              <>
                <div className="flex items-center gap-2 justify-end text-zinc-400"><Clock size={16}/> Valid Until</div>
                <div className="text-white font-medium text-left">: &nbsp;&nbsp;{format(data.validUntil, "dd MMM yyyy")}</div>
              </>
            )}

            <div className="flex items-center gap-2 justify-end text-zinc-400"><Tag size={16}/> Status</div>
            <div className="text-left">
              : &nbsp;&nbsp;
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                data.status === 'PAID' || data.status === 'ACCEPTED' ? 'bg-green-600 text-white' : 
                'bg-[#C1121F] text-white'
              }`}>
                {data.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
