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
      <div className="flex items-center gap-2 text-[#C1121F] font-bold mb-4 border-b border-[#E6E6E6] pb-2 uppercase">
        <FileText size={18} /> SERVICES & PRICING
      </div>
      
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#111111] text-white">
            <th className="py-2 px-4 text-center w-12 rounded-tl-md">#</th>
            <th className="py-2 px-4 text-left">SERVICE</th>
            <th className="py-2 px-4 text-center w-24">QTY</th>
            <th className="py-2 px-4 text-right w-32">RATE (₹)</th>
            <th className="py-2 px-4 text-right w-32 rounded-tr-md">AMOUNT (₹)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="border-b border-[#E6E6E6] text-center">
              <td className="py-3 px-4 font-bold text-[#C1121F]">{index + 1}</td>
              <td className="py-3 px-4 text-left text-zinc-700 font-medium">{item.description}</td>
              <td className="py-3 px-4 text-zinc-600">{item.quantity}</td>
              <td className="py-3 px-4 text-right text-zinc-600">{item.unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
              <td className="py-3 px-4 text-right text-zinc-800 font-semibold">{item.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            </tr>
          ))}
          {items.length === 0 && (
            <tr>
              <td colSpan={5} className="py-6 text-center text-zinc-400 italic">No services added.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
