import React from "react";
import { Page, View, Text, StyleSheet, Font, Svg, Polygon } from "@react-pdf/renderer";
import { PDFIcons } from "./PDFIcons";

import path from "path";

// Register Montserrat font
Font.register({
  family: 'Montserrat',
  fonts: [
    { src: path.join(process.cwd(), 'public/fonts/Montserrat-Regular.ttf') },
    { src: path.join(process.cwd(), 'public/fonts/Montserrat-Medium.ttf'), fontWeight: 500 },
    { src: path.join(process.cwd(), 'public/fonts/Montserrat-SemiBold.ttf'), fontWeight: 600 },
    { src: path.join(process.cwd(), 'public/fonts/Montserrat-Bold.ttf'), fontWeight: 700 },
  ]
});
export const theme = {
  colors: {
    primary: "#C1121F",
    black: "#0F1115",
    textDark: "#333333",
    textLight: "#666666",
    grayBorder: "#eeeeee",
    white: "#ffffff"
  }
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: theme.colors.white,
    fontFamily: "Montserrat",
    fontSize: 10,
    position: "relative",
    paddingBottom: 50,
  },
  watermarkContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
    opacity: 0.05,
    zIndex: 1, // behind the header which has zIndex 10
  },
  headerContainer: {
    backgroundColor: theme.colors.black,
    padding: "20px 40px",
    flexDirection: "row",
    justifyContent: "space-between",
    position: "relative",
    zIndex: 10,
  },
  redShape: {
    position: "absolute",
    bottom: -20,
    left: 0,
    width: "100%",
    height: 20,
    zIndex: 5,
  },
  headerLeft: {
    flexDirection: "row",
    gap: 15,
    alignItems: "center"
  },
  headerTextContainer: {
    flexDirection: "column",
    gap: 4
  },
  brandNameRow: {
    flexDirection: "row",
    gap: 4
  },
  brandNameWhite: {
    color: theme.colors.white,
    fontSize: 22,
    fontWeight: 700,
  },
  brandNameRed: {
    color: theme.colors.primary,
    fontSize: 22,
    fontWeight: 700,
  },
  brandSubtitle: {
    color: theme.colors.white,
    fontSize: 8,
    letterSpacing: 1,
    marginTop: 2
  },
  subtitleUnderline: {
    width: 60,
    height: 1.5,
    backgroundColor: theme.colors.primary,
    marginTop: 6
  },
  docTitle: {
    color: theme.colors.primary,
    fontSize: 24,
    fontWeight: 700,
    textAlign: "right",
    marginBottom: 15,
    letterSpacing: 1
  },
  metaGrid: {
    flexDirection: "column",
    gap: 8,
    width: 180
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  metaLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    width: 90
  },
  metaLabelText: {
    color: "#a0a0a0",
    fontSize: 9
  },
  metaValueText: {
    color: theme.colors.white,
    fontSize: 9,
    fontWeight: 500,
    textAlign: "right",
    flex: 1
  },
  statusBadge: {
    backgroundColor: theme.colors.primary,
    padding: "3px 12px",
    borderRadius: 12,
    color: theme.colors.white,
    fontSize: 9,
    fontWeight: 700,
    textAlign: "center"
  },
  contentContainer: {
    paddingHorizontal: 30,
    paddingTop: 15,
    zIndex: 10,
  },
  footerContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 50,
    borderTopWidth: 1,
    borderTopColor: theme.colors.grayBorder,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0 40px",
  },
  footerItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  footerText: {
    fontSize: 8,
    color: theme.colors.textDark,
    fontWeight: 500
  }
});

interface MetaItem {
  icon: React.ReactNode;
  label: string;
  value: string;
  isStatus?: boolean;
  statusColor?: string;
}

interface PDFLayoutProps {
  documentTitle: string;
  metaInfo: MetaItem[];
  children: React.ReactNode;
  companyInfo?: {
    businessName: string;
    email: string;
    phone: string;
    address: string;
    website: string;
  };
}

export const PDFLayout = ({ documentTitle, metaInfo, companyInfo, children }: PDFLayoutProps) => {
  return (
    <Page size="A4" style={styles.page}>
      {/* Global Watermark - rendered behind everything else on every page */}
      <View fixed style={styles.watermarkContainer}>
        <PDFIcons.Logo width={250} height={250} opacity={0.05} />
      </View>

      <View style={styles.headerContainer} fixed>
        {/* Left Branding */}
        <View style={styles.headerLeft}>
          <PDFIcons.Logo width={50} height={50} />
          <View style={styles.headerTextContainer}>
            <View style={styles.brandNameRow}>
              <Text style={styles.brandNameWhite}>RANDOM</Text>
              <Text style={styles.brandNameRed}>FRAMES</Text>
            </View>
            <Text style={styles.brandSubtitle}>COMMERCIAL PHOTOGRAPHY & VIDEOGRAPHY</Text>
            <View style={styles.subtitleUnderline} />
          </View>
        </View>

        {/* Right Info */}
        <View>
          <Text style={styles.docTitle}>{documentTitle}</Text>
          <View style={styles.metaGrid}>
            {metaInfo.map((item, index) => (
              <View key={index} style={styles.metaRow}>
                <View style={styles.metaLabelRow}>
                  {item.icon}
                  <Text style={styles.metaLabelText}>{item.label}</Text>
                </View>
                <Text style={styles.metaLabelText}>:</Text>
                {item.isStatus ? (
                  <View style={[styles.statusBadge, item.statusColor ? { backgroundColor: item.statusColor } : {}]}>
                    <Text>{item.value}</Text>
                  </View>
                ) : (
                  <Text style={styles.metaValueText}>{item.value}</Text>
                )}
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Red Geometric Shape below header */}
      <View style={styles.redShape} fixed>
        <Svg width="100%" height="20" viewBox="0 0 1000 20" preserveAspectRatio="none">
          <Polygon points="0,0 450,0 400,20 0,20" fill={theme.colors.primary} />
        </Svg>
      </View>

      {/* Main Content Area */}
      <View style={styles.contentContainer}>
        {children}
      </View>

      {/* Absolute Footer */}
      <View style={styles.footerContainer} fixed>
        <View style={styles.footerItem}>
          <PDFIcons.EmailFooter size={12} />
          <Text style={styles.footerText}>{companyInfo?.email || "frames.random.7@gmail.com"}</Text>
        </View>
        <View style={styles.footerItem}>
          <PDFIcons.PhoneFooter size={12} />
          <Text style={styles.footerText}>{companyInfo?.phone || "8073080077"}</Text>
        </View>
        <View style={styles.footerItem}>
          <PDFIcons.MapPinFooter size={12} />
          <Text style={styles.footerText}>{companyInfo?.address || "Bangalore | Coorg"}</Text>
        </View>
        <View style={styles.footerItem}>
          <PDFIcons.InstagramFooter size={12} />
          <Text style={styles.footerText}>{companyInfo?.website || "instagram.com/random.frames.7"}</Text>
        </View>
      </View>
    </Page>
  );
};
