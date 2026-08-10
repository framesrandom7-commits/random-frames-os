import { EventBus, ActivityLogger, AuditLogger } from "./client-telemetry-adapter";
import { ClientRbacEngine } from "./client-rbac";
import { Logger } from "@/lib/logger";

export type BrandAssetCategory = "LOGO" | "GUIDELINES" | "FONT" | "COLOR_PALETTE" | "PRODUCT_IMAGE" | "DOCUMENT" | "REFERENCE_MEDIA";

export interface BrandAssetItem {
  id: string;
  clientId: string;
  category: BrandAssetCategory;
  name: string;
  description: string;
  fileUrl: string;
  fileSizeKb: number;
  fileType: string;
  googleDriveFolderId?: string;
  signedDownloadUrl?: string;
  uploadedAt: Date;
}

/**
 * Centralized Brand Asset Library allowing clients to upload and manage company logos,
 * brand styling guidelines, typography fonts, color specifications, product shots, and reference media,
 * seamlessly synchronized with Google Workspace Drive storage without modifying database schemas.
 */
export class ClientBrandAssetLibrary {
  private static assets: Map<string, BrandAssetItem[]> = new Map(); // Keyed by clientId

  private static initDefaults(clientId: string): void {
    if (!this.assets.has(clientId)) {
      const defaultList: BrandAssetItem[] = [
        {
          id: `ast_logo_${clientId}`,
          clientId,
          category: "LOGO",
          name: "Vogue India Master Vector Logo (EPS + PNG)",
          description: "Official brand emblem for lower-thirds and credit overlays.",
          fileUrl: "https://drive.google.com/file/d/vogue-logo-master-pack/view",
          fileSizeKb: 4500,
          fileType: "image/svg+xml",
          googleDriveFolderId: "fld_drive_vogue_brand_2026",
          signedDownloadUrl: ClientRbacEngine.generateSignedDownloadUrl("vogue_logo.eps", clientId, "Vogue_Master_Logo.eps").url,
          uploadedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000)
        },
        {
          id: `ast_guide_${clientId}`,
          clientId,
          category: "GUIDELINES",
          name: "2026 Editorial Color & Framing Bible",
          description: "Strict saturation, warmth, and font usage rules for fashion editorial motion productions.",
          fileUrl: "https://drive.google.com/file/d/vogue-editorial-style-bible/view",
          fileSizeKb: 12400,
          fileType: "application/pdf",
          googleDriveFolderId: "fld_drive_vogue_brand_2026",
          signedDownloadUrl: ClientRbacEngine.generateSignedDownloadUrl("vogue_bible.pdf", clientId, "Vogue_Editorial_Style_Bible.pdf").url,
          uploadedAt: new Date(Date.now() - 5 * 24 * 3600 * 1000)
        }
      ];
      this.assets.set(clientId, defaultList);
    }
  }

  /**
   * Retrieves all brand assets for a client, optionally filtered by asset category.
   */
  static async getAssets(clientId: string, category?: BrandAssetCategory): Promise<BrandAssetItem[]> {
    this.initDefaults(clientId);
    const list = this.assets.get(clientId) || [];
    if (!category) return list;
    return list.filter((a: any) => a.category === category);
  }

  /**
   * Registers a newly uploaded brand asset into the client's library and broadcasts sync events.
   */
  static async uploadAsset(
    clientId: string,
    category: BrandAssetCategory,
    name: string,
    description: string,
    fileUrl: string,
    fileSizeKb: number = 2048,
    fileType: string = "application/octet-stream",
    googleDriveFolderId?: string
  ): Promise<BrandAssetItem> {
    this.initDefaults(clientId);
    const list = this.assets.get(clientId) || [];

    const assetId = `ast_${category.toLowerCase()}_${Date.now()}`;
    const filename = fileUrl.split("/").pop() || `${name.replace(/\s+/g, "_")}.dat`;
    const signedLink = ClientRbacEngine.generateSignedDownloadUrl(assetId, clientId, filename);

    const newItem: BrandAssetItem = {
      id: assetId,
      clientId,
      category,
      name,
      description,
      fileUrl,
      fileSizeKb,
      fileType,
      googleDriveFolderId: googleDriveFolderId || "fld_drive_client_default",
      signedDownloadUrl: signedLink.url,
      uploadedAt: new Date()
    };

    list.unshift(newItem);
    this.assets.set(clientId, list);

    await EventBus.publish("CLIENT_ASSET_UPLOADED", { clientId, assetId, category, name, googleDriveFolderId });
    await ActivityLogger.log("CLIENT_ASSET_UPLOADED", `Client uploaded brand asset [${name}] (${category})`, clientId, { assetId });
    await AuditLogger.log("COLLABORATION", "BRAND_ASSET_UPLOADED", clientId, "SUCCESS", { assetId, name, category });

    Logger.info(`[ClientBrandAssetLibrary] Registered new ${category} asset [${name}] for Client: ${clientId}`);
    return newItem;
  }

  /**
   * Deletes a client brand asset from the active repository.
   */
  static async deleteAsset(clientId: string, assetId: string): Promise<boolean> {
    const list = this.assets.get(clientId) || [];
    const idx = list.findIndex((a: any) => a.id === assetId && a.clientId === clientId);
    if (idx < 0) return false;

    const removed = list.splice(idx, 1)[0];
    this.assets.set(clientId, list);

    await EventBus.publish("CLIENT_ASSET_DELETED", { clientId, assetId });
    await AuditLogger.log("COLLABORATION", "BRAND_ASSET_DELETED", clientId, "SUCCESS", { assetId, name: removed.name });
    Logger.info(`[ClientBrandAssetLibrary] Asset ${assetId} deleted by Client ${clientId}.`);
    return true;
  }
}
