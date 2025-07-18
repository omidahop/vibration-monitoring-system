const CACHE_NAME = 'vibration-monitor-v2';
const DYNAMIC_CACHE = 'vibration-dynamic-v2';
const OFFLINE_CACHE = 'vibration-offline-v2';

const STATIC_FILES = [
    '/pages/index.html',
    '/pages/login.html',
    '/pages/register.html',
    '/css/styles.css',
    '/css/auth.css',
    '/css/admin.css',
    '/js/app.js',
    '/js/auth.js',
    '/js/admin.js',
    '/js/register.js',
    '/manifest.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Install event
self.addEventListener('install', event => {
    event.waitUntil(
        Promise.all([
            caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_FILES)),
            caches.open(OFFLINE_CACHE).then(cache => 
                cache.put('/offline.html', new Response(OFFLINE_HTML, {
                    headers: { 'Content-Type': 'text/html' }
                }))
            )
        ])
    );
    self.skipWaiting();
});

// Activate event
self.addEventListener('activate', event => {
    event.waitUntil(
        Promise.all([
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName !== CACHE_NAME && 
                            cacheName !== DYNAMIC_CACHE && 
                            cacheName !== OFFLINE_CACHE) {
                            return caches.delete(cacheName);
                        }
                    })
                );
            }),
            self.clients.claim()
        ])
    );
});

// Fetch event
self.addEventListener('fetch', event => {
    const { request } = event;
    const url = new URL(request.url);
    
    if (!request.url.startsWith('http')) {
        return;
    }
    
    if (request.method === 'GET') {
        if (STATIC_FILES.includes(url.pathname)) {
            event.respondWith(cacheFirst(request));
        } else if (url.pathname.startsWith('/api/')) {
            event.respondWith(networkFirst(request));
        } else {
            event.respondWith(staleWhileRevalidate(request));
        }
    } else {
        event.respondWith(networkOnly(request));
    }
});

// Cache strategies
async function cacheFirst(request) {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        return await caches.match('/offline.html');
    }
}

async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            const cache = await caches.open(DYNAMIC_CACHE);
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

async function staleWhileRevalidate(request) {
    const cachedResponse = await caches.match(request);
    
    const networkResponsePromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            const cache = caches.open(DYNAMIC_CACHE);
            cache.then(c => c.put(request, networkResponse.clone()));
        }
        return networkResponse;
    });
    
    return cachedResponse || networkResponsePromise;
}

async function networkOnly(request) {
    return fetch(request);
}

// Offline page HTML
const OFFLINE_HTML = `
<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>اتصال قطع شده</title>
    <style>
        body {
            font-family: 'Vazirmatn', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 2rem;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0;
        }
        .offline-container {
            max-width: 500px;
        }
        .offline-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
        }
        .offline-title {
            font-size: 2rem;
            margin-bottom: 1rem;
        }
        .offline-message {
            font-size: 1.2rem;
            margin-bottom: 2rem;
            opacity: 0.9;
        }
        .retry-btn {
            background: #4CAF50;
            color: white;
            border: none;
            padding: 12px 24px;
            font-size: 1rem;
            border-radius: 8px;
            cursor: pointer;
            transition: background 0.3s;
        }
        .retry-btn:hover {
            background: #45a049;
        }
    </style>
</head>
<body>
    <div class="offline-container">
        <div class="offline-icon">📡</div>
        <h1 class="offline-title">اتصال به اینترنت قطع شده</h1>
        <p class="offline-message">
            لطفاً اتصال اینترنت خود را بررسی کنید و دوباره تلاش کنید.
        </p>
        <button class="retry-btn" onclick="window.location.reload()">
            تلاش مجدد
        </button>
    </div>
</body>
</html>
`;