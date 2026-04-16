// Service Worker for Push Notifications
const CACHE_NAME = 'task-tracker-v1';
const urlsToCache = [
    '/',
    '/index.php',
    '/build/',
];

// Install event
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(urlsToCache))
            .then(() => self.skipWaiting())
    );
});

// Activate event
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch event with network-first strategy for API, cache-first for assets
self.addEventListener('fetch', (event) => {
    const { request } = event;

    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }

    // Network first for API calls
    if (request.url.includes('/api/') || request.url.includes('/broadcasting/')) {
        event.respondWith(
            fetch(request)
                .then((response) => {
                    if (!response || response.status !== 200 || response.type === 'error') {
                        return response;
                    }
                    const responseClone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(request, responseClone);
                    });
                    return response;
                })
                .catch(() => {
                    return caches.match(request);
                })
        );
    } else {
        // Cache first for static assets
        event.respondWith(
            caches.match(request)
                .then((response) => response || fetch(request))
                .catch(() => new Response('Offline', { status: 503 }))
        );
    }
});

// Push notification event
self.addEventListener('push', (event) => {
    if (!event.data) {
        return;
    }

    try {
        const data = event.data.json();
        const options = {
            body: data.body || 'New notification',
            icon: '/logo.png',
            badge: '/logo.png',
            tag: data.tag || 'task-notification',
            requireInteraction: false,
            actions: [
                {
                    action: 'open',
                    title: 'View',
                },
                {
                    action: 'close',
                    title: 'Dismiss',
                },
            ],
            data: {
                url: data.url || '/',
                taskId: data.task_id,
                notificationId: data.id,
            },
        };

        event.waitUntil(
            self.registration.showNotification(data.title || 'Task Tracker', options)
        );
    } catch (error) {
        console.error('Push event error:', error);
    }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'close') {
        return;
    }

    const urlToOpen = event.notification.data?.url || '/';

    event.waitUntil(
        clients.matchAll({
            type: 'window',
            includeUncontrolled: true,
        }).then((clientList) => {
            // Check if app is already open
            for (let i = 0; i < clientList.length; i++) {
                const client = clientList[i];
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            // Open new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

// Notification close event (for analytics)
self.addEventListener('notificationclose', (event) => {
    console.log('Notification dismissed:', event.notification.data?.notificationId);
});
