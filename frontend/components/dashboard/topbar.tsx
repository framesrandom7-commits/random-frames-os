import SearchBar from "./search-bar";
import NotificationButton from "./notification-button";
import ThemeSwitcher from "./theme-switcher";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Topbar({ title }: { title: string }) {
  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-black/80 px-8 backdrop-blur-md">
      <h1 className="text-xl font-semibold text-white">{title}</h1>
      
      <div className="flex items-center gap-4">
        <SearchBar />
        <div className="flex items-center gap-2">
          <NotificationButton />
          <ThemeSwitcher />
        </div>
        <div className="ml-2 flex items-center gap-3 border-l border-white/10 pl-4">
          <Avatar className="h-8 w-8 ring-1 ring-white/10 cursor-pointer transition-transform hover:scale-105">
            <AvatarImage src="/placeholder-user.jpg" alt="User" />
            <AvatarFallback className="bg-zinc-800 text-xs text-zinc-400">JD</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
