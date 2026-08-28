import React from "react";
import { Document, View, Text, StyleSheet, Image } from "@react-pdf/renderer";
import { Prisma } from "@prisma/client";
import { PDFLayout, theme } from "./shared/PDFLayout";
import { PDFIcons } from "./shared/PDFIcons";
import { PDFSectionTitle, PDFInfoRow, PDFTable } from "./shared/PDFComponents";

type InvoiceWithRelations = Prisma.InvoiceGetPayload<{
  include: { project: { include: { client: true } }; items: true }
}>;

const styles = StyleSheet.create({
  summarySection: {
    flexDirection: "row",
    marginTop: 15,
    gap: 15,
  },
  paymentInfoCol: {
    flex: 1,
  },
  paymentInfoBox: {
    marginTop: 8,
  },
  summaryCol: {
    width: "45%",
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 10,
    paddingBottom: 0,
    borderWidth: 1,
    borderColor: theme.colors.grayBorder,
    overflow: "hidden"
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
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
    padding: "10px 15px",
    marginHorizontal: -10,
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
    gap: 15,
  },
  bottomCol: {
    flex: 1,
  },
  termsText: {
    fontSize: 8,
    color: theme.colors.textLight,
    lineHeight: 1.4,
    marginBottom: 4,
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
    marginBottom: 10,
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
    marginBottom: 10,
    height: 10,
  }
});

interface InvoicePDFProps {
  invoice: any;
  companyInfo?: {
    businessName: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    gstin?: string;
  };
  paymentInfo?: {
    acceptUpi: boolean;
    upiId: string;
    upiQrUrl?: string;
    acceptBankTransfer: boolean;
    bankName: string;
    accountHolder: string;
    accountNumber: string;
    ifscCode: string;
  };
  invoiceLogo?: string;
  currency?: string;
  taxPercentage?: string;
  invoiceFooterNotes?: string;
}

