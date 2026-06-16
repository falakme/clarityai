"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { LifeBuoy, Settings, TriangleAlert } from "lucide-react";
import { Brand } from "@/components/brand";
import { ThemeMode } from "@/components/theme";
import { IntakeWorkspace } from "@/components/translator/intake-workspace";
import { spring } from "@/lib/motion";
import { fetchAlerts } from "@/lib/api";
import { useProfile } from "@/lib/storage";
import type { Alert } from "@/lib/types";

/**
 * Emergency intake (Scenario A). Reached directly when an active emergency is
 * detected for the user's area — authentication is bypassed entirely. The RED
 * accent scheme is applied programmatically via <ThemeMode theme="emergency">.
 */
export default function EmergencyPage() {
  const { profile } = useProfile();
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    if (!profile?.zipCode) return;
    let active = true;
    fetchAlerts(profile.zipCode)
      .then((a) => active && setAlerts(a.filter((x) => x.is_active)))
      .catch(() => active && setAlerts([]));
    return () => {
      active = false;
    };
  }, [profile?.zipCode]);

  return (
    <main className="mx-auto max-w-3xl px-5 py-8">
      {/* Programmatic RED accent scheme for the emergency surface. */}
      <ThemeMode theme="emergency" />

      <header className="flex items-center justify-between">
        <Brand href="/emergency" />
        <Link
          href="/settings"
          className="flex min-h-tap min-w-tap items-center justify-center rounded-md text-muted-foreground hover:text-primary"
          aria-label="Settings"
        >
          <Settings className="h-6 w-6" />
        </Link>
      </header>

      <motion.div
        initial={{ opacity: 0, y: -10, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={spring}
        className="mt-6 flex items-center gap-3 rounded-md border-2 border-primary bg-primary/10 p-4 text-primary"
      >
        <TriangleAlert className="h-6 w-6 shrink-0" />
        <div>
          <p className="text-lg font-extrabold">
            Active emergency{profile?.label ? ` near ${profile.label}` : " in your area"}
          </p>
          <p className="text-base">
            All ClearAid tools are open — no sign-in needed. Get help below.
          </p>
        </div>
      </motion.div>

      {alerts.length > 0 && (
        <ul className="mt-4 space-y-2">
          {alerts.map((a) => (
            <li
              key={a.id}
              className="flex items-start gap-3 rounded-md border border-primary/40 bg-card p-4 shadow-clay-sm"
            >
              <LifeBuoy className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div>
                <p className="font-bold">{a.title}</p>
                <p className="text-base text-muted-foreground">{a.message}</p>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">
        <IntakeWorkspace
          docType="emergency"
          storageKey="emergency-intake"
          subtitle="Describe what's happening, paste a notice you received, or add a photo or PDF of any document. ClearAid explains it and gives you clear next steps right now."
        />
      </div>

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        Free and anonymous. ClearAid never submits anything for you.
      </footer>
    </main>
  );
}
