"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Phone } from "lucide-react";
import { recordCallOutcome, CallOutcome } from "@/app/actions/calls";
import { toast } from "sonner";

interface CallOutcomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetType: "LEAD" | "CLIENT";
  targetId: string;
}

const OUTCOMES: CallOutcome[] = [
  "No Answer",
  "Call Back",
  "Connected",
  "Interested",
  "Not Interested",
  "Wrong Number",
  "Qualified"
];

export function CallOutcomeDialog({ open, onOpenChange, targetType, targetId }: CallOutcomeDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [outcome, setOutcome] = useState<CallOutcome>("No Answer");
  const [followUpDate, setFollowUpDate] = useState<string>("");
  const [nextAction, setNextAction] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = await recordCallOutcome({
      targetType,
      targetId,
      outcome,
      followUpDate: followUpDate ? new Date(followUpDate) : null,
      nextAction: nextAction || null,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast.success("Call outcome recorded successfully");
      onOpenChange(false);
      // Reset form
      setOutcome("No Answer");
      setFollowUpDate("");
      setNextAction("");
    } else {
      toast.error(result.error || "Failed to record call outcome");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-zinc-950 border-white/10 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="w-5 h-5 text-zinc-400" />
            Record Call Outcome
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Log the result of your outbound call.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Call Result</Label>
            <Select value={outcome} onValueChange={(val) => setOutcome(val as CallOutcome)}>
              <SelectTrigger className="w-full bg-zinc-900 border-zinc-800">
                <SelectValue placeholder="Select outcome..." />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-800 text-white">
                {OUTCOMES.map(o => (
                  <SelectItem key={o} value={o}>{o}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Next Follow-up Date (Optional)</Label>
            <Input 
              type="date" 
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="bg-zinc-900 border-zinc-800 [color-scheme:dark]"
            />
          </div>

          <div className="space-y-2">
            <Label>Next Action (Optional)</Label>
            <Textarea 
              placeholder="e.g. Send portfolio on WhatsApp"
              value={nextAction}
              onChange={(e) => setNextAction(e.target.value)}
              className="bg-zinc-900 border-zinc-800 min-h-[80px]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="bg-transparent border-white/10 text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-[#C1121F] text-white hover:bg-[#a00f1a]"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Call Record
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
