const CACHE_NAME = 'messenger-cache-v2';
const ASSETS = ['./', './index.html', './manifest.json', './icon-192.png', './icon-512.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// App shell: network-first (so updates arrive), cache fallback offline. Server/API calls are never touched.
self.addEventListener('fetch', (event) => {
  const req = event.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;
  event.respondWith(
    fetch(req).then((res) => {
      if (res && res.status === 200) { const copy = res.clone(); caches.open(CACHE_NAME).then((c) => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then((m) => m || caches.match('./index.html')))
  );
});

// Push + notification clicks (works for server push and for the same-phone MsgGen hand-off)
self.addEventListener('push', (event) => {
  let d = {};
  try { d = event.data.json(); } catch (e) { d = { title: 'Messenger', body: event.data ? event.data.text() : '' }; }
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => {
    if (cs.some((c) => c.focused)) return; // app is open in front: no popup needed
    return self.registration.showNotification(d.title || 'Messenger', {
      body: d.body || '', icon: 'icon-192.png', badge: 'icon-192.png',
      tag: d.conv ? 'conv-' + d.conv : 'msg', renotify: true, data: d
    });
  }));
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const d = event.notification.data || {};
  const qs = d.inbox ? '?inbox=1' : d.conv ? '?conv=' + d.conv : '';
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => {
    if (cs[0]) { cs[0].postMessage({ inbox: !!d.inbox, conv: d.conv }); return cs[0].focus(); }
    return self.clients.openWindow('./' + qs);
  }));
});
