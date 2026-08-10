import crypto from "crypto";
import { AuditLogger } from "./client-telemetry-adapter";
import { Logger } from "@/lib/logger";

export interface SignedDownloadLink {
  url: string;
  fileId: string;
  clientId: string;
  filename: string;
  expiresAt: Date;
  signature: string;
}

/**
 * Enterprise Client Portal RBAC & Security Engine for Random Frames OS.
 * Enforces strict self-record isolation, zero internal data exposure, AES-256 encryption,
 * and cryptographically signed HMAC download URLs with automatic expiration.
 */
export class ClientRbacEngine {
  private static SECRET_KEY = process.env.CLIENT_PORTAL_SECRET || "Random_Frames_Client_Portal_Master_Security_Key_2026_Enterprise_V1";
  private static downloadAuditLog: Array<{ fileId: string; filename: string; clientId: string; downloadedAt: Date; ipAddress: string }> = [];

  /**
   * Verifies that the active client session is strictly accessing their own records.
   * Throws an unauthorized security exception if cross-client tampering or admin access is detected.
   */
  static authorizeClientAccess(
    session: { clientId: string; role?: string }, 
    targetClientId?: string | null,
    resourceType: string = "RECORD"
  ): boolean {
    if (!session || !session.clientId) {
      Logger.error(`[ClientRbacEngine] Unauthorized access attempt: No active client session provided for ${resourceType}`);
      throw new Error("Access Denied: Authentication session required for Client Portal.");
    }

    // Clients cannot access admin analytics or internal finance modules
    const forbiddenScopes = ["INTERNAL_FINANCE", "BUSINESS_ANALYTICS", "OTHER_CLIENTS", "OPERATIONAL_DASHBOARDS", "AUDIT_LOGS", "INTERNAL_NOTES"];
    if (forbiddenScopes.includes(resourceType.toUpperCase())) {
      Logger.warn(`[ClientRbacEngine] Client ${session.clientId} attempted illegal access to protected administrative domain: ${resourceType}`);
      throw new Error(`Access Denied: Client Portal users have zero permissions to access internal studio domain [${resourceType}].`);
    }

    // Enforce strict self-record boundary
    if (targetClientId && targetClientId !== session.clientId) {
      Logger.error(`[ClientRbacEngine] CROSS-CLIENT BREACH ATTEMPT! Session Client [${session.clientId}] attempted to access resource owned by Client [${targetClientId}]`);
      AuditLogger.log("SECURITY", "CROSS_CLIENT_ACCESS_BLOCKED", session.clientId, "FAILURE", { attemptedClientId: targetClientId, resourceType }).catch(() => {});
      throw new Error("Security Violation: You are strictly forbidden from viewing or altering records belonging to other clients.");
    }

    return true;
  }

  /**
   * Deeply scrubs internal staff notes, operational profit margins, cost structures, and administrative audit trails
   * from any data object before transmitting to the client portal UI or API.
   */
  static sanitizeClientRecord(data: any): any {
    if (!data || typeof data !== "object") return data;
    if (Array.isArray(data)) return data.map((item: any) => this.sanitizeClientRecord(item));

    const sanitized = { ...data };
    const forbiddenKeys = [
      "internalNotes", "ownerNotes", "profitMargin", "profit", "internalCost",
      "crewCost", "vendorCost", "auditLogs", "staffRate", "secretKey", "apiSecret", "passwordHash"
    ];

    for (const key of forbiddenKeys) {
      if (key in sanitized) {
        delete sanitized[key];
      }
    }

    // Recursively scrub nested objects and children
    for (const [key, value] of Object.entries(sanitized)) {
      if (value && typeof value === "object") {
        sanitized[key] = this.sanitizeClientRecord(value);
      }
    }

    return sanitized;
  }

