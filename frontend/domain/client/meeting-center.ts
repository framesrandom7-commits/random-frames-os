import { EventBus, ActivityLogger, AuditLogger, NotificationEngine } from "./client-telemetry-adapter";
import { Logger } from "@/lib/logger";

export interface MeetingItem {
  id: string;
  clientId: string;
  projectId?: string;
  title: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  googleMeetLink: string;
  googleCalendarEventId?: string;
  agenda: string[];
  notes?: string;
  recordingUrl?: string;
  actionItems?: Array<{ task: string; assignee: string; isCompleted: boolean }>;
}

/**
 * Client Meeting Center displaying upcoming consultations, Google Meet video links,
 * structured discussion agendas, post-meeting notes, video recordings, and actionable follow-ups.
 */
export class ClientMeetingCenter {
  private static meetings: Map<string, MeetingItem[]> = new Map(); // Keyed by clientId

  private static ensureDefaults(clientId: string): void {
    if (!this.meetings.has(clientId)) {
      const defaultMeetings: MeetingItem[] = [
        {
          id: `meet_upcoming_${clientId}`,
          clientId,
          projectId: "proj_vogue_fashion_week",
          title: "Pre-Production Creative Sync & Wardrobe Alignment",
          scheduledAt: new Date(Date.now() + 2 * 24 * 3600 * 1000),
          durationMinutes: 45,
          status: "SCHEDULED",
          googleMeetLink: "https://meet.google.com/ran-dom-frms",
          googleCalendarEventId: "gcal_evt_vogue_sync_2026",
          agenda: [
            "Review color framing style bible (2026)",
            "Confirm shooting dates and location logistics at Taj Colaba",
            "Discuss drone filming clearance and crew badges"
          ],
          actionItems: [
            { task: "Upload wardrobe reference photos to Brand Asset Library", assignee: "Client", isCompleted: false },
            { task: "Share drone flight authorization certificate", assignee: "Studio Lead", isCompleted: true }
          ]
        },
        {
          id: `meet_past_${clientId}`,
          clientId,
          projectId: "proj_vogue_fashion_week",
          title: "Initial Campaign Kickoff & Quotation Review",
          scheduledAt: new Date(Date.now() - 4 * 24 * 3600 * 1000),
          durationMinutes: 60,
          status: "COMPLETED",
          googleMeetLink: "https://meet.google.com/kck-off-rnd",
          googleCalendarEventId: "gcal_evt_vogue_kickoff",
          agenda: ["Introduce creative directors", "Walk through budget and deliverables timeline"],
          notes: "Client confirmed preference for unwatermarked 4K ProRes master deliveries upon final invoice clearance.",
          recordingUrl: "https://drive.google.com/file/d/rec-vogue-kickoff-meeting-2026/view",
          actionItems: [
            { task: "Issue Master Quotation #101 with GST breakdown", assignee: "Studio Finance", isCompleted: true },
            { task: "Approve Quotation #101 in Client Portal", assignee: "Client", isCompleted: true }
          ]
        }
      ];
      this.meetings.set(clientId, defaultMeetings);
    }
  }

  /**
   * Retrieves upcoming and past meeting schedules for a specific client.
   */
  static async getClientMeetings(clientId: string): Promise<MeetingItem[]> {
    this.ensureDefaults(clientId);
    return (this.meetings.get(clientId) || []).sort((a: any, b: any) => b.scheduledAt.getTime() - a.scheduledAt.getTime());
  }

  /**
   * Schedules a new client consultation with automated Google Meet & Calendar integration links.
   */
  static async scheduleClientConsultation(
    clientId: string,
    title: string,
    preferredTime: Date,
    agenda: string[],
    durationMinutes: number = 45
  ): Promise<MeetingItem> {
    this.ensureDefaults(clientId);
    const list = this.meetings.get(clientId) || [];

    const meetingId = `meet_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const meetCode = `rfos-${Math.random().toString(36).substring(2, 5)}-${Math.random().toString(36).substring(2, 5)}`;

    const newMeet: MeetingItem = {
      id: meetingId,
      clientId,
      title,
      scheduledAt: preferredTime,
      durationMinutes,
      status: "SCHEDULED",
      googleMeetLink: `https://meet.google.com/${meetCode}`,
      googleCalendarEventId: `gcal_${meetingId}`,
      agenda: agenda.length > 0 ? agenda : ["General Project & Deliverable Discussion"],
      actionItems: []
    };

    list.unshift(newMeet);
    this.meetings.set(clientId, list);

    await EventBus.publish("CLIENT_MEETING_SCHEDULED", { clientId, meetingId, title, meetLink: newMeet.googleMeetLink });
    await ActivityLogger.log("MEETING_SCHEDULED", `Client consultation booked: "${title}" at ${preferredTime.toLocaleString()}`, clientId, { meetingId });
    await AuditLogger.log("COLLABORATION", "MEETING_SCHEDULED_BY_CLIENT", clientId, "SUCCESS", { meetingId, title });

    try {
      await NotificationEngine.notify({
        recipient: "studio.calendar@randomframes.com",
        type: "SYSTEM_ALERT",
        priority: "HIGH",
        title: `📅 New Client Meeting: ${title}`,
        message: `Client (${clientId}) scheduled consultation for ${preferredTime.toLocaleString()}. Meet Link: ${newMeet.googleMeetLink}`,
        metadata: { meetingId, clientId, meetLink: newMeet.googleMeetLink }
      });
    } catch (e: any) {
      Logger.warn(`[ClientMeetingCenter] Calendar notification simulation: ${e.message}`);
    }

    return newMeet;
  }
}
