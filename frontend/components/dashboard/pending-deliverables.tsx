import React from "react";
import { Badge } from "@/components/ui/badge";
import { FileText, Camera, Building, AlertCircle } from "lucide-react";
import Link from "next/link";
import { getPendingDeliverables } from "@/app/actions/deliverable";

export default async function PendingDeliverables() {
  const deliverables = await getPendingDeliverables();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
      case 'EDITING': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'CHANGES_REQUESTED': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-red-400';
      case 'MEDIUM': return 'text-amber-400';
      case 'LOW': return 'text-blue-400';
      default: return 'text-zinc-400';
    }
  };

  if (deliverables.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex flex-row items-center justify-between p-6 pb-2">
          <h3 className="text-white text-lg font-medium flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-400" /> Pending Deliverables
          </h3>
        </div>
        <div className="p-6">
          <div className="text-center py-6">
            <CheckCircleIcon className="w-8 h-8 text-emerald-500/50 mx-auto mb-2" />
            <p className="text-zinc-500 text-sm">All deliverables are caught up.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      <div className="absolute top-0 left-0 h-1 bg-gradient-to-r from-purple-500/20 to-purple-500/50 w-full" />
      <div className="flex flex-row items-center justify-between p-6 pb-2 pt-7">
        <h3 className="text-white text-lg font-medium flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-400" /> Pending Deliverables
        </h3>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-2 space-y-3">
        {deliverables.map((item) => (
          <Link href={`/shoots/${item.shootId}`} key={item.id} className="block group">
            <div className="p-3 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/5 transition-colors group-hover:border-white/10">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-medium text-white">{item.type}</h4>
                  {item.priority === 'HIGH' && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                </div>
                <Badge variant="outline" className={`text-[10px] uppercase border ${getStatusColor(item.status)}`}>
                  {item.status.replace(/_/g, " ")}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-2 text-xs mt-3">
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Camera className="w-3.5 h-3.5" />
                  <span className="truncate">{item.shoot?.title || "Unknown Shoot"}</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400">
                  <Building className="w-3.5 h-3.5" />
                  <span className="truncate">{item.shoot?.project?.title || "Unknown Project"}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5 text-xs">
                <div className="text-zinc-500">
                  {item.dueDate ? (
                    <span>Due: <span className="text-zinc-300">{new Date(item.dueDate).toLocaleDateString()}</span></span>
                  ) : (
                    <span>No due date</span>
                  )}
                </div>
                <div className="text-zinc-500 flex items-center gap-1.5">
                  Priority: <span className={`font-medium ${getPriorityColor(item.priority)}`}>{item.priority}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function CheckCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}
