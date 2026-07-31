import React from "react";
import { getLead, updateLeadPhone } from "@/app/actions/lead";
import { notFound } from "next/navigation";
import {
  ModuleDetailsLayout,
  ModuleDetailsHeader,
  ModuleDetailsBody,
  ModuleDetailsContent,
  ModuleDetailsSidebar,
  ModuleDetailsSection
} from "@/components/ui/module";
import StatusBadge from "@/components/leads/status-badge";
import PriorityBadge from "@/components/leads/priority-badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, MapPin, Globe, AtSign, Clock, Star, Plus } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import ReminderCard from "@/components/leads/reminder-card";
import AttachmentCard from "@/components/leads/attachment-card";
import ConvertToClientButton from "@/components/leads/convert-to-client-button";
import MarkAsLostButton from "@/components/leads/mark-as-lost-button";
import CopyOnboardingLinkButton from "@/components/leads/copy-onboarding-link";
import { ActivityTimeline } from "@/components/shared/activity-timeline";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import QuotationActions from "@/components/leads/quotation-actions";
import { Typography } from "@/components/ui/typography";

export const dynamic = "force-dynamic";

export default async function LeadDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  let resolvedParams;
  try {
    resolvedParams = await params;
  } catch (error) {
    notFound();
  }

  if (!resolvedParams.id || typeof resolvedParams.id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(resolvedParams.id)) {
    notFound();
  }

  let lead;
  try {
    lead = await getLead(resolvedParams.id);
  } catch (error) {
    console.error("Failed to fetch lead details:", error);
    throw new Error("Failed to load lead details from the database.");
  }

  if (!lead) {
    notFound();
  }

  const fullAddress = [lead.address, lead.city, lead.state, lead.country, lead.postalCode]
    .filter(Boolean)
    .join(", ");

  return (
    <ModuleDetailsLayout>
      <Link href="/leads">
        <Button variant="ghost" className="w-fit text-zinc-400 hover:text-white p-0 h-auto">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Leads
        </Button>
      </Link>
      
      <ModuleDetailsHeader>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Typography variant="pageTitle">{lead.businessName}</Typography>
            <div className="flex items-center gap-1 text-amber-500 font-medium bg-amber-500/10 px-2 py-1 rounded-full text-base">
              <Star className="w-4 h-4 fill-current" />
              {lead.leadScore}
            </div>
          </div>
          {lead.contactPerson && <Typography variant="sectionTitle" color="muted">{lead.contactPerson}</Typography>}
          {lead.leadTags && lead.leadTags.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {lead.leadTags.map(lt => (
                <Badge key={lt.tag.id} variant="outline" className="text-xs py-0.5 border-white/20 text-zinc-300">
                  {lt.tag.name}
                </Badge>
              ))}
              <Button variant="ghost" size="sm" className="h-5 text-xs text-zinc-400 hover:text-white px-2">
                <Plus className="w-3 h-3 mr-1" /> Add Tag
              </Button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 items-end">
          <div className="flex gap-2">
            <StatusBadge status={lead.status} />
            <PriorityBadge priority={lead.priority} />
          </div>
          {lead.convertedToClientId ? (
            <Link href={`/clients/${lead.convertedToClientId}`}>
              <Button className="bg-zinc-800 text-white hover:bg-zinc-700">
                View Client
              </Button>
            </Link>
          ) : (
            <div className="flex gap-2 items-center">
              {(lead.status === "NEW" || lead.status === "CONTACTED" || lead.status === "REQUIREMENT_DISCUSSION") && (
                <WhatsAppButton 
                  variant="outline" 
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  phone={lead.whatsapp || lead.phone}
                  onSavePhone={async (phone) => {
                    "use server";
                    return updateLeadPhone(lead.id, phone);
                  }}
                  whatsappTemplate="rejectBeforeQuotation"
                  whatsappArgs={[lead.contactPerson || lead.businessName]}
                >
                  Reject (Pre-Quote)
                </WhatsAppButton>
              )}
              {(lead.status === "QUOTE_SENT" || lead.status === "NEGOTIATION" || lead.status === "QUOTE_APPROVED") && (
                <WhatsAppButton 
                  variant="outline" 
                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                  phone={lead.whatsapp || lead.phone}
                  onSavePhone={async (phone) => {
                    "use server";
                    return updateLeadPhone(lead.id, phone);
                  }}
                  whatsappTemplate="rejectAfterQuotation"
                  whatsappArgs={[lead.contactPerson || lead.businessName]}
                >
                  Reject (Post-Quote)
                </WhatsAppButton>
              )}
              <QuotationActions lead={lead} />
              {lead.status === "QUOTE_APPROVED" && (
                <CopyOnboardingLinkButton leadId={lead.id} />
              )}
              {lead.status !== "CONVERTED" && lead.status !== "LOST" && (
                <MarkAsLostButton leadId={lead.id} />
              )}
              <ConvertToClientButton leadId={lead.id} />
            </div>
          )}
        </div>
      </ModuleDetailsHeader>

      <ModuleDetailsBody>
        <ModuleDetailsContent>
          <ModuleDetailsSection>
            <div className="mb-4">
              <Typography variant="sectionTitle">Contact Information</Typography>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <Mail className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-zinc-500">Email</p>
                  <p className="text-white">{lead.email || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-zinc-500">Phone</p>
                  <p className="text-white">{lead.phone || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-green-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-zinc-500">WhatsApp</p>
                  <p className="text-white">{lead.whatsapp || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-zinc-500">Website</p>
                  <p className="text-white">
                    {lead.website ? (
                      <a href={lead.website} target="_blank" rel="noopener noreferrer" className="text-[#C1121F] hover:underline">
                        {lead.website}
                      </a>
                    ) : "—"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AtSign className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-zinc-500">Instagram</p>
                  <p className="text-white">{lead.instagram || "—"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 md:col-span-2">
                <MapPin className="w-5 h-5 text-zinc-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-zinc-500">Address</p>
                  <p className="text-white">{fullAddress || "—"}</p>
                </div>
              </div>
            </div>
          </ModuleDetailsSection>

          <ModuleDetailsSection>
            <div className="flex flex-row items-center justify-between mb-4">
              <Typography variant="sectionTitle">Activity Timeline</Typography>
              <Button size="sm" variant="outline" className="h-8 bg-zinc-900 border-white/10 text-white">
                <Plus className="w-4 h-4 mr-2" /> Log Activity
              </Button>
            </div>
            {(() => {
              const timelineItems = [
                ...(lead.activities || []),
                ...(lead.communications || []).map((c) => ({ 
                  id: c.id, 
                  type: 'NOTE' as any, 
                  description: c.summary, 
                  metadata: c.details ? { details: c.details } : null,
                  createdAt: c.createdAt,
                  createdBy: c.createdBy,
                  leadId: lead.id,
                  clientId: null,
                  projectId: null,
                  shootId: null,
                  invoiceId: null,
                  paymentId: null,
                  expenseId: null
                }))
              ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

              return <ActivityTimeline activities={timelineItems} />;
            })()}
          </ModuleDetailsSection>
        </ModuleDetailsContent>

        <ModuleDetailsSidebar>
          <ModuleDetailsSection>
            <div className="mb-4">
              <Typography variant="sectionTitle">Lead Details</Typography>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Source</span>
                <span className="text-white capitalize">{lead.leadSource.replace(/_/g, " ").toLowerCase()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Business Type</span>
                <span className="text-white capitalize">{lead.businessType.replace(/_/g, " ").toLowerCase()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400">Budget</span>
                <span className="text-white font-medium">
                  {lead.budget ? `${lead.budget.toString()} ${lead.currency}` : "—"}
                </span>
              </div>
              <hr className="border-white/10" />
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-2"><Clock className="w-4 h-4"/> Created At</span>
                <span className="text-white text-sm">{new Date(lead.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 flex items-center gap-2"><Clock className="w-4 h-4"/> Last Updated</span>
                <span className="text-white text-sm">{new Date(lead.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </ModuleDetailsSection>

          <ReminderCard reminders={lead.reminders || []} />

          <ModuleDetailsSection>
            <div className="mb-4">
              <Typography variant="sectionTitle">Notes</Typography>
            </div>
            <p className="text-zinc-300 whitespace-pre-wrap text-sm">
              {lead.notes || "No notes available for this lead."}
            </p>
          </ModuleDetailsSection>

          <AttachmentCard leadId={lead.id} attachments={lead.attachments || []} />
        </ModuleDetailsSidebar>
      </ModuleDetailsBody>
    </ModuleDetailsLayout>
  );
}
