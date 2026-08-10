"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function WelcomeScreen({ user }: { user?: { name: string } }) {
  const [show, setShow] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const hasSeenWelcome = sessionStorage.getItem('hasSeenWelcome');
    
    if (!hasSeenWelcome) {
      setShow(true);
      sessionStorage.setItem('hasSeenWelcome', 'true');
    }
  }, []);

  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        setShow(false);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!isClient) {
    // Render the initial overlay for SSR to prevent hydration issues,
    // but without text so it doesn't flash the wrong state.
    return (
      <div className="fixed inset-0 z-[99999] bg-[#0F1115] pointer-events-none" />
    );
  }

  // If client-side and they shouldn't see it, render nothing to avoid exit animations
  if (!show && sessionStorage.getItem('hasSeenWelcome') === 'true') {
    return null;
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ y: 0 }}
          exit={{ y: "-100%" }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }} // Smooth, fast cinematic ease
          className="fixed inset-0 z-[99999] bg-[#0F1115] flex flex-col items-center justify-center pointer-events-none"
        >
          <div className="flex flex-col items-center justify-center gap-3">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
            >
              <span className="text-[#E53935] text-3xl md:text-4xl font-extrabold tracking-[0.1em] uppercase leading-none text-center block">
                Welcome back to Random Frames,
              </span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
            >
              <span className="text-3xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-br from-white via-white to-zinc-500 leading-none block">
                {user?.name || "User"}
              </span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
