"use client";

import React, { useState, useEffect, useTransition } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

export default function ShootSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [query, setQuery] = useState(searchParams.get("search") || "");

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (query) {
        params.set("search", query);
      } else {
        params.delete("search");
      }
      params.set("page", "1");
      
      if (searchParams.get("search") !== query && (query || searchParams.has("search"))) {
        startTransition(() => {
          router.push(`${pathname}?${params.toString()}`);
        });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query, pathname, router, searchParams]);

  return (
    <div className="relative w-full sm:w-64">
      <Search className={`absolute left-2.5 top-2.5 h-4 w-4 ${isPending ? "text-[#C1121F] animate-pulse" : "text-zinc-500"}`} />
      <Input
        placeholder="Search shoots..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="h-9 pl-9 bg-black/40 border-white/10 text-white placeholder:text-zinc-500 focus-visible:ring-[#C1121F]"
      />
    </div>
  );
}
