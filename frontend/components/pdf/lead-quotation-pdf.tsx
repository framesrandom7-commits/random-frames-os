import React from "react";
import { Document, View, Text, StyleSheet } from "@react-pdf/renderer";
import { Prisma } from "@prisma/client";
import { PDFLayout, theme } from "./shared/PDFLayout";
import { PDFIcons } from "./shared/PDFIcons";
import { PDFSectionTitle, PDFInfoRow, PDFTable } from "./shared/PDFComponents";

type Lead = Prisma.LeadGetPayload<{}>;

const styles = StyleSheet.create({
  summarySection: {
    flexDirection: "row",
    marginTop: 15,
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
    marginTop: 15,
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
    marginTop: 10,
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
    marginBottom: 15,
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
    height: 6,
  }
});

interface LeadQuotationPDFProps {
  lead: Lead;
}

export function LeadQuotationPDF({ lead }: LeadQuotationPDFProps) {
  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const budget = lead.budget ? Number(lead.budget) : 0;
  const quoteNumber = `EST-${lead.id.substring(0, 6).toUpperCase()}`;

  const issueDate = new Date();
  const validUntil = new Date();
  validUntil.setDate(validUntil.getDate() + 14);

  const metaInfo = [
    { icon: <PDFIcons.Document size={12} />, label: "Quotation No.", value: quoteNumber },
    { icon: <PDFIcons.Calendar size={12} />, label: "Issue Date", value: formatDate(issueDate) },
    { icon: <PDFIcons.Calendar size={12} />, label: "Valid Until", value: formatDate(validUntil) },
    { icon: <PDFIcons.Tag size={12} />, label: "Status", value: "DRAFT", isStatus: true, statusColor: theme.colors.primary },
  ];

  const tableItems = [
    {
      service: lead.serviceInterested || "Professional Services (Estimated)",
      qty: "1",
      unit: "Service",
      rate: budget.toLocaleString('en-IN'),
      amount: budget.toLocaleString('en-IN')
    }
  ];

  return (
    <Document>
      <PDFLayout documentTitle="QUOTATION" metaInfo={metaInfo}>
        
        {/* Client & Project Info */}
        <View style={{ flexDirection: "row", gap: 30 }}>
          <View style={{ flex: 1 }}>
            <PDFSectionTitle icon={<PDFIcons.UserRed />} title="CLIENT INFORMATION" />
            <PDFInfoRow icon={<PDFIcons.UserGray />} label="Client Name" value={lead.contactPerson || "-"} />
            <PDFInfoRow icon={<PDFIcons.BuildingGray />} label="Business Name" value={lead.businessName || "-"} />
            <PDFInfoRow icon={<PDFIcons.UserGray />} label="Contact Person" value={lead.contactPerson || "-"} />
            <PDFInfoRow icon={<PDFIcons.PhoneGray />} label="Phone Number" value={lead.phone || "-"} />
            <PDFInfoRow icon={<PDFIcons.EmailGray />} label="Email" value={lead.email || "-"} />
            <PDFInfoRow icon={<PDFIcons.BadgeGray />} label="GSTIN (Optional)" value="-" />
            <PDFInfoRow icon={<PDFIcons.MapPinGray />} label="Address" value={[lead.city, lead.state, lead.country].filter(Boolean).join(", ")} />
          </View>
          <View style={{ flex: 1 }}>
            <PDFSectionTitle icon={<PDFIcons.BriefcaseRed />} title="PROJECT INFORMATION" />
            <PDFInfoRow icon={<PDFIcons.FolderGray />} label="Project Name" value={`Estimate for ${lead.businessName || "Client"}`} />
            <PDFInfoRow icon={<PDFIcons.GridGray />} label="Category" value="-" />
            <PDFInfoRow icon={<PDFIcons.CameraGray />} label="Shoot Type" value={lead.serviceInterested || "-"} />
            <PDFInfoRow icon={<PDFIcons.MapPinGray />} label="Location" value={lead.city || "-"} />
            <PDFInfoRow icon={<PDFIcons.CalendarGray />} label="Shoot Date" value="To be decided" />
            <PDFInfoRow icon={<PDFIcons.ClockGray />} label="Delivery Timeline" value="-" />
          </View>
        </View>

        {/* Services & Pricing */}
        <View style={{ marginTop: 10 }}>
          <PDFSectionTitle icon={<PDFIcons.DocumentRed />} title="SERVICES & PRICING" />
          <PDFTable items={tableItems} />
        </View>

        {/* Deliverables & Summary */}
        <View style={{ flexDirection: "row", marginTop: 10, gap: 20 }}>
          <View style={styles.deliverablesCol}>
            <PDFSectionTitle icon={<PDFIcons.CheckCircleRed />} title="DELIVERABLES" />
            <View style={styles.deliverableRow}>
              <PDFIcons.CheckRed />
              <Text style={styles.deliverableText}>High-resolution edited photographs</Text>
            </View>
            <View style={styles.deliverableRow}>
              <PDFIcons.CheckRed />
              <Text style={styles.deliverableText}>Web-optimized files</Text>
            </View>
            <View style={styles.deliverableRow}>
              <PDFIcons.CheckRed />
              <Text style={styles.deliverableText}>Commercial usage rights</Text>
            </View>
          </View>
          
          <View style={styles.summaryCol}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>₹ {budget.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>- ₹ 0</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (If Applicable)</Text>
              <Text style={styles.summaryValue}>₹ 0</Text>
            </View>
            <View style={styles.grandTotalBox}>
              <Text style={styles.grandTotalLabel}>GRAND TOTAL</Text>
              <Text style={styles.grandTotalValue}>₹ {budget.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </View>

        {/* Footer Areas */}
        <View style={{ flexDirection: "row", marginTop: 10, gap: 20 }}>
          <View style={styles.bottomCol}>
            <PDFSectionTitle icon={<PDFIcons.DocumentRed />} title="TERMS & CONDITIONS" />
            <View style={styles.termsText}>
              <PDFIcons.DotRed />
              <Text>50% advance to confirm booking.</Text>
            </View>
            <View style={styles.termsText}>
              <PDFIcons.DotRed />
              <Text>Raw footage will be retained for 7 days from the date of delivery.</Text>
            </View>
            <View style={styles.termsText}>
              <PDFIcons.DotRed />
              <Text>Cancellation after confirmation may incur charges.</Text>
            </View>
            <View style={styles.termsText}>
              <PDFIcons.DotRed />
              <Text>Quotation is valid for 14 days from the date of issue.</Text>
            </View>
            
            <View style={styles.thankYouBox}>
              <PDFIcons.Logo width={30} height={30} opacity={1} />
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
            <View style={styles.notesLine} />
            <View style={styles.notesLine} />
          </View>
        </View>

      </PDFLayout>
    </Document>
  );
}
