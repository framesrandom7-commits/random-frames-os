"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { whatsappLinks } from "@/lib/integrations/whatsapp";

interface WhatsAppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  phone?: string | null;
  onSavePhone: (phone: string) => Promise<{ success: boolean; error?: string }>;
  getMessageUrl?: (phone: string) => string;
  whatsappTemplate?: keyof typeof whatsappLinks;
  whatsappArgs?: any[];
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  children?: React.ReactNode;
  className?: string;
}

export function WhatsAppButton({
  phone,
  onSavePhone,
  getMessageUrl,
  whatsappTemplate,
  whatsappArgs = [],
  children,
  className,
  variant = "default",
  ...props
}: WhatsAppButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputPhone, setInputPhone] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const getResolvedUrl = (p: string) => {
    if (whatsappTemplate && whatsappLinks[whatsappTemplate]) {
      // @ts-expect-error - Type string cannot be used to index
      return whatsappLinks[whatsappTemplate](p, ...whatsappArgs);
    }
    return getMessageUrl ? getMessageUrl(p) : "";
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (phone) {
      window.open(getResolvedUrl(phone), "_blank", "noopener,noreferrer");
    } else {
      setIsOpen(true);
    }
  };

  const handleSave = async () => {
    if (!inputPhone || inputPhone.trim() === "") {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsSaving(true);
    try {
      const result = await onSavePhone(inputPhone);
      if (result.success) {
        toast.success("Phone number saved successfully");
        setIsOpen(false);
        // Open WhatsApp immediately after saving
        window.open(getResolvedUrl(inputPhone), "_blank", "noopener,noreferrer");
      } else {
        toast.error(result.error || "Failed to save phone number");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Button
        type="button"
        variant={variant}
        className={className}
        onClick={handleClick}
        {...props}
      >
        {children || (
          <>
            <MessageCircle className="w-4 h-4 mr-2" />
            WhatsApp
          </>
        )}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[425px] bg-[#111] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Missing Phone Number</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Please enter the phone number for this contact to continue sending the WhatsApp message.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="phone" className="text-zinc-300">
                Phone Number
              </Label>
              <Input
                id="phone"
                value={inputPhone}
                onChange={(e) => setInputPhone(e.target.value)}
                placeholder="e.g. +91 9876543210"
                className="bg-white/5 border-white/10 text-white placeholder:text-zinc-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSave();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="border-white/10 text-zinc-300 hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#C1121F] hover:bg-[#a00f1a] text-white"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save & Continue"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
