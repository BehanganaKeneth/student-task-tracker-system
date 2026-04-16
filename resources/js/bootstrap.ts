import axios from 'axios';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

const token = document
	.querySelector('meta[name="csrf-token"]')
	?.getAttribute('content');

if (token) {
	window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token;
}

// Initialize Echo for real-time broadcasting
const pusherKey = import.meta.env.VITE_PUSHER_APP_KEY;
if (pusherKey) {
	window.Pusher = Pusher;
	window.Echo = new Echo({
		broadcaster: 'pusher',
		key: pusherKey,
		cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER ?? 'mt1',
		authEndpoint: '/broadcasting/auth',
		auth: {
			headers: {
				'X-CSRF-TOKEN': token ?? '',
			},
		},
		forceTLS: true,
	});
}

// Register Service Worker for PWA and push notifications
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker
			.register('/service-worker.js', { scope: '/' })
			.then((registration) => {
				console.log('Service Worker registered:', registration);
				
				// Listen for push messages
				registration.onupdatefound = () => {
					const newWorker = registration.installing;
					if (newWorker) {
						newWorker.onstatechange = () => {
							if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
								console.log('New Service Worker available');
							}
						};
					}
				};
			})
			.catch((error) => {
				console.error('Service Worker registration failed:', error);
			});
		
		// Request notification permission if not already granted
		if ('Notification' in window && Notification.permission === 'default') {
			Notification.requestPermission().catch((error) => {
				console.log('Notification permission request failed:', error);
			});
		}
	});
}
