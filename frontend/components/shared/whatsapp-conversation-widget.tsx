"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  MessageCircle, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  CheckCheck, 
  AlertCircle, 
  Image, 
  FileText, 
  Video, 
  Mic, 
  ExternalLink,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { getConversationHistory, sendManualWhatsAppMessage } from "@/app/actions/whatsapp-settings";

interface WhatsAppConversationWidgetProps {
  clientId?: string;
  leadId?: string;
  projectId?: string;
  shootId?: string;
  phone?: string | null;
  recipientName?: string;
}

export function WhatsAppConversationWidget({
  clientId,
  leadId,
  projectId,
  shootId,
  phone,
  recipientName = "Client"
}: WhatsAppConversationWidgetProps) {
  const [activeTab, setActiveTab] = useState<"send" | "history">("send");
  const [messages, setMessages] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);

  // Message Form State
  const [messageType, setMessageType] = useState<"TEXT" | "IMAGE" | "VIDEO" | "DOCUMENT" | "PDF" | "VOICE_NOTE" | "BUSINESS_CARD">("TEXT");
  const [content, setContent] = useState("");
  const [customPhone, setCustomPhone] = useState(phone || "");

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    const res: any = await getConversationHistory({ clientId, leadId, projectId, shootId, limit: 15 });
    if (res.success && res.conversations) {
      setMessages(res.conversations);
    }
    setLoadingHistory(false);
  };

  const handleSend = async () => {
    const targetPhone = phone || customPhone;
    if (!targetPhone) {
      toast.error("No valid destination phone number provided.");
      return;
    }
    if (!content.trim()) {
      toast.error("Please enter message text or media URL.");
      return;
    }

    setSending(true);
    const res: any = await sendManualWhatsAppMessage(targetPhone, content, messageType as any, {
      clientId,
      leadId,
      projectId,
      shootId
    });

    if (res.success) {
      toast.success(`WhatsApp (${messageType}) transmitted to ${targetPhone} via Meta Cloud API!`);
      setContent("");
      setActiveTab("history");
      fetchHistory();
    } else {
      toast.error(res.error || "Transmission failed.");
    }
    setSending(false);
  };

  const renderStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case "READ":
      case "READ_CONFIRMED":
        return <span title="Read by recipient"><CheckCheck className="w-3.5 h-3.5 text-blue-400 inline ml-1" /></span>;
      case "DELIVERED":
        return <span title="Delivered to device"><CheckCheck className="w-3.5 h-3.5 text-zinc-400 inline ml-1" /></span>;
      case "SENT":
      case "SUBMITTED":
        return <span title="Sent to server"><CheckCircle2 className="w-3.5 h-3.5 text-zinc-500 inline ml-1" /></span>;
      case "FAILED":
        return <span title="Delivery failed"><AlertCircle className="w-3.5 h-3.5 text-red-400 inline ml-1" /></span>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-white/[0.02] border border-white/10 rounded-xl p-4 text-white space-y-4 shadow-lg">
      {/* Widget Navigation Header */}
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300">WhatsApp Conversation Center</span>
        </div>
        <div className="flex gap-1 bg-black/40 p-0.5 rounded border border-white/5">
          <button
            onClick={() => setActiveTab("send")}
            className={`text-[11px] px-2 py-0.5 rounded font-medium transition-colors ${activeTab === "send" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"}`}
          >
            New Message
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`text-[11px] px-2 py-0.5 rounded font-medium transition-colors flex items-center gap-1 ${activeTab === "history" ? "bg-emerald-600 text-white" : "text-zinc-400 hover:text-white"}`}
          >
            History
            {activeTab === "history" && <RefreshCw className="w-2.5 h-2.5 ml-0.5 animate-spin" />}
          </button>
        </div>
      </div>

      {activeTab === "send" ? (
        <div className="space-y-3">
          {!phone && (
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-zinc-400">Destination Phone Number</label>
              <Input
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                placeholder="+91 9876543210"
                className="bg-black border-white/10 text-xs h-8"
              />
            </div>
          )}

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="text-[11px] font-medium text-zinc-400">Payload Type</label>
              <span className="text-[10px] text-emerald-400 font-mono">Meta Cloud API v19.0</span>
            </div>
            <select
              value={messageType}
              onChange={(e: any) => setMessageType(e.target.value)}
              className="w-full bg-black border border-white/10 rounded-md py-1 px-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="TEXT">💬 Freeform Session Text / Reminder</option>
              <option value="DOCUMENT">📄 PDF Invoice / Contract Quotation</option>
              <option value="IMAGE">🖼️ Production Preview Image</option>
              <option value="VIDEO">🎥 Cinematic Cut Video Preview</option>
              <option value="VOICE_NOTE">🎙️ Creative Director Voice Note</option>
              <option value="BUSINESS_CARD">🪪 Executive Digital Business Card</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-medium text-zinc-400">
              {messageType === "TEXT" ? "Message Content" : "Media Document / File URL"}
            </label>
            {messageType === "TEXT" ? (
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Type your direct operational message to ${recipientName}...`}
                className="bg-black border-white/10 text-xs min-h-[75px] resize-none focus:ring-emerald-500"
              />
            ) : (
              <Input
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="https://drive.google.com/open?id=..."
                className="bg-black border-white/10 text-xs h-8 focus:ring-emerald-500 font-mono"
              />
            )}
          </div>

          <Button
            onClick={handleSend}
            disabled={sending || (!phone && !customPhone)}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-semibold shadow-md"
          >
            {sending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Transmitting to Meta Queue...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Transmit WhatsApp via Cloud API
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {loadingHistory ? (
            <div className="py-8 text-center text-xs text-zinc-500 flex flex-col items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-500" />
              Syncing conversation timeline...
            </div>
          ) : messages.length === 0 ? (
            <div className="py-6 text-center text-xs text-zinc-500 bg-black/30 rounded border border-white/5">
              No recorded cloud API communication logs for this profile.
            </div>
          ) : (
            <div className="max-h-60 overflow-y-auto space-y-2 pr-1 text-xs">
              {messages.map((m: any) => {
                const isInbound = m.direction === "INBOUND";
                return (
                  <div
                    key={m.id}
                    className={`p-2 rounded-lg flex flex-col gap-1 ${
                      isInbound 
                        ? "bg-zinc-800/80 border border-zinc-700/50 mr-4 text-zinc-200" 
                        : "bg-emerald-950/40 border border-emerald-800/40 ml-4 text-emerald-100 text-right"
                    }`}
                  >
                    <div className="flex justify-between items-center text-[10px] text-zinc-400">
                      <span className="font-mono">{isInbound ? `⬅ ${m.sender}` : `➡ ${m.recipientPhone}`}</span>
                      <span>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        {!isInbound && renderStatusIcon(m.status)}
                      </span>
                    </div>
                    <p className="text-xs text-white break-words text-left">{m.content || `[${m.messageType || "Media"}]`}</p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between items-center pt-2 border-t border-white/5 text-[10px] text-zinc-500">
        <span>Channel: Official WhatsApp Cloud</span>
        <Badge variant="outline" className="text-[9px] px-1.5 py-0 bg-white/5 text-zinc-400 border-white/10">Encrypted</Badge>
      </div>
    </div>
  );
}
