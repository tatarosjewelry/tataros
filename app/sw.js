// Disable the previous splash-era offline cache so the current app always loads fresh.
self.addEventListener("install",event=>event.waitUntil(self.skipWaiting()));
self.addEventListener("activate",event=>event.waitUntil((async()=>{const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith("tataros-app-")).map(k=>caches.delete(k)));await self.registration.unregister();await self.clients.claim();})()));
self.addEventListener("fetch",event=>{});
