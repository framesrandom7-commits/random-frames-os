import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center p-24">
      <div className="flex flex-col items-center gap-4 text-zinc-500">
        <Loader2 className="h-10 w-10 animate-spin text-white/50" />
        <p className="text-sm font-medium tracking-wide">Loading workspace...</p>
      </div>
    </div>
  );
}
