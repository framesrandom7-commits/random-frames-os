"use client";

import React, { useTransition } from "react";
import { ModuleDetailsSection } from "@/components/ui/module";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, CreditCard, Film, XCircle, Loader2 } from "lucide-react";
import { Quotation, QuotationStatus, ClientContentDeliverable, ContentPipelineStatus } from "@prisma/client";
import { updateQuotation } from "@/app/actions/quotation";
import { updateContentDeliverableStatus } from "@/app/actions/content-pipeline";
import { toast } from "sonner";

interface ApprovalsModuleProps {
  clientId: string;
  quotations: Quotation[];
  contentDeliverables: ClientContentDeliverable[];
}

export function ApprovalsModule({ clientId, quotations, contentDeliverables }: ApprovalsModuleProps) {
  const [isPending, startTransition] = useTransition();

  const handleQuotationStatus = (id: string, status: QuotationStatus) => {
    startTransition(async () => {
      const result = await updateQuotation(id, { status });
      if (result.success) {
        toast.success(`Quotation marked as ${status}`);
      } else {
        toast.error("Failed to update quotation");
      }
    });
  };

  const handleContentStatus = (id: string, status: ContentPipelineStatus) => {
    startTransition(async () => {
      const result = await updateContentDeliverableStatus(id, clientId, status);
      if (result.success) {
        toast.success(`Content marked as ${status}`);
      } else {
        toast.error("Failed to update content");
      }
    });
  };

  // Financial Approvals (Pending)
  const pendingQuotations = quotations.filter(q => q.status === "SENT" || q.status === "VIEWED");
  const approvedQuotations = quotations.filter(q => q.status === "APPROVED").slice(0, 3); // Show top 3 recent

  // Creative Approvals (Pending)
  const pendingContent = contentDeliverables.filter(c => c.status === "SHARED" || c.status === "REVISION_REQUESTED");

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ModuleDetailsSection>
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10">
          <h2 className="text-lg font-medium text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-zinc-400" />
            Approval Engine
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Financial Approvals */}
          <div className="p-5 rounded-xl border border-white/10 bg-[#09090b] space-y-4 relative">
            {isPending && <div className="absolute inset-0 z-50 bg-black/50 rounded-xl flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>}
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400"><CreditCard className="w-5 h-5" /></div>
              <div>
                <h3 className="font-semibold text-white">Financial Approvals</h3>
                <p className="text-xs text-zinc-500">Quotations & Estimates pending client sign-off</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {pendingQuotations.length === 0 && approvedQuotations.length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-4 italic">No pending financial approvals.</p>
              )}

              {pendingQuotations.map(q => (
                <div key={q.id} className="p-4 rounded-lg bg-white/5 border border-amber-500/20 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{q.quotationNumber}</p>
                      <p className="text-xs text-zinc-400">Total: ₹{Number(q.total).toLocaleString()}</p>
                    </div>
                    <Badge className="bg-amber-500/20 text-amber-400">Pending Client</Badge>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300" onClick={() => handleQuotationStatus(q.id, "APPROVED")}>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Approve
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300" onClick={() => handleQuotationStatus(q.id, "REJECTED")}>
                      <XCircle className="w-3.5 h-3.5 mr-2" /> Decline
                    </Button>
                  </div>
                </div>
              ))}

              {approvedQuotations.map(q => (
                <div key={q.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5 opacity-70">
                  <div>
                    <p className="text-sm font-medium text-white line-through decoration-zinc-500">{q.quotationNumber}</p>
                    <p className="text-xs text-zinc-500">₹{Number(q.total).toLocaleString()}</p>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Approved</Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Creative Approvals */}
          <div className="p-5 rounded-xl border border-white/10 bg-[#09090b] space-y-4 relative">
            {isPending && <div className="absolute inset-0 z-50 bg-black/50 rounded-xl flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-white" /></div>}
            <div className="flex items-center gap-3 border-b border-white/5 pb-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400"><Film className="w-5 h-5" /></div>
              <div>
                <h3 className="font-semibold text-white">Creative Approvals</h3>
                <p className="text-xs text-zinc-500">Content deliverables pending client sign-off</p>
              </div>
            </div>
            
            <div className="space-y-3">
              {pendingContent.length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-4 italic">No content currently awaiting client approval.</p>
              )}

              {pendingContent.map(c => (
                <div key={c.id} className={`p-4 rounded-lg bg-white/5 border space-y-3 ${c.status === 'REVISION_REQUESTED' ? 'border-rose-500/20' : 'border-amber-500/20'}`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-white">{c.title}</p>
                      <p className="text-xs text-zinc-400">{c.format.replace('_', ' ')}</p>
                    </div>
                    {c.status === 'REVISION_REQUESTED' ? (
                      <Badge className="bg-rose-500/20 text-rose-400">Revision Req</Badge>
                    ) : (
                      <Badge className="bg-amber-500/20 text-amber-400">Pending Client</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-white/5">
                    <Button size="sm" variant="outline" className="flex-1 bg-transparent border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300" onClick={() => handleContentStatus(c.id, "APPROVED")}>
                      <CheckCircle2 className="w-3.5 h-3.5 mr-2" /> Approve
                    </Button>
                    {c.status !== 'REVISION_REQUESTED' && (
                      <Button size="sm" variant="outline" className="flex-1 bg-transparent border-rose-500/30 text-rose-400 hover:bg-rose-500/10 hover:text-rose-300" onClick={() => handleContentStatus(c.id, "REVISION_REQUESTED")}>
                        <XCircle className="w-3.5 h-3.5 mr-2" /> Needs Rev
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </ModuleDetailsSection>
    </div>
  );
}
