import { NextResponse } from "next/server";
import { ClientRbacEngine } from "@/domain/client/client-rbac";
import { Logger } from "@/lib/logger";

/**
 * Cryptographic Signed URL Download Gateway for Client Portal Deliverables.
 * Enforces time-bound HMAC signature verification and logs every download for security audit.
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const fileId = url.searchParams.get("fileId") || "";
    const clientId = url.searchParams.get("client") || "";
    const expiresStr = url.searchParams.get("expires") || "0";
    const signature = url.searchParams.get("sig") || "";
    const filename = url.searchParams.get("name") ? decodeURIComponent(url.searchParams.get("name")!) : "deliverable_file.mov";

    const expiresMs = Number(expiresStr);
    const ipAddress = req.headers.get("x-forwarded-for") || "127.0.0.1";

    // Verify HMAC signature and expiration timestamp
    const isValid = ClientRbacEngine.verifySignedDownloadUrl(fileId, clientId, filename, signature, expiresMs, clientId, ipAddress);

    if (!isValid) {
      Logger.error(`[API /portal/v1/download] Security blocked invalid or expired download link for file [${fileId}] by Client [${clientId}]`);
      return new NextResponse("403 Forbidden — Security Download Link Expired or Signature Validation Failed. Please return to your gallery to generate a fresh link.", { status: 403 });
    }

    Logger.info(`[API /portal/v1/download] Verified download for file [${filename}] by Client [${clientId}]`);

    // Stream simulated file byte binary buffer for production responsiveness verification
    const dummyFileContent = `[Random Frames OS — Verified Secure Master Deliverable Archive]\nFile ID: ${fileId}\nClient ID: ${clientId}\nTimestamp: ${new Date().toISOString()}\nHMAC Verified: true\n`;
    const buffer = Buffer.from(dummyFileContent, "utf8");

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": String(buffer.length),
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "Pragma": "no-cache",
        "X-Random-Frames-Security": "HMAC-SHA256-VERIFIED"
      }
    });
  } catch (error: any) {
    Logger.error(`[API /portal/v1/download] Gateway Exception: ${error.message}`);
    return new NextResponse("500 Internal Server Error during secure deliverable download.", { status: 500 });
  }
}
