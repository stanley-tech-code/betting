"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Track Visit
    const trackVisit = async () => {
      const sessionId = localStorage.getItem('session_id') || Math.random().toString(36).substring(7);
      localStorage.setItem('session_id', sessionId);

      try {
        await fetch('/api/landing/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            session_id: sessionId,
            action: 'visit',
            referrer: document.referrer
          })
        });
      } catch (e) { console.error('Tracking error:', e); }
    };
    trackVisit();
  }, []);

  const handleClick = async () => {
    const sessionId = localStorage.getItem('session_id');
    try {
      await fetch('/api/landing/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          action: 'click'
        })
      });
    } catch (e) { console.error('Tracking error:', e); }
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-between p-4 relative overflow-hidden font-sans">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black -z-10" />
      <div className="absolute top-0 left-0 w-full h-full bg-[url('/noise.png')] opacity-[0.05] pointer-events-none" />

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center w-full max-w-md mx-auto text-center space-y-12 z-10">

        {/* HERO SECTION */}
        <div className="space-y-4">
          <motion.h1
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] glitch-text relative z-20"
            data-text="CRASH"
          >
            CRASH
          </motion.h1>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="space-y-1"
          >
            <p className="text-gray-400 text-lg uppercase tracking-widest font-bold">Up to</p>
            <p className="text-4xl font-bold text-yellow-500 drop-shadow-lg">
              5 MILLION
            </p>
            <p className="text-gray-400 text-lg uppercase tracking-widest font-bold">To be won</p>
          </motion.div>
        </div>

        {/* GRAPH VISUAL (Abstract representation of Crash game) */}
        <div className="w-full h-32 relative flex items-end justify-center px-8 opacity-80">
          <svg viewBox="0 0 100 40" className="w-full h-full overflow-visible">
            <motion.path
              d="M0,40 Q50,40 100,5"
              fill="none"
              stroke="#ef4444"
              strokeWidth="2"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeIn" }}
            />
            <motion.circle
              cx="100"
              cy="5"
              r="2"
              fill="#fbbf24"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: 2, repeat: Infinity, times: [0.8, 0.9, 1] }}
            />
          </svg>
        </div>

        {/* CTA SECTION */}
        <div className="space-y-6 w-full">
          <motion.p
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-green-400 font-mono text-sm uppercase tracking-wider"
          >
            Tap to get free <span className="font-bold text-lg">50 KSH</span>
          </motion.p>

          <Link href="https://boompesa.com/" onClick={handleClick} className="block w-full">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={{
                boxShadow: ["0 0 0 rgba(239, 68, 68, 0)", "0 0 20px rgba(239, 68, 68, 0.5)", "0 0 0 rgba(239, 68, 68, 0)"]
              }}
              transition={{
                boxShadow: { duration: 1.5, repeat: Infinity }
              }}
              className="w-full py-6 bg-gradient-to-r from-red-600 to-red-700 rounded-xl font-black text-2xl uppercase tracking-widest text-white border-b-4 border-red-900 active:border-b-0 active:translate-y-1 shadow-2xl"
            >
              Tap to Claim
            </motion.button>
          </Link>
        </div>

      </main>

      {/* FOOTER */}
      <footer className="w-full text-center py-6 z-10">
        <p className="text-[10px] text-gray-600 font-medium uppercase tracking-widest">
          18+ | Play Responsibly | Terms & Conditions Apply
        </p>
      </footer>
    </div>
  );
}
