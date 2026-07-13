import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Check, Clock, BellOff, Link as LinkIcon, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { updateNotificationStatus, snoozeNotification } from "@/app/actions/notifications";
import { NotificationStatus } from "@prisma/client";
import { toast } from "sonner";

interface NotificationCardProps {
  notification: any;
  onUpdate: () => void;
}

export default function NotificationCard({ notification: n, onUpdate }: NotificationCardProps) {
  
  const handleStatusChange = async (status: NotificationStatus) => {
    try {
      await updateNotificationStatus(n.id, status);
      onUpdate();
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleSnooze = async () => {
    try {
      await snoozeNotification(n.id, 1); // Snooze for 1 day
      toast.success("Snoozed for 1 day");
      onUpdate();
    } catch {
      toast.error("Failed to snooze");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'HIGH': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'MEDIUM': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const getEntityLink = () => {
    if (n.leadId) return `/leads/${n.leadId}`;
    if (n.clientId) return `/clients/${n.clientId}`;
    if (n.projectId) return `/projects/${n.projectId}`;
    if (n.shootId) return `/shoots/${n.shootId}`;
    if (n.invoiceId) return `/finance/invoices/${n.invoiceId}`;
    return null;
  };

  const entityLink = getEntityLink();

  const isOverdue = n.dueDate && new Date(n.dueDate) < new Date() && n.status === 'PENDING';

  return (
    <div className={`p-4 rounded-lg border flex flex-col md:flex-row gap-4 transition-colors ${
      isOverdue ? 'bg-red-500/5 border-red-500/20' : 'bg-white/5 border-white/10 hover:bg-white/10'
    }`}>
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className={`text-[10px] uppercase h-5 px-1.5 ${getPriorityColor(n.priority)}`}>
            {n.priority}
          </Badge>
          <h4 className="text-white font-medium truncate">{n.title}</h4>
          {isOverdue && (
            <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30 text-[10px] h-5">
              <AlertTriangle className="w-3 h-3 mr-1" /> Overdue
            </Badge>
          )}
        </div>
        
        {n.message && <p className="text-sm text-zinc-400 break-words">{n.message}</p>}
        
        <div className="flex items-center gap-4 text-xs text-zinc-500 flex-wrap pt-1">
          {n.dueDate && (
            <div className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              <span className={isOverdue ? "text-red-400 font-medium" : ""}>
                Due: {new Date(n.dueDate).toLocaleDateString()}
              </span>
            </div>
          )}
          {n.type && (
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                {n.type.replace(/_/g, ' ')}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-start md:justify-end gap-2 shrink-0">
        {entityLink && (
          <Link href={entityLink}>
            <Button variant="outline" size="sm" className="h-8 border-white/10 text-zinc-300 hover:text-white bg-black/20">
              <LinkIcon className="w-3.5 h-3.5 mr-1.5" /> View
            </Button>
          </Link>
        )}
        
        {n.status === 'PENDING' || n.status === 'SNOOZED' ? (
          <>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSnooze}
              className="h-8 border-white/10 text-zinc-300 hover:text-white bg-black/20"
              title="Snooze for 1 day"
            >
              <Clock className="w-3.5 h-3.5" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleStatusChange('DISMISSED')}
              className="h-8 border-white/10 text-zinc-300 hover:text-red-400 bg-black/20"
              title="Dismiss"
            >
              <BellOff className="w-3.5 h-3.5" />
            </Button>
            <Button 
              size="sm" 
              onClick={() => handleStatusChange('COMPLETED')}
              className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Check className="w-3.5 h-3.5 mr-1.5" /> Complete
            </Button>
          </>
        ) : n.status === 'DISMISSED' ? (
          <Badge variant="outline" className="border-white/10 text-zinc-500">Dismissed</Badge>
        ) : (
          <Badge variant="outline" className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
            <Check className="w-3 h-3 mr-1" /> Completed
          </Badge>
        )}
      </div>
    </div>
  );
}
