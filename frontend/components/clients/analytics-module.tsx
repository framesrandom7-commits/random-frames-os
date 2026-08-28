"use client";

import React, { useState, useTransition } from "react";
import { ModuleDetailsSection } from "@/components/ui/module";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LineChart, Plus, Loader2, ExternalLink, Trash2, Eye, Heart, MessageCircle, Share2, Bookmark, MousePointerClick, Users, IndianRupee, ArrowUpRight } from "lucide-react";
import { ClientContentMetric } from "@prisma/client";
import { createContentMetric, deleteContentMetric } from "@/app/actions/content-metrics";
import { toast } from "sonner";
import { format } from "date-fns";

interface AnalyticsModuleProps {
  clientId: string;
  metrics: ClientContentMetric[];
}

export function AnalyticsModule({ clientId, metrics }: AnalyticsModuleProps) {
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("INSTAGRAM");
  const [publishedUrl, setPublishedUrl] = useState("");
  
  // Metrics State
  const [views, setViews] = useState(0);
  const [likes, setLikes] = useState(0);
  const [comments, setComments] = useState(0);
  const [shares, setShares] = useState(0);
  const [saves, setSaves] = useState(0);
  const [linkClicks, setLinkClicks] = useState(0);
  const [leadsGenerated, setLeadsGenerated] = useState(0);
  const [adSpend, setAdSpend] = useState(0);

  const handleCreateMetric = () => {
    if (!title) {
      toast.error("Title is required");
      return;
    }

    startTransition(async () => {
      const result = await createContentMetric({
        clientId,
        title,
        platform,
        publishedUrl,
        publishedAt: new Date(),
        views,
        likes,
        comments,
        shares,
        saves,
        linkClicks,
        leadsGenerated,
        adSpend
      });

      if (result.success) {
        toast.success("Metrics logged successfully");
        setIsDialogOpen(false);
        // Reset form
        setTitle("");
        setPlatform("INSTAGRAM");
        setPublishedUrl("");
        setViews(0); setLikes(0); setComments(0); setShares(0); setSaves(0); setLinkClicks(0); setLeadsGenerated(0); setAdSpend(0);
      } else {
        toast.error("Failed to log metrics");
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this log?")) return;
    startTransition(async () => {
      await deleteContentMetric(id, clientId);
      toast.success("Deleted metric log");
    });
  };

  // Aggregates
  const totalViews = metrics.reduce((acc, curr) => acc + curr.views, 0);
  const totalEngagement = metrics.reduce((acc, curr) => acc + curr.likes + curr.comments + curr.shares + curr.saves, 0);
  const totalLeads = metrics.reduce((acc, curr) => acc + curr.leadsGenerated, 0);
  const totalSpend = metrics.reduce((acc, curr) => acc + Number(curr.adSpend), 0);
  const avgCostPerLead = totalLeads > 0 ? (totalSpend / totalLeads).toFixed(2) : "0.00";

  const KpiCard = ({ title, value, icon: Icon, trend }: { title: string, value: string | number, icon: any, trend?: string }) => (
    <div className="p-5 rounded-xl border border-white/10 bg-[#09090b] flex items-start justify-between">
      <div className="space-y-1">
        <p className="text-sm font-medium text-zinc-400">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
        {trend && (
          <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3" /> {trend}
          </p>
        )}
      </div>
      <div className="p-2.5 rounded-lg bg-white/5 text-zinc-300">
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <ModuleDetailsSection>
        <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
          <div className="space-y-1">
            <h2 className="text-lg font-medium text-white flex items-center gap-2">
              <LineChart className="w-5 h-5 text-indigo-400" />
              Analytics & Publishing
            </h2>
            <p className="text-sm text-zinc-400">Track ROAS, overall reach, and leads generated from your content.</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-500 text-white shadow-md">
                <Plus className="w-4 h-4 mr-2" />
                Log Published Post
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-[#09090b] border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Log Published Content Metrics</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-5 py-4">
                <div className="space-y-2 col-span-2">
                  <Label>Asset Title</Label>
                  <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Summer Campaign Reel 1" className="bg-white/5 border-white/10 text-white" />
                </div>
                
                <div className="space-y-2">
                  <Label>Platform</Label>
                  <Select value={platform} onValueChange={setPlatform}>
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#09090b] border-white/10 text-white">
                      <SelectItem value="INSTAGRAM">Instagram</SelectItem>
                      <SelectItem value="YOUTUBE">YouTube</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Live URL Link</Label>
                  <Input value={publishedUrl} onChange={e => setPublishedUrl(e.target.value)} placeholder="https://instagram.com/reel/..." className="bg-white/5 border-white/10 text-white" />
                </div>

                {/* Metrics Grid */}
                <div className="col-span-2 mt-2 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-medium text-zinc-400 mb-4">Performance Metrics</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs flex items-center gap-1 text-zinc-300"><Eye className="w-3 h-3"/> Views (Reach)</Label>
                      <Input type="number" min="0" value={views} onChange={e => setViews(parseInt(e.target.value) || 0)} className="bg-white/5 border-white/10" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs flex items-center gap-1 text-zinc-300"><Heart className="w-3 h-3"/> Likes</Label>
                      <Input type="number" min="0" value={likes} onChange={e => setLikes(parseInt(e.target.value) || 0)} className="bg-white/5 border-white/10" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs flex items-center gap-1 text-zinc-300"><MessageCircle className="w-3 h-3"/> Comments</Label>
                      <Input type="number" min="0" value={comments} onChange={e => setComments(parseInt(e.target.value) || 0)} className="bg-white/5 border-white/10" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs flex items-center gap-1 text-zinc-300"><Share2 className="w-3 h-3"/> Shares</Label>
                      <Input type="number" min="0" value={shares} onChange={e => setShares(parseInt(e.target.value) || 0)} className="bg-white/5 border-white/10" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs flex items-center gap-1 text-zinc-300"><Bookmark className="w-3 h-3"/> Saves</Label>
                      <Input type="number" min="0" value={saves} onChange={e => setSaves(parseInt(e.target.value) || 0)} className="bg-white/5 border-white/10" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs flex items-center gap-1 text-zinc-300"><MousePointerClick className="w-3 h-3"/> Link Clicks</Label>
                      <Input type="number" min="0" value={linkClicks} onChange={e => setLinkClicks(parseInt(e.target.value) || 0)} className="bg-white/5 border-white/10" />
                    </div>
                  </div>
                </div>

                {/* Conversion Grid */}
                <div className="col-span-2 mt-2 pt-4 border-t border-white/10">
                  <h4 className="text-sm font-medium text-zinc-400 mb-4">Conversion & Spend</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-xs flex items-center gap-1 text-zinc-300"><Users className="w-3 h-3"/> Leads Generated</Label>
                      <Input type="number" min="0" value={leadsGenerated} onChange={e => setLeadsGenerated(parseInt(e.target.value) || 0)} className="bg-emerald-500/10 border-emerald-500/20 text-emerald-400" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs flex items-center gap-1 text-zinc-300"><IndianRupee className="w-3 h-3"/> Ad Spend (₹)</Label>
                      <Input type="number" min="0" step="0.01" value={adSpend} onChange={e => setAdSpend(parseFloat(e.target.value) || 0)} className="bg-rose-500/10 border-rose-500/20 text-rose-400" />
                    </div>
                  </div>
                </div>

              </div>
              <div className="flex justify-end gap-3 mt-2">
                <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="text-zinc-400 hover:text-white">Cancel</Button>
                <Button onClick={handleCreateMetric} disabled={isPending} className="bg-indigo-600 hover:bg-indigo-500 text-white">
                  {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Metrics
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Top Level KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <KpiCard title="Total Views" value={totalViews.toLocaleString()} icon={Eye} />
          <KpiCard title="Total Engagement" value={totalEngagement.toLocaleString()} icon={Heart} />
          <KpiCard title="Total Leads" value={totalLeads.toLocaleString()} icon={Users} trend={totalLeads > 0 ? "Active" : undefined} />
          <KpiCard title="Cost Per Lead" value={`₹${avgCostPerLead}`} icon={IndianRupee} />
        </div>
        
        {/* Post Breakdown */}
        <div>
          <h3 className="text-sm font-semibold text-white mb-4">Published Post Breakdown</h3>
          <div className="space-y-3">
            {metrics.length === 0 ? (
              <p className="text-sm text-zinc-500 text-center py-10 italic border border-white/5 rounded-xl bg-white/5">No published posts logged yet.</p>
            ) : (
              metrics.map(metric => (
                <div key={metric.id} className="p-5 rounded-xl border border-white/10 bg-[#09090b] hover:border-white/20 transition-colors group">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-sm font-medium text-white mb-1 flex items-center gap-2">
                        {metric.title}
                        {metric.publishedUrl && (
                          <a href={metric.publishedUrl} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-indigo-400">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </h4>
                      <p className="text-xs text-zinc-400">
                        {metric.platform} • Published on {format(new Date(metric.publishedAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <button onClick={() => handleDelete(metric.id)} className="text-zinc-600 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-4 md:grid-cols-8 gap-4 pt-4 border-t border-white/5">
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Views</p>
                      <p className="text-sm font-medium text-white">{metric.views.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Likes</p>
                      <p className="text-sm font-medium text-white">{metric.likes.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Comments</p>
                      <p className="text-sm font-medium text-white">{metric.comments.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Shares</p>
                      <p className="text-sm font-medium text-white">{metric.shares.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Saves</p>
                      <p className="text-sm font-medium text-white">{metric.saves.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase text-zinc-500 font-semibold tracking-wider">Clicks</p>
                      <p className="text-sm font-medium text-white">{metric.linkClicks.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase text-emerald-500/70 font-semibold tracking-wider">Leads</p>
                      <p className="text-sm font-medium text-emerald-400">{metric.leadsGenerated.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] uppercase text-rose-500/70 font-semibold tracking-wider">Spend</p>
                      <p className="text-sm font-medium text-rose-400">₹{Number(metric.adSpend).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </ModuleDetailsSection>
    </div>
  );
}
