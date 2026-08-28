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
    <div className="relative bg-black text-white pt-[15mm] pb-[10mm] px-[15mm] overflow-hidden flex-shrink-0">
      
      {/* Red diagonal line accent */}
      <div 
        className="absolute -top-10 left-[55%] w-1 h-[200%] bg-[#C1121F] opacity-100"
        style={{ transform: 'rotate(25deg)' }}
      ></div>
      
      {/* Bottom red polygon accent near center */}
      <div className="absolute bottom-0 left-[45%] w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[20px] border-b-[#C1121F]"></div>
      <div className="absolute bottom-0 left-0 w-[45%] h-[4px] bg-[#C1121F]"></div>

      <div className="flex justify-between items-start relative z-10">
        <div className="flex items-center gap-4">
          <div className="border-[1.5px] border-white text-white font-black text-2xl w-14 h-14 flex items-center justify-center rounded-md">
            RF
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-widest flex gap-2">
              {companyInfo.businessName.split(' ').map((word, idx) => (
                <span key={idx} className={idx > 0 ? "text-[#C1121F]" : "text-white"}>
                  {word.toUpperCase()}
                </span>
              ))}
            </h1>
            <p className="text-[10px] text-zinc-300 tracking-[0.2em] mt-1 uppercase">Commercial Photography & Videography</p>
            <div className="h-[2px] w-12 bg-[#C1121F] mt-3"></div>
          </div>
        </div>

        <div className="text-right">
          <h2 className="text-4xl font-black text-[#C1121F] tracking-wide mb-6">
            {type.toUpperCase()}
          </h2>
          
          <div className="grid grid-cols-[auto_auto] gap-x-6 gap-y-3 text-sm text-zinc-300 items-center justify-end">
            <div className="flex items-center gap-2 justify-end text-zinc-300">
              <FileText size={14}/> 
              <span>{type === 'RECEIPT' ? 'Receipt No.' : type === 'INVOICE' ? 'Invoice No.' : 'Quotation No.'}</span>
            </div>
            <div className="text-white font-medium text-left">: &nbsp;&nbsp;{data.documentNumber}</div>
            
            <div className="flex items-center gap-2 justify-end text-zinc-300">
              <Calendar size={14}/> 
              <span>Issue Date</span>
            </div>
            <div className="text-white font-medium text-left">: &nbsp;&nbsp;{format(data.issueDate, "dd/MM/yyyy")}</div>
            
            <div className="flex items-center gap-2 justify-end text-zinc-300">
              <Tag size={14}/> 
              <span>Status</span>
            </div>
            <div className="text-left flex items-center">
              <span className="mr-2 text-white font-medium">:</span>
              <span className={`px-4 py-0.5 rounded-full text-[11px] font-bold ${
                data.status === 'PAID' || data.status === 'COMPLETED' || data.status === 'ACCEPTED' ? 'bg-[#00A651] text-white' : 
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
