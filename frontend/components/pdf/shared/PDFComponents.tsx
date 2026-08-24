import React from "react";
import { View, Text, StyleSheet } from "@react-pdf/renderer";
import { theme } from "./PDFLayout";
import { PDFIcons } from "./PDFIcons";

const styles = StyleSheet.create({
  sectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
    marginTop: 15,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grayBorder,
    paddingBottom: 5,
  },
  sectionTitleText: {
    fontSize: 12,
    fontWeight: 700,
    color: theme.colors.textDark,
    letterSpacing: 0.5,
  },
  infoGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 40,
    marginTop: 10,
  },
  infoCol: {
    flex: 1,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 6,
    alignItems: "center"
  },
  infoLabelCol: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    width: 120,
  },
  infoLabelText: {
    fontSize: 9,
    color: theme.colors.textDark,
  },
  infoValueCol: {
    flexDirection: "row",
    flex: 1,
    alignItems: "center",
    gap: 10,
  },
  infoValueText: {
    fontSize: 9,
    color: theme.colors.textLight,
  },
  table: {
    marginTop: 15,
    borderWidth: 1,
    borderColor: theme.colors.grayBorder,
    borderRadius: 4,
    overflow: "hidden"
  },
  tableHeader: {
    backgroundColor: theme.colors.black,
    flexDirection: "row",
    padding: "10px 15px",
    alignItems: "center",
  },
  tableHeaderCol: {
    fontSize: 8,
    fontWeight: 700,
    color: theme.colors.white,
    letterSpacing: 0.5,
    textAlign: "center"
  },
  tableRow: {
    flexDirection: "row",
    padding: "12px 15px",
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.grayBorder,
    alignItems: "center",
  },
  tableCell: {
    fontSize: 9,
    color: theme.colors.textLight,
    textAlign: "center"
  },
  tableCellDesc: {
    fontSize: 9,
    color: theme.colors.textLight,
    textAlign: "left"
  },
  col1: { width: "10%" },
  col2: { width: "35%" },
  col3: { width: "10%" },
  col4: { width: "15%" },
  col5: { width: "15%" },
  col6: { width: "15%" },
});

export const PDFSectionTitle = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
  <View style={styles.sectionTitleRow}>
    {icon}
    <Text style={styles.sectionTitleText}>{title}</Text>
  </View>
);

export const PDFInfoRow = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLabelCol}>
      {icon}
      <Text style={styles.infoLabelText}>{label}</Text>
    </View>
    <View style={styles.infoValueCol}>
      <Text style={styles.infoLabelText}>:</Text>
      <Text style={styles.infoValueText}>{value || "-"}</Text>
    </View>
  </View>
);

// Helper for the specific 6 column table layout
export const PDFTable = ({ items }: { items: any[] }) => {
  return (
    <View style={styles.table}>
      <View style={styles.tableHeader}>
        <Text style={[styles.tableHeaderCol, styles.col1]}>#</Text>
        <Text style={[styles.tableHeaderCol, styles.col2, { textAlign: "left" }]}>SERVICE</Text>
        <Text style={[styles.tableHeaderCol, styles.col3]}>QTY</Text>
        <Text style={[styles.tableHeaderCol, styles.col4]}>UNIT</Text>
        <Text style={[styles.tableHeaderCol, styles.col5]}>RATE (₹)</Text>
        <Text style={[styles.tableHeaderCol, styles.col6]}>AMOUNT (₹)</Text>
      </View>
      {items.map((item, idx) => (
        <View key={idx} style={[styles.tableRow, idx === items.length - 1 ? { borderBottomWidth: 0 } : {}]}>
          <Text style={[styles.tableCell, styles.col1, { color: theme.colors.primary, fontWeight: 700 }]}>{idx + 1}</Text>
          <Text style={[styles.tableCellDesc, styles.col2]}>{item.service}</Text>
          <Text style={[styles.tableCell, styles.col3]}>{item.qty}</Text>
          <Text style={[styles.tableCell, styles.col4]}>{item.unit}</Text>
          <Text style={[styles.tableCell, styles.col5]}>{item.rate}</Text>
          <Text style={[styles.tableCell, styles.col6]}>{item.amount}</Text>
        </View>
      ))}
    </View>
  );
};
