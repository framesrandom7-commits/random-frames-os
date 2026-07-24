"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Settings, Palette, Database, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

import { useRouter } from "next/navigation";

import { useTheme } from "next-themes";
import { toast } from "sonner";
import { logout } from "@/app/actions/auth";

export default function UserProfile({ user }: { user?: { name: string, roleName: string } }) {
  const router = useRouter();
  const { setTheme, theme } = useTheme();
  const [appearanceOpen, setAppearanceOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "S";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#E53935] to-red-800 text-white font-bold text-xs shadow-md border border-white/20 transition-all hover:scale-105 focus:outline-none">
          {initial}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56 bg-[#171A21] border-white/10 text-white shadow-2xl" align="end">
          <div className="px-2 py-1.5 font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.name || "Savan Somaiah T P"}</p>
              <p className="text-xs leading-none text-zinc-500 mt-1.5">{user?.roleName || "Owner"}</p>
            </div>
          </div>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-white" onClick={() => router.push("/profile")}>
            <User className="mr-2 h-4 w-4 text-zinc-400" />
            <span>My Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-white" onClick={() => router.push("/settings")}>
            <Settings className="mr-2 h-4 w-4 text-zinc-400" />
            <span>Settings</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-white" onClick={(e) => {
            e.preventDefault(); // Prevent dropdown from closing immediately if needed, or let it close and open dialog
            setAppearanceOpen(true);
          }}>
            <Palette className="mr-2 h-4 w-4 text-zinc-400" />
            <span>Appearance</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="cursor-pointer hover:bg-white/5 focus:bg-white/5 focus:text-white" onClick={() => router.push("/backup")}>
            <Database className="mr-2 h-4 w-4 text-zinc-400" />
            <span>Backup & Export</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem className="cursor-pointer text-[#E53935] hover:bg-[#E53935]/10 focus:bg-[#E53935]/10 focus:text-[#E53935]" onClick={(e) => {
            e.preventDefault();
            setLogoutOpen(true);
          }}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log Out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Appearance Dialog */}
      <Dialog open={appearanceOpen} onOpenChange={setAppearanceOpen}>
        <DialogContent className="sm:max-w-md bg-[#171A21] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Appearance</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Customize the look and feel of Random Frames OS.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-3 py-4">
            <div 
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all ${theme === 'dark' ? 'border-[#E53935] bg-[#E53935]/10' : 'border-white/10 hover:bg-white/5'}`}
              onClick={() => setTheme("dark")}
            >
              <div className="h-10 w-full rounded-md bg-black/50 border border-white/10"></div>
              <span className={`text-sm font-medium ${theme === 'dark' ? 'text-white' : 'text-zinc-400'}`}>Dark</span>
            </div>
            <div 
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all ${theme === 'light' ? 'border-[#E53935] bg-[#E53935]/10' : 'border-white/10 hover:bg-white/5'}`}
              onClick={() => setTheme("light")}
            >
              <div className="h-10 w-full rounded-md bg-white border border-black/10"></div>
              <span className={`text-sm font-medium ${theme === 'light' ? 'text-white' : 'text-zinc-400'}`}>Light</span>
            </div>
            <div 
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border cursor-pointer transition-all ${theme === 'system' ? 'border-[#E53935] bg-[#E53935]/10' : 'border-white/10 hover:bg-white/5'}`}
              onClick={() => setTheme("system")}
            >
              <div className="h-10 w-full rounded-md bg-gradient-to-r from-black/50 to-white border border-white/10"></div>
              <span className={`text-sm font-medium ${theme === 'system' ? 'text-white' : 'text-zinc-400'}`}>System</span>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Log Out Dialog */}
      <Dialog open={logoutOpen} onOpenChange={setLogoutOpen}>
        <DialogContent className="sm:max-w-md bg-[#171A21] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Sign Out</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Are you sure you want to log out of Random Frames OS?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="sm:justify-end gap-2 mt-4">
            <Button variant="outline" className="bg-transparent border-white/10 hover:bg-white/5 text-white" onClick={() => setLogoutOpen(false)}>
              Cancel
            </Button>
            <Button className="bg-[#E53935] hover:bg-red-700 text-white" onClick={async () => {
              setLogoutOpen(false);
              toast.success("Successfully logged out");
              await logout();
            }}>
              Log Out
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
