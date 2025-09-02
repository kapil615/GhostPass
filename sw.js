// GhostPass Service Worker - PWA Support

const CACHE_NAME = 'ghostpass-v1.0.0';
const STATIC_CACHE_NAME = 'ghostpass-static-v1.0.0';

// Files to cache for offline functionality
const STATIC_FILES = [
    './',
    './index.html',
    './styles.css',
    './obfuscator.js',
    './matrix.js',
    './app.js',
    './manifest.json'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
    console.log('GhostPass SW: Installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE_NAME)
            .then((cache) => {
                console.log('GhostPass SW: Caching static files');
                return cache.addAll(STATIC_FILES);
            })
            .then(() => {
                console.log('GhostPass SW: Installation complete');
                return self.skipWaiting();
            })
            .catch((error) => {
                console.error('GhostPass SW: Installation failed', error);
            })
    );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('GhostPass SW: Activating...');
    
    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => {
                        // Delete old caches
                        if (cacheName !== STATIC_CACHE_NAME && cacheName !== CACHE_NAME) {
                            console.log('GhostPass SW: Deleting old cache', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('GhostPass SW: Activation complete');
                return self.clients.claim();
            })
            .catch((error) => {
                console.error('GhostPass SW: Activation failed', error);
            })
    );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
    // Only handle GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // Skip cross-origin requests
    if (!event.request.url.startsWith(self.location.origin)) {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then((cachedResponse) => {
                // Return cached version if available
                if (cachedResponse) {
                    console.log('GhostPass SW: Serving from cache', event.request.url);
                    return cachedResponse;
                }

                // Otherwise fetch from network
                console.log('GhostPass SW: Fetching from network', event.request.url);
                return fetch(event.request)
                    .then((networkResponse) => {
                        // Don't cache non-successful responses
                        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                            return networkResponse;
                        }

                        // Clone the response for caching
                        const responseToCache = networkResponse.clone();

                        // Cache the response for future use
                        caches.open(CACHE_NAME)
                            .then((cache) => {
                                cache.put(event.request, responseToCache);
                            });

                        return networkResponse;
                    })
                    .catch((error) => {
                        console.error('GhostPass SW: Network fetch failed', error);
                        
                        // Return offline page or basic response for HTML requests
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return new Response(
                                `<!DOCTYPE html>
                                <html>
                                <head>
                                    <title>GhostPass - Offline</title>
                                    <style>
                                        body { 
                                            font-family: 'Courier New', monospace; 
                                            background: #0a0a0a; 
                                            color: #00ff41; 
                                            text-align: center; 
                                            padding: 50px; 
                                        }
                                        h1 { color: #00ff41; }
                                        p { color: #b0b0b0; }
                                    </style>
                                </head>
                                <body>
                                    <h1>🔐 GhostPass</h1>
                                    <h2>You're Offline</h2>
                                    <p>GhostPass is currently offline. Please check your connection and try again.</p>
                                    <p>Your privacy is protected - no data is sent to any server.</p>
                                </body>
                                </html>`,
                                {
                                    headers: { 'Content-Type': 'text/html' }
                                }
                            );
                        }
                        
                        throw error;
                    });
            })
    );
});

// Handle messages from the main thread
self.addEventListener('message', (event) => {
    console.log('GhostPass SW: Received message', event.data);
    
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    
    if (event.data && event.data.type === 'GET_VERSION') {
        event.ports[0].postMessage({ version: CACHE_NAME });
    }
});

// Handle background sync (if supported)
self.addEventListener('sync', (event) => {
    console.log('GhostPass SW: Background sync', event.tag);
    
    if (event.tag === 'background-sync') {
        event.waitUntil(
            // Perform any background tasks here
            Promise.resolve()
        );
    }
});

// Handle push notifications (if needed in future)
self.addEventListener('push', (event) => {
    console.log('GhostPass SW: Push received', event);
    
    // GhostPass doesn't use push notifications for privacy
    // This is here for future extensibility
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('GhostPass SW: Notification clicked', event);
    
    event.notification.close();
    
    event.waitUntil(
        clients.openWindow('./')
    );
});

// Error handling
self.addEventListener('error', (event) => {
    console.error('GhostPass SW: Error', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
    console.error('GhostPass SW: Unhandled rejection', event.reason);
});

console.log('GhostPass SW: Service Worker loaded');