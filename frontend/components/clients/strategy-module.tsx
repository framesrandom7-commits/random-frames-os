"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ModuleDetailsSection } from "@/components/ui/module";
import { Target, Save, FileText, Link as LinkIcon, FileIcon, Loader2, Edit3, X } from "lucide-react";
import { upsertClientStrategy } from "@/app/actions/strategy";
import { toast } from "sonner";
import { FileUpload } from "@/components/ui/file-upload";
import { ClientStrategy } from "@prisma/client";

interface StrategyModuleProps {
  clientId: string;
  initialData: ClientStrategy | null;
}

export function StrategyModule({ clientId, initialData }: StrategyModuleProps) {
  const [isEditing, setIsEditing] = useState(!initialData);
  const [isPending, startTransition] = useTransition();
  
  const [brandGuidelines, setBrandGuidelines] = useState(initialData?.brandGuidelines || "");
  const [targetAudience, setTargetAudience] = useState(initialData?.targetAudience || "");
  const [coreObjectives, setCoreObjectives] = useState(initialData?.coreObjectives || "");
  const [referenceLinks, setReferenceLinks] = useState(initialData?.referenceLinks || "");
  
  // Parse documents from JSON string if available
  const [documents, setDocuments] = useState<{name: string, url: string}[]>(() => {
    try {
      return initialData?.documents ? JSON.parse(initialData.documents) : [];
    } catch {
      return [];
    }
  });

  const handleSave = () => {
    startTransition(async () => {
      const result = await upsertClientStrategy(clientId, {
        brandGuidelines,
        targetAudience,
        coreObjectives,
        referenceLinks,
        documents: JSON.stringify(documents),
      });

      if (result.success) {
        toast.success("Strategy updated successfully");
        setIsEditing(false);
      } else {
        toast.error("Failed to update strategy");
      }
    });
  };

  const handleMockUpload = (files: File[]) => {
    // In a real app, you would upload to S3 here.
    // For now, we mock the uploaded URLs.
    const newDocs = files.map(f => ({
      name: f.name,
      url: `https://storage.randomframes.com/strategy/${clientId}/${f.name}`
    }));
    setDocuments(prev => [...prev, ...newDocs]);
    toast.success(`${files.length} document(s) attached to strategy.`);
  };

  const removeDoc = (index: number) => {
    setDocuments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ModuleDetailsSection>
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-zinc-400" />
            Client Strategy & Brand Identity
          </h2>
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm" className="bg-white/5 border-white/10 text-zinc-300 hover:text-white">
              <Edit3 className="w-4 h-4 mr-2" />
              Edit Strategy
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              {initialData && (
                <Button onClick={() => setIsEditing(false)} variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
                  Cancel
                </Button>
              )}
              <Button onClick={handleSave} disabled={isPending} className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-md">
                {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                Save Strategy
              </Button>
            </div>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-8">
            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <Label className="text-zinc-300 text-sm font-medium">Core Objectives & KPIs</Label>
                <Textarea 
                  value={coreObjectives}
                  onChange={(e) => setCoreObjectives(e.target.value)}
                  placeholder="What is the primary goal for this client? (e.g. Increase social reach by 20%, launch new product)"
                  className="min-h-[120px] bg-[#09090b] border-white/10 text-white resize-y"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-zinc-300 text-sm font-medium">Target Audience</Label>
                <Textarea 
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="Who are we speaking to? (Demographics, pain points, behaviors)"
                  className="min-h-[120px] bg-[#09090b] border-white/10 text-white resize-y"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-zinc-300 text-sm font-medium">Brand Guidelines & Tone</Label>
              <Textarea 
                value={brandGuidelines}
                onChange={(e) => setBrandGuidelines(e.target.value)}
                placeholder="List brand colors, fonts, tone of voice (e.g. Professional but witty), and core messaging pillars."
                className="min-h-[150px] bg-[#09090b] border-white/10 text-white resize-y"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
              <div className="space-y-3">
                <Label className="text-zinc-300 text-sm font-medium flex items-center gap-2">
                  <LinkIcon className="w-4 h-4" /> Reference Links (Drive, Pinterest, Figma)
                </Label>
                <Textarea 
                  value={referenceLinks}
                  onChange={(e) => setReferenceLinks(e.target.value)}
                  placeholder="Paste URLs here (one per line)"
                  className="min-h-[150px] bg-[#09090b] border-white/10 text-white resize-y font-mono text-xs"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-zinc-300 text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Strategy Documents
                </Label>
                <FileUpload 
                  onUpload={handleMockUpload} 
                  accept=".pdf,.docx,.pptx,.jpg,.png"
                  maxFiles={10}
                />
                
                {documents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-wider mb-2">Attached Files</p>
                    {documents.map((doc, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 rounded-md bg-white/5 border border-white/5">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <FileIcon className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span className="text-sm text-zinc-300 truncate">{doc.name}</span>
                        </div>
                        <button onClick={() => removeDoc(idx)} className="text-zinc-500 hover:text-rose-400 p-1 transition-colors">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-10">
            {/* View Mode */}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4 bg-white/5 rounded-xl p-5 border border-white/5">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Target className="w-3 h-3" /> Core Objectives
                </h3>
                <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {coreObjectives || <span className="text-zinc-600 italic">No objectives defined.</span>}
                </div>
              </div>

              <div className="space-y-4 bg-white/5 rounded-xl p-5 border border-white/5">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                  <Target className="w-3 h-3" /> Target Audience
                </h3>
                <div className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {targetAudience || <span className="text-zinc-600 italic">No audience defined.</span>}
                </div>
              </div>
            </div>

            <div className="space-y-4 bg-[#09090b] rounded-xl p-6 border border-white/10">
              <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Brand Guidelines & Tone</h3>
              <div className="text-white text-base leading-relaxed whitespace-pre-wrap">
                {brandGuidelines || <span className="text-zinc-600 italic text-sm">No brand guidelines defined.</span>}
              </div>
            </div>

            {(referenceLinks || documents.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                {referenceLinks && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <LinkIcon className="w-3 h-3" /> Reference Links
                    </h3>
                    <div className="space-y-2">
                      {referenceLinks.split('\n').filter(url => url.trim() !== '').map((url, idx) => (
                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 truncate bg-indigo-500/10 p-2.5 rounded-lg border border-indigo-500/20 transition-colors">
                          <LinkIcon className="w-3 h-3 shrink-0" />
                          <span className="truncate">{url}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {documents.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                      <FileText className="w-3 h-3" /> Strategy Documents
                    </h3>
                    <div className="grid grid-cols-1 gap-2">
                      {documents.map((doc, idx) => (
                        <a key={idx} href={doc.url} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                          <div className="p-2 rounded bg-indigo-500/20 text-indigo-400 group-hover:bg-indigo-500/30 transition-colors">
                            <FileIcon className="w-4 h-4" />
                          </div>
                          <span className="text-sm text-zinc-300 font-medium truncate">{doc.name}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {!referenceLinks && documents.length === 0 && (
               <div className="pt-6 border-t border-white/5 text-center">
                 <p className="text-sm text-zinc-500 italic">No reference links or documents uploaded.</p>
               </div>
            )}
          </div>
        )}
      </ModuleDetailsSection>
    </div>
  );
}
