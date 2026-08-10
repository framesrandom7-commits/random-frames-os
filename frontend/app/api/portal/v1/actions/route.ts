import { NextResponse } from "next/server";
import { ClientAuthEngine } from "@/domain/client/client-auth-engine";
import { ClientPortalService } from "@/domain/services/client-portal-service";
import { ClientApprovalCenter } from "@/domain/client/client-approvals";
import { ClientBrandAssetLibrary } from "@/domain/client/brand-asset-library";
import { ClientMeetingCenter } from "@/domain/client/meeting-center";
import { ClientAiAssistantService } from "@/domain/client/ai-assistant-interface";
import { Logger } from "@/lib/logger";

/**
 * Multi-action REST endpoint enabling mobile clients and PWA interfaces
 * to trigger approvals, revisions, consultations, brand asset uploads, and automated CRM requests.
 */
export async function POST(req: Request) {
  try {
    const body: any = await req.json();
    const { action, clientId = "cli_portal_default_1", sessionId, ...params } = body;

    let session = sessionId ? await ClientAuthEngine.verifySession(sessionId) : null;
    if (!session && process.env.NODE_ENV !== "production") {
      session = {
        sessionId: "mock_action_session",
        clientId,
        email: "executive@vogue.in",
        role: "CLIENT_PORTAL_USER",
        createdAt: new Date(),
        lastActiveAt: new Date(),
        expiresAt: new Date(Date.now() + 3600000),
        isRemembered: false
      };
    }

    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized session." }, { status: 401 });
    }

    let resData: any = null;

    switch (action) {
      case "APPROVE_ITEM":
        resData = await ClientApprovalCenter.approveItem(session.clientId, params.itemId, params.itemType, params.comments);
        break;

      case "REQUEST_REVISION":
        resData = await ClientApprovalCenter.requestRevision(session.clientId, params.itemId, params.itemType, params.revisionDetails);
        break;

      case "SUBMIT_CRM_REQUEST":
        resData = await ClientPortalService.submitClientRequest(session.clientId, session, params.requestType, params.title, params.details, params.priority);
        break;

      case "UPLOAD_BRAND_ASSET":
        resData = await ClientBrandAssetLibrary.uploadAsset(session.clientId, params.category, params.name, params.description, params.fileUrl, params.fileSizeKb);
        break;

      case "SCHEDULE_MEETING":
        resData = await ClientMeetingCenter.scheduleClientConsultation(session.clientId, params.title, new Date(params.preferredTime), params.agenda || []);
        break;

      case "AI_PROJECT_SUMMARY":
        resData = await ClientAiAssistantService.summarizeProjectProgress(session.clientId, params.projectId || "proj_vogue_fashion_week");
        break;

      default:
        return NextResponse.json({ success: false, error: `Unsupported portal action: ${action}` }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      action,
      data: resData,
      timestamp: new Date().toISOString()
    }, { status: 200 });
  } catch (error: any) {
    Logger.error(`[API /portal/v1/actions] Action Failed: ${error.message}`);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
