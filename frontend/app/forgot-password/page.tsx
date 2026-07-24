"use client";

import React, { useState } from "react";
import { forgotPassword } from "@/app/actions/auth";
import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    const result = await forgotPassword(formData);
    
    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success) {
      setIsSuccess(true);
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0C10] p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E53935]/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="w-full max-w-md z-10">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-8">
          <ArrowLeft className="h-4 w-4" /> Back to Login
        </Link>

        <div className="bg-[#171A21]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Reset Password</h1>
            <p className="text-sm text-zinc-400">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mb-4 border border-green-500/30">
                <Mail className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Check your email</h3>
              <p className="text-sm text-zinc-400">
                If an active account exists with that email, we've sent instructions to reset your password.
              </p>
            </div>
          ) : (
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

              <button 
                type="submit"
                disabled={isSubmitting}
                className="h-11 mt-2 w-full rounded-xl bg-gradient-to-r from-[#E53935] to-red-700 text-sm font-bold text-white shadow-lg shadow-red-900/20 transition-all hover:scale-[1.02] hover:shadow-red-900/40 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? "Sending Reset Link..." : "Send Reset Link"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
