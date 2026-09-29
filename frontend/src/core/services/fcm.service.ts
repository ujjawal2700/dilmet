/**
 * Firebase Cloud Messaging (FCM) Configuration and Initialization
 * @purpose: Handle push notifications for the web app
 */

import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { API_URL } from '../api/apiUrl';

let messaging: ReturnType<typeof getMessaging> | undefined;
type FirebaseRuntimeConfig = {
    apiKey: string;
    authDomain: string;
    projectId: string;
    storageBucket: string;
    messagingSenderId: string;
    appId: string;
    vapidKey: string;
};

let runtimeConfigPromise: Promise<FirebaseRuntimeConfig | null> | null = null;
const getRuntimeConfig = () => {
    if (!runtimeConfigPromise) {
        runtimeConfigPromise = fetch(`${API_URL.replace(/\/api$/, '')}/api/public-config`)
            .then(async (response) => {
                if (!response.ok) return null;
                const config = (await response.json())?.data?.firebase as FirebaseRuntimeConfig | undefined;
                return config?.apiKey && config?.vapidKey ? config : null;
            })
            .catch(() => null);
    }
    return runtimeConfigPromise;
};

const getMessagingClient = async () => {
    if (messaging) return messaging;
    const config = await getRuntimeConfig();
    if (!config) return null;
    try {
        const app = initializeApp({
            apiKey: config.apiKey,
            authDomain: config.authDomain,
            projectId: config.projectId,
            storageBucket: config.storageBucket,
            messagingSenderId: config.messagingSenderId,
            appId: config.appId,
        });
        messaging = getMessaging(app);
        return messaging;
    } catch (error) {
        console.error('[FCM] Firebase messaging initialization failed:', (error as Error).message);
        return null;
    }
};

/**
 * Request notification permission from the user
 * @returns {Promise<string>} Permission status: 'granted', 'denied', or 'default'
 */
export const requestNotificationPermission = async () => {
    console.log('[FCM] 📢 === REQUESTING NOTIFICATION PERMISSION ===');

    // Check if notifications are supported
    if (!('Notification' in window)) {
        console.error('[FCM] ❌ This browser does not support notifications');
        return 'denied';
    }

    console.log('[FCM] 📊 Current permission status:', Notification.permission);

    // If already granted, return early
    if (Notification.permission === 'granted') {
        console.log('[FCM] ✅ Permission already granted');
        return 'granted';
    }

    // If already denied, return early
    if (Notification.permission === 'denied') {
        console.warn('[FCM] ⚠️ Permission was previously denied');
        return 'denied';
    }

    try {
        console.log('[FCM] 🔔 Requesting permission from user...');
        const permission = await Notification.requestPermission();
        console.log('[FCM] 📊 Permission response:', permission);

        if (permission === 'granted') {
            console.log('[FCM] ✅ User granted notification permission!');
        } else {
            console.warn('[FCM] ⚠️ User denied notification permission');
        }

        return permission;
    } catch (error) {
        console.error('[FCM] ❌ Error requesting permission:', error);
        return 'denied';
    }
};

/**
 * Get FCM token for the device
 * @param {string} userId - User ID to associate with the token
 * @returns {Promise<string|null>} FCM token or null if failed
 */
export const getFCMToken = async (): Promise<string | null> => {
    const client = await getMessagingClient();
    const config = await getRuntimeConfig();
    if (!client || !config) return null;

    try {
        // Request permission first
        console.log('[FCM] 1️⃣ Requesting notification permission...');
        const permission = await requestNotificationPermission();

        if (permission !== 'granted') {
            console.warn('[FCM] ⚠️ Cannot get token without permission');
            return null;
        }

        const apiBaseUrl = API_URL.replace(/\/api$/, '');
        const serviceWorkerRegistration = await navigator.serviceWorker.register(
            `/sw.js?apiBaseUrl=${encodeURIComponent(apiBaseUrl)}`,
        );
        return await getToken(client, {
            vapidKey: config.vapidKey,
            serviceWorkerRegistration,
        });
    } catch (error) {
        console.error('[FCM] ❌ Error getting FCM token:', error);
        console.error('[FCM] ❌ Error details:', {
            message: (error as Error).message,
            code: (error as { code?: string }).code,
            name: (error as Error).name,
            stack: (error as Error).stack
        });
        return null;
    }
};

/**
 * Save FCM token to backend
 * @param {string} token - FCM token
 * @param {Function} apiCall - Function to call backend API
 * @returns {Promise<boolean>} Success status
 */
export const saveFCMTokenToBackend = async (token: string, apiCall: { post: (url: string, data: object) => Promise<{ data: { status: string } }> }): Promise<boolean> => {
    try {
        const response = await apiCall.post('/fcm/register', { fcmToken: token });
        return response.data.status === 'success';
    } catch (error) {
        console.error('[FCM] ❌ Error saving token to backend:', error);
        console.error('[FCM] ❌ Error response:', (error as { response?: { data?: unknown } }).response?.data);
        console.error('[FCM] ❌ Error status:', (error as { response?: { status?: number } }).response?.status);
        return false;
    }
};

/**
 * Handle foreground messages (when app is open)
 * @param {Function} callback - Callback to handle the message
 */
export const onForegroundMessage = (callback: (payload: { notification?: { title?: string; body?: string }; data?: Record<string, string> }) => void): void => {
    void getMessagingClient().then((client) => {
        if (client) onMessage(client, callback);
    });
};

/**
 * Show browser notification
 * @param {string} title - Notification title
 * @param {object} options - Notification options
 */
export const showNotification = (title: string, options: NotificationOptions = {}): void => {
    console.log('[FCM] 🔔 === SHOWING BROWSER NOTIFICATION ===');
    console.log('[FCM] 📢 Title:', title);
    console.log('[FCM] 📋 Options:', options);

    if (!('Notification' in window)) {
        console.error('[FCM] ❌ Browser does not support notifications');
        return;
    }

    if (Notification.permission !== 'granted') {
        console.warn('[FCM] ⚠️ No permission to show notification');
        return;
    }

    try {
        const notification = new Notification(title, options);
        console.log('[FCM] ✅ Notification created:', notification);

        notification.onclick = (event) => {
            console.log('[FCM] 👆 Notification clicked:', event);
            window.focus();
            notification.close();
        };
    } catch (error) {
        console.error('[FCM] ❌ Error showing notification:', error);
    }
};

export default {
    requestNotificationPermission,
    getFCMToken,
    saveFCMTokenToBackend,
    onForegroundMessage,
    showNotification,
};
