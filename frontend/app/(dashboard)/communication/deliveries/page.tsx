import React from "react";
import { PageHeader } from "@/components/layout/page-header";
import { DeliveryService } from "@/lib/communication/delivery.service";
import { Button } from "@/components/ui/button";
import { Plus, Link as LinkIcon, Download, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function DeliveriesPage() {
  // In a real app we would fetch all deliveries globally or with pagination
  // For now we assume a custom fetch or we pass an empty projectId to get all if we modify the service.
  // We'll mock it passing a dummy projectId, or we can just render the structure since we are building UI.
  const deliveries = await DeliveryService.getDeliveriesForProject("");

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.16))] gap-6 text-white overflow-hidden">
      <div className="flex justify-between items-center">
        <PageHeader 
          title="Delivery Center"
          subtitle="Manage asset deliveries, secure links, and confirmations"
        />
        <Button className="bg-white text-black hover:bg-white/90">
          <Plus className="h-4 w-4 mr-2" />
          New Delivery
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
        {deliveries.length === 0 ? (
          <div className="text-center p-12 border border-dashed border-white/10 rounded-xl bg-white/5">
            <h3 className="text-lg font-medium mb-2">No Deliveries Found</h3>
            <p className="text-white/50 mb-4">You haven't sent any deliverables to clients yet.</p>
            <Button variant="outline" className="border-white/10">Create Delivery</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {deliveries.map(d => (
              <div key={d.id} className="bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-medium text-lg">{d.title}</h3>
                    <span className="px-2 py-0.5 rounded text-[10px] uppercase font-semibold bg-white/10">{d.status}</span>
                  </div>
                  {d.description && <p className="text-sm text-white/50 mb-3">{d.description}</p>}
                  
                  <div className="flex items-center gap-4 text-xs text-white/40">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Created {format(new Date(d.createdAt), 'MMM d, yyyy')}</span>
                    {d.expiryDate && <span className="flex items-center gap-1 text-orange-300"><Clock className="h-3 w-3" /> Expires {format(new Date(d.expiryDate), 'MMM d, yyyy')}</span>}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 min-w-[200px]">
                  <Button variant="outline" className="w-full justify-start bg-black/20 border-white/10 hover:bg-white/10">
                    <LinkIcon className="h-4 w-4 mr-2 text-blue-400" />
                    Copy Delivery Link
                  </Button>
                  <div className="flex justify-between text-xs text-white/40 px-1">
                    <span className="flex items-center gap-1" title="Views"><CheckCircle2 className={`h-3 w-3 ${d.viewedAt ? 'text-green-400' : ''}`} /> {d.viewedAt ? 'Viewed' : 'Unseen'}</span>
                    <span className="flex items-center gap-1" title="Downloads"><Download className={`h-3 w-3 ${d.downloadedAt ? 'text-green-400' : ''}`} /> {d.downloadedAt ? 'Downloaded' : 'No DL'}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
