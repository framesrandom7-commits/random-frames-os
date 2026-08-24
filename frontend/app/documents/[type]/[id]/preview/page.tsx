import React from "react";
import { DocumentEngine } from "@/components/documents/DocumentEngine";
import { DocumentService } from "@/domain/document/service";
import { DocumentType } from "@/components/documents/types";
import { notFound } from "next/navigation";

export default async function DocumentPreviewPage(props: {
  params: Promise<{ type: string; id: string }>
}) {
  const params = await props.params;
  const { type, id } = params;
  
  const validTypes = ["quotation", "invoice", "receipt"];
  if (!validTypes.includes(type.toLowerCase())) {
    notFound();
  }

  let documentData;
  let docType: DocumentType;

  try {
    docType = type.toUpperCase() as DocumentType;
    documentData = await DocumentService.getDocumentData(docType, id);
  } catch (error) {
    console.error("Error loading document:", error);
    return (
      <div className="flex items-center justify-center h-screen text-red-500 font-bold">
        Error loading document.
      </div>
    );
  }

  return (
    <div className="bg-[#E6E6E6] min-h-screen py-8 print:py-0 print:bg-white flex items-center justify-center">
      <DocumentEngine 
        type={docType}
        data={documentData.data}
        companyInfo={documentData.companyInfo}
        paymentInfo={documentData.paymentInfo}
      />
    </div>
  );
}