export function InvoicePDF({ invoice, companyInfo, paymentInfo: defaultPaymentInfo, invoiceLogo, currency = "INR", taxPercentage = "0", invoiceFooterNotes }: InvoicePDFProps) {
  const { project, items } = invoice;
  const client = project?.client;
  const paymentInfo = invoice.paymentSnapshot || defaultPaymentInfo;

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const isPaid = invoice.status === "PAID";
  const statusColor = isPaid ? "#10B981" : theme.colors.primary;

  const metaInfo = [
    { icon: <PDFIcons.Document size={12} />, label: "Invoice No.", value: invoice.invoiceNumber || "-" },
    { icon: <PDFIcons.Calendar size={12} />, label: "Issue Date", value: formatDate(invoice.issueDate) },
    { icon: <PDFIcons.Calendar size={12} />, label: "Due Date", value: formatDate(invoice.dueDate) },
    { icon: <PDFIcons.Tag size={12} />, label: "Status", value: invoice.status || "DRAFT", isStatus: true, statusColor },
  ];

  const currencySymbol = currency === "USD" ? "$" : currency === "EUR" ? "€" : "₹";

  const tableItems = items && items.length > 0 ? items.map((item: any) => ({
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
      rate: Number(invoice.subtotal).toLocaleString('en-US'),
      amount: Number(invoice.subtotal).toLocaleString('en-US')
    }
  ];

  return (
    <Document>
      <PDFLayout documentTitle="INVOICE" metaInfo={metaInfo} companyInfo={companyInfo} invoiceLogo={invoiceLogo}>
        
        {/* Bill To & From Info */}
        <View style={{ flexDirection: "row", gap: 30 }}>
          <View style={{ flex: 1 }}>
            <PDFSectionTitle icon={<PDFIcons.UserRed />} title="BILL TO" />
            <PDFInfoRow icon={<PDFIcons.UserGray />} label="Client Name" value={client?.contactPerson || client?.businessName || "-"} />
            <PDFInfoRow icon={<PDFIcons.BuildingGray />} label="Business Name" value={client?.businessName || "-"} />
            <PDFInfoRow icon={<PDFIcons.UserGray />} label="Contact Person" value={client?.contactPerson || "-"} />
            <PDFInfoRow icon={<PDFIcons.PhoneGray />} label="Phone Number" value={client?.phone || "-"} />
            <PDFInfoRow icon={<PDFIcons.EmailGray />} label="Email" value={client?.email || "-"} />
            <PDFInfoRow icon={<PDFIcons.BadgeGray />} label="GSTIN (Optional)" value={client?.gstNumber || "-"} />
            <PDFInfoRow icon={<PDFIcons.MapPinGray />} label="Address" value={client?.address || client?.city || "-"} />
          </View>
          <View style={{ flex: 1 }}>
            <PDFSectionTitle icon={<PDFIcons.BriefcaseRed />} title="FROM" />
            <PDFInfoRow icon={<PDFIcons.BuildingGray />} label="Business Name" value={companyInfo?.businessName || "Random Frames"} />
            <PDFInfoRow icon={<PDFIcons.UserGray />} label="Contact Person" value={companyInfo?.businessName === "Random Frames" ? "Savan Somaiah T P" : companyInfo?.businessName || "Savan Somaiah T P"} />
            <PDFInfoRow icon={<PDFIcons.PhoneGray />} label="Phone Number" value={companyInfo?.phone || "8073080077"} />
            <PDFInfoRow icon={<PDFIcons.EmailGray />} label="Email" value={companyInfo?.email || "frames.random.7@gmail.com"} />
            <PDFInfoRow icon={<PDFIcons.MapPinGray />} label="Address" value={companyInfo?.address || "Bangalore | Coorg, India"} />
          </View>
        </View>

        {/* Services & Pricing */}
        <View style={{ marginTop: 20 }}>
          <PDFSectionTitle icon={<PDFIcons.DocumentRed />} title="SERVICES & PRICING" />
          <PDFTable items={tableItems} />
        </View>

        {/* Payment Info & Summary */}
        <View style={styles.summarySection}>
          <View style={styles.paymentInfoCol}>
            <PDFSectionTitle icon={<PDFIcons.CheckCircleRed />} title="PAYMENT INFORMATION" />
            <View style={styles.paymentInfoBox}>
              <PDFInfoRow icon={<PDFIcons.DotRed />} label="Payment Method" value={paymentInfo?.acceptBankTransfer ? "Bank Transfer" : "UPI"} />
              {paymentInfo?.acceptBankTransfer && (
                <>
                  <PDFInfoRow icon={<PDFIcons.DotRed />} label="Bank Name" value={paymentInfo.bankName || "-"} />
                  <PDFInfoRow icon={<PDFIcons.DotRed />} label="Account Number" value={paymentInfo.accountNumber || "-"} />
                  <PDFInfoRow icon={<PDFIcons.DotRed />} label="IFSC Code" value={paymentInfo.ifscCode || "-"} />
                  <PDFInfoRow icon={<PDFIcons.DotRed />} label="Account Holder" value={paymentInfo.accountHolder || "-"} />
                </>
              )}
              {paymentInfo?.acceptUpi && paymentInfo.upiId && (
                <PDFInfoRow icon={<PDFIcons.DotRed />} label="UPI ID" value={paymentInfo.upiId} />
              )}
              {paymentInfo?.acceptUpi && paymentInfo.upiQrUrl && (
                <View style={{ marginTop: 10, marginLeft: 20 }}>
                   <Image src={paymentInfo.upiQrUrl} style={{ width: 80, height: 80, objectFit: "contain" }} />
                </View>
              )}
            </View>
          </View>
          
          <View style={styles.summaryCol}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{currencySymbol} {Number(invoice.subtotal).toLocaleString('en-US')}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>- {currencySymbol} {Number(invoice.discountAmount || 0).toLocaleString('en-US')}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax ({taxPercentage}%)</Text>
              <Text style={styles.summaryValue}>{currencySymbol} {Number(invoice.taxAmount || 0).toLocaleString('en-US')}</Text>
            </View>
            <View style={styles.grandTotalBox}>
              <Text style={styles.grandTotalLabel}>GRAND TOTAL</Text>
              <Text style={styles.grandTotalValue}>{currencySymbol} {Number(invoice.total).toLocaleString('en-US')}</Text>
            </View>
          </View>
        </View>

        {/* Footer Areas */}
        <View style={styles.bottomSection}>
          <View style={styles.bottomCol}>
            <PDFSectionTitle icon={<PDFIcons.DocumentRed />} title="TERMS & CONDITIONS" />
            {(invoice.termsAndConditions || invoiceFooterNotes || "50% advance to confirm booking.\nRaw footage will be retained for 7 days from the date of delivery.\nCancellation after confirmation may incur charges.\nInvoice is valid for 7 days from the date of issue.").split('\n').map((term: string, idx: number) => (
               <View key={idx} style={styles.termsText}>
                 <PDFIcons.DotRed />
                 <Text>{term}</Text>
               </View>
            ))}
            
            <View style={styles.thankYouBox}>
              <PDFIcons.Logo width={30} height={30} />
              <View style={styles.thankYouTextCol}>
                <Text style={styles.thankYouTitle}>THANK YOU!</Text>
                <Text style={styles.thankYouDesc}>Thank you for choosing Random Frames. We look forward to working with you.</Text>
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
            <Text style={{ fontSize: 8, color: theme.colors.textLight, marginBottom: 10 }}>{invoice.notes || ""}</Text>
            <View style={styles.notesLine} />
            <View style={styles.notesLine} />
            <View style={styles.notesLine} />
          </View>
        </View>

      </PDFLayout>
    </Document>
  );
}
