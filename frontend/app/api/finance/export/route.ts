import { NextRequest, NextResponse } from "next/server";
import { FinanceExportService, ExportReportType, ExportFormat } from "@/domain/finance/export-service";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportType = (searchParams.get("reportType") || "STATEMENT") as ExportReportType;
    const format = (searchParams.get("format") || "CSV") as ExportFormat;
    const param = searchParams.get("param") || undefined;

    const result = await FinanceExportService.exportReport(reportType, format, param);

    return new NextResponse(result.data, {
      headers: {
        "Content-Type": result.mimeType,
        "Content-Disposition": `attachment; filename="${result.filename}"`
      }
    });
  } catch (error: any) {
    console.error("Error exporting finance report:", error);
    return new NextResponse(JSON.stringify({ error: error?.message || "Export failed" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
