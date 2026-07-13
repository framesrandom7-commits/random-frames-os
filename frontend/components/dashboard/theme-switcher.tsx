import { Moon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ThemeSwitcher() {
  return (
    <Button variant="ghost" size="icon" className="text-zinc-400 hover:bg-white/10 hover:text-white rounded-full">
      <Moon className="h-5 w-5" />
    </Button>
  );
}
