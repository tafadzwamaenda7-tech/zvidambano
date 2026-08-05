/**
 * Service Worker Registration & Management
 * Handles PWA offline capabilities + web push subscriptions
 */

import { supabase } from './supabase';

interface ServiceWorkerOptions {
  onUpdate?: (sw: ServiceWorkerContainer) => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

let swRegistration: ServiceWorkerRegistration | null = null;

let deferredInstallPrompt: { prompt: () => void; userChoice: Promise<{ outcome: string }> } | null = null;

/** Capture the browser's install prompt (must be called before the event fires). */
export function captureInstallPrompt(): void {
  if (deferredInstallPrompt || typeof window === 'undefined') return;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e as unknown as typeof deferredInstallPrompt;
  });
}

/** Ask the user to install the PWA. Returns true if they accepted. */
export async function promptInstall(): Promise<boolean> {
  if (!deferredInstallPrompt) return false;
  const prompt = deferredInstallPrompt;
  prompt.prompt();
  const { outcome } = await prompt.userChoice;
  deferredInstallPrompt = null;
  return outcome === 'accepted';
}

export async function registerServiceWorker(options: ServiceWorkerOptions = {}): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.log('[PWA] Service Workers not supported');
    return;
  }

  captureInstallPrompt();

  try {
    console.log('[PWA] Registering Service Worker...');

    swRegistration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    console.log('[PWA] Service Worker registered successfully', swRegistration);

    // Check for updates periodically
    setInterval(async () => {
      try {
        await swRegistration?.update();
      } catch (error) {
        console.warn('[PWA] Error checking for SW updates:', error);
      }
    }, 60000); // Check every minute

    // Listen for updates
    swRegistration.addEventListener('updatefound', () => {
      const newWorker = swRegistration?.installing;

      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (
          newWorker.state === 'activated' &&
          navigator.serviceWorker.controller &&
          options.onUpdate
        ) {
          console.log('[PWA] New Service Worker available');
          options.onUpdate(navigator.serviceWorker);
        }
      });
    });

    if (options.onSuccess) {
      options.onSuccess();
    }
  } catch (error) {
    console.error('[PWA] Service Worker registration failed:', error);
    if (options.onError && error instanceof Error) {
      options.onError(error);
    }
  }
}

export function updateServiceWorker(): void {
  if (!swRegistration?.waiting) {
    console.log('[PWA] No waiting Service Worker');
    return;
  }

  console.log('[PWA] Updating Service Worker...');

  swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}

export async function unregisterServiceWorker(): Promise<void> {
  if (!swRegistration) {
    console.log('[PWA] No Service Worker to unregister');
    return;
  }

  try {
    const success = await swRegistration.unregister();
    if (success) {
      console.log('[PWA] Service Worker unregistered');
      swRegistration = null;
    }
  } catch (error) {
    console.error('[PWA] Error unregistering Service Worker:', error);
  }
}

export function clearCache(): void {
  if (!navigator.serviceWorker.controller) {
    console.log('[PWA] No active Service Worker');
    return;
  }

  navigator.serviceWorker.controller.postMessage({
    type: 'CLEAR_CACHE',
  });
}

export function isOnline(): boolean {
  return navigator.onLine;
}

export function onOnlineStatusChange(callback: (isOnline: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}

/* ---------- Web push notifications ---------- */

/** VAPID public key as configured in .env (VITE_VAPID_PUBLIC_KEY). */
export function vapidConfigured(): boolean {
  return Boolean(import.meta.env.VITE_VAPID_PUBLIC_KEY);
}

function urlBase64ToUint8Array(base64Url: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64Url.length % 4)) % 4);
  const base64 = (base64Url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(base64);
  const out = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function bytesToBase64Url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function hasPushPermission(): boolean {
  return typeof Notification !== 'undefined' && Notification.permission === 'granted';
}

/**
 * Requests permission, (re)subscribes to web push and persists the endpoint to
 * the push_subscriptions table (RLS: own rows only). Resolves true when a
 * subscription is active and stored. Never throws on an unconfigured VAPID key
 * or absent session — returns false and lets the caller explain why.
 */
export async function ensurePushSubscription(): Promise<boolean> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    return false;
  }
  const { data } = await supabase.auth.getSession();
  if (!data.session) return false;
  if (!vapidConfigured()) return false;

  try {
    let reg = swRegistration;
    if (!reg) reg = await navigator.serviceWorker.ready;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return false;

    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY as string),
      });
    }

    const p256dh = sub.getKey('p256dh');
    const auth = sub.getKey('auth');
    if (!p256dh || !auth) return false;

    const { error } = await supabase.from('push_subscriptions').upsert(
      {
        user_id: data.session.user.id,
        endpoint: sub.endpoint,
        p256dh: bytesToBase64Url(p256dh),
        auth: bytesToBase64Url(auth),
        user_agent: navigator.userAgent.slice(0, 500),
      },
      { onConflict: 'endpoint' }
    );
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('[PWA] Push subscription failed:', err);
    return false;
  }
}
