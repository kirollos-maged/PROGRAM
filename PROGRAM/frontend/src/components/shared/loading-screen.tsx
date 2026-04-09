"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useEffect } from "react";
import { useUIStore } from "@/store/uiStore";

export function LoadingScreen() {
  const { loadingScreen, setLoadingScreen } = useUIStore();

  useEffect(() => {
    const timer = setTimeout(() => setLoadingScreen(false), 1400);
    return () => clearTimeout(timer);
  }, [setLoadingScreen]);

  return (
    <AnimatePresence>
      {loadingScreen && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 grid place-items-center bg-black"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <Image src="/program-logo.png" alt="PROGRAM" width={180} height={180} className="mx-auto" priority />
            
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

