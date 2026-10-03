/**
 * Service Worker for JUIT Student Hub
 * Provides comprehensive offline caching for timetable, mess, campus map,
 * academic vault, calendar, portals, and core UI assets.
 */

const CACHE_NAME = 'juit-hub-stitch-v3';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './favicon.ico',
  './favicon.svg',
  './favicon-32x32.png',
  './favicon-16x16.png',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png',
  './css/styles.css',
  './css/stitch-theme.css',
  './css/fonts/MaterialSymbolsOutlined.woff2',
  './css/fonts/MaterialSymbolsOutlined.ttf',
  './data/timetable_data.json',
  './data/mess_data.json',
  './data/campus_data.json',
  './data/calendar_data.json',
  './js/data/bundle.js',
  './js/data/initial_data.js',
  './js/theme.js',
  './js/timetable.js',
  './js/mess.js',
  './js/map.js',
  './js/calendar.js',
  './js/portals.js',
  './js/academics.js',
  './js/resources.js',
  './js/bus.js',
  './js/announcements.js',
  './js/events-clubs.js',
  './js/utilities.js',
  './js/admin.js',
  './js/app.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[ServiceWorker] Pre-caching offline campus hub pages & data');
      // Cache files individually so a single missing optional asset doesn't break the whole cache
      for (const asset of ASSETS_TO_CACHE) {
        try {
          await cache.add(asset);
        } catch (err) {
          console.warn(`[ServiceWorker] Asset skipped or failed to cache: ${asset}`, err);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[ServiceWorker] Removing stale cache version:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  
  const url = new URL(event.request.url);

  // Stale-while-revalidate / cache-first for same-origin requests
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Fetch fresh copy in background to keep cache up to date
        fetch(event.request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
            });
          }
        }).catch(() => {
          // Network unavailable; silent ignore since we served cached copy
        });
        return cachedResponse;
      }

      // If not in cache, fetch from network and cache successful response
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200) {
          return networkResponse;
        }
        
        // Cache same-origin GET requests
        if (url.origin === location.origin) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch((error) => {
        // If navigation request fails offline, return index.html
        if (event.request.mode === 'navigate' || event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('./index.html') || caches.match('./');
        }
        // If data JSON fails offline, check cache match
        if (url.pathname.endsWith('.json')) {
          return caches.match(event.request);
        }
        throw error;
      });
    })
  );
});
