"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { XCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { markLeadAsLost } from "@/app/actions/lead";
import { LostReason } from "@prisma/client";
import { toast } from "sonner";

export default function MarkAsLostButton({ leadId, disabled }: { leadId: string, disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLost = async () => {
    if (!reason) {
      toast.error("Please select a reason");
      return;
    }
    setLoading(true);
    const success = await markLeadAsLost(leadId, reason, remarks);
    setLoading(false);
    if (success) {
      toast.success("Lead marked as lost");
      setOpen(false);
    } else {
      toast.error("Failed to update lead");
    }
  };

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        disabled={disabled}
        variant="destructive"
        className="shadow-lg"
      >
        <XCircle className="mr-2 h-4 w-4" />
        Mark as Lost
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px] bg-zinc-950 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Mark Lead as Lost</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Please specify the reason why this lead was lost.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Reason</Label>
              <Select onValueChange={(val) => setReason(val || "")} value={reason}>
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue placeholder="Select a reason..." />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  {Object.values(LostReason).map((r) => (
                    <SelectItem key={r} value={r} className="hover:bg-white/10">
                      {r.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid gap-2">
              <Label>Closing Remarks (Optional)</Label>
              <Textarea 
                placeholder="Any additional context..."
                className="bg-white/5 border-white/10 resize-none h-24"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)} disabled={loading} className="text-zinc-400 hover:text-white">
              Cancel
            </Button>
            <Button onClick={handleLost} disabled={!reason || loading} variant="destructive">
              {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Confirm Lost
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
