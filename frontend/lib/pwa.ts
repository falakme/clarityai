"use client";

/**
 * PWA / Web Push helpers (client-side).
 *
 * Flow: request Notification permission -> ensure the service worker is active
 * -> fetch the VAPID public key -> subscribe via the Push API -> persist the
 * subscription on the backend (scoped to the user's city).
 *
 * iOS hardening: every async step is bounded by a timeout so the UI can never
 * hang on an infinite spinner (a known iOS Safari/PWA quirk where the service
 * worker isn't yet "ready" the first time permission is granted). When that
 * happens we return "pending" instead of spinning, and `resumePushForCity`
 * silently finishes the subscription on the next app open/focus.
 */

const STEP_TIMEOUT_MS = 8000;

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

class TimeoutError extends Error {}

function withTimeout<T>(p: Promise<T>, ms = STEP_TIMEOUT_MS): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new TimeoutError("timeout")), ms),
    ),
  ]);
}

export type PushResult =
  | "subscribed"
  | "denied"
  | "unsupported"
  | "not-configured"
  | "pending"
  | "error";

export function pushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

/** Get an ACTIVE service-worker registration, registering it if needed. */
async function getActiveRegistration(): Promise<ServiceWorkerRegistration> {
  let reg = await navigator.serviceWorker.getRegistration();
  if (!reg) reg = await navigator.serviceWorker.register("/sw.js");
  if (reg.active) return reg;
  // Wait (bounded) for the worker to finish activating. On the very first
  // grant this can stall on iOS — the timeout converts that into "pending".
  await withTimeout(navigator.serviceWorker.ready);
  return (await navigator.serviceWorker.getRegistration()) ?? reg;
}

/** Subscribe + persist. Assumes permission is already granted. */
async function subscribeAndPersist(city: string): Promise<PushResult> {
  try {
    const keyRes = await fetch("/api/push/vapid-public-key", { cache: "no-store" });
    const keyData = await keyRes.json();
    if (!keyData?.configured || !keyData?.public_key) return "not-configured";

    const reg = await getActiveRegistration();

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await withTimeout(
        reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(keyData.public_key),
        }),
      );
    }

    const json = sub.toJSON() as {
      endpoint?: string;
      keys?: { p256dh?: string; auth?: string };
    };
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        endpoint: json.endpoint,
        keys: { p256dh: json.keys?.p256dh ?? "", auth: json.keys?.auth ?? "" },
        city,
      }),
    });
    return "subscribed";
  } catch (e) {
    // Timed out waiting on the SW/subscribe — it'll complete on next open.
    if (e instanceof TimeoutError) return "pending";
    return "error";
  }
}

/**
 * User-initiated: request permission (must run inside a click handler), then
 * subscribe. Never hangs — returns "pending" if the SW isn't ready yet.
 */
export async function enablePushForCity(city: string): Promise<PushResult> {
  if (!pushSupported()) return "unsupported";

  let permission: NotificationPermission;
  try {
    permission = await Notification.requestPermission();
  } catch {
    return "error";
  }
  if (permission !== "granted") return "denied";

  return subscribeAndPersist(city);
}

/**
 * Silent: if permission is ALREADY granted, (re)subscribe without prompting.
 * Called on mount / when the app regains focus so a previously "pending"
 * grant activates automatically — no second tap or reinstall needed.
 * Returns null when there's nothing to do (unsupported / not granted).
 */
export async function resumePushForCity(city: string): Promise<PushResult | null> {
  if (!pushSupported()) return null;
  if (Notification.permission !== "granted") return null;
  return subscribeAndPersist(city);
}
