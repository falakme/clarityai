"use client";

import { AnimatePresence, motion } from "framer-motion";
import { WifiOff } from "lucide-react";
import { useOnline } from "@/lib/use-online";

/**
 * A small pill that appears when the device goes offline. ClarityAI is a PWA
 * that caches your last translation, so this reassures the user that the app
 * still works without a connection.
 */
export function OfflineBadge() {
  const online = useOnline();
  return (
    <AnimatePresence>
      {!online && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          className="print-hidden fixed inset-x-0 top-3 z-[60] mx-auto flex w-fit items-center gap-2 rounded-full border border-amber-300 bg-amber-50/90 px-4 py-2 text-sm font-bold text-amber-900 shadow-clay-sm backdrop-blur"
          role="status"
        >
          <WifiOff className="h-4 w-4" /> Offline. Showing your saved plan.
        </motion.div>
      )}
    </AnimatePresence>
  );
}
