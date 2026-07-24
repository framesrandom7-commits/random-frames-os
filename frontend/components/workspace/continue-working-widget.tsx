import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, Image as ImageIcon } from "lucide-react";

interface ResumeItem {
  id: string;
  type: "PROJECT" | "SHOOT" | "LEAD" | "DELIVERABLE";
  title: string;
  subtitle: string; // client name or project name
  statusText: string;
  href: string;
  updatedAt: Date;
  actionText: string;
  progress: number;
  coverImage?: string | null; // For future when cover images exist
}

// Helper to generate a consistent gradient based on string ID
const generateGradient = (id: string) => {
  const colors = [
    "from-blue-900/40 to-indigo-900/40",
    "from-purple-900/40 to-fuchsia-900/40",
    "from-emerald-900/40 to-teal-900/40",
    "from-orange-900/40 to-red-900/40",
    "from-zinc-800 to-zinc-900"
  ];
  const index = id.charCodeAt(id.length - 1) % colors.length;
  return colors[index];
};

export default async function ContinueWorkingWidget() {
  const [projects, shoots, leads, deliverables] = await Promise.all([
    prisma.project.findMany({
      where: { status: { in: ["SHOOTING", "EDITING", "REVIEW", "PLANNED"] } },
      include: { client: true },
      orderBy: { updatedAt: "desc" },
      take: 2,
    }),
    prisma.shoot.findMany({
      where: { status: { in: ["CONFIRMED", "IN_PROGRESS"] } },
      include: { project: { include: { client: true } } },
      orderBy: { updatedAt: "desc" },
      take: 2,
    }),
    prisma.lead.findMany({
      where: { status: { in: ["ATTENDED", "REQUIREMENT_DISCUSSION", "QUOTATION_SENT", "NEGOTIATION"] } },
      orderBy: { updatedAt: "desc" },
      take: 2,
    }),
    prisma.deliverable.findMany({
      where: { status: { in: ["EDITING", "CHANGES_REQUESTED"] } },
      include: { shoot: { include: { project: { include: { client: true } } } } },
      orderBy: { updatedAt: "desc" },
      take: 2,
    })
  ]);

  const items: ResumeItem[] = [];

  projects.forEach(p => {
    items.push({
      id: `proj-${p.id}`,
      type: "PROJECT",
      title: p.title,
      subtitle: p.client?.businessName || "No Client",
      statusText: p.status,
      href: `/projects/${p.id}`,
      updatedAt: p.updatedAt,
      actionText: "Resume",
      progress: p.status === "SHOOTING" ? 40 : p.status === "EDITING" ? 70 : p.status === "REVIEW" ? 90 : 10
    });
  });

  shoots.forEach(s => {
    items.push({
      id: `shoot-${s.id}`,
      type: "SHOOT",
      title: s.title,
      subtitle: s.project?.client?.businessName || "Internal",
      statusText: s.status,
      href: `/shoots/${s.id}`,
      updatedAt: s.updatedAt,
      actionText: "Open",
      progress: s.status === "IN_PROGRESS" ? 50 : 20
    });
  });

  leads.forEach(l => {
    items.push({
      id: `lead-${l.id}`,
      type: "LEAD",
      title: l.businessName,
      subtitle: l.contactPerson || "Lead",
      statusText: "Pending Follow-up",
      href: `/leads/${l.id}`,
      updatedAt: l.updatedAt,
      actionText: "Continue",
      progress: 60
    });
  });

  deliverables.forEach((d: any) => {
    items.push({
      id: `del-${d.id}`,
      type: "DELIVERABLE",
      title: d.type,
      subtitle: d.shoot?.project?.title || "Project",
      statusText: d.status,
      href: `/shoots/${d.shootId}`,
      updatedAt: d.updatedAt,
      actionText: "Review",
      progress: d.status === "EDITING" ? 50 : 95
    });
  });

  items.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  const finalItems = items.slice(0, 4);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
          Continue Working
        </h2>
        <Link href="/projects" className="text-[10px] font-medium text-zinc-500 hover:text-white transition-colors uppercase tracking-wider">
          View All
        </Link>
      </div>
      
      {finalItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-[#1D212B] rounded-3xl border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
          <p className="text-zinc-400 font-medium">Nothing active at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {finalItems.map((item) => {
            const gradient = generateGradient(item.id);
            return (
              <div key={item.id} className="group relative flex flex-col h-[280px] bg-[#171A21] rounded-[24px] border border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.2)] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
                
                {/* Background Image / Placeholder */}
                <div className="absolute inset-0 z-0">
                  {item.coverImage ? (
                    <img src={item.coverImage} alt={item.title} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${gradient} opacity-80 group-hover:scale-105 transition-transform duration-700`} />
                  )}
                  {/* Vignette / Overlay to ensure text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111318] via-[#111318]/80 to-transparent" />
                </div>

                <div className="relative z-10 flex flex-col h-full p-5">
                  <div className="flex items-center justify-between mb-auto">
                    <span className="px-2 py-0.5 rounded-full bg-white/10 backdrop-blur-md text-[10px] font-semibold text-white tracking-wider border border-white/10">
                      {item.type}
                    </span>
                    <button className="w-8 h-8 rounded-full bg-black/20 hover:bg-black/40 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white transition-colors border border-white/5">
                      <span className="sr-only">More</span>
                      •••
                    </button>
                  </div>

                  <div>
                    <h4 className="text-lg font-bold text-white tracking-tight line-clamp-1">{item.title}</h4>
                    <p className="text-xs text-zinc-400 font-medium mt-1 truncate">{item.subtitle}</p>
                    
                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-medium text-zinc-300 uppercase tracking-wider">
                        <span className="truncate text-[#E53935]">{item.statusText.replace(/_/g, " ")}</span>
                        <span>{item.progress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-gradient-to-r from-[#E53935] to-red-400 rounded-full" style={{ width: `${item.progress}%` }} />
                      </div>
                    </div>

                    <div className="mt-5">
                      <Link href={item.href}>
                        <button className="w-full py-2.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-xs font-semibold text-white tracking-wide flex items-center justify-center gap-2 transition-all duration-200">
                          {item.actionText} <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
