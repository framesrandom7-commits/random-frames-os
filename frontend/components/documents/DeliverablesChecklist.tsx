import React from "react";
import { CheckCircle2 } from "lucide-react";

export const DeliverablesChecklist: React.FC<{
  deliverables: string[];
}> = ({ deliverables }) => {
  return (
    <div className="bg-[#F8F8F8] border border-[#E6E6E6] rounded-xl p-5 h-full">
      <div className="flex items-center gap-2 text-[#C1121F] font-bold mb-4 uppercase">
        <CheckCircle2 size={18} /> DELIVERABLES
      </div>
      <ul className="space-y-3">
        {deliverables.map((item, index) => (
          <li key={index} className="flex items-start gap-3 text-sm font-medium text-zinc-700">
            <div className="text-[#C1121F] mt-0.5">
               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
               </svg>
            </div>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
};
