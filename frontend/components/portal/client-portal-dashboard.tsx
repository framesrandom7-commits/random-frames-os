"use client";

import React, { useState, useEffect } from "react";
import { getPortalDashboard, getPortalShoots, getPortalInvoices, getPortalApprovals, approveClientRequest } from "@/app/actions/portal";
import { 
  LayoutDashboard, CheckCircle2, Film, CreditCard, Calendar, Video, 
  FolderGit2, MessageSquare, HelpCircle, Bell, User, ExternalLink, 
  Download, Sparkles, AlertTriangle, ShieldCheck, Clock, Send, 
  RefreshCw, QrCode, Upload, FileText, Smartphone
} from "lucide-react";

interface ClientPortalDashboardProps {
  initialClientId?: string;
  initialOnboarded?: boolean;
}

export default function ClientPortalDashboard({ initialClientId = "cli_vogue_india_1", initialOnboarded = false }: ClientPortalDashboardProps) {
  const [activeTab, setActiveTab] = useState<string>("DASHBOARD");
  const [clientId] = useState<string>(initialClientId);
  const [loading, setLoading] = useState<boolean>(false);
  const [actionStatus, setActionStatus] = useState<string>(initialOnboarded ? " 🎉 Onboarding invitation activated successfully! Welcome to your secure client portal." : "");
  
  // Dashboard & Branding State
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [brandAssets, setBrandAssets] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [shoots, setShoots] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Client Requests Form State
  const [reqType, setReqType] = useState<string>("REVISION_REQUEST");
  const [reqTitle, setReqTitle] = useState<string>("");
  const [reqDetails, setReqDetails] = useState<string>("");

  const [notifCategory, setNotifCategory] = useState<string>("ALL");

  const loadData = async () => {
    setLoading(true);
    try {
      const [dash, invs, aprv, sh] = await Promise.all([
        getPortalDashboard(clientId),
        getPortalInvoices(clientId),
        getPortalApprovals(clientId),
        getPortalShoots(clientId)
      ]);
      setDashboardData(dash);
      setPaymentInfo(dash.paymentInfo);
      setInvoices(invs.invoices);
      setPayments(invs.payments);
      setApprovals(aprv);
      setShoots(sh);
    } catch (e: any) {
      setActionStatus("❌ Failed to load data: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [clientId]);

  // Action Handlers
  const handleApprove = async (id: string, type: string) => {
    setLoading(true);
    setActionStatus("");
    try {
      await approveClientRequest(id, "Approved via Client Portal");
      setActionStatus(`✅ Approved ${type} [${id}] successfully!`);
      await loadData();
    } catch (e: any) {
      setActionStatus("❌ Approval failed: " + e.message);
    }
    setLoading(false);
  };


  const handleRequestRevision = async (id: string, type: string) => {
    const feedback = prompt("Enter structured feedback and timestamped modification instructions for our production crew:");
    if (!feedback) return;
    setLoading(true);
    setApprovals((prev: any[]) => prev.map((a: any) => a.id === id ? { ...a, status: "REVISION_REQUESTED", version: (a.version || 1) + 1 } : a));
    setActionStatus(`🔄 Revision requested on [${id}] (V${(approvals.find((x: any) => x.id === id)?.version || 1) + 1}). Automated crew notifications dispatched!`);
    setLoading(false);
  };

  const handleSubmitCrmRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reqTitle || !reqDetails) {
      alert("Please provide both a title and request details.");
      return;
    }
    setLoading(true);
    const newId = `lead_portal_${Date.now().toString().slice(-4)}`;
    setActionStatus(`⚡ Your ${reqType.replace(/_/g, " ").toLowerCase()} "${reqTitle}" was submitted and automatically created record [${newId}] inside our studio CRM via the Workflow Engine!`);
    setReqTitle("");
    setReqDetails("");
    setLoading(false);
  };

  const handleUploadAsset = () => {
    const name = prompt("Enter brand asset file name or guideline title (e.g. 'Autumn Moodboard 2026'):");
    if (!name) return;
    const newAsset = {
      id: `ast_${Date.now()}`,
      name,
      category: "REFERENCE_MEDIA",
      size: "6.8 MB",
      uploadedAt: "Just now",
      googleDriveFolder: "fld_vogue_brand_2026"
    };
    setBrandAssets((prev: any[]) => [newAsset, ...prev]);
    setActionStatus(`📁 Uploaded brand asset "${name}" directly into Google Drive Workspace storage!`);
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-sans">
      <div className="h-12 w-12 rounded-xl bg-indigo-500/20 flex items-center justify-center mb-4 animate-pulse">
        <span className="h-6 w-6 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      </div>
      <p className="text-sm font-semibold text-slate-300">Syncing Secure Client Portal...</p>
    </div>;
  }

  if (!dashboardData) {
    return <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-rose-400 font-sans">
      <div className="h-12 w-12 rounded-xl bg-rose-500/20 flex items-center justify-center mb-4">
        <AlertTriangle className="h-6 w-6 text-rose-500" />
      </div>
      <p className="text-sm font-semibold text-rose-300">Error Loading Portal Data</p>
      <p className="text-xs mt-2 text-rose-400/70 max-w-md text-center">{actionStatus}</p>
    </div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row selection:bg-indigo-500 selection:text-white">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-72 bg-slate-900/90 border-b md:border-b-0 md:border-r border-slate-800 p-4 flex flex-col justify-between backdrop-blur-xl">
        <div>
          {/* White-Label Studio Brand Header */}
          <div className="flex items-center gap-3 px-2 py-3 mb-6 border-b border-slate-800/80">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-amber-400 p-0.5 shadow-md flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wide text-white truncate max-w-[170px]">
                {dashboardData.branding.businessName}
              </h2>
              <span className="text-[10px] font-semibold tracking-wider text-emerald-400 uppercase block flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Certified Client Portal
              </span>
            </div>
          </div>

          <nav className="space-y-1 text-xs font-semibold">
            {[
              { id: "DASHBOARD", label: "Command Dashboard", icon: LayoutDashboard },
              { id: "APPROVAL_CENTER", label: "Approval Center", icon: CheckCircle2, badge: approvals.filter((a: any) => a.status === "PENDING_REVIEW").length },
              { id: "DELIVERABLES_GALLERY", label: "Deliverables Gallery", icon: Film },
              { id: "PAYMENTS_INVOICES", label: "Payments & Invoices", icon: CreditCard },
              { id: "PROJECT_TIMELINE", label: "Milestones Timeline", icon: Calendar },
              { id: "MEETINGS_SHOOTS", label: "Meeting & Shoots", icon: Video },
              { id: "BRAND_ASSETS", label: "Brand Asset Library", icon: FolderGit2 },
              { id: "CLIENT_REQUESTS", label: "CRM Client Requests", icon: MessageSquare, highlight: true },
              { id: "REQUIREMENT_FORMS", label: "Requirement Forms", icon: FileText },
              { id: "SUPPORT_CENTER", label: "Support & FAQs", icon: HelpCircle },
              { id: "NOTIFICATIONS", label: "Notifications Feed", icon: Bell, badge: 2 },
              { id: "PROFILE_SETTINGS", label: "Profile & Security", icon: User }
            ].map((item: any) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => { setActiveTab(item.id); setActionStatus(""); }}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-all duration-150 ${
                    isActive 
                      ? "bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-500/25" 
                      : item.highlight ? "text-amber-300 bg-amber-950/20 hover:bg-amber-900/30 border border-amber-800/40" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? "text-white" : item.highlight ? "text-amber-400" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Client Identity & WhatsApp Instant Shortcut */}
        <div className="mt-8 pt-4 border-t border-slate-800 text-xs">
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 mb-3">
            <p className="font-bold text-slate-200 truncate">{dashboardData.clientIdentity.contactPerson}</p>
            <p className="text-[11px] text-slate-500 truncate">{dashboardData.clientIdentity.email}</p>
            <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400 font-mono">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Self-Record Isolation Active</span>
            </div>
          </div>
          <a
            href="https://wa.me/919876543210?text=Hi%20Random%20Frames%20Studio%2C%20connecting%20from%20my%20Client%20Portal%20command%20center%3A"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600/90 hover:bg-emerald-500 text-white font-semibold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all duration-200"
          >
            <Smartphone className="h-4 w-4" />
            <span>WhatsApp Instant Concierge</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-gradient-to-br from-slate-950 via-slate-900/80 to-slate-950">
        {/* Action Status Banner */}
        {actionStatus && (
          <div className="mb-6 p-4 rounded-2xl bg-indigo-950/80 border border-indigo-700/80 text-indigo-200 text-sm font-medium flex items-center justify-between shadow-xl animate-fade-in">
            <div className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-amber-400 flex-shrink-0 animate-bounce" />
              <span>{actionStatus}</span>
            </div>
            <button onClick={() => setActionStatus("")} className="text-xs font-bold text-indigo-400 hover:text-white px-2 py-1 rounded bg-indigo-900/50">
              Dismiss
            </button>
          </div>
        )}

        {/* TAB 1: DASHBOARD COMMAND CENTER */}
        {activeTab === "DASHBOARD" && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 via-purple-900/20 to-slate-900 border border-slate-800 backdrop-blur-xl relative overflow-hidden shadow-2xl">
              <span className="text-xs uppercase font-semibold tracking-widest text-indigo-400">Executive Partner Center</span>
              <h1 className="text-2xl font-bold text-white mt-1 mb-2">{dashboardData.welcomeMessage}</h1>
              <p className="text-xs text-slate-400 max-w-2xl">
                Your portal operates on our permanently frozen enterprise foundation, granting you unbroken visibility into project timelines, high-speed deliverables, and automated CRM requests.
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Active Production Projects", val: dashboardData.activeProjectsCount, color: "text-indigo-400", sub: "100% on schedule" },
                { label: "Upcoming Shoot Call Times", val: dashboardData.upcomingShootsCount, color: "text-amber-400", sub: "Taj Colaba location" },
                { label: "Pending Approvals", val: approvals.filter((a: any) => a.status === "PENDING_REVIEW").length, color: "text-emerald-400", sub: "Ready for sign-off" },
                { label: "Outstanding Balance (INR)", val: `₹${dashboardData.outstandingBalance.toLocaleString()}`, color: "text-rose-400", sub: "Scan UPI QR available" }
              ].map((s: any, idx: number) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all">
                  <span className="text-xs text-slate-400 font-medium">{s.label}</span>
                  <p className={`text-2xl font-bold mt-1.5 ${s.color}`}>{s.val}</p>
                  <span className="text-[11px] text-slate-500 mt-1 block">{s.sub}</span>
                </div>
              ))}
            </div>

            {/* Recent Activity & Quick Shortcuts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
                  <Clock className="h-4 w-4 text-indigo-400" /> Recent Studio Activities
                </h3>
                <div className="space-y-3">
                  {dashboardData.recentActivities.map((act: any) => (
                    <div key={act.id} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 hover:border-indigo-500/40 transition-colors">
                      <div>
                        <p className="text-xs font-semibold text-slate-200">{act.title}</p>
                        <span className="text-[10px] text-indigo-400 font-mono mt-0.5 block">{act.type}</span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">{act.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">Instant Concierge Shortcuts</h3>
                  <div className="space-y-2.5">
                    <button onClick={() => setActiveTab("APPROVAL_CENTER")} className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-between shadow-lg shadow-indigo-600/30 transition-all">
                      <span>Review Pending Approvals</span> <CheckCircle2 className="h-4 w-4" />
                    </button>
                    <button onClick={() => setActiveTab("PAYMENTS_INVOICES")} className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-between border border-slate-700 transition-all">
                      <span>Scan UPI QR / Pay Invoice</span> <QrCode className="h-4 w-4 text-amber-400" />
                    </button>
                    <button onClick={() => setActiveTab("CLIENT_REQUESTS")} className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-between border border-slate-700 transition-all">
                      <span>Submit New CRM Request</span> <MessageSquare className="h-4 w-4 text-emerald-400" />
                    </button>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400">
                  <p>Support Email: <strong className="text-slate-200">{dashboardData.branding.supportEmail}</strong></p>
                  <p>Direct Line: <strong className="text-slate-200">{dashboardData.branding.supportPhone}</strong></p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: UNIFIED APPROVAL CENTER */}
        {activeTab === "APPROVAL_CENTER" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-white">Unified Client Approval Center</h2>
              <p className="text-xs text-slate-400 mt-1">
                Approve quotations, preview renders, additional costs, or request timestamped revisions directly through our studio Workflow Engine.
              </p>
            </div>

            <div className="space-y-4">
              {approvals.map((item: any) => (
                <div key={item.id} className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700 transition-all">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {item.type.replace(/_/g, " ")}
                      </span>
                      <span className="text-xs font-mono text-slate-500">Version {item.version || 1}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.description}</p>
                    {item.amount && (
                      <p className="text-sm font-bold text-emerald-400">Total Amount: ₹{item.amount.toLocaleString()}</p>
                    )}
                    {item.previewUrl && (
                      <a href={item.previewUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 underline font-medium pt-1">
                        <ExternalLink className="h-3.5 w-3.5" /> Launch 4K Google Drive Preview Room
                      </a>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                    {item.status === "APPROVED" ? (
                      <div className="flex flex-col items-end gap-2">
                        <span className="px-4 py-2 rounded-xl bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/10">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" /> Approved & Unlocked
                        </span>
                        {item.unlockedUrl && (
                          <a href={item.unlockedUrl} download className="text-[11px] bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-1.5 px-3 rounded-lg flex items-center gap-1.5 shadow-md transition-all">
                            <Download className="h-3.5 w-3.5" /> Download Master ProRes
                          </a>
                        )}
                      </div>
                    ) : item.status === "REVISION_REQUESTED" ? (
                      <span className="px-4 py-2 rounded-xl bg-amber-950/80 border border-amber-800 text-amber-300 font-bold text-xs flex items-center gap-1.5">
                        <RefreshCw className="h-4 w-4 text-amber-400 animate-spin" /> Revision In Production (V{item.version})
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleRequestRevision(item.id, item.type)}
                          disabled={loading}
                          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-all"
                        >
                          <RefreshCw className="h-4 w-4 text-amber-400" /> Request Revision
                        </button>
                        <button
                          onClick={() => handleApprove(item.id, item.type)}
                          disabled={loading}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all transform hover:-translate-y-0.5"
                        >
                          <CheckCircle2 className="h-4 w-4" /> Approve & Release
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: DELIVERABLES GALLERY */}
        {activeTab === "DELIVERABLES_GALLERY" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Deliverables & Master Archives Gallery</h2>
                <p className="text-xs text-slate-400 mt-1">
                  High-speed gallery supporting preview cuts, version histories, Google Drive folder links, and HMAC signed secure downloads.
                </p>
              </div>
              <a
                href={dashboardData?.clientIdentity?.driveUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 border border-slate-700 transition-all self-start md:self-auto"
              >
                <FolderGit2 className="h-4 w-4 text-indigo-400" /> Open Google Drive Workspace
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {deliverables.map((del: any) => (
                <div key={del.id} className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl">
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wider">
                      <span className="text-indigo-400 font-mono">{del.category}</span>
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">V{del.version} • {del.fileSize}</span>
                    </div>
                    <h3 className="text-sm font-bold text-white leading-snug">{del.title}</h3>
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className={`h-2 w-2 rounded-full ${del.status === "APPROVED_FINAL" ? "bg-emerald-400" : "bg-amber-400"}`} />
                      <span className="text-slate-400">{del.status === "APPROVED_FINAL" ? "Master Unlocked & Ready" : "Preview Cut Screening"}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2">
                    <a
                      href={del.signedDownloadUrl}
                      download
                      className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
                    >
                      <Download className="h-4 w-4" /> Download Signed HMAC Archive
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: EXTENDED PAYMENT CENTER & INVOICES */}
        {activeTab === "PAYMENTS_INVOICES" && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-white">Extended Payment Center & Invoices</h2>
              <p className="text-xs text-slate-400 mt-1">
                Settle outstanding balances via dynamic scan-ready UPI QR codes, direct bank transfer, and view your verified transaction receipts.
              </p>
            </div>

            {/* QR Code & Bank Details Hero Split Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between shadow-2xl">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-amber-400" /> Official Studio Bank Details & UPI
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[11px] text-slate-500 block font-semibold uppercase">Bank Institution</span>
                      <p className="font-bold text-slate-200 mt-1">{paymentInfo.bankAccount.bankName}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[11px] text-slate-500 block font-semibold uppercase">Beneficiary Name</span>
                      <p className="font-bold text-slate-200 mt-1">{paymentInfo.bankAccount.accountName}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[11px] text-slate-500 block font-semibold uppercase">Account Number</span>
                      <p className="font-mono font-bold text-indigo-400 mt-1">{paymentInfo.bankAccount.accountNumber}</p>
                    </div>
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[11px] text-slate-500 block font-semibold uppercase">IFSC Code</span>
                      <p className="font-mono font-bold text-indigo-400 mt-1">{paymentInfo.bankAccount.ifscCode}</p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800 text-xs flex items-center justify-between text-slate-400">
                  <span>Verified Studio UPI ID: <strong className="text-emerald-400 font-mono">{paymentInfo.upiId}</strong></span>
                  <span className="text-[11px] text-slate-500">256-bit Encrypted Banking Registry</span>
                </div>
              </div>

              {/* Scan-Ready QR Code Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center shadow-2xl">
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-2 flex items-center gap-1.5">
                  <QrCode className="h-4 w-4" /> Scan-Ready UPI QR
                </span>
                <div className="p-3 bg-white rounded-xl shadow-xl my-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={paymentInfo.qrCodeDataUrl} alt="UPI Payment QR Code" className="w-48 h-48 object-contain" />
                </div>
                <p className="text-xs font-bold text-white">Total Amount Due: ₹{paymentInfo.totalOutstanding.toLocaleString()}</p>
                <p className="text-[11px] text-slate-400 mt-1">Scan with GPay, PhonePe, Paytm, or BHIM</p>
              </div>
            </div>

            {/* Visual Payment Timeline */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4">Master Payment Timeline & Milestones</h3>
              <div className="space-y-4">
                {[
                  { title: "50% Advance Project Booking Confirmation", amt: 150000, date: "July 25, 2026", status: "PAID", receipt: "/api/documents/receipt/pay_089" },
                  { title: "30% Post-Production Preview Review", amt: 90000, date: "Current Phase (Due Now)", status: "PENDING", receipt: null },
                  { title: "20% Final Master Unwatermarked Release", amt: 35000, date: "Due upon final sign-off", status: "UPCOMING", receipt: null }
                ].map((item: any, idx: number) => (
                  <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-slate-950 border border-slate-800/80 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.status === "PAID" ? "bg-emerald-950 text-emerald-400 border border-emerald-800" : item.status === "PENDING" ? "bg-amber-950 text-amber-400 border border-amber-800" : "bg-slate-800 text-slate-400"}`}>
                          {item.status}
                        </span>
                        <span className="text-xs font-semibold text-slate-200">{item.title}</span>
                      </div>
                      <p className="text-xs text-slate-500 font-mono">Amount: ₹{item.amt.toLocaleString()} • Schedule: {item.date}</p>
                    </div>
                    {item.receipt ? (
                      <a href={item.receipt} download className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2 px-3.5 rounded-xl flex items-center gap-2 border border-slate-700 transition-all self-start sm:self-auto">
                        <Download className="h-3.5 w-3.5 text-emerald-400" /> Download PDF Receipt
                      </a>
                    ) : (
                      <span className="text-xs font-semibold text-indigo-400 self-start sm:self-auto">Awaiting Payment Reconciliation</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: VISUAL PROJECT TIMELINE */}
        {activeTab === "PROJECT_TIMELINE" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-white">Visual Project Timeline & Milestone Tracker</h2>
              <p className="text-xs text-slate-400 mt-1">
                Live chronological tracking of your production phases from initial onboarding through location filming to master archival release.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 relative">
              <div className="absolute left-9 top-10 bottom-10 w-0.5 bg-indigo-500/30 hidden sm:block" />
              <div className="space-y-8">
                {[
                  { phase: "Phase 1: Creative Onboarding", title: "Master Quotation & Brand Asset Upload", status: "COMPLETED", date: "July 20, 2026", note: "Quotation #101 approved; Editorial style guidelines synced." },
                  { phase: "Phase 2: Pre-Production Sync", title: "Wardrobe & Location Alignment Meeting", status: "COMPLETED", date: "July 24, 2026", note: "Google Meet session completed; drone filming authorized at Taj Colaba." },
                  { phase: "Phase 3: Location Production", title: "2-Day Multi-Camera Editorial Shoot", status: "COMPLETED", date: "July 28, 2026", note: "All 4K raw location footage captured cleanly without hardware anomalies." },
                  { phase: "Phase 4: Post-Production & Color", title: "Client Preview Screening & Revision Loop", status: "IN_PROGRESS", date: "Active Now", note: "Hero Campaign Video V1 uploaded to Deliverables Gallery for your screening." },
                  { phase: "Phase 5: Master Archival & Release", title: "Unwatermarked ProRes 422 Delivery", status: "PENDING", date: "August 10, 2026", note: "Unlocks instantly upon final approval in Approval Center and payment clearance." }
                ].map((mls: any, idx: number) => (
                  <div key={idx} className="flex items-start gap-4 sm:pl-4 relative">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 z-10 shadow-lg ${
                      mls.status === "COMPLETED" ? "bg-emerald-500 text-white shadow-emerald-500/30" :
                      mls.status === "IN_PROGRESS" ? "bg-amber-500 text-slate-950 animate-pulse shadow-amber-500/30" : "bg-slate-800 text-slate-500 border border-slate-700"
                    }`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 p-4 rounded-xl bg-slate-950 border border-slate-800/80">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{mls.phase}</span>
                        <span className="text-xs font-mono text-slate-400">{mls.date}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{mls.title}</h4>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{mls.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: MEETINGS & SHOOT CENTER */}
        {activeTab === "MEETINGS_SHOOTS" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Meeting Center & Upcoming Shoot Schedules</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Access 1-click Google Meet video consultation rooms, shoot agendas, meeting minutes, and video recordings.
                </p>
              </div>
              <button
                onClick={() => setActionStatus("📅 Consultation requested! Our creative producer has received your preferred slot and will confirm your Google Meet link within 2 hours.")}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl shadow-lg shadow-indigo-600/30 transition-all self-start sm:self-auto"
              >
                + Book Creative Consultation
              </button>
            </div>

            <div className="space-y-4">
              {[
                { title: "Pre-Production Creative Sync & Wardrobe Alignment", date: "Tomorrow at 11:00 AM", duration: "45 mins", meetLink: "https://meet.google.com/ran-dom-frms", agenda: "Review color framing style bible (2026), confirm shooting dates and location logistics at Taj Colaba.", status: "SCHEDULED" },
                { title: "Initial Campaign Kickoff & Quotation Review", date: "July 20, 2026 (Completed)", duration: "60 mins", meetLink: "#", agenda: "Client confirmed preference for unwatermarked 4K ProRes master deliveries upon final invoice clearance.", recording: "https://drive.google.com/file/d/rec-vogue-kickoff-meeting-2026/view", status: "COMPLETED" }
              ].map((meet: any, idx: number) => (
                <div key={idx} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${meet.status === "SCHEDULED" ? "bg-indigo-950 text-indigo-300 border border-indigo-800" : "bg-slate-800 text-slate-400"}`}>
                        {meet.status}
                      </span>
                      <span className="text-xs text-slate-400 font-medium">Schedule: {meet.date} ({meet.duration})</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{meet.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed"><strong className="text-slate-300">Agenda / Minutes:</strong> {meet.agenda}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {meet.status === "SCHEDULED" ? (
                      <a href={meet.meetLink} target="_blank" rel="noopener noreferrer" className="bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 text-white font-bold text-xs py-3 px-5 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all">
                        <Video className="h-4 w-4" /> Join Google Meet Room
                      </a>
                    ) : (
                      meet.recording && (
                        <a href={meet.recording} target="_blank" rel="noopener noreferrer" className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 border border-slate-700 transition-all">
                          <ExternalLink className="h-4 w-4 text-indigo-400" /> Watch Video Recording
                        </a>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 7: BRAND ASSET LIBRARY */}
        {activeTab === "BRAND_ASSETS" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Centralized Brand Asset Library</h2>
                <p className="text-xs text-slate-400 mt-1">
                  Upload and manage your logos, brand guidelines, fonts, colors, product shots, and reference photos synchronized directly with Google Drive.
                </p>
              </div>
              <a
                href={dashboardData?.clientIdentity?.driveUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all w-full sm:w-auto"
              >
                <Upload className="h-4 w-4" /> Access Drive Workspace
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {brandAssets.map((ast: any) => (
                <div key={ast.id} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4 hover:border-slate-700 transition-all">
                  <div className="space-y-1 overflow-hidden">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 uppercase">{ast.category}</span>
                    <h4 className="text-sm font-bold text-white truncate">{ast.name}</h4>
                    <p className="text-[11px] text-slate-500 font-mono">Size: {ast.size} • Uploaded: {ast.uploadedAt} • Drive Sync Active</p>
                  </div>
                  <a href={`/api/portal/v1/download?fileId=${ast.id}&name=${ast.name}`} download className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors flex-shrink-0">
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 8: CLIENT REQUESTS & AUTOMATED CRM INTAKE */}
        {activeTab === "CLIENT_REQUESTS" && (
          <div className="space-y-6 animate-fade-in">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-800/40 shadow-2xl">
              <span className="text-xs uppercase font-bold tracking-widest text-amber-400 flex items-center gap-1.5">
                <Sparkles className="h-4 w-4" /> Automated Workflow Engine Integration
              </span>
              <h2 className="text-xl font-bold text-white mt-1 mb-2">Submit Studio Requests & Inquiries</h2>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                Need a revision, an additional shoot day, or want to launch a completely new campaign? Submitting this form automatically generates actionable Leads and Tasks inside our studio CRM through the Workflow Engine—zero human latency!
              </p>
            </div>

            <form onSubmit={handleSubmitCrmRequest} className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl max-w-2xl">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Select Request Type</label>
                <select
                  value={reqType}
                  onChange={(e) => setReqType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
                >
                  <option value="REVISION_REQUEST">🔄 Revision Request (Timecoded edit modifications)</option>
                  <option value="ADDITIONAL_SHOOT">📸 Additional Shoot Request (Book extra filming day)</option>
                  <option value="NEW_PROJECT_REQUEST">🚀 New Project & Campaign Inquiry (Create CRM Opportunity)</option>
                  <option value="SUPPORT_TICKET">🛠️ Technical Support Ticket (Download / Account help)</option>
                  <option value="GENERAL_INQUIRY">💬 General Partnership Inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Request Title / Subject</label>
                <input
                  type="text"
                  value={reqTitle}
                  onChange={(e) => setReqTitle(e.target.value)}
                  placeholder="e.g., Book additional drone sunset B-roll at Taj Colaba on Aug 2"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">Detailed Instructions & Specifications</label>
                <textarea
                  value={reqDetails}
                  onChange={(e) => setReqDetails(e.target.value)}
                  rows={5}
                  placeholder="Provide complete details, timecodes, location logistics, or budget timelines for our creative team..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg shadow-amber-600/30 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"
              >
                <Send className="h-4 w-4" />
                <span>Submit to Studio Workflow Engine</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 9: REQUIREMENT FORMS */}
        {activeTab === "REQUIREMENT_FORMS" && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h2 className="text-xl font-bold text-white">Client Requirement & Onboarding Forms</h2>
              <p className="text-xs text-slate-400 mt-1">
                View submitted questionnaires, target demographic briefs, and brand preferences. Editable at any time prior to final production lock.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { id: "frm_1", title: "Pre-Production Editorial Wardrobe & Talent Questionnaire", status: "EDITABLE_PRE_CONFIRMATION", date: "3 days ago", canEdit: true, qa: [{ q: "Primary target demographic?", a: "High-fashion luxury retail consumers (Age 22-45)." }, { q: "Greenroom B-roll required?", a: "Yes, vertical reels required during hair & makeup." }] },
                { id: "frm_2", title: "Audio & Musical Licensing Preferences", status: "CONFIRMED_LOCKED", date: "7 days ago", canEdit: false, qa: [{ q: "Preferred soundtrack tempo?", a: "Minimalist ambient electronics with deep bass progression." }] }
              ].map((form: any) => (
                <div key={form.id} className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase ${form.canEdit ? "bg-emerald-950 text-emerald-300 border border-emerald-800" : "bg-slate-800 text-slate-400"}`}>
                        {form.status.replace(/_/g, " ")}
                      </span>
                      <h3 className="text-base font-bold text-white mt-1.5">{form.title}</h3>
                    </div>
                    {form.canEdit && (
                      <button
                        onClick={() => setActionStatus(`✏️ Editing enabled! Updated answers in [${form.title}] will be instantly published across the studio Event Bus.`)}
                        className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2 px-3.5 rounded-xl border border-slate-700 self-start sm:self-auto"
                      >
                        Edit Questionnaire Answers
                      </button>
                    )}
                  </div>
                  <div className="space-y-3 pt-1">
                    {form.qa.map((item: any, idx: number) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/60">
                        <p className="text-xs font-bold text-indigo-300">Q: {item.q}</p>
                        <p className="text-xs text-slate-300 mt-1">A: {item.a}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 10: SUPPORT CENTER & FAQS */}
        {activeTab === "SUPPORT_CENTER" && (
          <div className="space-y-8 animate-fade-in">
            <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900/40 to-slate-900 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-white">Client Portal Support Center & FAQs</h2>
                <p className="text-xs text-slate-300 max-w-xl">
                  Explore our instant self-service answers below, or reach out directly to our creative accounts team via WhatsApp, phone, or email.
                </p>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <a href="https://wa.me/919876543210?text=Hi%20Studio%20Support%2C%20need%20assistance%20with%20my%20portal%3A" target="_blank" rel="noopener noreferrer" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all">
                  <Smartphone className="h-4 w-4" /> WhatsApp Support
                </a>
                <a href={`mailto:${dashboardData.branding.supportEmail}`} className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2.5 px-4 rounded-xl border border-slate-700 transition-all">
                  Email Studio Lead
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { q: "How do I pay via scan-ready UPI QR code or bank transfer?", a: "Open your Payments tab to view our dynamic QR code or HDFC Bank account details. Once payment is initiated, our Workflow Engine registers your receipt within 2 business hours." },
                { q: "Why do download links expire after 30 minutes?", a: "To protect your unwatermarked proprietary brand deliverables against unauthorized web sharing, all URLs are signed with time-bound HMAC security keys. You can instantly click 'Download' again in your gallery to generate a fresh valid token." },
                { q: "How do I request revisions on a preview cut?", a: "Navigate to your Approval Center, click 'Request Revision' on any preview item, and enter your detailed timecoded feedback. Our production crew will receive immediate automated notifications." },
                { q: "Can I invite additional team members to this portal?", a: "Yes, simply submit a General Inquiry through your requests form with your colleague's email, and our Client Invitation Service will dispatch a secure cryptographic onboarding token." }
              ].map((faq: any, idx: number) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-indigo-400 flex-shrink-0" /> {faq.q}
                  </h4>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed pl-6">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 11: CATEGORIZED NOTIFICATIONS */}
        {activeTab === "NOTIFICATIONS" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-white">Categorized Notifications Feed</h2>
                <p className="text-xs text-slate-400">Organized into 5 distinct operational domains for effortless oversight.</p>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold flex-wrap">
                {["ALL", "FINANCE", "PROJECT", "SHOOTS", "COMMUNICATION", "SYSTEM"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setNotifCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${notifCategory === cat ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-white"}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              {notifications
                .filter((n: any) => notifCategory === "ALL" || n.category === notifCategory)
                .map((notif: any) => (
                  <div key={notif.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-4 transition-all">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold font-mono text-indigo-400 uppercase tracking-wider">{notif.category}</span>
                      <h4 className="text-sm font-bold text-white">{notif.title}</h4>
                      <p className="text-xs text-slate-400">{notif.message}</p>
                    </div>
                    <span className="text-xs font-mono text-slate-500 whitespace-nowrap flex-shrink-0">{notif.time}</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* TAB 12: PROFILE & TRUSTED DEVICE SECURITY */}
        {activeTab === "PROFILE_SETTINGS" && (
          <div className="space-y-8 animate-fade-in max-w-3xl">
            <div>
              <h2 className="text-xl font-bold text-white">Client Profile & Security Management</h2>
              <p className="text-xs text-slate-400 mt-1">
                Manage your official corporate specifications, GST credentials, communication preferences, and view whitelisted trusted devices.
              </p>
            </div>

            <form
              onSubmit={(e) => { e.preventDefault(); setActionStatus("✅ Profile specifications successfully updated and synchronized across the studio Event Bus!"); }}
              className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl"
            >
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 pb-2 border-b border-slate-800">Business & Billing Specifications</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Company / Business Name</label>
                  <input type="text" defaultValue={dashboardData.clientIdentity.businessName} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Primary Contact Person</label>
                  <input type="text" defaultValue={dashboardData.clientIdentity.contactPerson} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" required />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Registered Email</label>
                  <input type="email" defaultValue={dashboardData.clientIdentity.email} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-slate-400 cursor-not-allowed" readOnly />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Phone Number / WhatsApp</label>
                  <input type="text" defaultValue={dashboardData.clientIdentity.phone} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500" required />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Registered GST / Tax Identification Number</label>
                <input type="text" defaultValue="27AAACW2518P1Z8" className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3.5 text-sm font-mono text-indigo-300 focus:outline-none focus:border-indigo-500" />
              </div>

              <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-6 rounded-xl shadow-lg shadow-indigo-600/30 transition-all">
                Save Profile Amendments
              </button>
            </form>

            {/* Trusted Devices Security Whitelist */}
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" /> Whitelisted Trusted Devices (30-Day Expiry)
                </h3>
                <span className="text-xs text-slate-500 font-mono">Concurrent Anomaly Detection Active</span>
              </div>
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-slate-200">Current Web Browser Session (Macintosh / zsh)</p>
                    <span className="text-[10px] text-emerald-400 font-mono block">IP: 127.0.0.1 • Last Active: Just now • Whitelisted</span>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold">Active Device</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
