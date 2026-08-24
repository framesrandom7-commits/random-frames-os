import crypto from 'crypto';
try {
  const keyHex = "c066322677202e2789d55c16b07dcd101e043d26e1abfbebe6012c074b1ed4cb";
  const key = Buffer.from(keyHex, 'hex');
  console.log("Key length:", key.length);
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', iv, key);
  console.log("Cipher created successfully");
} catch(e: any) {
  console.error("Error:", e.message);
}
