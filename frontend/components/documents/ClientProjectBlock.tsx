import React from "react";
import { DocumentData, DocumentType, CompanySettings } from "./types";
import { User, Briefcase, Phone, Mail, MapPin, Building2, Folder, LayoutGrid, Camera, Map, Calendar, Clock } from "lucide-react";

export const ClientProjectBlock: React.FC<{
  type: DocumentType;
  data: DocumentData;
  companyInfo: CompanySettings;
}> = ({ type, data, companyInfo }) => {
  return (
    <div className="grid grid-cols-[1fr_1fr] gap-12 pb-6">
      
      {/* Left Column: Client / Received From */}
      <div>
        <div className="flex items-center gap-3 text-[#C1121F] font-bold mb-4">
          <div className="border border-[#C1121F] rounded-full p-1.5 flex items-center justify-center">
            <User size={16} strokeWidth={2} /> 
          </div>
          <span className="uppercase text-black tracking-wide">{type === 'RECEIPT' ? 'RECEIVED FROM' : 'BILL TO'}</span>
        </div>
        
        <div className="grid grid-cols-[130px_1fr] gap-y-3 text-[11px]">
          <div className="flex items-center gap-3 text-[#111111]">
            <User size={14} className="text-zinc-400" strokeWidth={1.5}/> Client Name
          </div>
          <div className="text-black font-medium">: &nbsp;&nbsp;&nbsp;{data.clientName}</div>

          {data.businessName && (
            <>
              <div className="flex items-center gap-3 text-[#111111]">
                <Building2 size={14} className="text-zinc-400" strokeWidth={1.5}/> Business Name
              </div>
              <div className="text-black font-medium">: &nbsp;&nbsp;&nbsp;{data.businessName}</div>
            </>
          )}
          
          <div className="flex items-center gap-3 text-[#111111]">
            <User size={14} className="text-zinc-400" strokeWidth={1.5}/> Contact Person
          </div>
          <div className="text-black font-medium">: &nbsp;&nbsp;&nbsp;{data.clientName}</div>

          {data.clientPhone && (
            <>
              <div className="flex items-center gap-3 text-[#111111]">
                <Phone size={14} className="text-zinc-400" strokeWidth={1.5}/> Phone Number
              </div>
              <div className="text-black font-medium">: &nbsp;&nbsp;&nbsp;{data.clientPhone}</div>
            </>
          )}

          {data.clientEmail && (
            <>
              <div className="flex items-center gap-3 text-[#111111]">
                <Mail size={14} className="text-zinc-400" strokeWidth={1.5}/> Email
              </div>
              <div className="text-black font-medium">: &nbsp;&nbsp;&nbsp;{data.clientEmail}</div>
            </>
          )}

          {(data as any).clientGst && (
            <>
              <div className="flex items-center gap-3 text-[#111111]">
                <User size={14} className="text-zinc-400" strokeWidth={1.5}/> GSTIN
              </div>
              <div className="text-black font-medium">: &nbsp;&nbsp;&nbsp;{(data as any).clientGst}</div>
            </>
          )}

          {data.clientAddress && (
            <>
              <div className="flex items-start gap-3 text-[#111111]">
                <MapPin size={14} className="text-zinc-400 mt-0.5" strokeWidth={1.5}/> Address
              </div>
              <div className="text-black font-medium leading-relaxed">: &nbsp;&nbsp;&nbsp;{data.clientAddress}</div>
            </>
          )}
        </div>
      </div>

      {/* Right Column: Business / Received By (for Receipt/Invoice) OR Project (for Quotation) */}
      <div>
        <div className="flex items-center gap-3 text-[#C1121F] font-bold mb-4">
          <div className="border border-[#C1121F] rounded-full p-1.5 flex items-center justify-center">
            {type === 'QUOTATION' ? <Folder size={16} strokeWidth={2}/> : <Briefcase size={16} strokeWidth={2} />}
          </div>
          <span className="uppercase text-black tracking-wide">{type === 'QUOTATION' ? 'PROJECT INFORMATION' : (type === 'RECEIPT' ? 'RECEIVED BY' : 'FROM')}</span>
        </div>
        
        <div className="grid grid-cols-[130px_1fr] gap-y-3 text-[11px]">
          {type === 'QUOTATION' ? (
            <>
              {data.projectName && (
                <>
                  <div className="flex items-center gap-3 text-[#111111]"><Folder size={14} className="text-zinc-400" strokeWidth={1.5}/> Project Name</div>
                  <div className="text-black font-medium">: &nbsp;&nbsp;&nbsp;{data.projectName}</div>
                </>
              )}
              {data.category && (
                <>
                  <div className="flex items-center gap-3 text-[#111111]"><LayoutGrid size={14} className="text-zinc-400" strokeWidth={1.5}/> Category</div>
                  <div className="text-black font-medium">: &nbsp;&nbsp;&nbsp;{data.category}</div>
                </>
              )}
              {data.shootType && (
                <>
                  <div className="flex items-center gap-3 text-[#111111]"><Camera size={14} className="text-zinc-400" strokeWidth={1.5}/> Shoot Type</div>
                  <div className="text-black font-medium">: &nbsp;&nbsp;&nbsp;{data.shootType}</div>
                </>
              )}
              {data.location && (
                <>
                  <div className="flex items-center gap-3 text-[#111111]"><Map size={14} className="text-zinc-400" strokeWidth={1.5}/> Location</div>
                  <div className="text-black font-medium">: &nbsp;&nbsp;&nbsp;{data.location}</div>
                </>
              )}
              {data.shootDate && (
                <>
                  <div className="flex items-center gap-3 text-[#111111]"><Calendar size={14} className="text-zinc-400" strokeWidth={1.5}/> Shoot Date</div>
                  <div className="text-black font-medium">: &nbsp;&nbsp;&nbsp;{format(data.shootDate, "dd/MM/yyyy")}</div>
                </>
              )}
              {data.deliveryTimeline && (
                <>
                  <div className="flex items-center gap-3 text-[#111111]"><Clock size={14} className="text-zinc-400" strokeWidth={1.5}/> Delivery</div>
                  <div className="text-black font-medium">: &nbsp;&nbsp;&nbsp;{data.deliveryTimeline}</div>
                </>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 text-[#111111]">
                <Building2 size={14} className="text-zinc-400" strokeWidth={1.5}/> Business Name
              </div>
              <div className="text-black font-medium">: &nbsp;&nbsp;&nbsp;{companyInfo.businessName || "Random Frames"}</div>
              
              <div className="flex items-center gap-3 text-[#111111]">
                <User size={14} className="text-zinc-400" strokeWidth={1.5}/> Contact Person
              </div>
              <div className="text-black font-medium">: &nbsp;&nbsp;&nbsp;{companyInfo.ownerName || "Savan Somaiah T P"}</div>
              
              <div className="flex items-center gap-3 text-[#111111]">
                <Phone size={14} className="text-zinc-400" strokeWidth={1.5}/> Phone Number
              </div>
              <div className="text-black font-medium">: &nbsp;&nbsp;&nbsp;{companyInfo.phone || "8073080077"}</div>
              
              <div className="flex items-center gap-3 text-[#111111]">
                <Mail size={14} className="text-zinc-400" strokeWidth={1.5}/> Email
              </div>
              <div className="text-black font-medium">: &nbsp;&nbsp;&nbsp;{companyInfo.email || "frames.random.7@gmail.com"}</div>
              
              <div className="flex items-start gap-3 text-[#111111]">
                <MapPin size={14} className="text-zinc-400 mt-0.5" strokeWidth={1.5}/> Address
              </div>
              <div className="text-black font-medium leading-relaxed">: &nbsp;&nbsp;&nbsp;{companyInfo.address || "Bangalore, India"}</div>
            </>
          )}
        </div>
      </div>

    </div>
  );
};
