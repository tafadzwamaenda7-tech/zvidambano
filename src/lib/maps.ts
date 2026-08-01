/**
 * Maps & GPS Tracking — Live delivery tracking, geolocation, and map utilities
 * Uses Supabase Realtime (WebSockets) for live GPS updates
 */

import { supabase } from './supabase';
import { deliveriesCRUD } from './crud';
import { logger } from './logger';

// Zimbabwe center coordinates (Harare)
export const ZIMBABWE_CENTER = { lat: -17.8318, lng: 31.0524 };
export const ZIMBABWE_BOUNDS = {
  north: -15.6,
  south: -22.4,
  west: 25.2,
  east: 33.1,
};

// Major Zimbabwe cities for geocoding
export const ZIMBABWE_CITIES: Record<string, { lat: number; lng: number }> = {
  Harare: { lat: -17.8318, lng: 31.0524 },
  Bulawayo: { lat: -20.1457, lng: 28.5873 },
  Mutare: { lat: -18.9689, lng: 32.6729 },
  Gweru: { lat: -19.4541, lng: 29.8159 },
  Masvingo: { lat: -20.0748, lng: 30.8326 },
  Kwekwe: { lat: -18.9167, lng: 29.8167 },
  Kadoma: { lat: -18.3333, lng: 29.9167 },
  Chinhoyi: { lat: -17.35, lng: 30.2 },
  Marondera: { lat: -18.1853, lng: 31.5514 },
  Norton: { lat: -17.8833, lng: 30.7 },
  Chegutu: { lat: -18.1333, lng: 30.1333 },
  Bindura: { lat: -17.3, lng: 31.3 },
  Gokwe: { lat: -18.2, lng: 28.9333 },
  Hwange: { lat: -18.3667, lng: 26.5 },
  VictoriaFalls: { lat: -17.9167, lng: 25.8333 },
};

// ============================================================
// GEOLOCATION — Get current user location
// ============================================================
export function getCurrentLocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}

// Watch position continuously (for driver tracking)
export function watchPosition(
  callback: (location: { lat: number; lng: number; accuracy: number }) => void,
  errorCallback?: (error: GeolocationPositionError) => void
): number {
  if (!navigator.geolocation) {
    errorCallback?.(new GeolocationPositionError());
    return -1;
  }

  return navigator.geolocation.watchPosition(
    (position) => {
      callback({
        lat: position.coords.latitude,
        lng: position.coords.longitude,
        accuracy: position.coords.accuracy,
      });
    },
    (error) => errorCallback?.(error),
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 }
  );
}

// Stop watching position
export function stopWatching(watchId: number) {
  if (watchId !== -1) {
    navigator.geolocation.clearWatch(watchId);
  }
}

// ============================================================
// LIVE DELIVERY TRACKING — Update GPS via Supabase
// ============================================================

// Start live tracking for a delivery (driver side)
export async function startDeliveryTracking(deliveryId: string, intervalMs: number = 30000) {
  logger.info(`Starting GPS tracking for delivery ${deliveryId}`);

  const watchId = watchPosition(
    async (location) => {
      try {
        await deliveriesCRUD.updateLocation(deliveryId, location.lat, location.lng);
        logger.debug('GPS updated:', location);
      } catch (error) {
        logger.error('Failed to update GPS:', error);
      }
    },
    (error) => {
      logger.error('Geolocation error:', error);
    }
  );

  return watchId;
}

