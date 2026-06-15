/* ClearAid service worker — offline shell + push notifications.
 * Intentionally minimal: caches the app shell so a displaced user can still
 * open the app on a flaky connection. Never caches API responses (they may
 * be time-sensitive crisis data).
 */
const CACHE = "clearaid-shell-v1";
const SHELL = ["/", "/manifest.json", "/icons/icon.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  // Never cache API calls — crisis data must be fresh.
  if (request.method !== "GET" || new URL(request.url).pathname.startsWith("/api")) {
    return;
  }
  event.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).catch(() => caches.match("/")))
  );
});

// Push notification: "wake up" the user when aid becomes available.
self.addEventListener("push", (event) => {
  let data = { title: "ClearAid", body: "New aid may be available in your area." };
  try {
    if (event.data) data = { ...data, ...event.data.json() };
  } catch (e) {
    /* keep defaults */
  }
  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon.svg",
      badge: "/icons/icon.svg",
      vibrate: [120, 60, 120],
      data: { url: "/dashboard" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/dashboard";
  event.waitUntil(clients.openWindow(url));
});
