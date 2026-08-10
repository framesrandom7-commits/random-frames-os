import React from "react";
import Link from "next/link";
import { Camera, Video, Image as ImageIcon, ArrowRight } from "lucide-react";

// In a real scenario, this would be fetched from a dynamic data source (CMS or DB)
const SERVICES_DATA = [
  {
    id: "automotive",
    title: "Automotive Cinema",
    description: "High-speed pursuit tracking, dynamic rigging, and precision lighting for automotive reveals and commercials. We specialize in capturing the essence of motion and engineering.",
    icon: <Video className="h-8 w-8" />,
    features: ["U-Crane Tracking", "Precision Driving Coordination", "FVP Drone Cinematography", "LED Volume Virtual Production"]
  },
  {
    id: "fashion",
    title: "Fashion Editorials",
    description: "Striking visual narratives for high-fashion campaigns, lookbooks, and brand storytelling. We manage full-scale productions across global locations.",
    icon: <Camera className="h-8 w-8" />,
    features: ["Location Scouting & Permits", "Global Casting", "Styling & Art Direction", "High-End Retouching"]
  },
  {
    id: "commercial",
    title: "Commercial Product",
    description: "Macro cinematography and precision lighting designed to showcase product details with absolute clarity for global advertising campaigns.",
    icon: <ImageIcon className="h-8 w-8" />,
    features: ["Motion Control Robotics", "Macro Probe Lenses", "High-Speed Phantom Flex", "CGI & Compositing Integration"]
  }
];

export default function ServicesPage() {
  return (
    <div className="min-h-screen bg-black pt-12 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Our Services</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            World-class production capabilities spanning pre-production planning, principal photography, and high-end post-production.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SERVICES_DATA.map(service => (
            <div key={service.id} className="p-8 rounded-3xl bg-neutral-900/50 border border-white/5 flex flex-col group hover:border-amber-500/30 transition-colors">
              <div className="h-16 w-16 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                {service.icon}
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">{service.title}</h2>
              <p className="text-slate-400 mb-8 flex-grow">{service.description}</p>
              
              <div className="space-y-3 mb-8">
                {service.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm text-slate-300">
                    <div className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                    {feature}
                  </div>
                ))}
              </div>
              
              <Link href="/quote" className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white hover:text-black transition-all flex items-center justify-center gap-2">
                Request a Quote <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
