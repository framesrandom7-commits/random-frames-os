import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, backgroundColor: "#ffffff", fontFamily: "Helvetica" },
  header: { flexDirection: "row", justifyContent: "space-between", borderBottomWidth: 1, borderBottomColor: "#eeeeee", paddingBottom: 20, marginBottom: 20 },
  brandName: { fontSize: 24, fontWeight: "bold", color: "#10B981" },
  brandDetails: { fontSize: 10, color: "#666666", marginTop: 5 },
  title: { fontSize: 28, color: "#333333", fontWeight: "bold", textAlign: "right" },
  section: { marginBottom: 20 },
  label: { fontSize: 10, color: "#888888", marginBottom: 4 },
  value: { fontSize: 12, color: "#333333", fontWeight: "bold" },
  amountBox: { padding: 20, backgroundColor: "#F0FDF4", borderRadius: 8, marginVertical: 20, alignItems: "center" },
  amountTitle: { fontSize: 14, color: "#166534", marginBottom: 5 },
  amountValue: { fontSize: 32, color: "#15803D", fontWeight: "bold" },
  footer: { marginTop: 40, borderTopWidth: 1, borderTopColor: "#eeeeee", paddingTop: 20, fontSize: 10, color: "#999999", textAlign: "center" }
});

export const ReceiptPDF: React.FC<{ payment: any }> = ({ payment }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.brandName}>RANDOM FRAMES STUDIO</Text>
          <Text style={styles.brandDetails}>Official Payment Receipt</Text>
        </View>
        <View>
          <Text style={styles.title}>RECEIPT</Text>
          <Text style={styles.brandDetails}>{payment?.receiptNumber || payment?.id || "REC-000"}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 20 }}>
        <View style={styles.section}>
          <Text style={styles.label}>RECEIVED FROM:</Text>
          <Text style={styles.value}>{payment?.client?.name || `Client (${payment?.clientId})`}</Text>
          <Text style={{ fontSize: 10, color: "#666666", marginTop: 2 }}>{payment?.client?.email || ""}</Text>
        </View>
        <View style={styles.section}>
          <Text style={styles.label}>DATE & METHOD:</Text>
          <Text style={styles.value}>{payment?.paymentDate ? new Date(payment.paymentDate).toLocaleDateString() : "Today"}</Text>
          <Text style={{ fontSize: 10, color: "#666666", marginTop: 2 }}>Method: {payment?.paymentMethod || "ONLINE"}</Text>
          <Text style={{ fontSize: 10, color: "#666666", marginTop: 2 }}>Type: {payment?.paymentType || "PARTIAL"}</Text>
        </View>
      </View>

      <View style={styles.amountBox}>
        <Text style={styles.amountTitle}>AMOUNT RECEIVED</Text>
        <Text style={styles.amountValue}>INR {Number(payment?.amount || 0).toLocaleString("en-IN")}.00</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>NOTES & ALLOCATIONS:</Text>
        <Text style={{ fontSize: 11, color: "#444444" }}>{payment?.notes || "Payment received with thanks against services rendered."}</Text>
        {payment?.referenceNumber && <Text style={{ fontSize: 10, color: "#666666", marginTop: 5 }}>Reference / UPI TXN: {payment.referenceNumber}</Text>}
      </View>

      <View style={styles.footer}>
        <Text>Thank you for doing business with Random Frames Studio!</Text>
        <Text style={{ marginTop: 4 }}>This is an electronically generated fiscal receipt verified by Random Frames OS v1.0 Immutable Financial Ledger.</Text>
      </View>
    </Page>
  </Document>
);
