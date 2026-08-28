"use client";

import React, { useState } from "react";
import Image from "next/image";
import { login } from "@/app/actions/auth";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Clear the welcome screen flag so it shows up after a fresh login
    sessionStorage.removeItem('hasSeenWelcome');
    
    const formData = new FormData(e.currentTarget);
    const result = await login(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsSubmitting(false);
    }
    // On success, redirect is handled by server action
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0C10] p-4 relative overflow-hidden">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes breathe {
          0%, 100% { opacity: 0.4; transform: scale(1) translate(-50%, -50%); }
          50% { opacity: 0.7; transform: scale(1.05) translate(-48%, -48%); }
        }
        .animate-breathe {
          animation: breathe 10s ease-in-out infinite;
          transform-origin: top left;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-breathe {
            animation: none;
            opacity: 0.5;
          }
        }
      `}} />
      {/* Premium Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Soft radial red glow behind the card */}
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] bg-[#E53935]/10 rounded-full blur-[120px] animate-breathe"></div>
        {/* Extremely blurred gradient blobs */}
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-[#E53935]/5 rounded-full blur-[150px]"></div>
        {/* Film grain noise texture */}
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
        {/* Soft Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#0A0C10_100%)] opacity-50"></div>
      </div>
      
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center h-20 w-20 rounded-2xl bg-[#0A0C10] mb-8 border-[3px] border-white/10 shadow-xl shadow-black/50 overflow-hidden">
            <Image src="/logo.jpg" alt="Logo" width={80} height={80} className="object-contain h-full w-full" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wide mb-2.5 font-[family-name:var(--font-heading)]">RANDOM FRAMES</h1>
          <p className="text-sm sm:text-base font-medium text-zinc-400">Creative Business Platform</p>
        </div>

        <div className="bg-[#12141A]/70 backdrop-blur-2xl border border-white/[0.05] rounded-3xl p-10 shadow-[0_0_60px_-15px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.02]">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            {error && (
              <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium animate-in fade-in slide-in-from-top-1" role="alert">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-300">Email Address</label>
              <input 
                name="email"
                type="email" 
                required
                onChange={() => setError(null)}
                className="h-11 rounded-xl border border-white/10 bg-black/40 px-4 text-sm text-white placeholder:text-zinc-600 focus:border-[#E53935] focus:outline-none focus:ring-1 focus:ring-[#E53935] transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-zinc-300">Password</label>
                <Link href="/forgot-password" className="text-xs text-[#E53935] hover:text-red-400 font-medium transition-colors">
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input 
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  required
                  onChange={() => setError(null)}
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-4 text-sm text-white placeholder:text-zinc-600 focus:border-[#E53935] focus:outline-none focus:ring-1 focus:ring-[#E53935] transition-all pr-10"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>



            <button 
              type="submit"
              disabled={isSubmitting}
              className="h-11 mt-2 w-full rounded-xl bg-gradient-to-r from-[#E53935] to-red-700 text-sm font-bold text-white shadow-lg shadow-red-900/20 transition-all hover:scale-[1.02] hover:shadow-red-900/40 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
            </button>
            
          </form>
        </div>
        
        <footer className="mt-8 text-center">
          <p className="text-[12px] text-white/40 font-medium">© 2026 Random Frames by Savan</p>
        </footer>
      </div>
    </div>
  );
}
