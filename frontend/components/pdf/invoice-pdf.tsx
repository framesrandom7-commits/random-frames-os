import React from "react";
import { Document, Page, Text, View, StyleSheet, Font } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eeeeee",
    paddingBottom: 20,
    marginBottom: 20,
  },
  brandName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#C1121F",
  },
  brandDetails: {
    fontSize: 10,
    color: "#666666",
    marginTop: 5,
  },
  invoiceTitle: {
    fontSize: 28,
    color: "#333333",
    fontWeight: "bold",
  },
  invoiceMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  metaCol: {
    flexDirection: "column",
  },
  metaLabel: {
    fontSize: 10,
    color: "#888888",
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 12,
    color: "#333333",
    fontWeight: "bold",
  },
  billTo: {
    marginBottom: 30,
  },
  billToTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 6,
  },
  billToText: {
    fontSize: 11,
    color: "#555555",
    marginBottom: 3,
  },
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#eeeeee",
    borderRightWidth: 0,
    borderBottomWidth: 0,
    marginTop: 20,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableHeader: {
    backgroundColor: "#f9f9f9",
    fontWeight: "bold",
  },
  tableColHeader: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#eeeeee",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
  },
  tableColDescHeader: {
    width: "50%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#eeeeee",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#eeeeee",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
  },
  tableColDesc: {
    width: "50%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#eeeeee",
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 8,
  },
  tableCellHeader: {
    fontSize: 10,
    color: "#333333",
    fontWeight: "bold",
  },
  tableCell: {
    fontSize: 10,
    color: "#555555",
  },
  summary: {
    marginTop: 20,
    alignItems: "flex-end",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "40%",
    marginBottom: 5,
  },
  summaryLabel: {
    fontSize: 11,
    color: "#666666",
  },
  summaryValue: {
    fontSize: 11,
    color: "#333333",
    fontWeight: "bold",
  },
  summaryTotalLabel: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "bold",
  },
  summaryTotalValue: {
    fontSize: 14,
    color: "#C1121F",
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: "center",
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    paddingTop: 10,
  },
  footerText: {
    fontSize: 9,
    color: "#888888",
  },
  statusBadge: {
    marginTop: 10,
    padding: 5,
    borderRadius: 4,
    borderWidth: 1,
    width: 80,
    textAlign: "center",
  },
  statusPaid: {
    borderColor: "#22c55e",
    backgroundColor: "#dcfce7",
    color: "#166534",
  },
  statusPending: {
    borderColor: "#eab308",
    backgroundColor: "#fef9c3",
    color: "#854d0e",
  }
});

interface InvoicePDFProps {
  invoice: any; // We'll pass the full invoice object including project and client
}

export function InvoicePDF({ invoice }: InvoicePDFProps) {
  const { project } = invoice;
  const client = project?.client;
  
  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isPaid = invoice.status === "PAID";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.brandName}>Random Frames</Text>
            <Text style={styles.brandDetails}>Photography & Videography</Text>
            <Text style={styles.brandDetails}>Bangalore, India</Text>
          </View>
          <View>
            <Text style={styles.invoiceTitle}>INVOICE</Text>
            <View style={[styles.statusBadge, isPaid ? styles.statusPaid : styles.statusPending]}>
              <Text style={{ fontSize: 9, fontWeight: "bold" }}>{invoice.status}</Text>
            </View>
          </View>
        </View>

        {/* Meta Info */}
        <View style={styles.invoiceMeta}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Invoice Number</Text>
            <Text style={styles.metaValue}>{invoice.invoiceNumber}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Issue Date</Text>
            <Text style={styles.metaValue}>{formatDate(invoice.issueDate)}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Due Date</Text>
            <Text style={styles.metaValue}>{formatDate(invoice.dueDate)}</Text>
          </View>
        </View>

        {/* Bill To */}
        <View style={styles.billTo}>
          <Text style={styles.billToTitle}>Bill To:</Text>
          <Text style={styles.billToText}>{client?.businessName || "Client Name"}</Text>
          {client?.contactPerson && <Text style={styles.billToText}>{client.contactPerson}</Text>}
          {client?.address && <Text style={styles.billToText}>{client.address}</Text>}
          {client?.gstNumber && <Text style={styles.billToText}>GST: {client.gstNumber}</Text>}
        </View>

        {/* Project Name */}
        <View style={{ marginBottom: 10 }}>
          <Text style={styles.billToTitle}>Project: {project?.title || "N/A"}</Text>
        </View>

        {/* Line Items Table */}
        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <View style={styles.tableColDescHeader}>
              <Text style={styles.tableCellHeader}>Description</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Quantity</Text>
            </View>
            <View style={styles.tableColHeader}>
              <Text style={styles.tableCellHeader}>Amount (₹)</Text>
            </View>
          </View>
          
          {/* We assume a single line item for the project total, or multiple if lineItems exist */}
          {invoice.lineItems ? invoice.lineItems.map((item: any, i: number) => (
            <View style={styles.tableRow} key={i}>
              <View style={styles.tableColDesc}>
                <Text style={styles.tableCell}>{item.description}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{item.quantity || 1}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{Number(item.amount).toLocaleString('en-IN')}</Text>
              </View>
            </View>
          )) : (
            <View style={styles.tableRow}>
              <View style={styles.tableColDesc}>
                <Text style={styles.tableCell}>{project?.title || "Project Services"}</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>1</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{Number(invoice.subtotal).toLocaleString('en-IN')}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{Number(invoice.subtotal).toLocaleString('en-IN')}</Text>
          </View>
          {Number(invoice.taxAmount) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>₹{Number(invoice.taxAmount).toLocaleString('en-IN')}</Text>
            </View>
          )}
          {Number(invoice.discountAmount) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={styles.summaryValue}>-₹{Number(invoice.discountAmount).toLocaleString('en-IN')}</Text>
            </View>
          )}
          <View style={[styles.summaryRow, { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "#eeeeee" }]}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>₹{Number(invoice.total).toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for your business!</Text>
          <Text style={styles.footerText}>For any queries, please contact Random Frames.</Text>
        </View>
      </Page>
    </Document>
  );
}
