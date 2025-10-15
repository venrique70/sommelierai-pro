// SW minimalista para habilitar modo instalable (sin cache aún)
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
