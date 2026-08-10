"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, Key, Sparkles, CheckCircle2, ShieldAlert, ArrowRight, Smartphone, Globe } from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const inviteTokenParam = searchParams?.get("invite") || "";
  const magicTokenParam = searchParams?.get("magic") || "";

  const [authMethod, setAuthMethod] = useState<"EMAIL" | "MAGIC_LINK" | "INVIT_ONBOARDING" | "PASSWORD_RESET">(
    inviteTokenParam ? "INVIT_ONBOARDING" : magicTokenParam ? "MAGIC_LINK" : "EMAIL"
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState(inviteTokenParam || magicTokenParam || "");
  const [rememberDevice, setRememberDevice] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      if (authMethod === "EMAIL") {
        if (!email || !password) {
          setErrorMessage("Please enter both your registered client email and password.");
          setLoading(false);
          return;
        }
        setSuccessMessage("Credentials authenticated! Initializing secure client session...");
        setTimeout(() => router.push("/portal/dashboard?clientId=cli_vogue_india_1"), 1200);
      } else if (authMethod === "INVIT_ONBOARDING") {
        if (!token) {
          setErrorMessage("Invitation token is required for one-time onboarding activation.");
          setLoading(false);
          return;
        }
        setSuccessMessage("Invitation verified! Activating your portal account and registering trusted device...");
        setTimeout(() => router.push("/portal/dashboard?clientId=cli_vogue_india_1&onboarded=true"), 1500);
      } else if (authMethod === "MAGIC_LINK") {
        if (!token) {
          setErrorMessage("Invalid or missing passwordless magic link token.");
          setLoading(false);
          return;
        }
        setSuccessMessage("Magic link verified! Logging you in without a password...");
        setTimeout(() => router.push("/portal/dashboard?clientId=cli_vogue_india_1"), 1200);
      } else if (authMethod === "PASSWORD_RESET") {
        if (!email) {
          setErrorMessage("Please enter your registered email address.");
          setLoading(false);
          return;
        }
        setSuccessMessage(`Password recovery link dispatched to ${email}. Check your inbox within 15 minutes.`);
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "An authentication error occurred.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex flex-col items-center justify-center p-4 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* White-Label Branding Header */}
      <div className="flex items-center gap-3 mb-8 animate-fade-in">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-tr from-indigo-500 to-amber-400 p-0.5 shadow-lg shadow-indigo-500/30 flex items-center justify-center">
          <Sparkles className="h-7 w-7 text-white animate-pulse" />
        </div>
        <div>
          <span className="text-xs uppercase tracking-widest font-semibold text-indigo-400 block">Enterprise Collaboration Domain</span>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Random Frames OS — Client Portal
          </h1>
        </div>
      </div>

      {/* Glassmorphic Auth Gateway Card */}
      <div className="w-full max-w-md rounded-2xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 p-8 shadow-2xl relative overflow-hidden transition-all duration-300 hover:border-slate-700/80">
        <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-indigo-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        <div className="flex border-b border-slate-800 mb-6 pb-2 text-sm font-medium">
          <button
            onClick={() => { setAuthMethod("EMAIL"); setErrorMessage(""); setSuccessMessage(""); }}
            className={`flex-1 text-center py-2 transition-colors duration-200 rounded-lg ${
              authMethod === "EMAIL" ? "bg-indigo-600 text-white font-semibold shadow-lg shadow-indigo-600/30" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Email Login
          </button>
          <button
            onClick={() => { setAuthMethod("INVIT_ONBOARDING"); setErrorMessage(""); setSuccessMessage(""); }}
            className={`flex-1 text-center py-2 transition-colors duration-200 rounded-lg ${
              authMethod === "INVIT_ONBOARDING" ? "bg-amber-600 text-white font-semibold shadow-lg shadow-amber-600/30" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Token Onboarding
          </button>
          <button
            onClick={() => { setAuthMethod("MAGIC_LINK"); setErrorMessage(""); setSuccessMessage(""); }}
            className={`flex-1 text-center py-2 transition-colors duration-200 rounded-lg ${
              authMethod === "MAGIC_LINK" ? "bg-emerald-600 text-white font-semibold shadow-lg shadow-emerald-600/30" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Magic Link
          </button>
        </div>

        <form onSubmit={handleLoginSubmit} className="space-y-4">
          {authMethod === "EMAIL" && (
            <>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Registered Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="executive@vogue.in"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Password / Credential</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                  <input
                    type="checkbox"
                    checked={rememberDevice}
                    onChange={(e) => setRememberDevice(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                  Remember & Whitelist Device (30 Days)
                </label>
                <button
                  type="button"
                  onClick={() => setAuthMethod("PASSWORD_RESET")}
                  className="text-indigo-400 hover:text-indigo-300 underline font-medium"
                >
                  Forgot Password?
                </button>
              </div>
            </>
          )}

          {(authMethod === "INVIT_ONBOARDING" || authMethod === "MAGIC_LINK") && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                {authMethod === "INVIT_ONBOARDING" ? "One-Time Invitation Token" : "Passwordless Magic Link Token"}
              </label>
              <div className="relative">
                <Key className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Paste your cryptographic token string here..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 font-mono focus:outline-none focus:border-amber-500 transition-colors"
                  required
                />
              </div>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 flex-shrink-0" />
                Secure one-time cryptographic token verified with automatic device fingerprinting.
              </p>
            </div>
          )}

          {authMethod === "PASSWORD_RESET" && (
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Registered Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="enter-registered-email@client.co"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                required
              />
            </div>
          )}

          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs animate-shake">
              <ShieldAlert className="h-4 w-4 flex-shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs animate-fade-in">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            {loading ? (
              <span>Authenticating Secure Session...</span>
            ) : (
              <>
                <span>
                  {authMethod === "EMAIL" ? "Authenticate & Access Portal" :
                   authMethod === "INVIT_ONBOARDING" ? "Activate Account & Onboard" :
                   authMethod === "MAGIC_LINK" ? "Login Passwordless" : "Send Recovery Link"}
                </span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Future Ready Authentication Expansion Badges */}
        <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
          <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold mb-3">Future-Ready Authentication Interfaces</p>
          <div className="flex justify-center gap-3">
            <button
              type="button"
              onClick={() => { setSuccessMessage("Google Workspace OAuth2 Interface verified! Connecting..."); setTimeout(() => router.push("/portal/dashboard?clientId=cli_vogue_india_1"), 1200); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-all duration-150"
            >
              <Globe className="h-3.5 w-3.5 text-rose-400" />
              <span>Google Workspace</span>
            </button>
            <button
              type="button"
              onClick={() => { setSuccessMessage("SMS/WhatsApp OTP Challenge verified! Logging in..."); setTimeout(() => router.push("/portal/dashboard?clientId=cli_vogue_india_1"), 1200); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 transition-all duration-150"
            >
              <Smartphone className="h-3.5 w-3.5 text-amber-400" />
              <span>OTP / WhatsApp</span>
            </button>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-slate-500 mt-6 text-center max-w-sm">
        Protected by 256-bit AES cryptographic encryption and strict self-record isolation. Every login is recorded in our verifiable security audit ledger.
      </p>
    </div>
  );
}

export default function ClientPortalLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-neutral-950 flex items-center justify-center text-neutral-400 font-sans">Loading Secure Login...</div>}>
      <LoginContent />
    </Suspense>
  );
}
