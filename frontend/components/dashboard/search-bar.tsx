import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function SearchBar() {
  return (
    <div className="relative w-64">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
      <Input
        type="search"
        placeholder="Search..."
        className="h-9 w-full bg-zinc-900/50 pl-9 border-white/10 text-sm text-white placeholder:text-zinc-500 focus-visible:ring-[#C1121F] focus-visible:border-[#C1121F]"
      />
    </div>
  );
}
