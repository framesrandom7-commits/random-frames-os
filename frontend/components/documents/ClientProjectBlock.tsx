import React from "react";
import { DocumentData, DocumentType, CompanySettings } from "./types";
import { User, Briefcase, Phone, Mail, MapPin, Building2, Folder, LayoutGrid, Camera, Map, Calendar, Clock } from "lucide-react";

export const ClientProjectBlock: React.FC<{
  type: DocumentType;
  data: DocumentData;
  companyInfo: CompanySettings;
}> = ({ type, data, companyInfo }) => {
  return (
    <div className="grid grid-cols-2 gap-8 border-b border-[#E6E6E6] pb-6">
      
      {/* Left Column: Client / Received From */}
      <div>
        <div className="flex items-center gap-2 text-[#C1121F] font-bold mb-4 border-b border-[#E6E6E6] pb-2">
          <User size={18} /> 
          <span className="uppercase">{type === 'RECEIPT' ? 'RECEIVED FROM' : 'CLIENT INFORMATION'}</span>
        </div>
        
        <div className="grid grid-cols-[120px_1fr] gap-y-3 text-sm">
          <div className="flex items-center gap-2 text-zinc-500"><User size={16}/> Client Name</div>
          <div className="font-medium">: {data.clientName}</div>

          {data.businessName && (
            <>
              <div className="flex items-center gap-2 text-zinc-500"><Building2 size={16}/> Business Name</div>
              <div className="font-medium">: {data.businessName}</div>
            </>
          )}

          {data.clientPhone && (
            <>
              <div className="flex items-center gap-2 text-zinc-500"><Phone size={16}/> Phone Number</div>
              <div className="font-medium">: {data.clientPhone}</div>
            </>
          )}

          {data.clientEmail && (
            <>
              <div className="flex items-center gap-2 text-zinc-500"><Mail size={16}/> Email</div>
              <div className="font-medium">: {data.clientEmail}</div>
            </>
          )}

          {data.clientAddress && (
            <>
              <div className="flex items-start gap-2 text-zinc-500 mt-1"><MapPin size={16}/> Address</div>
              <div className="font-medium mt-1 leading-relaxed">: {data.clientAddress}</div>
            </>
          )}
        </div>
      </div>

      {/* Right Column: Business / Received By (for Receipt/Invoice) OR Project (for Quotation) */}
      <div>
        <div className="flex items-center gap-2 text-[#C1121F] font-bold mb-4 border-b border-[#E6E6E6] pb-2">
          <Briefcase size={18} /> 
          <span className="uppercase">{type === 'QUOTATION' ? 'PROJECT INFORMATION' : (type === 'RECEIPT' ? 'RECEIVED BY' : 'FROM')}</span>
        </div>
        
        <div className="grid grid-cols-[120px_1fr] gap-y-3 text-sm">
          {type === 'QUOTATION' ? (
            <>
              {data.projectName && (
                <>
                  <div className="flex items-center gap-2 text-zinc-500"><Folder size={16}/> Project Name</div>
                  <div className="font-medium">: {data.projectName}</div>
                </>
              )}
              {data.category && (
                <>
                  <div className="flex items-center gap-2 text-zinc-500"><LayoutGrid size={16}/> Category</div>
                  <div className="font-medium">: {data.category}</div>
                </>
              )}
              {data.shootType && (
                <>
                  <div className="flex items-center gap-2 text-zinc-500"><Camera size={16}/> Shoot Type</div>
                  <div className="font-medium">: {data.shootType}</div>
                </>
              )}
              {data.location && (
                <>
                  <div className="flex items-center gap-2 text-zinc-500"><Map size={16}/> Location</div>
                  <div className="font-medium">: {data.location}</div>
                </>
              )}
              {data.shootDate && (
                <>
                  <div className="flex items-center gap-2 text-zinc-500"><Calendar size={16}/> Shoot Date</div>
                  <div className="font-medium">: {format(data.shootDate, "dd MMM yyyy")}</div>
                </>
              )}
              {data.deliveryTimeline && (
                <>
                  <div className="flex items-center gap-2 text-zinc-500"><Clock size={16}/> Delivery</div>
                  <div className="font-medium">: {data.deliveryTimeline}</div>
                </>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-zinc-500"><Building2 size={16}/> Business Name</div>
              <div className="font-medium">: {companyInfo.businessName}</div>
              
              <div className="flex items-center gap-2 text-zinc-500"><User size={16}/> Owner</div>
              <div className="font-medium">: {companyInfo.ownerName}</div>
              
              <div className="flex items-center gap-2 text-zinc-500"><Phone size={16}/> Phone Number</div>
              <div className="font-medium">: {companyInfo.phone}</div>
              
              <div className="flex items-center gap-2 text-zinc-500"><Mail size={16}/> Email</div>
              <div className="font-medium">: {companyInfo.email}</div>
              
              <div className="flex items-start gap-2 text-zinc-500 mt-1"><MapPin size={16}/> Address</div>
              <div className="font-medium mt-1 leading-relaxed">: {companyInfo.address}</div>
            </>
          )}
        </div>
      </div>

    </div>
  );
};
