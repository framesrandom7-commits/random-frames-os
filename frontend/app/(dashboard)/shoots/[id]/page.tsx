import React from "react";
import Topbar from "@/components/dashboard/topbar";
import { getShoot } from "@/app/actions/shoot";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Building, MapPin, ExternalLink, Calendar, Users, Camera, CloudSun, FileText, Settings, Video } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import EquipmentChecklist from "@/components/shoots/equipment-checklist";
import ShotListManager from "@/components/shoots/shot-list-manager";

export const dynamic = "force-dynamic";

export default async function ShootDetailsPage({ params }: { params: { id: string } }) {
  const shoot = await getShoot(params.id);

  if (!shoot) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'CONFIRMED': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'IN_PROGRESS': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'COMPLETED': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'CANCELLED': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'POSTPONED': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default: return 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
    }
  };

  return (
    <>
      <Topbar title="Shoot Details" />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#050505]">
        <div className="mb-6 flex flex-col gap-4">
          <Link href="/shoots">
            <Button variant="ghost" className="w-fit text-zinc-400 hover:text-white p-0 h-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Shoots
            </Button>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant="outline" className="bg-white/5 text-zinc-300 font-mono text-xs">
                  {shoot.shootCode}
                </Badge>
                <Badge variant="outline" className={`border ${getStatusColor(shoot.status)} text-xs`}>
                  {shoot.status.replace(/_/g, " ")}
                </Badge>
                <Badge variant="outline" className="border-white/10 text-zinc-300 text-xs uppercase tracking-wider">
                  {shoot.shootType.replace(/_/g, " ")}
                </Badge>
              </div>
              <h2 className="text-3xl font-bold text-white tracking-tight">{shoot.title}</h2>
              <div className="flex flex-wrap items-center text-sm text-zinc-400 mt-3 gap-x-6 gap-y-2">
                <Link href={`/clients/${shoot.clientId}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                  <Building className="w-4 h-4 text-zinc-500" />
                  {shoot.client.businessName}
                </Link>
                <div className="w-1 h-1 rounded-full bg-zinc-700 hidden sm:block"></div>
                <Link href={`/projects/${shoot.projectId}`} className="flex items-center gap-1.5 hover:text-white transition-colors">
                  <Camera className="w-4 h-4 text-zinc-500" />
                  {shoot.project.title}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Left/Main Column */}
          <div className="lg:col-span-2 xl:col-span-3 space-y-6">
            
            {/* Schedule & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" /> Schedule
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-500/10 p-2 rounded-md border border-blue-500/20">
                      <div className="text-center">
                        <div className="text-xs text-blue-400 uppercase font-semibold">
                          {shoot.date ? new Date(shoot.date).toLocaleString('default', { month: 'short' }) : "TBD"}
                        </div>
                        <div className="text-xl font-bold text-white leading-none mt-1">
                          {shoot.date ? new Date(shoot.date).getDate() : "-"}
                        </div>
                      </div>
                    </div>
                    <div className="pt-1">
                      <div className="text-sm font-medium text-white mb-1">
                        {shoot.date ? new Date(shoot.date).toLocaleDateString('default', { weekday: 'long', year: 'numeric' }) : "Date Not Set"}
                      </div>
                      <div className="flex items-center text-sm text-zinc-400">
                        <Clock className="w-4 h-4 mr-1.5" />
                        {shoot.startTime || "TBD"} {shoot.endTime ? `- ${shoot.endTime}` : ''}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-emerald-400" /> Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-white text-sm mb-3">
                    {shoot.location || <span className="text-zinc-500 italic">No location provided.</span>}
                  </p>
                  {shoot.googleMapsLink && (
                    <a 
                      href={shoot.googleMapsLink} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-400/10 hover:bg-emerald-400/20 px-3 py-1.5 rounded-md transition-colors"
                    >
                      <MapPin className="w-3.5 h-3.5 mr-1.5" /> Open in Google Maps
                      <ExternalLink className="w-3 h-3 ml-1.5 opacity-70" />
                    </a>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Crew & Brief */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" /> Crew & Team
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5" /> Photographer
                    </h4>
                    <p className="text-white text-sm">{shoot.photographer || "—"}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Video className="w-3.5 h-3.5" /> Videographer
                    </h4>
                    <p className="text-white text-sm">{shoot.videographer || "—"}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Assistants</h4>
                    <p className="text-white text-sm">{shoot.assistants || "—"}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-amber-400" /> Client Brief
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">Client Requirements</h4>
                    <p className="text-zinc-300 text-sm whitespace-pre-wrap">{shoot.clientRequirements || "—"}</p>
                  </div>
                  <div className="pt-3 border-t border-white/5">
                    <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <CloudSun className="w-3.5 h-3.5" /> Weather Notes
                    </h4>
                    <p className="text-zinc-300 text-sm whitespace-pre-wrap">{shoot.weatherNotes || "—"}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Shot List Manager */}
            <Card className="border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500/20 to-blue-500/50 w-full" />
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Camera className="w-5 h-5 text-blue-400" /> Shot List & Storyboard
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ShotListManager shootId={shoot.id} shots={shoot.shots} />
              </CardContent>
            </Card>
            
          </div>

          {/* Right Column: Interactive Checklists & Notes */}
          <div className="space-y-6">
            
            <Card className="border-white/10 bg-white/5 backdrop-blur-md overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-emerald-500/20 to-emerald-500/50 w-full" />
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Settings className="w-5 h-5 text-emerald-400" /> Equipment Checklist
                </CardTitle>
              </CardHeader>
              <CardContent>
                <EquipmentChecklist shootId={shoot.id} equipment={shoot.equipment} />
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5 backdrop-blur-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-lg">Internal Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-300 whitespace-pre-wrap text-sm">
                  {shoot.notes || "No notes available for this shoot."}
                </p>
              </CardContent>
            </Card>
            
          </div>
        </div>
      </main>
    </>
  );
}
