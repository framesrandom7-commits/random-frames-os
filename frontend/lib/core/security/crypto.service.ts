import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || process.env.NEXTAUTH_SECRET || "default_fallback_secret_32_bytes"; 
// Note: In production, ENCRYPTION_KEY must be a 32-byte (256-bit) string.

export class CryptoService {
  private static getKey(): Buffer {
    // Ensure key is exactly 32 bytes for aes-256
    return crypto.scryptSync(ENCRYPTION_KEY, "salt", 32);
  }

  /**
   * Encrypts a string and returns a base64 encoded format with the IV and Auth Tag attached.
   */
  public static encrypt(text: string): string {
    const iv = crypto.randomBytes(12); // GCM standard IV size
    const key = this.getKey();
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag().toString('base64');

    // Format: iv:authTag:encryptedData
    return `${iv.toString('base64')}:${authTag}:${encrypted}`;
  }

  /**
   * Decrypts a previously encrypted string.
   */
  public static decrypt(encryptedData: string): string {
    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) throw new Error("Invalid encrypted format");

      const [ivBase64, authTagBase64, encryptedBase64] = parts;
      const iv = Buffer.from(ivBase64, 'base64');
      const authTag = Buffer.from(authTagBase64, 'base64');
      const key = this.getKey();

      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedBase64, 'base64', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      console.error("[CryptoService] Decryption failed:", error);
      throw new Error("Failed to decrypt data.");
    }
  }

  /**
   * Verify a webhook signature using HMAC SHA256
   */
  public static verifySignature(payload: string, signature: string, secret: string): boolean {
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");
      
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  }
}
