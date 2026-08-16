import { prisma } from "@/lib/prisma";

export class DocumentSequenceService {
  /**
   * Generates a persistent, unique document number for the given type.
   * Format: RF-{PREFIX}-{YYYYMM}_{SEQUENCE}
   * 
   * The sequence continues indefinitely and does NOT reset when the month/year changes.
   * This is atomic and concurrency-safe.
   * 
   * @param documentType "QUOTATION", "INVOICE", or "RECEIPT"
   * @param date Optional date to use for YYYYMM (defaults to now)
   */
  static async getNextDocumentNumber(
    documentType: "QUOTATION" | "INVOICE" | "RECEIPT",
    date: Date = new Date()
  ): Promise<string> {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const yyyymm = `${year}${month}`;

    let prefix = "QT";
    if (documentType === "INVOICE") prefix = "INV";
    if (documentType === "RECEIPT") prefix = "RCP";

    const record = await prisma.$transaction(async (tx) => {
      let seq = await tx.documentSequence.findUnique({
        where: { documentType }
      });
      
      if (!seq) {
        seq = await tx.documentSequence.create({
          data: {
            documentType,
            nextSequence: 102 // The next one will be 102, this one is 101
          }
        });
        return 101;
      }
      
      const updated = await tx.documentSequence.update({
        where: { documentType },
        data: {
          nextSequence: { increment: 1 }
        }
      });
      return updated.nextSequence - 1;
    });

    return `RF-${prefix}-${yyyymm}_${record}`;
  }
}
