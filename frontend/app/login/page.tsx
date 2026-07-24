"use client";

import React, { useState } from "react";
import { login } from "@/app/actions/auth";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await login(formData);
    
    if (result?.error) {
      toast.error(result.error);
      setIsSubmitting(false);
    }
    // On success, redirect is handled by server action
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0C10] p-4 relative overflow-hidden">
      {/* Premium Background Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E53935]/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-[#E53935] to-red-800 text-white font-bold text-2xl shadow-xl shadow-red-900/20 mb-6 border border-white/10">
            RF
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight mb-2 font-[family-name:var(--font-heading)]">RANDOM FRAMES</h1>
          <p className="text-sm text-zinc-400">Creative Production Operating System</p>
        </div>

        <div className="bg-[#171A21]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-300">Email Address</label>
              <input 
                name="email"
                type="email" 
                required
                placeholder="hello@randomframes.com"
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
                  placeholder="••••••••"
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

            <div className="flex items-center gap-2 mt-1">
              <input 
                type="checkbox" 
                id="remember"
                name="remember"
                className="h-4 w-4 rounded border-white/10 bg-black/40 text-[#E53935] focus:ring-[#E53935] focus:ring-offset-0"
              />
              <label htmlFor="remember" className="text-sm text-zinc-400 select-none cursor-pointer">
                Remember me for 30 days
              </label>
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
        
        <p className="text-center text-xs text-zinc-600 mt-8">
          Authorized personnel only. <br/> Access implies agreement to company security policies.
        </p>
      </div>
    </div>
  );
}
