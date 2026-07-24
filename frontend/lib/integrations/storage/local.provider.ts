import { StorageProvider, FileMetadata } from "./storage.provider";
import { ProviderMetadata } from "../core/provider.interface";
import fs from "fs/promises";
import path from "path";

export class LocalStorageProvider extends StorageProvider {
  public getMetadata(): ProviderMetadata {
    return {
      id: "LOCAL_STORAGE",
      name: "Local Storage",
      version: "1.0.0",
      type: "STORAGE",
      description: "Stores files locally on the server disk.",
      authenticationMethod: "NONE",
      supportedFeatures: ["upload", "download", "delete"],
      capabilities: { maxFileSize: true }
    };
  }

  public async checkHealth(): Promise<boolean> {
    try {
      await fs.access(path.join(process.cwd(), "public/uploads"));
      return true;
    } catch {
      await fs.mkdir(path.join(process.cwd(), "public/uploads"), { recursive: true });
      return true;
    }
  }

  public validateConfiguration(config: any): boolean {
    return true; // No config required for local storage
  }

  public async testConnection(config?: any): Promise<boolean> {
    return this.checkHealth();
  }

  public async uploadFile(buffer: Buffer, filename: string, mimeType: string, folder: string = ""): Promise<FileMetadata> {
    const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
    await fs.mkdir(uploadDir, { recursive: true });
    
    const uniqueFilename = `${Date.now()}-${filename.replace(/\s+/g, '-')}`;
    const filePath = path.join(uploadDir, uniqueFilename);
    
    await fs.writeFile(filePath, buffer);
    
    return {
      id: path.join(folder, uniqueFilename),
      name: filename,
      size: buffer.length,
      url: `/uploads/${folder ? folder + '/' : ''}${uniqueFilename}`,
      mimeType
    };
  }

  public async deleteFile(fileId: string): Promise<boolean> {
    try {
      const filePath = path.join(process.cwd(), "public", "uploads", fileId);
      await fs.unlink(filePath);
      return true;
    } catch {
      return false; 
    }
  }

  public async getFileUrl(fileId: string): Promise<string> {
    return `/uploads/${fileId}`;
  }
}
