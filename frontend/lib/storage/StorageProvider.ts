export interface StorageFolder {
  id: string;
  name: string;
  url: string;
}

export interface StorageFile {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  sizeBytes?: number;
}

export interface StorageProvider {
  /**
   * Initialize the provider, validate tokens, etc.
   */
  initialize(): Promise<void>;

  /**
   * Create a folder. If parentFolderId is omitted, creates at root.
   */
  createFolder(name: string, parentFolderId?: string): Promise<StorageFolder>;

  /**
   * Get the details of a folder
   */
  getFolder(folderId: string): Promise<StorageFolder>;

  /**
   * Delete a folder or file
   */
  deleteItem(itemId: string): Promise<void>;

  /**
   * Get total storage used by the connected account
   */
  getStorageUsageBytes(): Promise<{ usage: number, limit: number } | number>;
}
