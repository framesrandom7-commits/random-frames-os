import React from "react";
import { Document, View, Text, StyleSheet } from "@react-pdf/renderer";
import { Prisma } from "@prisma/client";
import { PDFLayout, theme } from "./shared/PDFLayout";
import { PDFIcons } from "./shared/PDFIcons";
import { PDFSectionTitle, PDFInfoRow, PDFTable } from "./shared/PDFComponents";

type QuotationWithRelations = Prisma.QuotationGetPayload<{
  include: { client: true; project: true; items: true }
}>;

const styles = StyleSheet.create({
  summarySection: {
    flexDirection: "row",
    marginTop: 20,
    gap: 20,
  },
  deliverablesCol: {
    flex: 1,
    paddingTop: 10,
  },
  deliverableRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  deliverableText: {
    fontSize: 9,
    color: theme.colors.textDark,
  },
  summaryCol: {
    width: "45%",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 15,
    paddingBottom: 0,
    borderWidth: 1,
    borderColor: theme.colors.grayBorder,
    overflow: "hidden"
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 9,
    color: theme.colors.textDark,
  },
  summaryValue: {
    fontSize: 9,
    color: theme.colors.textDark,
    fontWeight: 600,
  },
  grandTotalBox: {
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 20px",
    marginHorizontal: -15,
    marginBottom: 0,
  },
  grandTotalLabel: {
    color: theme.colors.white,
    fontSize: 12,
    fontWeight: 700,
  },
  grandTotalValue: {
    color: theme.colors.white,
    fontSize: 14,
    fontWeight: 700,
  },
  bottomSection: {
    flexDirection: "row",
    marginTop: 30,
    gap: 20,
  },
  bottomCol: {
    flex: 1,
  },
  termsText: {
    fontSize: 8,
    color: theme.colors.textLight,
    lineHeight: 1.5,
    marginBottom: 6,
    flexDirection: "row",
    gap: 6,
  },
  thankYouBox: {
    marginTop: 20,
    flexDirection: "row",
    gap: 10,
    alignItems: "center"
  },
  thankYouTextCol: {
    flex: 1,
  },
  thankYouTitle: {
    color: theme.colors.primary,
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 2,
  },
  thankYouDesc: {
    fontSize: 7,
    color: theme.colors.textLight,
  },
  dottedLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
    borderBottomStyle: "dashed",
    flex: 1,
  },
  signatureRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginBottom: 20,
  },
  signatureLabel: {
    fontSize: 8,
    color: theme.colors.textDark,
    width: 60,
  },
  notesLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
    borderBottomStyle: "dashed",
    marginBottom: 15,
    height: 10,
  }
});

interface QuotationPDFProps {
  quotation: QuotationWithRelations;
  companyInfo?: {
    businessName: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    gstin?: string;
  };
  invoiceLogo?: string;
  currency?: string;
  taxPercentage?: string;
  invoiceFooterNotes?: string;
}

