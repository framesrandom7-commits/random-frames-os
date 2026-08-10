import { NextRequest, NextResponse } from "next/server";
import { ReportExportEngine, BiReportModule, BiExportFormat, BiReportTimeHorizon } from "@/domain/services/reporting/report-export-engine";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reportModule = (searchParams.get("module") || "DASHBOARD_SNAPSHOT") as BiReportModule;
    const format = (searchParams.get("format") || "CSV") as BiExportFormat;
    const horizon = (searchParams.get("horizon") || "FINANCIAL_YEAR") as BiReportTimeHorizon;
    const startStr = searchParams.get("startDate");
    const endStr = searchParams.get("endDate");
    
    const startDate = startStr ? new Date(startStr) : undefined;
    const endDate = endStr ? new Date(endStr) : undefined;

    const result = await ReportExportEngine.exportBiReport(reportModule, format, horizon, startDate, endDate);

    return new NextResponse(result.data, {
      headers: {
        "Content-Type": result.mimeType,
        "Content-Disposition": `attachment; filename="${result.filename}"`
      }
    });
  } catch (error: any) {
    console.error("Error exporting BI report:", error);
    return new NextResponse(JSON.stringify({ error: error?.message || "Export failed" }), { status: 500, headers: { "Content-Type": "application/json" } });
  }
}
