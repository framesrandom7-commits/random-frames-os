"use client";

import React from "react";
import { format } from "date-fns";
import { Mail, MessageCircle, FileText, Send, CheckCircle2, Phone, AlertCircle, Clock } from "lucide-react";

interface TimelineEvent {
  id: string;
  type: "EMAIL" | "MESSAGE" | "NOTE" | "DELIVERY" | "FOLLOW_UP" | "SYSTEM";
  title: string;
  description: string;
  date: Date;
  metadata?: any;
}

interface CommunicationTimelineProps {
  events: TimelineEvent[];
}

export function CommunicationTimeline({ events }: CommunicationTimelineProps) {
  
  if (events.length === 0) {
    return (
      <div className="text-center p-8 border border-dashed border-white/10 rounded-xl bg-white/5 text-white/50">
        No communication history available.
      </div>
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "EMAIL": return <Mail className="h-4 w-4 text-blue-400" />;
      case "MESSAGE": return <MessageCircle className="h-4 w-4 text-green-400" />;
      case "NOTE": return <FileText className="h-4 w-4 text-purple-400" />;
      case "DELIVERY": return <Send className="h-4 w-4 text-emerald-400" />;
      case "FOLLOW_UP": return <Clock className="h-4 w-4 text-orange-400" />;
      default: return <CheckCircle2 className="h-4 w-4 text-white/40" />;
    }
  };

  return (
    <div className="relative border-l border-white/10 ml-3 pl-6 space-y-8 text-white">
      {events.map((event) => (
        <div key={event.id} className="relative">
          <div className="absolute -left-[35px] top-1 h-8 w-8 rounded-full bg-black border border-white/10 flex items-center justify-center">
            {getIcon(event.type)}
          </div>
          
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-white/90">{event.title}</h4>
              <span className="text-xs text-white/40">{format(event.date, 'MMM d, h:mm a')}</span>
            </div>
            
            <p className="text-sm text-white/60 mb-2 whitespace-pre-wrap">{event.description}</p>
            
            {event.metadata && event.metadata.link && (
              <a href={event.metadata.link} target="_blank" rel="noreferrer" className="inline-block mt-2 text-xs text-blue-400 hover:underline">
                View Attachment / Link
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
