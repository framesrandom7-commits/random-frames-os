import React from "react";
import { Document, View, Text, StyleSheet } from "@react-pdf/renderer";
import { Prisma } from "@prisma/client";
import { PDFLayout, theme } from "./shared/PDFLayout";
import { PDFIcons } from "./shared/PDFIcons";
import { PDFSectionTitle, PDFInfoRow } from "./shared/PDFComponents";
import { CurrencyService } from "@/lib/finance/currency.service";

const styles = StyleSheet.create({
  middleSection: {
    flexDirection: "row",
    marginTop: 20,
    gap: 20,
  },
  paymentDetailsCol: {
    flex: 6,
  },
  summaryCol: {
    flex: 4,
  },
  detailsBox: {
    borderWidth: 1,
    borderColor: theme.colors.grayBorder,
    borderRadius: 8,
    padding: 15,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    alignItems: "center"
  },
  detailsRowLast: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  detailsLabel: {
    fontSize: 9,
    color: theme.colors.textDark,
    fontWeight: 600,
  },
  detailsValue: {
    fontSize: 9,
    color: theme.colors.textLight,
  },
  summaryBox: {
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    padding: 15,
    paddingBottom: 0,
    borderWidth: 1,
    borderColor: theme.colors.grayBorder,
    overflow: "hidden",
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
    alignItems: "center",
    padding: "15px 20px",
    marginHorizontal: -15,
    marginBottom: 0,
    marginTop: 10,
  },
  grandTotalLabel: {
    color: theme.colors.white,
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 4,
  },
  grandTotalValue: {
    color: theme.colors.white,
    fontSize: 20,
    fontWeight: 700,
  },
  confirmationSection: {
    flexDirection: "row",
    marginTop: 20,
    gap: 20,
    alignItems: "center"
  },
  confirmBox: {
    flex: 6,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: "#10B981",
    borderRadius: 8,
    padding: 15,
    alignItems: "center",
    gap: 15,
    backgroundColor: "#F0FDF4"
  },
  confirmTextCol: {
    flex: 1,
  },
  confirmTextSmall: {
    fontSize: 9,
    color: theme.colors.textDark,
  },
  confirmAmount: {
    fontSize: 14,
    color: "#10B981",
    fontWeight: 700,
    marginVertical: 4,
  },
  signatureCol: {
    flex: 4,
    alignItems: "center",
  },
  signatureLine: {
    width: "100%",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grayBorder,
    marginBottom: 8,
    marginTop: 30, // Space for signature image
  },
  signatureText: {
    fontSize: 8,
    color: theme.colors.textDark,
  },
  signatureBrand: {
    fontSize: 8,
    color: theme.colors.primary,
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
  paymentInfoBox: {
    marginTop: 10,
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
  notesLine: {
    borderBottomWidth: 1,
    borderBottomColor: "#dddddd",
    borderBottomStyle: "dashed",
    marginBottom: 15,
    height: 10,
  }
});

interface ReceiptPDFProps {
  payment: any;
  companyInfo?: {
    businessName: string;
    email: string;
    phone: string;
    address: string;
    website: string;
    gstin?: string;
  };
  invoiceLogo?: string;
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
  currency?: string;
  invoiceFooterNotes?: string;
}

export function ReceiptPDF({ payment, companyInfo, paymentInfo, invoiceLogo, currency = "INR", invoiceFooterNotes }: ReceiptPDFProps) {
  const { invoice, client } = payment;

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const amountReceived = Number(payment.amount || 0);
  const totalAmount = invoice ? Number(invoice.total) : amountReceived;
  const paymentDate = formatDate(payment.paymentDate || new Date());
  
  const metaInfo = [
    { icon: <PDFIcons.Document size={12} />, label: "Receipt No.", value: payment.receiptNumber || `RCPT-${payment.id?.substring(0,6).toUpperCase() || "001"}` },
    { icon: <PDFIcons.Calendar size={12} />, label: "Receipt Date", value: paymentDate },
    { icon: <PDFIcons.Document size={12} />, label: "Invoice No.", value: invoice?.invoiceNumber || "-" },
    { icon: <PDFIcons.Tag size={12} />, label: "Status", value: "PAID", isStatus: true, statusColor: "#10B981" },
  ];

  return (
    <Document>
      <PDFLayout documentTitle="PAYMENT RECEIPT" metaInfo={metaInfo} companyInfo={companyInfo} invoiceLogo={invoiceLogo}>
        
        {/* Received From & Received By */}
        <View style={{ flexDirection: "row", gap: 30 }}>
          <View style={{ flex: 1 }}>
            <PDFSectionTitle icon={<PDFIcons.UserRed />} title="RECEIVED FROM" />
            <PDFInfoRow icon={<PDFIcons.UserGray />} label="Client Name" value={client?.contactPerson || client?.businessName || "-"} />
            <PDFInfoRow icon={<PDFIcons.BuildingGray />} label="Business Name" value={client?.businessName || "-"} />
            <PDFInfoRow icon={<PDFIcons.UserGray />} label="Contact Person" value={client?.contactPerson || "-"} />
            <PDFInfoRow icon={<PDFIcons.PhoneGray />} label="Phone Number" value={client?.phone || "-"} />
            <PDFInfoRow icon={<PDFIcons.EmailGray />} label="Email" value={client?.email || "-"} />
            <PDFInfoRow icon={<PDFIcons.MapPinGray />} label="Address" value={client?.address || client?.city || "-"} />
          </View>
          <View style={{ flex: 1 }}>
            <PDFSectionTitle icon={<PDFIcons.BriefcaseRed />} title="RECEIVED BY" />
            <PDFInfoRow icon={<PDFIcons.BuildingGray />} label="Business Name" value={companyInfo?.businessName || "Random Frames"} />
            <PDFInfoRow icon={<PDFIcons.UserGray />} label="Contact Person" value={companyInfo?.businessName === "Random Frames" ? "Savan Somaiah T P" : companyInfo?.businessName || "Savan Somaiah T P"} />
            <PDFInfoRow icon={<PDFIcons.PhoneGray />} label="Phone Number" value={companyInfo?.phone || "8073080077"} />
            <PDFInfoRow icon={<PDFIcons.EmailGray />} label="Email" value={companyInfo?.email || "frames.random.7@gmail.com"} />
            <PDFInfoRow icon={<PDFIcons.MapPinGray />} label="Address" value={companyInfo?.address || "Bangalore | Coorg, India"} />
          </View>
        </View>

        {/* Payment Details & Summary Box */}
        <View style={styles.middleSection}>
          <View style={styles.paymentDetailsCol}>
            <PDFSectionTitle icon={<PDFIcons.DocumentRed />} title="PAYMENT DETAILS" />
            <View style={styles.detailsBox}>
              <View style={styles.detailsRow}><Text style={styles.detailsLabel}>Invoice Number</Text><Text style={styles.detailsValue}>:</Text><Text style={[styles.detailsValue, {flex: 1, textAlign: "right"}]}>{invoice?.invoiceNumber || "-"}</Text></View>
              <View style={styles.detailsRow}><Text style={styles.detailsLabel}>Invoice Date</Text><Text style={styles.detailsValue}>:</Text><Text style={[styles.detailsValue, {flex: 1, textAlign: "right"}]}>{formatDate(invoice?.issueDate)}</Text></View>
              <View style={styles.detailsRow}><Text style={styles.detailsLabel}>Total Amount ({currencySymbol})</Text><Text style={styles.detailsValue}>:</Text><Text style={[styles.detailsValue, {flex: 1, textAlign: "right"}]}>{totalAmount.toLocaleString('en-US')}</Text></View>
              <View style={styles.detailsRow}><Text style={styles.detailsLabel}>Amount Received ({currencySymbol})</Text><Text style={styles.detailsValue}>:</Text><Text style={[styles.detailsValue, {flex: 1, textAlign: "right"}]}>{amountReceived.toLocaleString('en-US')}</Text></View>
              <View style={styles.detailsRow}><Text style={styles.detailsLabel}>Amount in Words</Text><Text style={styles.detailsValue}>:</Text><Text style={[styles.detailsValue, {flex: 1, textAlign: "right"}]}>Rupees {CurrencyService.numberToWords(amountReceived)} Only</Text></View>
              <View style={styles.detailsRow}><Text style={styles.detailsLabel}>Payment Mode</Text><Text style={styles.detailsValue}>:</Text><Text style={[styles.detailsValue, {flex: 1, textAlign: "right"}]}>{payment.paymentMethod || "Bank Transfer"}</Text></View>
              <View style={styles.detailsRow}><Text style={styles.detailsLabel}>Reference / Transaction ID</Text><Text style={styles.detailsValue}>:</Text><Text style={[styles.detailsValue, {flex: 1, textAlign: "right"}]}>{payment.referenceNumber || "-"}</Text></View>
              <View style={styles.detailsRowLast}><Text style={styles.detailsLabel}>Payment Date</Text><Text style={styles.detailsValue}>:</Text><Text style={[styles.detailsValue, {flex: 1, textAlign: "right"}]}>{paymentDate}</Text></View>
            </View>
          </View>

          <View style={styles.summaryCol}>
            <Text style={{ fontSize: 10, fontWeight: 700, color: theme.colors.textDark, marginBottom: 15, marginTop: 20 }}>AMOUNT SUMMARY</Text>
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{currencySymbol} {totalAmount.toLocaleString('en-US')}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={[styles.summaryValue, { color: theme.colors.primary }]}>- {currencySymbol} 0</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax (If Applicable)</Text>
                <Text style={styles.summaryValue}>{currencySymbol} 0</Text>
              </View>
              <View style={styles.grandTotalBox}>
                <Text style={styles.grandTotalLabel}>GRAND TOTAL</Text>
                <Text style={styles.grandTotalValue}>{currencySymbol} {amountReceived.toLocaleString('en-US')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Confirmation & Signature */}
        <View style={styles.confirmationSection}>
          <View style={styles.confirmBox}>
            <PDFIcons.BigGreenCheck />
            <View style={styles.confirmTextCol}>
              <Text style={styles.confirmTextSmall}>We hereby confirm that we have received the amount of</Text>
              <Text style={styles.confirmAmount}>{currencySymbol} {amountReceived.toLocaleString('en-US')}</Text>
              <Text style={styles.confirmTextSmall}>(Amount: {amountReceived} Only) from the above client.</Text>
            </View>
          </View>

          <View style={styles.signatureCol}>
            <View style={styles.signatureLine} />
            <Text style={styles.signatureText}>Authorised Signature</Text>
            <Text style={styles.signatureBrand}>RANDOM FRAMES</Text>
          </View>
        </View>

        {/* Footer Areas */}
        <View style={styles.bottomSection}>
          <View style={styles.bottomCol}>
            <Text style={{ fontSize: 10, fontWeight: 700, color: theme.colors.textDark, marginBottom: 15 }}>PAYMENT INFORMATION</Text>
            <View style={styles.paymentInfoBox}>
              <PDFInfoRow icon={null} label="Payment Method" value={payment.paymentMethod || "Bank Transfer"} />
              {paymentInfo?.acceptBankTransfer && (
                <>
                  <PDFInfoRow icon={null} label="Bank Name" value={paymentInfo.bankName || "-"} />
                  <PDFInfoRow icon={null} label="Account Number" value={paymentInfo.accountNumber || "-"} />
                  <PDFInfoRow icon={null} label="IFSC Code" value={paymentInfo.ifscCode || "-"} />
                  <PDFInfoRow icon={null} label="Account Holder" value={paymentInfo.accountHolder || "-"} />
                </>
              )}
            </View>
          </View>

          <View style={styles.bottomCol}>
            <Text style={{ fontSize: 10, fontWeight: 700, color: theme.colors.textDark, marginBottom: 15 }}>NOTES</Text>
            <Text style={{ fontSize: 8, color: theme.colors.textLight, marginBottom: 10 }}>{payment.notes || ""}</Text>
            <View style={styles.notesLine} />
            <View style={styles.notesLine} />
            <View style={styles.notesLine} />
            <View style={styles.notesLine} />
          </View>

          <View style={styles.bottomCol}>
            <View style={styles.thankYouBox}>
              <PDFIcons.Logo width={40} height={40} />
              <View style={styles.thankYouTextCol}>
                <Text style={[styles.thankYouTitle, { fontSize: 12 }]}>THANK YOU!</Text>
                <Text style={styles.thankYouDesc}>Thank you for your trust and for making us a part of your creative journey.</Text>
              </View>
            </View>
          </View>
        </View>

      </PDFLayout>
    </Document>
  );
}
