import crypto from 'crypto';

// The encryption key must be 32 bytes for AES-256
// We recommend storing a 64-character hex string in the environment variable
// which gets converted to a 32-byte Buffer.
const getEncryptionKey = (): Buffer => {
  const keyHex = process.env.GOOGLE_TOKEN_ENCRYPTION_KEY;
  if (!keyHex) {
    throw new Error('GOOGLE_TOKEN_ENCRYPTION_KEY environment variable is missing.');
  }
  
  const buffer = Buffer.from(keyHex, 'hex');
  if (buffer.length !== 32) {
    throw new Error('GOOGLE_TOKEN_ENCRYPTION_KEY must be a 64-character hex string (32 bytes).');
  }
  
  return buffer;
};

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

/**
 * Encrypts a string using AES-256-GCM.
 * Returns a colon-separated string: ivHex:authTagHex:encryptedTextHex
 */
export function encryptToken(text: string): string {
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(IV_LENGTH);
  
  const cipher = crypto.createCipheriv(ALGORITHM, iv, key);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag().toString('hex');
  
  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypts a token encrypted with encryptToken().
 */
export function decryptToken(encryptedData: string): string {
  const key = getEncryptionKey();
  const parts = encryptedData.split(':');
  
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format.');
  }
  
  const [ivHex, authTagHex, encryptedTextHex] = parts;
  
  const iv = Buffer.from(ivHex, 'hex');
  const authTag = Buffer.from(authTagHex, 'hex');
  
  const decipher = crypto.createDecipheriv(ALGORITHM, iv, key);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encryptedTextHex, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
