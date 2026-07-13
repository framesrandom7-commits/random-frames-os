import React from "react";
import { Aperture } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-black p-4 text-white selection:bg-[#C1121F] selection:text-white">
      <div className="w-full max-w-[420px]">
        <Card className="border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden ring-1 ring-white/5 transition-all duration-300 hover:ring-white/10">
          <CardHeader className="space-y-5 pb-6 pt-10 text-center flex flex-col items-center">
            {/* Logo */}
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#C1121F] text-white shadow-lg transition-transform duration-500 hover:scale-105">
              <Aperture size={32} strokeWidth={1.5} className="transition-transform duration-700 hover:rotate-180" />
            </div>
            
            <div className="space-y-1.5">
              <CardTitle className="text-2xl font-bold tracking-tight text-white">
                Random Frames OS
              </CardTitle>
              <CardDescription className="text-zinc-400 font-medium text-base">
                Business Operating System
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="px-8 pb-10">
            <form className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="h-12 bg-black/40 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-[#C1121F] focus-visible:border-[#C1121F] rounded-lg transition-all"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Password
                  </Label>
                  <a href="#" className="text-sm font-medium text-[#C1121F] hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C1121F] rounded-sm">
                    Forgot Password
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="h-12 bg-black/40 border-white/10 text-white placeholder:text-zinc-600 focus-visible:ring-[#C1121F] focus-visible:border-[#C1121F] rounded-lg transition-all"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#C1121F] text-white hover:bg-white hover:text-black transition-all duration-300 h-12 text-sm font-semibold rounded-lg mt-4 shadow-lg hover:shadow-white/20"
              >
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <div className="mt-10 text-center text-sm font-medium text-zinc-500">
          Powered by <span className="text-zinc-300">Random Frames</span>
        </div>
      </div>
    </div>
  );
}