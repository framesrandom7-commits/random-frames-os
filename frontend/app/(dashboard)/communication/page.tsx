import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { CommunicationService } from "@/lib/communication/communication.service";
import { FollowUpEngine } from "@/lib/communication/follow-up.engine";
import { DeliveryService } from "@/lib/communication/delivery.service";
import { InternalNoteService } from "@/lib/communication/internal-note.service";
import { MessageSquare, Clock, Send, FileText, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function CommunicationDashboard() {
  const [communications, followUps, deliveries, notes] = await Promise.all([
    CommunicationService.getHistory({}), // Fetch recent global
    FollowUpEngine.getPendingFollowUps({}),
    DeliveryService.getDeliveriesForProject(""), // Need to fetch all for dashboard, let's just get a few latest using Prisma below or adapt the service
    InternalNoteService.getNotesForEntity({})
  ]);

  // Just slicing for UI display, in real app, services should support pagination/limits
  const recentComms = communications.slice(0, 5);
  const pendingFollowUps = followUps.slice(0, 5);
  const recentNotes = notes.slice(0, 5);
  const activeDeliveries = deliveries.filter(d => d.status !== "EXPIRED").slice(0, 5);

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] gap-6 text-white overflow-hidden">
      <PageHeader 
        title="Communication Center"
        subtitle="Manage emails, messages, follow-ups, and deliveries in one place"
      />
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Recent Messages Widget */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="h-5 w-5 text-blue-400" />
            <h3 className="font-medium text-lg">Recent Messages</h3>
          </div>
          <div className="flex-1 space-y-3">
            {recentComms.length === 0 ? (
              <p className="text-white/40 text-sm">No recent messages.</p>
            ) : (
              recentComms.map(c => (
                <div key={c.id} className="p-3 bg-white/5 rounded-lg border border-white/5 text-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-medium text-white/90 truncate mr-2">{c.subject || 'No Subject'}</span>
                    <Badge variant="outline" className="text-[10px] bg-white/10 border-none">{c.type}</Badge>
                  </div>
                  <p className="text-white/60 line-clamp-1 mb-2">{c.body}</p>
                  <span className="text-xs text-white/40">{format(new Date(c.sentAt), 'MMM d, h:mm a')}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending Follow-ups Widget */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="h-5 w-5 text-orange-400" />
            <h3 className="font-medium text-lg">Pending Follow-ups</h3>
          </div>
          <div className="flex-1 space-y-3">
            {pendingFollowUps.length === 0 ? (
              <p className="text-white/40 text-sm">You're all caught up!</p>
            ) : (
              pendingFollowUps.map(f => (
                <div key={f.id} className="p-3 bg-white/5 rounded-lg border border-white/5 text-sm flex gap-3">
                  <div className="mt-0.5"><Clock className="h-4 w-4 text-white/40" /></div>
                  <div>
                    <p className="font-medium text-white/90 mb-1">{f.title}</p>
                    <p className="text-xs text-orange-400">Due: {format(new Date(f.dueDate), 'MMM d, yyyy')}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Active Deliveries Widget */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col">
          <div className="flex items-center gap-2 mb-4">
            <Send className="h-5 w-5 text-green-400" />
            <h3 className="font-medium text-lg">Active Deliveries</h3>
          </div>
          <div className="flex-1 space-y-3">
            {activeDeliveries.length === 0 ? (
              <p className="text-white/40 text-sm">No active deliveries.</p>
            ) : (
              activeDeliveries.map(d => (
                <div key={d.id} className="p-3 bg-white/5 rounded-lg border border-white/5 text-sm flex justify-between items-center">
                  <div>
                    <p className="font-medium text-white/90 mb-0.5">{d.title}</p>
                    <p className="text-xs text-white/50">{d.status}</p>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-green-400/50" />
                </div>
              ))
            )}
          </div>
        </div>
        
        {/* Recent Notes Widget */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col md:col-span-2 lg:col-span-3">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-purple-400" />
            <h3 className="font-medium text-lg">Internal Notes</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentNotes.length === 0 ? (
              <p className="text-white/40 text-sm">No recent notes.</p>
            ) : (
              recentNotes.map(n => (
                <div key={n.id} className="p-4 bg-white/5 rounded-lg border border-white/5 text-sm relative">
                  {n.isPinned && <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-purple-500"></div>}
                  <p className="text-white/80 line-clamp-3 mb-3">{n.content}</p>
                  <p className="text-xs text-white/40">{format(new Date(n.createdAt), 'MMM d, yyyy')}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
