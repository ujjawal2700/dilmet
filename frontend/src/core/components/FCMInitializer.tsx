/**
 * FCM Initializer Component (OPTIMIZED)
 * - Runs for every logged-in user (male and female)
 * - Saves the token to localStorage and to the backend
 * - Session flag is set only after a successful save, so failures retry
 * - If permission hasn't been decided yet, waits for the first user gesture
 *   (browsers like Safari/iOS ignore permission prompts without one)
 */

import { useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import fcmService from "../services/fcm.service";
import apiClient from "../api/client";

const FCM_SESSION_KEY = "fcm_initialized_session";
const GESTURE_EVENTS = ["pointerdown", "keydown"] as const;

let foregroundListenerAttached = false;

export const FCMInitializer = () => {
  const { user } = useAuth();
  const inFlight = useRef(false);

  useEffect(() => {
    const userId = user?.id;
    // Guard: Only run if user is logged in
    if (!userId || userId === "unknown") return;
    if (!("Notification" in window)) return;
    if (Notification.permission === "denied") return;

    // Guard: Already registered for this user in this session
    if (sessionStorage.getItem(FCM_SESSION_KEY) === userId) return;

    let cancelled = false;

    const initFCM = async () => {
      if (inFlight.current || cancelled) return;
      inFlight.current = true;
      try {
        const token = await fcmService.getFCMToken();
        if (!token || cancelled) return;

        // Save locally right away so the device token is never lost
        fcmService.setStoredFCMToken(token, userId);

        const saved = await fcmService.saveFCMTokenToBackend(token, apiClient);
        if (saved) {
          sessionStorage.setItem(FCM_SESSION_KEY, userId);
        }

        if (!foregroundListenerAttached) {
          foregroundListenerAttached = true;
          fcmService.onForegroundMessage((payload) => {
            const title = payload.notification?.title || "New Message";
            const body =
              payload.notification?.body || "You have a notification";
            fcmService.showNotification(title, { body, icon: "/logo.jpeg" });
          });
        }
      } catch (e) {
        // Silent fail - FCM is non-critical
        console.error("[FCM] Initialization failed:", e);
      } finally {
        inFlight.current = false;
      }
    };

    const onGesture = () => {
      removeGestureListeners();
      void initFCM();
    };
    const removeGestureListeners = () =>
      GESTURE_EVENTS.forEach((evt) =>
        window.removeEventListener(evt, onGesture),
      );

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    if (Notification.permission === "granted") {
      // Delay FCM init by 5 seconds to prioritize dashboard
      timeoutId = setTimeout(initFCM, 5000);
    } else {
      // Permission not asked yet - ask on the first interaction
      GESTURE_EVENTS.forEach((evt) =>
        window.addEventListener(evt, onGesture, { once: true }),
      );
    }

    return () => {
      cancelled = true;
      if (timeoutId) clearTimeout(timeoutId);
      removeGestureListeners();
    };
  }, [user?.id]);

  return null;
};
