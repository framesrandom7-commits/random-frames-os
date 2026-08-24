import React from "react";
import { Svg, Path, Circle, Rect, Polygon, G, Defs, ClipPath, Text } from "@react-pdf/renderer";

export const PDFIcons = {
  // Brand Logo
  Logo: ({ width = 40, height = 40, opacity = 1 }: { width?: number; height?: number; opacity?: number }) => (
    <Svg width={width} height={height} viewBox="0 0 100 100" opacity={opacity}>
      <Rect x="0" y="0" width="100" height="100" rx="20" fill="#0F1115" />
      <Rect x="8" y="8" width="84" height="84" rx="12" fill="none" stroke="#ffffff" strokeWidth="5" />
      <Text x="18" y="70" fontSize="52" fontFamily="Helvetica" fontWeight="bold" fill="#ffffff">R</Text>
      <Text x="55" y="70" fontSize="52" fontFamily="Helvetica" fontWeight="bold" fill="#C1121F">F</Text>
    </Svg>
  ),

  // Header Details Icons
  Document: ({ color = "#ffffff", size = 16 }: { color?: string; size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M14 2v6h6" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 13H8" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 17H8" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 9H8" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  Calendar: ({ color = "#ffffff", size = 16 }: { color?: string; size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 2v4" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M8 2v4" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M3 10h18" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  Tag: ({ color = "#ffffff", size = 16 }: { color?: string; size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M7 7h.01" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  Hashtag: ({ color = "#ffffff", size = 16 }: { color?: string; size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 9h16" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M4 15h16" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 3L8 21" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 3l-2 18" stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),

  // Body Icons (Red circle with red icon inside)
  SectionIconWrapper: ({ children }: { children: React.ReactNode }) => (
    <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      {children}
    </Svg>
  ),
  UserRed: () => (
    <PDFIcons.SectionIconWrapper>
      <Circle cx="12" cy="12" r="11" stroke="#C1121F" strokeWidth="1" />
      <Path d="M12 14a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" stroke="#C1121F" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="#C1121F" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </PDFIcons.SectionIconWrapper>
  ),
  BriefcaseRed: () => (
    <PDFIcons.SectionIconWrapper>
      <Circle cx="12" cy="12" r="11" stroke="#C1121F" strokeWidth="1" />
      <Rect x="4" y="9" width="16" height="11" rx="2" ry="2" stroke="#C1121F" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M8 9V7a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="#C1121F" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </PDFIcons.SectionIconWrapper>
  ),
  DocumentRed: () => (
    <PDFIcons.SectionIconWrapper>
      <Circle cx="12" cy="12" r="11" stroke="#C1121F" strokeWidth="1" />
      <Path d="M14 6H8a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V8z" stroke="#C1121F" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M14 6v4h4" stroke="#C1121F" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 14h4" stroke="#C1121F" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M10 11h4" stroke="#C1121F" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </PDFIcons.SectionIconWrapper>
  ),
  CheckCircleRed: () => (
    <PDFIcons.SectionIconWrapper>
      <Circle cx="12" cy="12" r="11" stroke="#C1121F" strokeWidth="1" />
      <Path d="M7 12l3 3 7-7" stroke="#C1121F" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </PDFIcons.SectionIconWrapper>
  ),
  PenRed: () => (
    <PDFIcons.SectionIconWrapper>
      <Circle cx="12" cy="12" r="11" stroke="#C1121F" strokeWidth="1" />
      <Path d="M14 6.5l3.5 3.5-9 9H5v-3.5l9-9z" stroke="#C1121F" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </PDFIcons.SectionIconWrapper>
  ),
  BigGreenCheck: () => (
    <Svg width="40" height="40" viewBox="0 0 40 40" fill="none">
      <Circle cx="20" cy="20" r="18" stroke="#10B981" strokeWidth="2" />
      <Path d="M11 20l6 6 12-12" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),

  // List Icons (Gray)
  UserGray: ({ size = 12 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="7" r="4" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  BuildingGray: ({ size = 12 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M3 21h18" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 8h1" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 12h1" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M9 16h1" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M14 8h1" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M14 12h1" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M14 16h1" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  PhoneGray: ({ size = 12 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  EmailGray: ({ size = 12 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M22 6l-10 7L2 6" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  MapPinGray: ({ size = 12 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="10" r="3" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  BadgeGray: ({ size = 12 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M12 15v5l-3-3-3 3v-5" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="9" r="6" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  FolderGray: ({ size = 12 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  GridGray: ({ size = 12 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="3" width="7" height="7" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="14" y="3" width="7" height="7" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="14" y="14" width="7" height="7" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="3" y="14" width="7" height="7" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  CameraGray: ({ size = 12 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="13" r="4" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  CalendarGray: ({ size = 12 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 2v4" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M8 2v4" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M3 10h18" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  ClockGray: ({ size = 12 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="12" r="10" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M12 6v6l4 2" stroke="#888888" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  CheckRed: ({ size = 12 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M9 11l3 3L22 4" stroke="#C1121F" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="#C1121F" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  DotRed: ({ size = 6 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="#C1121F">
      <Circle cx="12" cy="12" r="6" />
    </Svg>
  ),
  
  // Footer Icons
  EmailFooter: ({ size = 12 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="#333333" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M22 6l-10 7L2 6" stroke="#333333" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  PhoneFooter: ({ size = 12 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" stroke="#333333" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  MapPinFooter: ({ size = 12 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke="#333333" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Circle cx="12" cy="10" r="3" stroke="#333333" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
  InstagramFooter: ({ size = 12 }: { size?: number }) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect x="2" y="2" width="20" height="20" rx="5" ry="5" stroke="#333333" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" stroke="#333333" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <Path d="M17.5 6.5h.01" stroke="#333333" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  ),
};
