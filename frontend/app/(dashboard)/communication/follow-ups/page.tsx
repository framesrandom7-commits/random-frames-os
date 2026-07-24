import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { FollowUpEngine } from "@/lib/communication/follow-up.engine";
import { Button } from "@/components/ui/button";
import { Plus, Clock, CheckCircle2, User, Phone, Mail } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function FollowUpsPage() {
  const followUps = await FollowUpEngine.getPendingFollowUps({});

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] gap-6 text-white overflow-hidden">
      <div className="flex justify-between items-center">
        <PageHeader 
          title="Follow-ups"
          subtitle="Manage scheduled reminders and client follow-ups"
        />
        <Button className="bg-white text-black hover:bg-white/90">
          <Plus className="h-4 w-4 mr-2" />
          Add Follow-up
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {followUps.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-white/10 rounded-xl bg-white/5">
            <h3 className="text-lg font-medium mb-2">No Pending Follow-ups</h3>
            <p className="text-white/50 mb-4">You are all caught up with your client communications.</p>
            <Button variant="outline" className="border-white/10">Schedule Follow-up</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {followUps.map(f => (
              <div key={f.id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-6 group hover:bg-white/10 transition-colors">
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-lg truncate">{f.title}</h3>
                    <Badge variant="outline" className={`border-none ${f.priority === 'URGENT' ? 'bg-red-500/20 text-red-400' : f.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' : 'bg-white/10'}`}>
                      {f.priority}
                    </Badge>
                  </div>
                  
                  {f.description && <p className="text-sm text-white/60 mb-4 line-clamp-2">{f.description}</p>}
                  
                  <div className="flex flex-wrap items-center gap-4 text-xs text-white/50">
                    <span className={`flex items-center gap-1 font-medium ${new Date(f.dueDate) < new Date() ? 'text-red-400' : 'text-white/80'}`}>
                      <Clock className="h-3 w-3" /> Due {format(new Date(f.dueDate), 'MMM d, yyyy')}
                    </span>
                    
                    {f.client && (
                      <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded">
                        <User className="h-3 w-3" /> {f.client.businessName || f.client.contactPerson}
                      </span>
                    )}
                    {f.lead && (
                      <span className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded">
                        <User className="h-3 w-3" /> {f.lead.businessName || f.lead.contactPerson}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-row md:flex-col gap-2">
                  <Button variant="outline" className="bg-green-600/10 text-green-400 border-green-600/30 hover:bg-green-600/20 flex-1 md:flex-none">
                    <CheckCircle2 className="h-4 w-4 mr-2" /> Mark Done
                  </Button>
                  <Button variant="outline" className="bg-white/5 border-white/10 hover:bg-white/10 flex-1 md:flex-none">
                    <Mail className="h-4 w-4 mr-2" /> Message
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
