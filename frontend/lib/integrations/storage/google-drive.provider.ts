import { StorageProvider, FileMetadata } from "./storage.provider";
import { ProviderMetadata } from "../core/provider.interface";

export class GoogleDriveProvider extends StorageProvider {
  public getMetadata(): ProviderMetadata {
    return {
      id: "GOOGLE_DRIVE",
      name: "Google Drive",
      version: "1.0.0",
      type: "STORAGE",
      description: "Cloud storage integration using Google Workspace.",
      authenticationMethod: "OAUTH2",
      supportedFeatures: ["upload", "download", "delete", "list"],
      capabilities: { maxFileSize: true, cloud: true }
    };
  }

  public async checkHealth(): Promise<boolean> {
    return false;
  }

  public validateConfiguration(config: any): boolean {
    return !!config?.accessToken;
  }

  public async testConnection(config?: any): Promise<boolean> {
    return false; // Stub
  }

  public async uploadFile(buffer: Buffer, filename: string, mimeType: string, folder?: string): Promise<FileMetadata> {
    throw new Error("Google Drive Provider is not fully configured yet.");
  }

  public async deleteFile(fileId: string): Promise<boolean> {
    throw new Error("Google Drive Provider is not fully configured yet.");
  }

  public async getFileUrl(fileId: string): Promise<string> {
    throw new Error("Google Drive Provider is not fully configured yet.");
  }
}
