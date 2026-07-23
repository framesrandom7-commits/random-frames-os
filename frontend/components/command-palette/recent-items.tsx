"use client";

import React, { useEffect, useState } from "react";
import { CommandGroup } from "@/components/ui/command";
import { Clock, Briefcase, UserCircle } from "lucide-react";
import { CommandItemWrapper } from "./command-item";
import { useRouter } from "next/navigation";

// In a real application, this would fetch from a database or localStorage
const MOCK_RECENT_ITEMS = [
  { id: "1", type: "client", label: "Acme Corp", route: "/clients/1", icon: UserCircle },
  { id: "2", type: "project", label: "Summer Campaign", route: "/projects/2", icon: Briefcase },
];

export function RecentItems({ onSelect }: { onSelect: (cmd: () => void) => void }) {
  const router = useRouter();
  const [recentItems, setRecentItems] = useState(MOCK_RECENT_ITEMS);

  useEffect(() => {
    // Future extension: Fetch recent items from API or localStorage here
  }, []);

  if (recentItems.length === 0) return null;

  return (
    <CommandGroup heading="Recent" className="text-zinc-400">
      {recentItems.map((item) => (
        <CommandItemWrapper
          key={item.id}
          icon={item.icon || Clock}
          label={item.label}
          onSelect={() => onSelect(() => router.push(item.route))}
        />
      ))}
    </CommandGroup>
  );
}
