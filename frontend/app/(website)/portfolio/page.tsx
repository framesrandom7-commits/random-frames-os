import React from "react";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

const PORTFOLIO_PROJECTS = [
  {
    id: "p1",
    client: "Porsche",
    title: "The New Taycan GTS",
    category: "Automotive",
    imageUrl: "https://images.unsplash.com/photo-1503376760366-5a413e832041?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: "p2",
    client: "Vogue",
    title: "Summer Collection '25",
    category: "Fashion",
    imageUrl: "https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: "p3",
    client: "McLaren",
    title: "Artura Hybrid Launch",
    category: "Automotive",
    imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?q=80&w=2000&auto=format&fit=crop"
  },
  {
    id: "p4",
    client: "Gucci",
    title: "Midnight Opulence",
    category: "Fashion",
    imageUrl: "https://images.unsplash.com/photo-1588661601614-239611f0a0bc?q=80&w=2000&auto=format&fit=crop"
  }
];

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-black pt-12 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Our Work</h1>
            <p className="text-slate-400 max-w-xl">
              A curated selection of our finest cinematic campaigns across automotive, fashion, and commercial sectors.
            </p>
          </div>
          <Link href="/book" className="px-6 py-3 rounded-full bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors inline-flex items-center gap-2">
            Start a Project <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PORTFOLIO_PROJECTS.map((project, idx) => (
            <div key={project.id} className={`group relative rounded-3xl overflow-hidden bg-neutral-900 border border-white/10 ${idx === 0 || idx === 3 ? 'md:aspect-[4/5]' : 'md:aspect-[4/3]'} aspect-square`}>
              {/* Image Placeholder */}
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url(${project.imageUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <span className="text-amber-400 font-bold tracking-wider text-xs uppercase mb-2">
                  {project.category}
                </span>
                <h2 className="text-3xl font-bold text-white mb-1">{project.client}</h2>
                <p className="text-slate-300 text-lg mb-6">{project.title}</p>
                
                <button className="h-14 w-14 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white group-hover:bg-amber-500 group-hover:text-black transition-colors">
                  <Play className="h-5 w-5 ml-1" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
