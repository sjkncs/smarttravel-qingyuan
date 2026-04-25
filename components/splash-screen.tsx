"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SESSION_KEY = "qy_splash_shown";
const DURATION = 3200;

function AppLogo() {
  return (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="logoGrad" x1="20" y1="8" x2="52" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
      </defs>
      <path d="M36 8L52 20V28L36 20L20 28V20L36 8Z" fill="#10b981" />
      <path d="M20 28V44L36 52V36L20 28Z" fill="#34d399" />
      <path d="M52 28V44L36 52V36L52 28Z" fill="#059669" />
      <path d="M36 36L20 44L36 64L52 44L36 36Z" fill="url(#logoGrad)" opacity="0.9" />
    </svg>
  );
}

export default function SplashScreen() {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!sessionStorage.getItem(SESSION_KEY)) {
      sessionStorage.setItem(SESSION_KEY, "1");
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      timerRef.current = setTimeout(() => setVisible(false), DURATION);
      return () => { if (timerRef.current) clearTimeout(timerRef.current); };
    }
  }, [visible]);

  const dismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-white dark:bg-zinc-950 flex flex-col cursor-pointer"
          onClick={dismiss}
        >
          {/* Top progress bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-transparent overflow-hidden">
            <motion.div
              className="h-full"
              style={{
                background: "linear-gradient(90deg, #10b981 0%, #34d399 50%, #0d9488 100%)",
              }}
              initial={{ width: "0%", x: "-100%" }}
              animate={{ width: "100%", x: "0%" }}
              transition={{ duration: DURATION / 1000 - 0.4, ease: "easeInOut" }}
            />
          </div>

          {/* Center logo */}
          <div className="flex-1 flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.75 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col items-center gap-3"
            >
              <motion.div
                animate={{ scale: [1, 1.04, 1] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <AppLogo />
              </motion.div>
              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-xl font-bold tracking-wider text-zinc-800 dark:text-zinc-200"
              >
                智游乡野
              </motion.h1>
            </motion.div>
          </div>

          {/* Bottom branding */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.4 }}
            className="pb-8 text-center space-y-2"
          >
            <p className="text-[13px] text-zinc-400 dark:text-zinc-500 tracking-wide">
              Powered by Smart Travel
            </p>
            <div className="flex items-center justify-center gap-3 text-[11px] text-zinc-400 dark:text-zinc-600">
              <a href="/terms" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">服务协议</a>
              <span>·</span>
              <a href="/privacy" className="hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors">隐私政策</a>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
