"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export function SplashOverlay({ user }: { user?: { name: string } }) {
  const [show, setShow] = useState(true);
  const [mount, setMount] = useState(true);

  useEffect(() => {
    // Keep splash on screen for 2.5 seconds to cover loading, then fade out
    const timer = setTimeout(() => {
      setShow(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  if (!mount) return null;

  return (
    <div
      className={`fixed inset-0 z-[99999] bg-transparent backdrop-blur-3xl flex flex-col items-center justify-center pointer-events-none ${show ? "opacity-100" : "opacity-0 transition-opacity duration-[800ms] ease-in-out"
        }`}
    >
      <div className="flex flex-col items-center justify-center gap-3">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <span className="text-[#E53935] text-3xl md:text-4xl font-extrabold tracking-[0.1em] uppercase leading-none text-center block">
            Welcome back to Random Frames,
          </span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        >
          <span className="text-3xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500 leading-none block">
            {user?.name || "User"}
          </span>
        </motion.div>
      </div>
    </div>
  );
}
