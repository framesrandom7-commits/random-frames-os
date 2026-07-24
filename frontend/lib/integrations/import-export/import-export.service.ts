import * as Papa from "papaparse";
import * as xlsx from "xlsx";

export class ImportExportService {
  /**
   * Export an array of objects to CSV.
   */
  public static exportToCSV(data: any[], filename: string): { content: string, type: string } {
    const csv = Papa.unparse(data);
    return {
      content: csv,
      type: "text/csv;charset=utf-8;"
    };
  }

  /**
   * Export an array of objects to Excel (XLSX).
   */
  public static exportToExcel(data: any[], sheetName: string): Buffer {
    const worksheet = xlsx.utils.json_to_sheet(data);
    const workbook = xlsx.utils.book_new();
    xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);
    const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });
    return buffer;
  }
}
