"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { ActivityType } from "@prisma/client";

export type CallOutcome = 
  | "No Answer" 
  | "Call Back" 
  | "Connected" 
  | "Interested" 
  | "Not Interested" 
  | "Wrong Number" 
  | "Qualified";

interface RecordCallOutcomeParams {
  targetType: "LEAD" | "CLIENT";
  targetId: string;
  outcome: CallOutcome;
  followUpDate?: Date | null;
  nextAction?: string | null;
}

export async function recordCallOutcome({
  targetType,
  targetId,
  outcome,
  followUpDate,
  nextAction
}: RecordCallOutcomeParams) {
  try {
    // 1. Construct the exact string format requested by the user
    let description = `📞 Outbound Call\nResult: ${outcome}`;
    
    // In a real app we'd get the current user, but for now we'll hardcode "Savan" as per the user's example
    description += `\nHandled by: Savan`;

    if (followUpDate) {
      // Format date nicely (e.g. 30 Aug 2026)
      const dateStr = followUpDate.toLocaleDateString("en-GB", {
        day: "numeric", month: "short", year: "numeric"
      });
      description += `\nNext Follow-up: ${dateStr}`;
    }

    if (nextAction) {
      description += `\nNext Action: ${nextAction}`;
    }

    // 2. Create the Activity Record
    await prisma.activity.create({
      data: {
        type: ActivityType.CALL,
        description: description,
        leadId: targetType === "LEAD" ? targetId : undefined,
        clientId: targetType === "CLIENT" ? targetId : undefined,
      }
    });

    // 3. Create the FollowUp Record if needed
    if (followUpDate) {
      await prisma.followUp.create({
        data: {
          title: `Follow-up: ${outcome}`,
          description: nextAction || "Scheduled follow-up after outbound call",
          dueDate: followUpDate,
          leadId: targetType === "LEAD" ? targetId : undefined,
          clientId: targetType === "CLIENT" ? targetId : undefined,
        }
      });
    }

    // 4. Update status if necessary (Optional based on rules, but user said "Do not unnecessarily replace existing status values", so we skip for now unless specifically requested. We could move "Qualified" leads to QUALIFIED status but let's keep it simple).

    // 5. Revalidate paths
    if (targetType === "LEAD") {
      revalidatePath(`/leads/${targetId}`);
      revalidatePath(`/leads`);
    } else {
      revalidatePath(`/clients/${targetId}`);
      revalidatePath(`/clients`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to record call outcome:", error);
    return { success: false, error: error.message || "Failed to record call outcome" };
  }
}