// Subscribe to live delivery updates (offtaker/broker side)
export function subscribeToDeliveryLocation(
  deliveryId: string,
  callback: (location: { lat: number; lng: number; status: string }) => void
) {
  const channel = supabase
    .channel(`delivery-location:${deliveryId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'deliveries',
        filter: `id=eq.${deliveryId}`,
      },
      (payload: any) => {
        const { gps_lat, gps_lng, status } = payload.new;
        if (gps_lat && gps_lng) {
          callback({ lat: gps_lat, lng: gps_lng, status });
        }
      }
    );

  channel.subscribe();
  return channel;
}

// Subscribe to all active deliveries (dashboard view)
export function subscribeToAllDeliveries(
  callback: (deliveries: any[]) => void
) {
  const channel = supabase
    .channel('all-deliveries-live')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'deliveries',
      },
      async () => {
        // Refetch all active deliveries on any change
        const { data } = await supabase
          .from('deliveries')
          .select(`
            *,
            contract:contracts(contract_number, farmer_id, offtaker_id),
            driver:users!driver_id(full_name, phone)
          `)
          .in('status', ['LOADING', 'FIRST_WEIGHT', 'IN_TRANSIT', 'SECOND_WEIGHT'])
          .order('created_at', { ascending: false });
        callback(data || []);
      }
    );

  channel.subscribe();
  return channel;
}

// ============================================================
// DISTANCE & ROUTE CALCULATIONS
// ============================================================

// Calculate distance between two coordinates (Haversine formula)
export function calculateDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Estimate travel time (assuming 60km/h average)
export function estimateTravelTime(distanceKm: number): { hours: number; minutes: number; text: string } {
  const hours = distanceKm / 60;
  const minutes = Math.round(hours * 60);
  if (minutes < 60) {
    return { hours: 0, minutes, text: `${minutes} min` };
  }
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  return { hours: h, minutes: m, text: `${h}h ${m}min` };
}

// ============================================================
// GEOCODING — Convert city names to coordinates
// ============================================================
export function geocodeCity(cityName: string): { lat: number; lng: number } | null {
  const normalized = cityName.replace(/\s/g, '').toLowerCase();
  for (const [city, coords] of Object.entries(ZIMBABWE_CITIES)) {
    if (city.toLowerCase() === normalized) {
      return coords;
    }
  }
  return null;
}

// Reverse geocode (find nearest city)
export function reverseGeocode(lat: number, lng: number): string {
  let nearestCity = 'Unknown';
  let minDistance = Infinity;

  for (const [city, coords] of Object.entries(ZIMBABWE_CITIES)) {
    const distance = calculateDistance(lat, lng, coords.lat, coords.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearestCity = city;
    }
  }

  return nearestCity;
}

// ============================================================
// MAP RENDERING HELPERS (for Leaflet/Google Maps integration)
// ============================================================

// Generate map markers for all active deliveries
export async function getDeliveryMarkers() {
  const { data, error } = await supabase
    .from('deliveries')
    .select(`
      id, gps_lat, gps_lng, status, vehicle_reg,
      contract:contracts(contract_number, farmer_id, offtaker_id),
      driver:users!driver_id(full_name, phone)
    `)
    .in('status', ['LOADING', 'FIRST_WEIGHT', 'IN_TRANSIT', 'SECOND_WEIGHT'])
    .not('gps_lat', 'is', null);

  if (error) throw error;
  return data || [];
}

// Generate map markers for all farms
export async function getFarmMarkers() {
  const { data, error } = await supabase
    .from('farms')
    .select(`
      id, name, location, gps_lat, gps_lng,
      owner:users!owner_id(full_name, phone)
    `)
    .not('gps_lat', 'is', null);

  if (error) throw error;
  return data || [];
}

// Generate map markers for marketplace listings by region
export async function getListingMarkers() {
  const { data, error } = await supabase
    .from('listings')
    .select('id, title, origin, category, asking_price, quantity, unit')
    .eq('status', 'active');

  if (error) throw error;

  // Geocode origins to coordinates
  return (data || []).map((listing: any) => {
    const coords = geocodeCity(listing.origin || '');
    return {
      ...listing,
      lat: coords?.lat || null,
      lng: coords?.lng || null,
    };
  }).filter((l: any) => l.lat && l.lng);
}

// ============================================================
// MAP INITIALIZATION (Leaflet example)
// ============================================================
export function initLeafletMap(containerId: string, center = ZIMBABWE_CENTER, zoom = 6) {
  // Requires Leaflet CSS/JS to be loaded:
  // <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  // <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>

  const L = (window as any).L;
  if (!L) {
    console.error('Leaflet not loaded. Add Leaflet CSS and JS to your HTML.');
    return null;
  }

  const map = L.map(containerId).setView([center.lat, center.lng], zoom);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18,
  }).addTo(map);

  return map;
}

// Add a marker to a Leaflet map
export function addMarker(map: any, lat: number, lng: number, popup: string, iconColor: string = 'blue') {
  const L = (window as any).L;
  if (!L || !map) return null;

  const marker = L.marker([lat, lng]).addTo(map);
  if (popup) marker.bindPopup(popup);
  return marker;
}

// Update marker position (for live tracking)
export function updateMarker(marker: any, lat: number, lng: number) {
  if (!marker) return;
  marker.setLatLng([lat, lng]);
}

// Draw a route line between two points
export function drawRoute(map: any, from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const L = (window as any).L;
  if (!L || !map) return null;

  const route = L.polyline(
    [[from.lat, from.lng], [to.lat, to.lng]],
    { color: '#2563eb', weight: 3, opacity: 0.7, dashArray: '10, 10' }
  ).addTo(map);

  return route;
}