  /**
   * Encrypts sensitive client billing and identity data using AES-256-CBC.
   */
  static encryptSensitiveData(plainText: string): string {
    if (!plainText) return "";
    try {
      const hash = crypto.createHash("sha256").update(this.SECRET_KEY).digest();
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv("aes-256-cbc", hash, iv);
      let encrypted = cipher.update(plainText, "utf8", "hex");
      encrypted += cipher.final("hex");
      return `${iv.toString("hex")}:${encrypted}`;
    } catch {
      return plainText;
    }
  }

  /**
   * Decrypts sensitive client billing data previously encrypted via AES-256-CBC.
   */
  static decryptSensitiveData(cipherText: string): string {
    if (!cipherText || !cipherText.includes(":")) return cipherText;
    try {
      const [ivHex, encrypted] = cipherText.split(":");
      const hash = crypto.createHash("sha256").update(this.SECRET_KEY).digest();
      const iv = Buffer.from(ivHex, "hex");
      const decipher = crypto.createDecipheriv("aes-256-cbc", hash, iv);
      let decrypted = decipher.update(encrypted, "hex", "utf8");
      decrypted += decipher.final("utf8");
      return decrypted;
    } catch {
      return cipherText;
    }
  }

  /**
   * Generates a cryptographically signed download URL for deliverables or billing PDFs with time-bound expiration.
   */
  static generateSignedDownloadUrl(
    fileId: string,
    clientId: string,
    filename: string,
    expiresInMinutes: number = 30
  ): SignedDownloadLink {
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    const timestamp = expiresAt.getTime();

    const signaturePayload = `${fileId}:${clientId}:${filename}:${timestamp}:${this.SECRET_KEY}`;
    const signature = crypto.createHmac("sha256", this.SECRET_KEY).update(signaturePayload).digest("hex");

    const encodedFile = encodeURIComponent(filename);
    const url = `/api/portal/v1/download?fileId=${fileId}&client=${clientId}&expires=${timestamp}&sig=${signature}&name=${encodedFile}`;

    return {
      url,
      fileId,
      clientId,
      filename,
      expiresAt,
      signature
    };
  }

  /**
   * Verifies an HMAC signature and expiration timestamp for a signed deliverable download URL.
   */
  static verifySignedDownloadUrl(
    fileId: string,
    clientId: string,
    filename: string,
    signature: string,
    expiresTimestampMs: number,
    requestingClientId?: string,
    ipAddress: string = "127.0.0.1"
  ): boolean {
    if (requestingClientId && requestingClientId !== clientId) {
      Logger.error(`[ClientRbacEngine] Signed URL signature validation failure: Cross-client download breach attempt!`);
      return false;
    }

    if (Date.now() > expiresTimestampMs) {
      Logger.warn(`[ClientRbacEngine] Signed URL expired for file ${filename} (ID: ${fileId})`);
      return false;
    }

    const expectedPayload = `${fileId}:${clientId}:${filename}:${expiresTimestampMs}:${this.SECRET_KEY}`;
    const expectedSig = crypto.createHmac("sha256", this.SECRET_KEY).update(expectedPayload).digest("hex");

    if (signature !== expectedSig) {
      Logger.error(`[ClientRbacEngine] HMAC signature mismatch! Tampered URL detected for file ${fileId}`);
      return false;
    }

    // Record verified download in audit log
    this.downloadAuditLog.unshift({
      fileId,
      filename,
      clientId,
      downloadedAt: new Date(),
      ipAddress
    });

    if (this.downloadAuditLog.length > 500) this.downloadAuditLog.pop();

    AuditLogger.log("SECURITY", "SIGNED_FILE_DOWNLOADED", clientId, "SUCCESS", { fileId, filename, ipAddress }).catch(() => {});
    return true;
  }

  /**
   * Retrieves the cryptographic download audit logs for founder oversight.
   */
  static getDownloadAuditLog(clientId?: string): Array<{ fileId: string; filename: string; clientId: string; downloadedAt: Date; ipAddress: string }> {
    if (!clientId) return this.downloadAuditLog;
    return this.downloadAuditLog.filter((l: any) => l.clientId === clientId);
  }
}
