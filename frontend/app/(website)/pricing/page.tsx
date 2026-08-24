import React from "react";
import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black pt-12 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Studio Investment</h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Transparent, modular pricing designed for scalable productions. Every project is unique, but these baselines provide a starting point for your budget.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Tier 1 */}
          <div className="p-8 rounded-3xl bg-neutral-900/50 border border-white/5 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2">Editorial</h3>
            <p className="text-slate-400 text-sm mb-6">For lookbooks and social campaigns.</p>
            <div className="mb-8">
              <span className="text-4xl font-black text-white">Starts at ₹5k</span>
            </div>
            <div className="space-y-4 mb-8 flex-grow">
              <div className="flex items-start gap-3"><Check className="h-5 w-5 text-amber-500 shrink-0" /><span className="text-slate-300 text-sm">Half-Day Studio Access</span></div>
              <div className="flex items-start gap-3"><Check className="h-5 w-5 text-amber-500 shrink-0" /><span className="text-slate-300 text-sm">Standard Lighting Package</span></div>
              <div className="flex items-start gap-3"><Check className="h-5 w-5 text-amber-500 shrink-0" /><span className="text-slate-300 text-sm">1 Principal Photographer</span></div>
              <div className="flex items-start gap-3"><Check className="h-5 w-5 text-amber-500 shrink-0" /><span className="text-slate-300 text-sm">Basic Retouching (10 images)</span></div>
            </div>
            <Link href="/quote" className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white hover:text-black transition-all text-center">
              Request Quote
            </Link>
          </div>

          {/* Tier 2 */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-neutral-900 to-black border border-amber-500/30 flex flex-col relative transform md:-translate-y-4 shadow-2xl shadow-amber-500/5">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-4 py-1 bg-amber-500 text-black text-xs font-bold uppercase tracking-wider rounded-full">
              Most Popular
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Commercial</h3>
            <p className="text-slate-400 text-sm mb-6">For brand reveals and broadcast.</p>
            <div className="mb-8">
              <span className="text-4xl font-black text-amber-400">Starts at ₹15k</span>
            </div>
            <div className="space-y-4 mb-8 flex-grow">
              <div className="flex items-start gap-3"><Check className="h-5 w-5 text-amber-500 shrink-0" /><span className="text-slate-300 text-sm">Full-Day Studio & Location</span></div>
              <div className="flex items-start gap-3"><Check className="h-5 w-5 text-amber-500 shrink-0" /><span className="text-slate-300 text-sm">Cinema Camera & Grip Truck</span></div>
              <div className="flex items-start gap-3"><Check className="h-5 w-5 text-amber-500 shrink-0" /><span className="text-slate-300 text-sm">Full Production Crew (5+)</span></div>
              <div className="flex items-start gap-3"><Check className="h-5 w-5 text-amber-500 shrink-0" /><span className="text-slate-300 text-sm">Advanced Color Grading</span></div>
            </div>
            <Link href="/quote" className="w-full px-6 py-4 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition-all text-center">
              Request Quote
            </Link>
          </div>

          {/* Tier 3 */}
          <div className="p-8 rounded-3xl bg-neutral-900/50 border border-white/5 flex flex-col">
            <h3 className="text-xl font-bold text-white mb-2">Automotive Rig</h3>
            <p className="text-slate-400 text-sm mb-6">For high-speed tracking shoots.</p>
            <div className="mb-8">
              <span className="text-4xl font-black text-white">Starts at ₹35k</span>
            </div>
            <div className="space-y-4 mb-8 flex-grow">
              <div className="flex items-start gap-3"><Check className="h-5 w-5 text-amber-500 shrink-0" /><span className="text-slate-300 text-sm">U-Crane Pursuit Vehicle</span></div>
              <div className="flex items-start gap-3"><Check className="h-5 w-5 text-amber-500 shrink-0" /><span className="text-slate-300 text-sm">Precision Driving Team</span></div>
              <div className="flex items-start gap-3"><Check className="h-5 w-5 text-amber-500 shrink-0" /><span className="text-slate-300 text-sm">FVP Drone Operators</span></div>
              <div className="flex items-start gap-3"><Check className="h-5 w-5 text-amber-500 shrink-0" /><span className="text-slate-300 text-sm">Full Road Closure Logistics</span></div>
            </div>
            <Link href="/quote" className="w-full px-6 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-bold hover:bg-white hover:text-black transition-all text-center">
              Request Quote
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
