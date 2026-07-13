import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotificationButton() {
  return (
    <Button variant="ghost" size="icon" className="relative text-zinc-400 hover:bg-white/10 hover:text-white rounded-full">
      <Bell className="h-5 w-5" />
      <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#C1121F]"></span>
    </Button>
  );
}
