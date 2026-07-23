"use client";

import React, { useState, useEffect } from "react";

interface GreetingWidgetProps {
  user: {
    firstName: string;
  };
}

export default function GreetingWidget({ user }: GreetingWidgetProps) {
  const [greeting, setGreeting] = useState("Good Morning");
  const [icon, setIcon] = useState("☀️");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting("Good Morning");
      setIcon("☀️");
    } else if (hour < 17) {
      setGreeting("Good Afternoon");
      setIcon("🌤️");
    } else {
      setGreeting("Good Evening");
      setIcon("🌙");
    }
  }, []);

  return (
    <div className="space-y-1 mb-8">
      <h1 className="text-3xl font-bold tracking-tight text-white">
        Hello, {user.firstName} 👋
      </h1>
      <p className="text-zinc-400 font-medium text-lg">
        {mounted ? `${greeting} ${icon}` : "Good Morning ☀️"}
      </p>
    </div>
  );
}
