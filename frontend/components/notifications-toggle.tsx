"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, BellOff, BellRing, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  enablePushForCity,
  pushSupported,
  resumePushForCity,
  type PushResult,
} from "@/lib/pwa";

/**
 * "Enable alerts" control. Requests Notification permission (on tap) and
 * registers a Web Push subscription scoped to the user's city.
 *
 * iOS resilience: if the first attempt can't finish subscribing (the service
 * worker isn't "ready" yet), it shows a "finishing" message instead of
 * hanging, and silently completes on the next mount/focus — so the user no
 * longer has to close and reopen the app to activate alerts.
 */
export function NotificationsToggle({ city }: { city: string }) {
  const [state, setState] = useState<PushResult | "idle" | "working">("idle");

  // On mount and whenever the app regains focus, if permission is already
  // granted, finish/refresh the subscription silently (no prompt).
  const resume = useCallback(async () => {
    const res = await resumePushForCity(city);
    if (res === "subscribed") setState("subscribed");
    else if (res === "pending") setState((s) => (s === "working" ? s : "pending"));
  }, [city]);

  useEffect(() => {
    if (!pushSupported()) return;
    resume();
    const onVisible = () => {
      if (document.visibilityState === "visible") resume();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [resume]);

  if (!pushSupported()) return null;

  const MESSAGES: Record<string, string> = {
    subscribed: "Alerts are on — we'll notify you about emergencies nearby.",
    denied: "Notifications are blocked. Enable them in your browser settings.",
    "not-configured": "Push isn't configured on the server yet.",
    pending: "Almost there — finishing setup. Reopen ClearAid once if it doesn't complete.",
    error: "Couldn't enable alerts. Please try again.",
    unsupported: "",
  };

  async function enable() {
    setState("working");
    setState(await enablePushForCity(city));
  }

  const done = state === "subscribed";
  const showMessage = state !== "idle" && state !== "working" && MESSAGES[state];

  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border border-primary/30 bg-primary/5 p-3">
      <span className="text-primary">
        {done ? <BellRing className="h-5 w-5" /> : <Bell className="h-5 w-5" />}
      </span>
      <p className="flex-1 text-base">
        {showMessage
          ? MESSAGES[state]
          : "Get notified when emergencies or aid are announced in your area."}
      </p>
      {!done && (
        <Button size="sm" variant="outline" onClick={enable} disabled={state === "working"}>
          {state === "working" ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" /> Enabling…
            </>
          ) : state === "denied" ? (
            <>
              <BellOff className="h-4 w-4" /> Blocked
            </>
          ) : state === "pending" ? (
            <>
              <Bell className="h-4 w-4" /> Finish setup
            </>
          ) : (
            <>
              <Bell className="h-4 w-4" /> Enable alerts
            </>
          )}
        </Button>
      )}
    </div>
  );
}
