import React from "react";
import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

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
  summary: {
    marginTop: 40,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "bold",
    marginBottom: 10,
  },
  summaryText: {
    fontSize: 11,
    color: "#555555",
    lineHeight: 1.5,
  },
  priceBox: {
    marginTop: 30,
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderLeftWidth: 4,
    borderLeftColor: "#C1121F",
  },
  priceLabel: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 5,
  },
  priceValue: {
    fontSize: 20,
    color: "#333333",
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
  }
});

interface QuotationPDFProps {
  lead: any; // The lead object
}

export function QuotationPDF({ lead }: QuotationPDFProps) {
  
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
            <Text style={styles.metaLabel}>Date</Text>
            {/* eslint-disable-next-line react-hooks/purity */}
            <Text style={styles.metaValue}>{formatDate(new Date())}</Text>
          </View>
          <View style={styles.metaCol}>
            <Text style={styles.metaLabel}>Valid Until</Text>
            {/* eslint-disable-next-line react-hooks/purity */}
            <Text style={styles.metaValue}>{formatDate(new Date(Date.now() + 14 * 24 * 60 * 60 * 1000))}</Text>
          </View>
        </View>

        {/* Prepared For */}
        <View style={styles.billTo}>
          <Text style={styles.billToTitle}>Prepared For:</Text>
          <Text style={styles.billToText}>{lead.contactPerson || "Contact Person"}</Text>
          <Text style={styles.billToText}>{lead.businessName || "Business Name"}</Text>
          {lead.phone && <Text style={styles.billToText}>{lead.phone}</Text>}
        </View>

        {/* Requirements Scope */}
        <View style={styles.summary}>
          <Text style={styles.summaryLabel}>Scope of Work</Text>
          <Text style={styles.summaryText}>{lead.requirements || "Details to be discussed."}</Text>
        </View>

        {/* Estimated Price */}
        <View style={styles.priceBox}>
          <Text style={styles.priceLabel}>Estimated Project Value</Text>
          <Text style={styles.priceValue}>
            {lead.estimatedValue ? `₹${Number(lead.estimatedValue).toLocaleString('en-IN')}` : "To be decided"}
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Thank you for considering Random Frames!</Text>
          <Text style={styles.footerText}>This quotation is valid for 14 days from the date of issue.</Text>
        </View>
      </Page>
    </Document>
  );
}
