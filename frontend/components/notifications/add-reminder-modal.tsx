"use client";

import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { NotificationType, NotificationPriority } from "@prisma/client";
import { createReminder } from "@/app/actions/notifications";
import { toast } from "sonner";

interface AddReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddReminderModal({ isOpen, onClose, onSuccess }: AddReminderModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "GENERAL_REMINDER" as NotificationType,
    priority: "MEDIUM" as NotificationPriority,
    dueDate: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSelectChange = (name: string, value: string | null) => {
    if(value) setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createReminder({
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined
      });
      toast.success("Reminder created");
      onSuccess();
      onClose();
    } catch {
      toast.error("Failed to create reminder");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-zinc-900 border-white/10 text-white sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Reminder</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input name="title" required value={formData.title} onChange={handleChange} className="bg-black/50 border-white/10" placeholder="e.g. Call Client XYZ" />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea name="message" value={formData.message} onChange={handleChange} className="bg-black/50 border-white/10 min-h-[80px]" placeholder="Optional details..." />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={formData.type} onValueChange={(v) => handleSelectChange('type', v)}>
                <SelectTrigger className="bg-black/50 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  {Object.values(NotificationType).map(t => (
                    <SelectItem key={t} value={t}>{t.replace(/_/g, ' ')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={formData.priority} onValueChange={(v) => handleSelectChange('priority', v)}>
                <SelectTrigger className="bg-black/50 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-white/10 text-white">
                  <SelectItem value="LOW">Low</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Due Date & Time</Label>
            <Input type="datetime-local" name="dueDate" value={formData.dueDate} onChange={handleChange} className="bg-black/50 border-white/10" />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-white/10">
            <Button type="button" variant="outline" onClick={onClose} className="border-white/10 text-white bg-transparent">Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="bg-[#C1121F] hover:bg-[#a00f1a] text-white">
              {isSubmitting ? "Saving..." : "Create Reminder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
