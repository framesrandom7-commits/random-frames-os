import React from "react";
import { DocumentData } from "./types";

export const SummaryBlock: React.FC<{
  data: DocumentData;
}> = ({ data }) => {
  return (
    <div className="bg-[#F8F8F8] border border-[#E6E6E6] rounded-xl overflow-hidden h-full flex flex-col justify-end">
      <div className="p-5 space-y-3 text-[11px] font-semibold text-black">
        <div className="flex justify-between items-center">
          <span>Subtotal</span>
          <span>₹ {data.subtotal.toLocaleString('en-IN')}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span>Discount</span>
          <span className="text-[#C1121F]">- ₹ {(data.discount || 0).toLocaleString('en-IN')}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span>Tax (If Applicable)</span>
          <span>₹ {(data.taxAmount || 0).toLocaleString('en-IN')}</span>
        </div>
      </div>
      
      <div className="bg-black text-white px-5 py-4 flex justify-between items-center text-sm font-black mt-auto">
        <span className="tracking-widest">GRAND TOTAL</span>
        <span>₹ {data.total.toLocaleString('en-IN')}</span>
      </div>
    </div>
  );
};
