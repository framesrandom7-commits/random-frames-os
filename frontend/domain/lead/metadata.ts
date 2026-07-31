import { LeadStatus } from "@prisma/client";
import { StatusMetadata } from "../types/metadata";

export function getLeadStatusMetadata(status: LeadStatus): StatusMetadata {
  const metadata: Record<LeadStatus, StatusMetadata> = {
    [LeadStatus.NEW]: {
      label: "New",
      color: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20",
      icon: "Inbox",
      description: "Newly captured lead",
      order: 1,
      variant: "outline",
    },
    [LeadStatus.CONTACTED]: {
      label: "Contacted",
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      icon: "Phone",
      description: "Initial contact made",
      order: 2,
      variant: "outline",
    },
    [LeadStatus.REQUIREMENT_DISCUSSION]: {
      label: "Requirement Discussion",
      color: "bg-indigo-500/10 text-indigo-500 border-indigo-500/20",
      icon: "Users",
      description: "Discussing project requirements",
      order: 3,
      variant: "outline",
    },
    [LeadStatus.QUOTE_SENT]: {
      label: "Quote Sent",
      color: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      icon: "Send",
      description: "Quotation has been sent",
      order: 4,
      variant: "outline",
    },
    [LeadStatus.NEGOTIATION]: {
      label: "Negotiation",
      color: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      icon: "MessageSquare",
      description: "Negotiating terms",
      order: 5,
      variant: "outline",
    },
    [LeadStatus.QUOTE_APPROVED]: {
      label: "Quote Approved",
      color: "bg-teal-500/10 text-teal-500 border-teal-500/20",
      icon: "CheckSquare",
      description: "Client approved quotation",
      order: 6,
      variant: "outline",
    },
    [LeadStatus.ADVANCE_PENDING]: {
      label: "Advance Pending",
      color: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      icon: "Clock",
      description: "Waiting for advance payment",
      order: 7,
      variant: "outline",
    },
    [LeadStatus.CONVERTED]: {
      label: "Converted",
      color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
      icon: "CheckCircle",
      description: "Lead converted to Client",
      order: 8,
      variant: "outline",
    },
    [LeadStatus.LOST]: {
      label: "Lost",
      color: "bg-rose-500/10 text-rose-500 border-rose-500/20",
      icon: "XCircle",
      description: "Lead was lost",
      order: 9,
      variant: "outline",
    }
  };

  return metadata[status];
}
