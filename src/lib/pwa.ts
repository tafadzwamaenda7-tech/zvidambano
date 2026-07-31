/**
 * Service Worker Registration & Management
 * Handles PWA offline capabilities
 */

interface ServiceWorkerOptions {
  onUpdate?: (sw: ServiceWorkerContainer) => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

let swRegistration: ServiceWorkerRegistration | null = null;

export async function registerServiceWorker(options: ServiceWorkerOptions = {}): Promise<void> {
  if (!('serviceWorker' in navigator)) {
    console.log('[PWA] Service Workers not supported');
    return;
  }

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
