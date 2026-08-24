import { validateStorageEnvironment } from "./lib/env";
import { encryptToken } from "./lib/crypto";

try {
  validateStorageEnvironment();
  console.log("Environment valid");
  const enc = encryptToken("test_token_123");
  console.log("Encryption successful");
} catch(e: any) {
  console.error("Error:", e.message);
}
