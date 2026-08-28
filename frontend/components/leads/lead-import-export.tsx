"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Upload, Loader2, FileUp } from "lucide-react";
import Papa from "papaparse";
import { importLeads, LeadListWithRelations } from "@/app/actions/lead";
import { toast } from "sonner";
import { LeadStatus, LeadPriority, LeadSource, BusinessType, OutreachChannel, CreationType } from "@prisma/client";
import { LeadFormData } from "@/lib/validations/lead";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface LeadImportExportProps {
  leads: LeadListWithRelations[];
}

export default function LeadImportExport({ leads }: LeadImportExportProps) {
  const [isImporting, setIsImporting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      if (leads.length === 0) {
        toast.info("No leads to export.");
        return;
      }

      const csvData = leads.map(lead => ({
        BusinessName: lead.businessName || "",
        ContactPerson: lead.contactPerson || "",
        Phone: lead.phone || "",
        WhatsApp: lead.whatsapp || "",
        Email: lead.email || "",
        Instagram: lead.instagram || "",
        Website: lead.website || "",
        Status: lead.status || "",
        Priority: lead.priority || "",
        Source: lead.leadSource || "",
        OutreachChannel: lead.outreachChannel || "",
        CreationType: lead.creationType || "",
        Budget: lead.budget ? String(lead.budget) : "",
        Address: lead.address || "",
        City: lead.city || "",
        State: lead.state || "",
        Country: lead.country || "",
        PostalCode: lead.postalCode || "",
        CreatedAt: lead.createdAt ? new Date(lead.createdAt).toISOString() : "",
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
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export leads.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const executeImport = () => {
    if (!selectedFile) {
      toast.error("Please select a file first.");
      return;
    }

    setIsImporting(true);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const importedData: LeadFormData[] = results.data.map((rawRow: unknown) => {
            const row = rawRow as Record<string, string>;
            return {
              businessName: row.BusinessName || "Unknown Business",
              contactPerson: row.ContactPerson || "Unknown Contact",
              phone: row.Phone || "0000000000",
              whatsapp: row.WhatsApp || null,
              email: row.Email || "",
              instagram: row.Instagram || null,
              website: row.Website || null,
              status: LeadStatus.NEW,
              priority: LeadPriority.MEDIUM,
              leadSource: LeadSource.OTHER,
              creationType: CreationType.MANUAL,
              businessType: BusinessType.OTHER,
              budget: row.Budget ? parseFloat(row.Budget) : null,
              currency: "INR",
              address: row.Address || null,
              city: row.City || null,
              state: row.State || null,
              country: row.Country || null,
              postalCode: row.PostalCode || null,
              leadScore: 0,
              tags: [],
            };
          });

          const response = await importLeads(importedData);
          if (response.success) {
            const added = response.count || 0;
            const skipped = importedData.length - added;
            
            if (skipped > 0) {
              toast.success(`Imported ${added} new leads. Skipped ${skipped} duplicates.`);
            } else {
              toast.success(`Successfully imported all ${added} leads.`);
            }
            setIsDialogOpen(false);
          } else {
            toast.error("Failed to import leads. Check format.");
          }
        } catch (error) {
          console.error(error);
          toast.error("An error occurred during import.");
        } finally {
          setIsImporting(false);
          setSelectedFile(null);
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
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-zinc-900 border-white/10 text-white hover:bg-white/10"
          >
            <Download className="h-4 w-4 mr-2" />
            Import CSV
          </Button>
        </DialogTrigger>
        <DialogContent className="bg-[#121212] border-white/10 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Bulk Import Leads</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Upload a CSV file of leads. Select the default source and channel for this batch.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>CSV File</Label>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-zinc-900 border-white/10 text-zinc-300 w-full flex justify-start"
                >
                  <FileUp className="h-4 w-4 mr-2" />
                  {selectedFile ? selectedFile.name : "Select CSV File"}
                </Button>
                <input 
                  type="file" 
                  accept=".csv" 
                  className="hidden" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDialogOpen(false)}
              className="bg-transparent border-white/10 text-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={executeImport} 
              disabled={!selectedFile || isImporting}
              className="bg-[#C1121F] hover:bg-[#A00F19] text-white"
            >
              {isImporting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              {isImporting ? "Importing..." : "Upload & Import"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleExport}
        className="bg-zinc-900 border-white/10 text-white hover:bg-white/10"
      >
        <Upload className="h-4 w-4 mr-2" />
        Export CSV
      </Button>
    </div>
  );
}