export function QuotationPDF({ quotation, companyInfo, invoiceLogo, currency = "INR", taxPercentage = "0", invoiceFooterNotes }: QuotationPDFProps) {
  const { client, project, items } = quotation;

  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const metaInfo = [
    { icon: <PDFIcons.Document size={12} />, label: "Quotation No.", value: quotation.quotationNumber },
    { icon: <PDFIcons.Calendar size={12} />, label: "Issue Date", value: formatDate(quotation.issueDate) },
    { icon: <PDFIcons.Calendar size={12} />, label: "Valid Until", value: formatDate(quotation.validUntil) },
    { icon: <PDFIcons.Tag size={12} />, label: "Status", value: quotation.status, isStatus: true, statusColor: quotation.status === 'ACCEPTED' ? '#10B981' : theme.colors.primary },
  ];

  const currencySymbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₹";

  const tableItems = items && items.length > 0 ? items.map(item => ({
    service: item.description,
    qty: item.quantity || 1,
    unit: "Unit",
    rate: Number(item.unitPrice || item.total).toLocaleString('en-US'),
    amount: Number(item.total).toLocaleString('en-US')
  })) : [
    {
      service: project?.title || "Professional Services",
      qty: "1",
      unit: "Service",
      rate: Number(quotation.subtotal).toLocaleString('en-US'),
      amount: Number(quotation.subtotal).toLocaleString('en-US')
    }
  ];

  const parsedDeliverables = quotation.deliverables ? (typeof quotation.deliverables === 'string' ? JSON.parse(quotation.deliverables as string) : quotation.deliverables) : [];
  const deliverablesList = Array.isArray(parsedDeliverables) && parsedDeliverables.length > 0 
    ? parsedDeliverables 
    : ["High-resolution edited photographs", "Web-optimized files", "Commercial usage rights"];

  return (
    <Document>
      <PDFLayout documentTitle="QUOTATION" metaInfo={metaInfo} companyInfo={companyInfo} invoiceLogo={invoiceLogo}>
        
        {/* Client & Project Info */}
        <View style={{ flexDirection: "row", gap: 30 }}>
          <View style={{ flex: 1 }}>
            <PDFSectionTitle icon={<PDFIcons.UserRed />} title="CLIENT INFORMATION" />
            <PDFInfoRow icon={<PDFIcons.UserGray />} label="Client Name" value={client?.contactPerson || client?.businessName || "-"} />
            <PDFInfoRow icon={<PDFIcons.BuildingGray />} label="Business Name" value={client?.businessName || "-"} />
            <PDFInfoRow icon={<PDFIcons.UserGray />} label="Contact Person" value={client?.contactPerson || "-"} />
            <PDFInfoRow icon={<PDFIcons.PhoneGray />} label="Phone Number" value={client?.phone || "-"} />
            <PDFInfoRow icon={<PDFIcons.EmailGray />} label="Email" value={client?.email || "-"} />
            <PDFInfoRow icon={<PDFIcons.BadgeGray />} label="GSTIN (Optional)" value="-" />
            <PDFInfoRow icon={<PDFIcons.MapPinGray />} label="Address" value={client?.city || "-"} />
          </View>
          <View style={{ flex: 1 }}>
            <PDFSectionTitle icon={<PDFIcons.BriefcaseRed />} title="PROJECT INFORMATION" />
            <PDFInfoRow icon={<PDFIcons.FolderGray />} label="Project Name" value={project?.title || "-"} />
            <PDFInfoRow icon={<PDFIcons.GridGray />} label="Category" value={project?.type || "-"} />
            <PDFInfoRow icon={<PDFIcons.CameraGray />} label="Shoot Type" value={project?.status || "-"} />
            <PDFInfoRow icon={<PDFIcons.MapPinGray />} label="Location" value={project?.location || "-"} />
            <PDFInfoRow icon={<PDFIcons.CalendarGray />} label="Shoot Date" value={project?.date ? formatDate(project.date) : "-"} />
            <PDFInfoRow icon={<PDFIcons.ClockGray />} label="Delivery Timeline" value="-" />
          </View>
        </View>

        {/* Services & Pricing */}
        <View style={{ marginTop: 20 }}>
          <PDFSectionTitle icon={<PDFIcons.DocumentRed />} title="SERVICES & PRICING" />
          <PDFTable items={tableItems} />
        </View>

        {/* Deliverables & Summary */}
        <View style={styles.summarySection}>
          <View style={styles.deliverablesCol}>
            <PDFSectionTitle icon={<PDFIcons.CheckCircleRed />} title="DELIVERABLES" />
            {deliverablesList.map((item: string, idx: number) => (
              <View key={idx} style={styles.deliverableRow}>
                <PDFIcons.CheckRed />
                <Text style={styles.deliverableText}>{item}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.summaryCol}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{currencySymbol} {Number(quotation.subtotal).toLocaleString('en-US')}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>- {currencySymbol} {Number(quotation.discount || 0).toLocaleString('en-US')}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax ({taxPercentage}%)</Text>
              <Text style={styles.summaryValue}>{currencySymbol} {Number(quotation.tax || 0).toLocaleString('en-US')}</Text>
            </View>
            <View style={styles.grandTotalBox}>
              <Text style={styles.grandTotalLabel}>GRAND TOTAL</Text>
              <Text style={styles.grandTotalValue}>{currencySymbol} {Number(quotation.total).toLocaleString('en-US')}</Text>
            </View>
          </View>
        </View>

        {/* Footer Areas */}
        <View style={styles.bottomSection}>
          <View style={styles.bottomCol}>
            <PDFSectionTitle icon={<PDFIcons.DocumentRed />} title="TERMS & CONDITIONS" />
            {(quotation.termsAndConditions || invoiceFooterNotes || "50% advance to confirm booking.\nCancellation after confirmation may incur charges.\nQuotation is valid for 7 days from the date of issue.").split('\n').map((term, idx) => (
               <View key={idx} style={styles.termsText}>
                 <PDFIcons.DotRed />
                 <Text>{term}</Text>
               </View>
            ))}
            
            <View style={styles.thankYouBox}>
              <PDFIcons.Logo width={30} height={30} />
              <View style={styles.thankYouTextCol}>
                <Text style={styles.thankYouTitle}>THANK YOU!</Text>
                <Text style={styles.thankYouDesc}>Thank you for considering Random Frames. We look forward to working with you.</Text>
              </View>
            </View>
          </View>

          <View style={styles.bottomCol}>
            <PDFSectionTitle icon={<PDFIcons.PenRed />} title="ACCEPTANCE" />
            <View style={styles.signatureRow}>
              <Text style={styles.signatureLabel}>Client Name</Text>
              <Text>:</Text>
              <View style={styles.dottedLine} />
            </View>
            <View style={styles.signatureRow}>
              <Text style={styles.signatureLabel}>Signature</Text>
              <Text>:</Text>
              <View style={styles.dottedLine} />
            </View>
            <View style={styles.signatureRow}>
              <Text style={styles.signatureLabel}>Date</Text>
              <Text>:</Text>
              <View style={styles.dottedLine} />
            </View>
          </View>

          <View style={styles.bottomCol}>
            <PDFSectionTitle icon={<PDFIcons.DocumentRed />} title="NOTES" />
            <Text style={{ fontSize: 8, color: theme.colors.textLight, marginBottom: 10 }}>{quotation.notes || ""}</Text>
            <View style={styles.notesLine} />
            <View style={styles.notesLine} />
            <View style={styles.notesLine} />
          </View>
        </View>

      </PDFLayout>
    </Document>
  );
}
