"use client";

import React, { useState, Suspense } from "react";
import { resetPassword } from "@/app/actions/auth";
import { Eye, EyeOff, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [password, setPassword] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // Password strength logic
  const hasMinLength = password.length >= 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  
  const strengthScore = [hasMinLength, hasUpperCase, hasNumber, hasSpecial].filter(Boolean).length;
  
  let strengthColor = "bg-zinc-600";
  let strengthText = "Weak";
  
  if (strengthScore === 4) {
    strengthColor = "bg-green-500";
    strengthText = "Strong";
  } else if (strengthScore >= 2) {
    strengthColor = "bg-yellow-500";
    strengthText = "Good";
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token) {
      toast.error("Invalid or missing reset token.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    formData.append("token", token);
    
    const result = await resetPassword(formData);
    
    if (result?.error) {
      toast.error(result.error);
      setIsSubmitting(false);
    } else if (result?.success) {
      toast.success(result.success);
      setIsSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    }
  };

  if (!token) {
    return (
      <div className="bg-[#171A21] border border-white/10 rounded-2xl p-8 max-w-md w-full">
        <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2 text-center">Invalid Request</h2>
        <p className="text-zinc-400 mb-6 text-center">No reset token found in the URL. Please request a new password reset link.</p>
        <div className="text-center">
          <Link href="/forgot-password" className="text-[#E53935] hover:text-red-400 font-medium">
            Go to Forgot Password
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md z-10">
      <div className="bg-[#171A21]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Set New Password</h1>
          <p className="text-sm text-zinc-400">
            Please enter your new password below.
          </p>
        </div>

        {isSuccess ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="h-12 w-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 mb-4 border border-green-500/30">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Password Reset</h3>
            <p className="text-sm text-zinc-400 mb-6">
              Your password has been successfully updated. Redirecting to login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-300">New Password</label>
              <div className="relative">
                <input 
                  name="password"
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
              
              {/* Password Strength Indicator */}
              {password.length > 0 && (
                <div className="mt-2 flex flex-col gap-1.5">
                  <div className="flex items-center gap-1 h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                    <div className={`h-full transition-all duration-300 ${strengthColor}`} style={{ width: `${(strengthScore / 4) * 100}%` }}></div>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-500">Password strength: <strong className={strengthScore === 4 ? "text-green-500" : strengthScore >= 2 ? "text-yellow-500" : "text-zinc-400"}>{strengthText}</strong></span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-[10px] text-zinc-500 mt-1">
                    <span className={hasMinLength ? "text-green-500" : ""}>✓ 8+ characters</span>
                    <span className={hasUpperCase ? "text-green-500" : ""}>✓ Uppercase letter</span>
                    <span className={hasNumber ? "text-green-500" : ""}>✓ Number</span>
                    <span className={hasSpecial ? "text-green-500" : ""}>✓ Special character</span>
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-zinc-300">Confirm Password</label>
              <div className="relative">
                <input 
                  name="confirmPassword"
                  type={showPassword ? "text" : "password"} 
                  required
                  placeholder="••••••••"
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/40 px-4 text-sm text-white placeholder:text-zinc-600 focus:border-[#E53935] focus:outline-none focus:ring-1 focus:ring-[#E53935] transition-all pr-10"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting || strengthScore < 2}
              className="h-11 mt-2 w-full rounded-xl bg-gradient-to-r from-[#E53935] to-red-700 text-sm font-bold text-white shadow-lg shadow-red-900/20 transition-all hover:scale-[1.02] hover:shadow-red-900/40 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isSubmitting ? "Resetting Password..." : "Reset Password"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0C10] p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#E53935]/5 rounded-full blur-[120px] pointer-events-none"></div>
      <Suspense fallback={
        <div className="text-zinc-400 text-sm animate-pulse">Loading secure connection...</div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
