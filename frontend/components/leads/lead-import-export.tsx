"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload, Loader2 } from "lucide-react";
import Papa from "papaparse";
import { importLeads, LeadListWithRelations } from "@/app/actions/lead";
import { toast } from "sonner";
import { LeadStatus, LeadPriority, LeadSource, BusinessType } from "@prisma/client";
import { LeadFormData } from "@/lib/validations/lead";

interface LeadImportExportProps {
  leads: LeadListWithRelations[];
}

export default function LeadImportExport({ leads }: LeadImportExportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    if (leads.length === 0) {
      toast.info("No leads to export.");
      return;
    }

    const csvData = leads.map(lead => ({
      BusinessName: lead.businessName,
      ContactPerson: lead.contactPerson || "",
      Phone: lead.phone || "",
      Email: lead.email || "",
      "Status": lead.status,
      Priority: lead.priority,
      Source: lead.leadSource,
      Budget: lead.budget ? lead.budget.toString() : "",
      Address: lead.address || "",
      City: lead.city || "",
      State: lead.state || "",
      Country: lead.country || "",
      PostalCode: lead.postalCode || "",
      CreatedAt: lead.createdAt.toISOString(),
    }));

    const csv = Papa.unparse(csvData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `leads_export_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsImporting(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const importedData: LeadFormData[] = results.data.map((rawRow: unknown) => {
            const row = rawRow as Record<string, string>;
            return {
            businessName: row.BusinessName || "Unknown Business",
            contactPerson: row.ContactPerson || null,
            phone: row.Phone || null,
            email: row.Email || null,
            status: Object.values(LeadStatus).includes(row.Status as LeadStatus) ? row.Status as LeadStatus : LeadStatus.NEW,
            priority: Object.values(LeadPriority).includes(row.Priority as LeadPriority) ? row.Priority as LeadPriority : LeadPriority.MEDIUM,
            leadSource: Object.values(LeadSource).includes(row.Source as LeadSource) ? row.Source as LeadSource : LeadSource.OTHER,
            businessType: BusinessType.OTHER,
            budget: row.Budget ? parseFloat(row.Budget) : null,
            currency: "USD",
            address: row.Address || null,
            city: row.City || null,
            state: row.State || null,
            country: row.Country || null,
            postalCode: row.PostalCode || null,
            leadScore: 0,
            tags: [],
            };
          });

          const success = await importLeads(importedData);
          if (success) {
            toast.success(`Successfully imported ${importedData.length} leads.`);
          } else {
            toast.error("Failed to import leads. Check format.");
          }
        } catch (error) {
          console.error(error);
          toast.error("An error occurred during import.");
        } finally {
          setIsImporting(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      },
      error: (error) => {
        console.error(error);
        toast.error("Failed to parse CSV file.");
        setIsImporting(false);
      }
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => fileInputRef.current?.click()}
        disabled={isImporting}
        className="bg-zinc-900 border-white/10 text-white hover:bg-white/10"
      >
        {isImporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
        Import CSV
      </Button>
      <input 
        type="file" 
        accept=".csv" 
        className="hidden" 
        ref={fileInputRef} 
        onChange={handleImport} 
      />
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleExport}
        className="bg-zinc-900 border-white/10 text-white hover:bg-white/10"
      >
        <Download className="h-4 w-4 mr-2" />
        Export CSV
      </Button>
    </div>
  );
}
