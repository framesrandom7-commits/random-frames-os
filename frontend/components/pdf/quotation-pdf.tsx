import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { Prisma } from "@prisma/client";

type QuotationWithRelations = Prisma.QuotationGetPayload<{
  include: { client: true; project: true; items: true }
}>;

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
    fontSize: 24,
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
    width: "50%",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 10,
    color: "#666666",
  },
  summaryValue: {
    fontSize: 10,
    color: "#333333",
  },
  summaryTotalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333333",
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
  notes: {
    marginTop: 30,
    padding: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
  },
  notesTitle: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  notesText: {
    fontSize: 9,
    color: "#666666",
  }
});

interface QuotationPDFProps {
  quotation: QuotationWithRelations;
}

export function QuotationPDF({ quotation }: QuotationPDFProps) {
  const { client, project } = quotation;
  
  const formatDate = (dateString: Date) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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
            <Text style={styles.invoiceTitle}>QUOTATION</Text>
          </View>
        </View>

        {/* Meta Info */}
        <View style={styles.invoiceMeta}>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Quotation Number</Text>
            <Text style={styles.metaValue}>{quotation.quotationNumber}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Issue Date</Text>
            <Text style={styles.metaValue}>{formatDate(quotation.issueDate)}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Valid Until</Text>
            <Text style={styles.metaValue}>{formatDate(quotation.validUntil)}</Text>
          </View>
        </View>

        {/* Prepared For */}
        <View style={styles.billTo}>
          <Text style={styles.billToTitle}>Prepared For:</Text>
          <Text style={styles.billToText}>{client?.businessName || "Client Name"}</Text>
          {client?.contactPerson && <Text style={styles.billToText}>{client.contactPerson}</Text>}
          {client?.address && <Text style={styles.billToText}>{client.address}</Text>}
        </View>

        {/* Project Name */}
        {project && (
          <View style={{ marginBottom: 10 }}>
            <Text style={styles.billToTitle}>Project: {project.title}</Text>
          </View>
        )}

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
          
          {quotation.items && quotation.items.length > 0 ? (
            quotation.items.map((item, i) => (
              <View style={styles.tableRow} key={i}>
                <View style={styles.tableColDesc}>
                  <Text style={styles.tableCell}>{item.description}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{item.quantity || 1}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{Number(item.total).toLocaleString('en-IN')}</Text>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.tableRow}>
              <View style={styles.tableColDesc}>
                <Text style={styles.tableCell}>Professional Services</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>1</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>{Number(quotation.subtotal).toLocaleString('en-IN')}</Text>
              </View>
            </View>
          )}
        </View>

        {/* Summary */}
        <View style={styles.summary}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal</Text>
            <Text style={styles.summaryValue}>₹{Number(quotation.subtotal).toLocaleString('en-IN')}</Text>
          </View>
          {Number(quotation.discount) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Discount</Text>
              <Text style={{...styles.summaryValue, color: '#ef4444'}}>-₹{Number(quotation.discount).toLocaleString('en-IN')}</Text>
            </View>
          )}
          {Number(quotation.tax) > 0 && (
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax (18%)</Text>
              <Text style={styles.summaryValue}>₹{Number(quotation.tax).toLocaleString('en-IN')}</Text>
            </View>
          )}
          <View style={[styles.summaryRow, { borderTopWidth: 2, borderTopColor: '#333333', paddingTop: 8, marginTop: 4 }]}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
            <Text style={styles.summaryTotalValue}>₹{Number(quotation.total).toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Notes & Terms */}
        {(quotation.notes || quotation.termsAndConditions) && (
          <View style={styles.notes}>
            {quotation.notes && (
              <View style={{ marginBottom: 10 }}>
                <Text style={styles.notesTitle}>Notes:</Text>
                <Text style={styles.notesText}>{quotation.notes}</Text>
              </View>
            )}
            {quotation.termsAndConditions && (
              <View>
                <Text style={styles.notesTitle}>Terms and Conditions:</Text>
                <Text style={styles.notesText}>{quotation.termsAndConditions}</Text>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for considering Random Frames!</Text>
        </View>
      </Page>
    </Document>
  );
}
