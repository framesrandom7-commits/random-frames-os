import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { CommandProvider } from "@/components/providers/command-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { UploadProvider } from "@/components/storage/uploads/upload-provider";
import { GlobalUploadCenter } from "@/components/storage/uploads/global-upload-center";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const satoshi = localFont({
  src: "../public/fonts/satoshi-variable.woff2",
  variable: "--font-heading",
  weight: "300 900",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Random Frames OS",
  description: "Business Operating System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html
        lang="en"
        className={`${inter.variable} ${satoshi.variable} h-full antialiased`}
        suppressHydrationWarning
      >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <CommandProvider>
            <UploadProvider>
              {children}
              <GlobalUploadCenter />
            </UploadProvider>
          </CommandProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
