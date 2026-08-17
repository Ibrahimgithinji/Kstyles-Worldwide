// Kill-switch service worker.
// The site does not use a service worker. This script exists only so any
// legacy service worker registered in a visitor's browser is replaced,
// unregistered, and has its caches cleared — preventing stale workers
// (e.g. from a previous version of the site) from running or throwing.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.registration.unregister();
      const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      for (const client of clients) client.navigate(client.url);
    })()
  );
});