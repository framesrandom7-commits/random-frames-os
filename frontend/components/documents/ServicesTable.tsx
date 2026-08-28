import React from "react";
import { FileText } from "lucide-react";

export const ServicesTable: React.FC<{
  items: Array<{
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }>;
}> = ({ items }) => {
  return (
    <div>
      <div className="flex items-center gap-3 text-[#C1121F] font-bold mb-4">
        <div className="border border-[#C1121F] rounded-full p-1.5 flex items-center justify-center">
          <FileText size={16} strokeWidth={2} /> 
        </div>
        <span className="uppercase text-black tracking-wide">SERVICES & PRICING</span>
      </div>
      
      <table className="w-full text-[11px] border-collapse border border-[#E6E6E6]">
        <thead>
          <tr className="bg-black text-white">
            <th className="py-2.5 px-4 text-center w-12 font-semibold">#</th>
            <th className="py-2.5 px-4 text-left font-semibold border-l border-black">SERVICE</th>
            <th className="py-2.5 px-4 text-center w-20 font-semibold border-l border-black">QTY</th>
            <th className="py-2.5 px-4 text-center w-24 font-semibold border-l border-black">UNIT</th>
            <th className="py-2.5 px-4 text-center w-28 font-semibold border-l border-black">RATE (₹)</th>
            <th className="py-2.5 px-4 text-center w-32 font-semibold border-l border-black">AMOUNT (₹)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b border-[#E6E6E6] text-center bg-white">
              <td className="py-3 px-4 font-bold text-[#C1121F] border-r border-[#E6E6E6]">{index + 1}</td>
              <td className="py-3 px-4 text-left text-black font-medium border-r border-[#E6E6E6]">{item.description}</td>
              <td className="py-3 px-4 text-black border-r border-[#E6E6E6]">{item.quantity}</td>
              <td className="py-3 px-4 text-black border-r border-[#E6E6E6]">1</td>
              <td className="py-3 px-4 text-center text-black border-r border-[#E6E6E6]">{item.unitPrice}</td>
              <td className="py-3 px-4 text-center text-black font-semibold">{item.total}</td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={6} className="py-6 text-center text-zinc-400 italic">No services added.</td>
            </tr>
          )}
          {/* Add exactly 2 empty rows to match the image grid feel */}
          <tr className="border-b border-[#E6E6E6] text-center bg-white h-10">
            <td className="border-r border-[#E6E6E6]"></td>
            <td className="border-r border-[#E6E6E6]"></td>
            <td className="border-r border-[#E6E6E6]"></td>
            <td className="border-r border-[#E6E6E6]"></td>
            <td className="border-r border-[#E6E6E6]"></td>
            <td></td>
          </tr>
          <tr className="border-b border-[#E6E6E6] text-center bg-white h-10">
            <td className="border-r border-[#E6E6E6]"></td>
            <td className="border-r border-[#E6E6E6]"></td>
            <td className="border-r border-[#E6E6E6]"></td>
            <td className="border-r border-[#E6E6E6]"></td>
            <td className="border-r border-[#E6E6E6]"></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
