import React from "react";
import { CompanySettings } from "./types";
import { Mail, Phone, MapPin, Globe } from "lucide-react";

export const DocumentFooter: React.FC<{
  companyInfo: CompanySettings;
}> = ({ companyInfo }) => {
  return (
    <div className="bg-white py-[6mm] px-[15mm] mt-auto">
      <div className="flex justify-center items-center gap-4 text-[10px] text-zinc-600 font-medium">
        <div className="flex items-center gap-2">
          <Mail size={12} className="text-[#111111]" />
          <span>{companyInfo.email || "frames.random.7@gmail.com"}</span>
        </div>
        
        <div className="text-zinc-300">|</div>

        <div className="flex items-center gap-2">
          <Phone size={12} className="text-[#111111]" />
          <span>{companyInfo.phone || "8073080077"}</span>
        </div>
        
        <div className="text-zinc-300">|</div>

        <div className="flex items-center gap-2">
          <MapPin size={12} className="text-[#111111]" />
          <span>{companyInfo.address || "Bangalore, India"}</span>
        </div>
        
        <div className="text-zinc-300">|</div>

        <div className="flex items-center gap-2">
          <Globe size={12} className="text-[#111111]" />
          <span>{companyInfo.website ? companyInfo.website.replace('https://', '') : 'instagram.com/random.frames.7'}</span>
        </div>
      </div>
    </div>
  );
};
