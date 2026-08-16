import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function GET(
  request: Request,
  { params }: { params: { type: string; id: string } }
) {
  const { type, id } = params;

  try {
    // Determine the base URL for Puppeteer to hit the preview route
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const targetUrl = `${baseUrl}/documents/${type}/${id}/preview`;

    // Launch puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // Set viewport to A4 dimensions (approximately 794x1123 at 96dpi)
    await page.setViewport({ width: 794, height: 1123, deviceScaleFactor: 2 });
    
    // Navigate to the preview page and wait for network idle to ensure fonts/images load
    await page.goto(targetUrl, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
      preferCSSPageSize: true
    });

    await browser.close();

    // Return the PDF buffer as a file download
    const filename = `${type}-${id}.pdf`;
    
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    });

  } catch (error: any) {
    console.error("PDF Generation Error:", error);
    return new NextResponse(`Error generating PDF: ${error.message}`, { status: 500 });
  }
}
