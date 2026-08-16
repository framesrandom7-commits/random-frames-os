import React from "react";
import { CompanySettings } from "./types";
import { Mail, Phone, MapPin, Instagram } from "lucide-react";

export const DocumentFooter: React.FC<{
  companyInfo: CompanySettings;
}> = ({ companyInfo }) => {
  return (
    <div className="bg-white border-t border-[#E6E6E6] py-[6mm] px-[15mm] mt-auto">
      <div className="flex justify-between items-center text-xs text-zinc-600">
        {companyInfo.email && (
          <div className="flex items-center gap-2">
            <Mail size={14} className="text-[#111111]" />
            <span>{companyInfo.email}</span>
          </div>
        )}
        
        {companyInfo.phone && (
          <div className="flex items-center gap-2">
            <Phone size={14} className="text-[#111111]" />
            <span>{companyInfo.phone}</span>
          </div>
        )}
        
        {companyInfo.address && (
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-[#111111]" />
            <span>{companyInfo.address}</span>
          </div>
        )}
        
        {companyInfo.website && (
          <div className="flex items-center gap-2">
            <Instagram size={14} className="text-[#111111]" />
            <span>{companyInfo.website.replace('https://', '')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
