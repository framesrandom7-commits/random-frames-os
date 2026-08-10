import React from "react";
import Link from "next/link";
import { Camera, Mail } from "lucide-react";
import "../globals.css";

export default function WebsiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Dynamic Glassmorphism Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center text-black group-hover:scale-105 transition-transform">
              <Camera className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-widest uppercase text-white">Random Frames</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            <Link href="/about" className="text-slate-400 hover:text-white transition-colors">About</Link>
            <Link href="/services" className="text-slate-400 hover:text-white transition-colors">Services</Link>
            <Link href="/portfolio" className="text-slate-400 hover:text-white transition-colors">Portfolio</Link>
            <Link href="/pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</Link>
            <Link href="/contact" className="text-slate-400 hover:text-white transition-colors">Contact</Link>
            <Link href="/book" className="text-slate-400 hover:text-white transition-colors">Book Shoot</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors hidden sm:block">
              Client Portal
            </Link>
            <Link href="/quote" className="px-5 py-2.5 rounded-full bg-white text-black text-sm font-bold hover:bg-slate-200 transition-colors">
              Get Quote
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content Render */}
      <main className="pt-20">
        {children}
      </main>

      {/* Dynamic Footer */}
      <footer className="bg-neutral-950 border-t border-white/5 py-12 mt-20">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="h-8 w-8 rounded-lg bg-amber-500 flex items-center justify-center text-black">
                <Camera className="h-4 w-4" />
              </div>
              <span className="text-md font-bold tracking-widest uppercase text-white">Random Frames</span>
            </Link>
            <p className="text-slate-400 text-sm max-w-sm mb-6">
              Capturing cinematic visual stories across fashion, automotive, and commercial production with unparalleled detail.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-slate-300">
                <Camera className="h-4 w-4" />
              </a>
              <a href="#" className="h-10 w-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors text-slate-300">
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Studio</h4>
            <div className="flex flex-col gap-2 text-sm text-slate-400">
              <Link href="/about" className="hover:text-amber-400 transition-colors">About Us</Link>
              <Link href="/portfolio" className="hover:text-amber-400 transition-colors">Portfolio</Link>
              <Link href="/pricing" className="hover:text-amber-400 transition-colors">Pricing & Packages</Link>
              <Link href="/services" className="hover:text-amber-400 transition-colors">Services</Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm">Legal</h4>
            <div className="flex flex-col gap-2 text-sm text-slate-400">
              <Link href="/privacy" className="hover:text-amber-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-amber-400 transition-colors">Terms of Service</Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 mt-12 pt-8 border-t border-white/5 text-xs text-slate-500 flex justify-between items-center">
          <p>© {new Date().getFullYear()} Random Frames Studio. All rights reserved.</p>
          <p>Powered by Random Frames OS</p>
        </div>
      </footer>
    </div>
  );
}
