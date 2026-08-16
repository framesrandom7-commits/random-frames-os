import React from "react";
import { FileText } from "lucide-react";

export const TermsBlock: React.FC = () => {
  return (
    <div>
      <div className="flex items-center gap-2 text-[#C1121F] font-bold mb-4 uppercase text-sm border-b border-[#E6E6E6] pb-2">
        <FileText size={16} /> TERMS & CONDITIONS
      </div>
      
      <ul className="text-xs text-zinc-700 space-y-2 list-disc pl-4 marker:text-[#C1121F]">
        <li>50% advance required to confirm booking.</li>
        <li>Raw footage will be retained for 7 days from the date of delivery.</li>
        <li>Cancellation after confirmation may incur charges.</li>
        <li>Quotation is valid for 7 days from the date of issue.</li>
      </ul>
    </div>
  );
};
