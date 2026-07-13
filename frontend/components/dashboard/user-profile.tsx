import { LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function UserProfile() {
  return (
    <div className="flex w-full items-center justify-between rounded-md p-2 transition-colors hover:bg-white/5">
      <div className="flex items-center gap-3">
        <Avatar className="h-9 w-9 ring-1 ring-white/10">
          <AvatarImage src="/placeholder-user.jpg" alt="User" />
          <AvatarFallback className="bg-zinc-800 text-sm">JD</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="text-sm font-medium text-white">John Doe</span>
          <span className="text-xs text-zinc-500">Admin</span>
        </div>
      </div>
      <button className="text-zinc-500 transition-colors hover:text-[#C1121F]">
        <LogOut className="h-5 w-5" />
      </button>
    </div>
  );
}
