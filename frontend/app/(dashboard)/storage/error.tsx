"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function StorageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-[400px] flex-col items-center justify-center rounded-lg border border-red-500/20 bg-red-500/5 p-8 text-center backdrop-blur-md">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 mb-4">
        <AlertCircle className="h-6 w-6 text-red-500" />
      </div>
      <h2 className="mb-2 text-xl font-semibold text-white">Storage Module Error</h2>
      <p className="mb-6 max-w-md text-sm text-zinc-400">
        There was a problem loading the storage dashboard. {error.message}
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()} className="bg-[#C1121F] hover:bg-[#a00f1a] text-white">
          Try again
        </Button>
      </div>
    </div>
  );
}
