"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Send, Mail, MessageCircle, Paperclip } from "lucide-react";

interface UniversalComposerProps {
  clientId?: string;
  projectId?: string;
  templates: any[];
}

export function UniversalComposer({ clientId, projectId, templates }: UniversalComposerProps) {
  const [channel, setChannel] = useState<"EMAIL" | "MESSAGE">("EMAIL");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("none");
  const [isSending, setIsSending] = useState(false);

  const handleTemplateChange = (val: string) => {
    setSelectedTemplateId(val);
    if (val === "none") {
      setBody("");
      setSubject("");
      return;
    }
    const template = templates.find(t => t.id === val);
    if (template) {
      setSubject(template.subject || "");
      // In a real app, you would call TemplateEngine.previewTemplate via Server Action here
      // to resolve {{variables}} before throwing it into the textarea
      setBody(template.body);
    }
  };

  const handleSend = async () => {
    setIsSending(true);
    // In a real app, you would call CommunicationService.sendCommunication via Server Action
    console.log("Sending...", { channel, subject, body, clientId, projectId });
    setTimeout(() => {
      setIsSending(false);
      setBody("");
      setSubject("");
      setSelectedTemplateId("none");
    }, 1000);
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Compose Message</h3>
        <div className="flex bg-black/40 rounded-lg p-1">
          <button 
            onClick={() => setChannel("EMAIL")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${channel === "EMAIL" ? 'bg-blue-600 text-white' : 'text-white/60 hover:text-white'}`}
          >
            <Mail className="h-4 w-4" /> Email
          </button>
          <button 
            onClick={() => setChannel("MESSAGE")}
            className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${channel === "MESSAGE" ? 'bg-green-600 text-white' : 'text-white/60 hover:text-white'}`}
          >
            <MessageCircle className="h-4 w-4" /> WhatsApp
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {templates.length > 0 && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/50 w-20">Template:</span>
            <Select value={selectedTemplateId} onValueChange={handleTemplateChange}>
              <SelectTrigger className="bg-black/20 border-white/10 flex-1">
                <SelectValue placeholder="Select a template..." />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-white/10 text-white">
                <SelectItem value="none">Blank Message</SelectItem>
                {templates.filter(t => t.type === channel).map(t => (
                  <SelectItem key={t.id} value={t.id}>{t.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {channel === "EMAIL" && (
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/50 w-20">Subject:</span>
            <Input 
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="Enter subject line..."
              className="bg-black/20 border-white/10 flex-1 text-white"
            />
          </div>
        )}

        <div>
          <Textarea 
            value={body}
            onChange={e => setBody(e.target.value)}
            placeholder="Type your message here... Use {{variable}} syntax for dynamic fields."
            className="bg-black/20 border-white/10 min-h-[200px] text-white resize-none mt-2"
          />
        </div>

        <div className="flex justify-between items-center pt-2">
          <Button variant="outline" size="sm" className="bg-white/5 border-white/10 text-white hover:bg-white/10">
            <Paperclip className="h-4 w-4 mr-2" />
            Attach File
          </Button>
          
          <Button 
            onClick={handleSend} 
            disabled={isSending || !body} 
            className={`${channel === 'EMAIL' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'} text-white`}
          >
            {isSending ? "Sending..." : (
              <>
                <Send className="h-4 w-4 mr-2" />
                {channel === 'EMAIL' ? 'Send Email' : 'Send WhatsApp'}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
