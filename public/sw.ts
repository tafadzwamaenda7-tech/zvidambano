/// <reference lib="webworker" />

const CACHE_NAME = 'zvida-v1';
const API_CACHE_NAME = 'zvida-api-v1';
const RUNTIME_CACHE_NAME = 'zvida-runtime-v1';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/styles.css',
  '/design-system.css',
];

// Install event - cache static assets
self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('[Service Worker] Installing...');

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Service Worker] Error caching static assets:', err);
      });
      // Force SW to activate immediately
      self.skipWaiting();
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('[Service Worker] Activating...');

  event.waitUntil(
    (async () => {
      const cacheNames = await caches.keys();
      const validCaches = [CACHE_NAME, API_CACHE_NAME, RUNTIME_CACHE_NAME];

      await Promise.all(
        cacheNames
          .filter((name) => !validCaches.includes(name))
          .map((name) => caches.delete(name))
      );

      // Claim all clients
      self.clients.claim();
    })()
  );
});

// Fetch event - implement caching strategy
self.addEventListener('fetch', (event: FetchEvent) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and non-http(s)
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Skip certain patterns
  if (url.pathname.includes('/node_modules/') || url.pathname.includes('.map')) {
    return;
  }

  // Strategy: API calls - network first, fall back to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Strategy: HTML - network first, fall back to cache
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(handleHtmlRequest(request));
    return;
  }

  // Strategy: Assets (JS, CSS, images) - cache first
  event.respondWith(handleAssetRequest(request));
});

async function handleApiRequest(request: Request): Promise<Response> {
  try {
    // Try network first
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(API_CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Fall back to cache
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Return offline response
    return new Response(
      JSON.stringify({
        error: 'Offline - No cached data available',
        offline: true,
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

async function handleHtmlRequest(request: Request): Promise<Response> {
  try {
    // Try network first
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Fall back to cache
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }

    // Return offline fallback
    const fallback = await caches.match('/index.html');
    if (fallback) {
      return fallback;
    }

    return new Response('Offline - Page not available', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

async function handleAssetRequest(request: Request): Promise<Response> {
  // Cache first strategy
  const cached = await caches.match(request);
  if (cached) {
    return cached;
  }

  try {
    const response = await fetch(request);

    // Cache successful responses
    if (response.ok) {
      const cache = await caches.open(RUNTIME_CACHE_NAME);
      cache.put(request, response.clone());
    }

    return response;
  } catch (error) {
    // Return offline response
    return new Response('Offline - Asset not available', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}

// Handle messages from clients
self.addEventListener('message', (event: ExtendableMessageEvent) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      (async () => {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map((name) => caches.delete(name)));
      })()
    );
  }
});
