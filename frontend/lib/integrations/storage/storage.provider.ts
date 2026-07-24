import { BaseProvider } from "../core/provider.interface";

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  url: string;
  mimeType: string;
}

export abstract class StorageProvider extends BaseProvider {
  /**
   * Upload a file buffer to the storage provider.
   */
  public abstract uploadFile(buffer: Buffer, filename: string, mimeType: string, folder?: string): Promise<FileMetadata>;
  
  /**
   * Delete a file from the storage provider by ID or Path.
   */
  public abstract deleteFile(fileId: string): Promise<boolean>;
  
  /**
   * Get a public or presigned URL for a file.
   */
  public abstract getFileUrl(fileId: string): Promise<string>;
}
