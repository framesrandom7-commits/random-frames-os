import React from "react";
import { FileText, PenTool, Edit3, Camera } from "lucide-react";

export const TermsBlock: React.FC = () => {
  return (
    <div className="grid grid-cols-3 gap-6 text-[10px]">
      
      {/* Column 1: Terms & Conditions + Thank You */}
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-3 text-[#C1121F] font-bold mb-3">
            <div className="border border-[#C1121F] rounded-full p-1.5 flex items-center justify-center">
              <FileText size={14} strokeWidth={2} /> 
            </div>
            <span className="uppercase text-black tracking-wide">TERMS & CONDITIONS</span>
          </div>
          
          <ul className="text-black space-y-1.5 list-none pl-1">
            <li className="flex items-start gap-2">
              <span className="text-[#C1121F] font-bold">•</span>
              50% advance to confirm booking.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#C1121F] font-bold">•</span>
              Raw footage will be retained for 7 days from the date of delivery.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#C1121F] font-bold">•</span>
              Cancellation after confirmation may incur charges.
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#C1121F] font-bold">•</span>
              Invoice is valid for 7 days from the date of issue.
            </li>
          </ul>
        </div>

        <div className="mt-2 flex gap-3 items-center">
          <Camera size={28} className="text-[#C1121F]" strokeWidth={1.5} />
          <div>
            <div className="text-[#111111] font-bold tracking-widest uppercase mb-0.5">THANK YOU!</div>
            <div className="text-black leading-snug">Thank you for choosing Random Frames. We look forward to working with you.</div>
          </div>
        </div>
      </div>

      {/* Column 2: Acceptance */}
      <div>
        <div className="flex items-center gap-3 text-[#C1121F] font-bold mb-3">
          <div className="border border-[#C1121F] rounded-full p-1.5 flex items-center justify-center">
            <PenTool size={14} strokeWidth={2} /> 
          </div>
          <span className="uppercase text-black tracking-wide">ACCEPTANCE</span>
        </div>

        <div className="space-y-6 mt-4">
          <div className="flex items-center">
            <span className="w-16 text-[#111111]">Client Name</span>
            <span className="mx-2">:</span>
            <div className="flex-1 border-b border-dashed border-zinc-400"></div>
          </div>
          <div className="flex items-center">
            <span className="w-16 text-[#111111]">Signature</span>
            <span className="mx-2">:</span>
            <div className="flex-1 border-b border-dashed border-zinc-400"></div>
          </div>
          <div className="flex items-center">
            <span className="w-16 text-[#111111]">Date</span>
            <span className="mx-2">:</span>
            <div className="flex-1 border-b border-dashed border-zinc-400"></div>
          </div>
        </div>
      </div>

      {/* Column 3: Notes */}
      <div>
        <div className="flex items-center gap-3 text-[#C1121F] font-bold mb-3">
          <div className="border border-[#C1121F] rounded-full p-1.5 flex items-center justify-center">
            <Edit3 size={14} strokeWidth={2} /> 
          </div>
          <span className="uppercase text-black tracking-wide">NOTES</span>
        </div>
        
        <div className="space-y-6 mt-6">
          <div className="border-b border-dashed border-zinc-400 w-full"></div>
          <div className="border-b border-dashed border-zinc-400 w-full"></div>
          <div className="border-b border-dashed border-zinc-400 w-full"></div>
          <div className="border-b border-dashed border-zinc-400 w-full"></div>
        </div>
      </div>

    </div>
  );
};
