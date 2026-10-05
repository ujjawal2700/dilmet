import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { getServiceWorkerUrl } from './core/services/fcm.service'
import { installNativeBackDetection } from './shared/lib/nativeBack'
import { installNoLongPressMenus } from './shared/lib/noLongPressMenus'

installNativeBackDetection();
installNoLongPressMenus();

if (
  typeof window !== 'undefined' &&
  window.location.protocol === 'http:' &&
  !['localhost', '127.0.0.1'].includes(window.location.hostname)
) {
  window.location.replace(`https://${window.location.host}${window.location.pathname}${window.location.search}${window.location.hash}`);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// Register Service Worker for PWA/Android App support
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      // Same URL as FCM registration - a different URL would replace the push worker
      navigator.serviceWorker.register(getServiceWorkerUrl())
        .then(registration => {
          console.log('SW registered: ', registration);
        })
        .catch(registrationError => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  } else {
    // In development mode, unregister any active service worker to prevent caching stale dev assets
    navigator.serviceWorker.getRegistrations().then(registrations => {
      for (const registration of registrations) {
        // Keep the FCM push worker: unregistering it invalidates the device's FCM token
        if (registration.active?.scriptURL.includes('apiBaseUrl=')) continue;
        if (registration.active && registration.active.scriptURL.includes('sw.js')) {
          registration.unregister().then(success => {
            if (success) {
              console.log('Successfully unregistered stale development service worker for sw.js');
              window.location.reload(); // Reload to fetch fresh assets
            }
          });
        }
      }
    });
  }
}
