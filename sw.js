// Minimal service worker. This exists only to satisfy Android's
// "installable web app" requirements so Add to Home Screen launches
// standalone instead of as a plain browser bookmark. It doesn't cache
// or intercept anything — every request just passes straight through.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));
self.addEventListener('fetch', () => {});
