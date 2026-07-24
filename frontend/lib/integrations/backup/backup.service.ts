import { prisma } from "@/lib/prisma";
import fs from "fs/promises";
import path from "path";

export class BackupService {
  /**
   * Generates a full JSON dump of the database.
   */
  public static async generateDatabaseBackup(): Promise<{ filepath: string; size: number }> {
    const backupDir = path.join(process.cwd(), "public", "backups");
    await fs.mkdir(backupDir, { recursive: true });

    // Fetch core tables (simplified for this implementation)
    const [clients, leads, projects, invoices, expenses] = await Promise.all([
      prisma.client.findMany(),
      prisma.lead.findMany(),
      prisma.project.findMany(),
      prisma.invoice.findMany(),
      prisma.expense.findMany()
    ]);

    const backupData = {
      timestamp: new Date().toISOString(),
      version: "1.0",
      data: {
        clients,
        leads,
        projects,
        invoices,
        expenses
      }
    };

    const filename = `backup-${Date.now()}.json`;
    const filepath = path.join(backupDir, filename);
    const content = JSON.stringify(backupData, null, 2);
    
    await fs.writeFile(filepath, content);
    
    return {
      filepath: `/backups/${filename}`,
      size: Buffer.byteLength(content, 'utf8')
    };
  }
}
