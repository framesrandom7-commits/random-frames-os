import React from "react";
import { Camera, Users, Target } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black pt-12 pb-24 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">About Random Frames</h1>
          <p className="text-slate-400 text-lg">
            Engineering visual perfection across automotive, commercial, and high-fashion cinema since 2018.
          </p>
        </div>

        <div className="aspect-video w-full rounded-3xl bg-neutral-900 border border-white/5 mb-16 overflow-hidden relative">
           <div 
              className="absolute inset-0 bg-cover bg-center opacity-50 mix-blend-overlay"
              style={{ backgroundImage: `url(https://images.unsplash.com/photo-1620023697926-0e9e4318c644?q=80&w=2000&auto=format&fit=crop)` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 p-8">
              <h2 className="text-2xl font-bold text-white mb-2">Our Studio Facility</h2>
              <p className="text-slate-300">10,000 sq ft of soundstages, edit bays, and color grading suites.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="p-8 rounded-3xl bg-neutral-900/50 border border-white/5">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6">
              <Target className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Our Mission</h3>
            <p className="text-slate-400 text-sm">To push the boundaries of cinematic storytelling through technological innovation and uncompromising artistic vision.</p>
          </div>
          <div className="p-8 rounded-3xl bg-neutral-900/50 border border-white/5">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6">
              <Camera className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">The Equipment</h3>
            <p className="text-slate-400 text-sm">Equipped with ARRI Alexa, RED V-Raptor, Phantom Flex 4K, and custom U-Crane systems for ultimate precision.</p>
          </div>
          <div className="p-8 rounded-3xl bg-neutral-900/50 border border-white/5">
            <div className="h-12 w-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-6">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">The Team</h3>
            <p className="text-slate-400 text-sm">A globally distributed collective of directors, cinematographers, precision drivers, and VFX artists.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
