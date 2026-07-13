import React from "react";
import Topbar from "@/components/dashboard/topbar";
import { getClient } from "@/app/actions/client";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mail, Phone, MapPin, Globe, AtSign, Clock, Building, Plus, FileText, CheckCircle, CreditCard, Camera } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ClientDetailsPage({ params }: { params: { id: string } }) {
  const client = await getClient(params.id);

  if (!client) {
    notFound();
  }

  // Format full address
  const fullAddress = [client.address, client.city, client.state, client.country, client.postalCode]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <Topbar title="Client Details" />
      <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#050505]">
        <div className="mb-6 flex flex-col gap-4">
          <Link href="/clients">
            <Button variant="ghost" className="w-fit text-zinc-400 hover:text-white p-0 h-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Clients
            </Button>
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold text-white tracking-tight">{client.businessName}</h2>
                <Badge variant="outline" className="bg-white/5 text-zinc-300 font-mono">
                  {client.clientCode}
                </Badge>
              </div>
              {client.contactPerson && <p className="text-lg text-zinc-400 mt-1">{client.contactPerson}</p>}
            </div>
            <div className="flex items-center gap-3">
              <Badge className={client.archivedAt ? "bg-red-500/20 text-red-500" : "bg-emerald-500/20 text-emerald-500"}>
                {client.archivedAt ? "Archived" : "Active"}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {client.businessType.replace(/_/g, " ").toLowerCase()}
              </Badge>
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
                    <p className="text-white">{client.email || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="w-5 h-5 text-zinc-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Phone</p>
                    <p className="text-white">{client.phone || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-zinc-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Website</p>
                    <p className="text-white">
                      {client.website ? (
                        <a href={client.website} target="_blank" rel="noopener noreferrer" className="text-[#C1121F] hover:underline">
                          {client.website}
                        </a>
                      ) : "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <AtSign className="w-5 h-5 text-zinc-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Instagram</p>
                    <p className="text-white">{client.instagram || "—"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 md:col-span-2">
                  <MapPin className="w-5 h-5 text-zinc-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-zinc-500">Address</p>
                    <p className="text-white">{fullAddress || "—"}</p>
                  </div>
                </div>
                {client.gstNumber && (
                  <div className="flex items-start gap-3 md:col-span-2">
                    <Building className="w-5 h-5 text-zinc-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-zinc-500">GST Number</p>
                      <p className="text-white">{client.gstNumber}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-zinc-400" />
                    Projects
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-500 text-sm">No projects assigned yet.</p>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <Camera className="w-5 h-5 text-zinc-400" />
                    Shoots
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-500 text-sm">No shoots scheduled.</p>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <FileText className="w-5 h-5 text-zinc-400" />
                    Invoices
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-500 text-sm">No invoices generated.</p>
                </CardContent>
              </Card>

              <Card className="border-white/10 bg-white/5 backdrop-blur-md">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-zinc-400" />
                    Payments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-zinc-500 text-sm">No payments recorded.</p>
                </CardContent>
              </Card>
            </div>
            
            <Card className="border-white/10 bg-white/5 backdrop-blur-md">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-white text-lg">Activity Timeline</CardTitle>
                <Button size="sm" variant="outline" className="h-8 bg-zinc-900 border-white/10 text-white">
                  <Plus className="w-4 h-4 mr-2" /> Log Activity
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-500 text-center py-8">Timeline tracking for clients will be implemented in the next module iteration.</p>
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Meta & Notes */}
          <div className="space-y-6">
            <Card className="border-white/10 bg-white/5 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white text-lg">Client Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400 flex items-center gap-2"><Clock className="w-4 h-4"/> Client Since</span>
                  <span className="text-white text-sm">{new Date(client.createdAt).toLocaleDateString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-white/10 bg-white/5 backdrop-blur-md">
              <CardHeader>
                <CardTitle className="text-white text-lg">Internal Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-zinc-300 whitespace-pre-wrap text-sm">
                  {client.notes || "No notes available for this client."}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
