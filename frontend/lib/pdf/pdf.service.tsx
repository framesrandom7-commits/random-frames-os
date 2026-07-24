import { renderToStream, renderToBuffer } from "@react-pdf/renderer";
import React from "react";

export type PDFDocumentType = "INVOICE" | "QUOTATION" | "RECEIPT" | "REPORT";

/**
 * PDFService
 * 
 * Reusable PDF engine. Supports generating PDFs to streams (for HTTP responses)
 * and buffers (for email attachments/storage).
 */
export class PDFService {
  
  /**
   * Generates a readable web stream for a React-PDF document.
   * Useful for API Route responses (e.g. NextResponse).
   */
  static async generateStream(documentElement: React.ReactElement): Promise<ReadableStream> {
    const stream = await renderToStream(documentElement as any);
    
    // Convert NodeJS ReadableStream to Web ReadableStream
    return new ReadableStream({
      start(controller) {
        stream.on("data", (chunk) => controller.enqueue(chunk));
        stream.on("end", () => controller.close());
        stream.on("error", (err) => controller.error(err));
      }
    });
  }

  /**
   * Generates a buffer for a React-PDF document.
   * Useful for saving to StorageService or attaching to Emails.
   */
  static async generateBuffer(documentElement: React.ReactElement): Promise<Buffer> {
    // Note: renderToBuffer might not exist directly in some versions, 
    // but the library provides a way to buffer the stream.
    // We will collect the stream into a Buffer.
    const stream = await renderToStream(documentElement as any);
    
    return new Promise((resolve, reject) => {
      const chunks: any[] = [];
      stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on("error", (err) => reject(err));
      stream.on("end", () => resolve(Buffer.concat(chunks)));
    });
  }

  /**
   * Generates standard HTTP headers for PDF responses.
   */
  static getHttpHeaders(filename: string, inline: boolean = true) {
    const disposition = inline ? "inline" : "attachment";
    return {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="${filename}.pdf"`,
    };
  }
}
