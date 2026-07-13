import React from "react";
import Topbar from "@/components/dashboard/topbar";
import { getLead } from "@/app/actions/lead";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "@/components/leads/status-badge";
import PriorityBadge from "@/components/leads/priority-badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, MapPin, Globe, AtSign, Clock, Star, Plus, FileText, PhoneCall, CheckCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import ReminderCard from "@/components/leads/reminder-card";
import AttachmentCard from "@/components/leads/attachment-card";

export const dynamic = "force-dynamic";

export default async function LeadDetailsPage({ params }: { params: { id: string } }) {
  const lead = await getLead(params.id);

  if (!lead) {
    notFound();
  }

  // Format full address
  const fullAddress = [lead.address, lead.city, lead.state, lead.country, lead.postalCode]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <Topbar title="Lead Details" />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#050505]">
        <div className="mb-6 flex flex-col gap-4">
          <Link href="/leads">
            <Button variant="ghost" className="w-fit text-zinc-400 hover:text-white p-0 h-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Leads
            </Button>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-white tracking-tight">{lead.businessName}</h2>
                <div className="flex items-center gap-1 text-amber-500 font-medium bg-amber-500/10 px-2 py-1 rounded-full text-sm">
                  <Star className="w-4 h-4 fill-current" />
                  {lead.leadScore}
                </div>
              </div>
              {lead.contactPerson && <p className="text-lg text-zinc-400 mt-1">{lead.contactPerson}</p>}
              
              {lead.leadTags && lead.leadTags.length > 0 && (
                <div className="flex gap-2 mt-3 flex-wrap">
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
            <div className="flex items-center gap-3">
              <StatusBadge status={lead.status} />
              <PriorityBadge priority={lead.priority} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Info & Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-white/10 bg-white/5 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white text-lg">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white text-lg">Activity Timeline</CardTitle>
                <Button size="sm" variant="outline" className="h-8 bg-zinc-900 border-white/10 text-white">
                  <Plus className="w-4 h-4 mr-2" /> Log Activity
                </Button>
              </CardHeader>
              <CardContent>
                {(() => {
                  const timelineItems = [
                    ...(lead.activities || []).map((a) => ({ ...a, _timelineType: 'activity' })),
                    ...(lead.communications || []).map((c) => ({ ...c, _timelineType: 'communication', description: c.summary }))
                  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

                  return timelineItems.length > 0 ? (
                    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/10 before:to-transparent">
                      {timelineItems.map((item) => (
                        <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-zinc-900 text-zinc-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                            {(item.type === 'CALL' || item.type === 'MEETING') && <PhoneCall className="w-4 h-4" />}
                            {item.type === 'EMAIL' && <Mail className="w-4 h-4" />}
                            {item.type === 'NOTE' && <FileText className="w-4 h-4" />}
                            {item.type === 'STATUS_CHANGE' && <CheckCircle className="w-4 h-4" />}
                            {!['CALL', 'MEETING', 'EMAIL', 'NOTE', 'STATUS_CHANGE'].includes(item.type) && <Clock className="w-4 h-4" />}
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-white/10 bg-white/5 shadow">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-bold text-white text-sm capitalize">{item.type.replace(/_/g, ' ').toLowerCase()}</h4>
                              <time className="text-xs text-zinc-500">{new Date(item.createdAt).toLocaleDateString()}</time>
                            </div>
                            <p className="text-sm text-zinc-400">{item.description}</p>
                            {'details' in item && item.details && <p className="text-xs text-zinc-500 mt-2 p-2 bg-black/20 rounded">{item.details}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-zinc-500 text-center py-8">No activities or communications logged yet.</p>
                  );
                })()}
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Meta & Attachments */}
          <div className="space-y-6">
            <Card className="border-white/10 bg-white/5 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white text-lg">Lead Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
              </CardContent>
            </Card>

            <ReminderCard reminders={lead.reminders || []} />

            <Card className="border-white/10 bg-white/5 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-300 whitespace-pre-wrap text-sm">
                  {lead.notes || "No notes available for this lead."}
                </p>
              </CardContent>
            </Card>

            <AttachmentCard leadId={lead.id} attachments={lead.attachments || []} />
          </div>
        </div>
      </main>
    </>
  );
}
