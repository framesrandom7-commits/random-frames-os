import React from "react";
import { DocumentData } from "./types";

export const SummaryBlock: React.FC<{
  data: DocumentData;
}> = ({ data }) => {
  return (
    <div className="bg-[#F8F8F8] border border-[#E6E6E6] rounded-xl overflow-hidden h-full flex flex-col justify-end">
      <div className="p-5 space-y-4 text-sm font-medium">
        <div className="flex justify-between items-center text-zinc-600">
          <span>Subtotal</span>
          <span>₹ {data.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
        </div>
        
        {data.discount !== undefined && data.discount > 0 && (
          <div className="flex justify-between items-center text-[#C1121F]">
            <span>Discount</span>
            <span>- ₹ {data.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
          </div>
        )}
      </div>
      
      <div className="bg-[#C1121F] text-white p-5 flex justify-between items-center text-lg font-black mt-auto">
        <span>GRAND TOTAL</span>
        <span>₹ {data.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
      </div>
    </div>
  );
};
