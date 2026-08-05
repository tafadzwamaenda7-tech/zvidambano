/* ============================================================
   ZVIDA Dashboards — shared shell + UI components (v2)
   ============================================================ */

import { syncAll, persistOrder, persistLoad, persistProduct, deleteProduct, persistRfq, deleteRfq, setLiveAccount, getLiveAccount, liveConfigured, fetchUnreadNotifications, markNotificationsRead, sendSupportMessage, fetchMyMessages, fetchProducts, fetchOrders, fetchLoads, fetchOpenRfqs, fetchMyRfqs } from '../lib/zvida-live';
import type { LiveOrder, LiveLoad, LiveProduct, LiveRfq, LiveMessage } from '../lib/zvida-live';
import { syncDeliveryStatus, settleContract, assignDriverByName } from '../lib/backend';
import { uploadListingPhoto, uploadToStorage, getSignedUrl } from '../lib/storage';
import type { DashboardSession } from '../lib/session';
import { onAuthChange } from '../lib/supabase';
import { startRealtime } from '../lib/realtime';
import { signOutAndRedirect } from '../lib/auth-ui';
import { formValue } from '../lib/settings';
import { hasPushPermission, ensurePushSubscription, vapidConfigured } from '../lib/pwa';
import { notifyUser } from '../lib/notifications';
import { getMfaStatus, enrollTotp, verifyTotpEnrollment, unEnrollMfa, type EnrollResult } from '../lib/auth';
import {
  issueWarehouseReceipt,
  updateWarehouseReceipt,
  deleteWarehouseReceipt,
  getWarehouseReceipt,
  getWarehouseReceipts,
  demoReceipts,
  buyingPower,
  pledgedTonnes,
  totalTonnes,
  clearDemoReceipts,
  type WarehouseReceipt,
} from '../lib/warehouse';

export interface PageCfg {
  id: string;
  label: string;
  icon: string;
  title: string;
  sub?: string;
  hidden?: boolean;
  render: () => string;
}

export interface RoleCfg {
  key: string;
  name: string;
  roleLabel: string;
  company: string;
  initials: string;
  logoText: string;
  accent: string;
  accentHover: string;
  accentLight: string;
  accentRgb: string;
  gradientEnd: string;
  pages: PageCfg[];
  navGroups?: { label: string; pages: string[] }[];
  /* Pages that stay fully functional for a brand-new live account (no orders/loads yet):
     marketplace flows plus create/edit forms. Every other page shows a role-specific
     empty state instead of the demo/dummy content. */
  keepEmpty?: string[];
  session?: DashboardSession;
}

export const ICON = {
  dashboard:
    '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
  sell: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
  shop: '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
  contracts:
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>',
  finance:
    '<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
  farm:
    '<path d="M3 9l1-5h16l1 5"/><path d="M3 9v11h18V9"/><path d="M9 20v-6h6v6"/>',
  messages:
    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  listings:
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  match:
    '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  deliveries:
    '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  disputes:
    '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  payments:
    '<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/><line x1="6" y1="15" x2="10" y2="15"/>',
  reports:
    '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',
  buy:
    '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>',
  quality:
    '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="m9 14 2 2 4-4"/>',
  warehouse:
    '<path d="M22 20V8l-10-5L2 8v12"/><path d="M2 20h20"/><path d="M6 20v-6h12v6"/>',
  trips: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  weighbridge:
    '<path d="M12 3v18"/><path d="M5 21h14"/><path d="M8 7a4 4 0 0 1 8 0"/>',
  earnings:
    '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  settings:
    '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  inventory:
    '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
  orders:
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>',
  truck:
    '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
  route:
    '<circle cx="6" cy="19" r="3"/><path d="M9 19h8.5a3.5 3.5 0 0 0 0-7h-11a3.5 3.5 0 0 1 0-7H15"/><circle cx="18" cy="5" r="3"/>',
  clock:
    '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  bell:
    '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  search: '<circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>',
  menu: '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',
  logout:
    '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
  mic: '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>',
  phone:
    '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',
  pin:
    '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
  check:
    '<polyline points="20 6 9 17 4 12"/>',
  x: '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
  alert:
    '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  cloud:
    '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>',
  box:
    '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
  camera:
    '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
  download:
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',
  send: '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
  plus: '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>',
  spark:
    '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  support:
    '<path d="M12 22a10 10 0 1 1 10-10"/><path d="M22 22v-6"/><path d="M22 22h-6"/><circle cx="12" cy="12" r="3"/>',
  scale: '<path d="M12 3v18"/><path d="M5 21h14"/><path d="M8 7a4 4 0 0 1 8 0"/>',
  upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  trendingUp: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
  trendingDown: '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>',
  chevronRight: '<polyline points="9 18 15 12 9 6"/>',
  wallet: '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
  users:
    '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
  moon: '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>',
  map: '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
  percent: '<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  refresh:
    '<polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>',
};

export function svg(path: string, cls = ''): string {
  return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}

/* ---------- Imagery ---------- */
interface Art { g1: string; g2: string; p: string }
export const ART: Record<string, Art> = {
  grain: { g1: '#f6c453', g2: '#e08600', p: '<path d="M5 21V9l7 3V8l7 3v10"/><path d="M3 21h18"/>' },
  wheat: { g1: '#f5d97b', g2: '#d4a017', p: '<path d="M12 22V8"/><path d="M12 11l-4-1 3-2.5"/><path d="M12 15l4-1-3-2.5"/><path d="M12 19l-4-1 3-2.5"/><path d="M3 21h18"/>' },
  soya: { g1: '#86d98a', g2: '#2f9e44', p: '<path d="M12 22C7 22 4 18 4 13s3-9 8-9 8 4 8 9-3 9-8 9z"/><path d="M12 5c.6 4 .6 8 0 17"/>' },
  seed: { g1: '#b6e07a', g2: '#5c9e0f', p: '<path d="M12 3l7 9-7 9-7-9z"/><path d="M12 7l3.5 5L12 17 8.5 12z" opacity=".55"/>' },
  fert: { g1: '#7ab6f5', g2: '#2563eb', p: '<rect x="6" y="3" width="12" height="6" rx="1"/><path d="M6 9h12v3H6z"/><rect x="8" y="12" width="8" height="9" rx="1"/>' },
  chem: { g1: '#5eead4', g2: '#0d9488', p: '<path d="M12 3c4 5 6 8 6 11a6 6 0 1 1-12 0c0-3 2-6 6-11z"/><path d="M9 14h6"/>' },
  feed: { g1: '#f0b87a', g2: '#ea580c', p: '<path d="M6 4h12l-2 5 3 7a5 5 0 0 1-5 5h-4a5 5 0 0 1-5-5l3-7z"/><path d="M7 13h10"/>' },
  chicks: { g1: '#f6a0b8', g2: '#e11d48', p: '<path d="M12 3c4 4 5 8 5 12a5 5 0 1 1-10 0c0-4 1-8 5-12z"/><circle cx="9.5" cy="16" r=".5"/>' },
  livestock: { g1: '#b0a8f5', g2: '#6d28d9', p: '<path d="M3 10h18l-9-7z"/><path d="M5 10v11h14V10"/><path d="M10 21v-5h4v5"/>' },
  tractor: { g1: '#f58a7a', g2: '#dc2626', p: '<circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/><path d="M12 18V9l-4 4H5.5"/><path d="M12 9h6l3 4-2.5 1"/>' },
  truck: { g1: '#7fb4f5', g2: '#4f46e5', p: '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>' },
  silo: { g1: '#9aa4b8', g2: '#475467', p: '<path d="M22 20V8l-10-5L2 8v12"/><path d="M2 20h20"/><path d="M6 20v-6h12v6"/>' },
  farm: { g1: '#7ee0a0', g2: '#059669', p: '<path d="M3 9l1-5h16l1 5"/><path d="M3 9v11h18V9"/><path d="M9 20v-6h6v6"/>' },
  factory: { g1: '#aab4c6', g2: '#3f4a5c', p: '<path d="M2 21h20"/><path d="M4 21V11l6 4V11l6 4V11l4 3v7"/>' },
  money: { g1: '#9fe8b0', g2: '#15803d', p: '<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/><circle cx="12" cy="15" r="2.5"/>' },
  scan: { g1: '#86a8f5', g2: '#4f46e5', p: '<path d="M3 8V5a2 2 0 0 1 2-2h3"/><path d="M16 3h3a2 2 0 0 1 2 2v3"/><path d="M21 16v3a2 2 0 0 1-2 2h-3"/><path d="M8 21H5a2 2 0 0 1-2-2v-3"/><line x1="7" y1="12" x2="17" y2="12"/>' },
  shield2: { g1: '#c5b8f5', g2: '#6d28d9', p: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>' },
  sorghum: { g1: '#f2b56b', g2: '#c2410c', p: '<path d="M8 22V8c0-3 2-6 4-6s4 3 4 6v14"/><path d="M8 13c-2 0-4-1-4-3s2-3 4-3"/><path d="M16 13c2 0 4-1 4-3s-2-3-4-3"/><path d="M12 15l4 2-1 3-3-2-3 2-1-3z"/>' },
  millet: { g1: '#efe0a8', g2: '#a16207', p: '<path d="M12 3l8 3-8 3-8-3z"/><path d="M12 9l8 3-8 3-8-3z"/><path d="M12 15l8 3-8 3-8-3z"/>' },
  sugarbeans: { g1: '#e8dcc0', g2: '#92400e', p: '<ellipse cx="12" cy="13" rx="8" ry="6"/><path d="M12 7c0 3 0 12 0 12"/>' },
};

const PHOTOS: Record<string, string> = {
  grain: 'maize-grainco2-300x232.jpg',
  seed: 'maize-grainco2-300x232.jpg',
  wheat: 'wheat-grainco-300x232.jpg',
  soya: 'soya-bean-grainco.jpg',
  soyaMeal: 'soya-meal-grainco-300x232.jpg',
  bran: 'Wheat-Bran-grainco.jpg',
  flour: 'Bread-And-Biscuit-Flour-grainco-1-300x232.jpg',
  rice: 'rice-grain-co.jpg',
  samp: 'samp-grainco.jpg',
  popcorn: 'popcorn-grain-co.jpg',
  beans: 'Navy-Beans-grainco.jpg',
  groundnuts: 'groundnuts-grain-co.jpg',
  barley: 'Growing%20and%20Using%20Barley%20at%20Home%20_%20Ready%20Nutrition.jpg',
  heroFarm: 'dash/hero-farm.jpg',
  heroWheat: 'dash/hero-wheat.jpg',
  heroTractor: 'dash/hero-tractor.jpg',
  heroSilo: 'dash/hero-silo.jpg',
  heroTruck: 'dash/hero-truck.jpg',
  heroHauler: 'dash/hero-hauler.jpg',
  heroWarehouse: 'dash/hero-warehouse.jpg',
  heroOffice: 'dash/hero-office.jpg',
};

export type ThumbSize = 'xs' | 'sm' | 'md' | 'lg' | 'wide';

export function photo(key: string, size: ThumbSize = 'md', tag?: string): string {
  const src = PHOTOS[key];
  if (!src) return img(key, size, tag);
  return `<span class="dsh-thumb ${size} photo">${tag ? `<span class="dsh-thumb-tag">${tag}</span>` : ''}<img src="${src}" alt="" loading="lazy" /></span>`;
}

export function img(key: string, size: ThumbSize = 'md', tag?: string): string {
  if (PHOTOS[key]) return photo(key, size, tag);
  if (/^https?:/.test(key)) {
    return `<span class="dsh-thumb ${size} photo">${tag ? `<span class="dsh-thumb-tag">${tag}</span>` : ''}<img src="${key}" alt="" loading="lazy" /></span>`;
  }
  const a = ART[key] || ART.grain;
  return `<span class="dsh-thumb ${size}" style="--tg2:${a.g2}">${tag ? `<span class="dsh-thumb-tag">${tag}</span>` : ''}${svg(a.p, 'dsh-thumb-ico')}</span>`;
}

export function avatar(initials: string, size = 36): string {
  return `<span class="dsh-avatar" style="width:${size}px;height:${size}px;font-size:${Math.round(size * 0.4)}px">${initials}</span>`;
}

/* ---------- Badges / pills ---------- */
export type PillTone = 'green' | 'amber' | 'red' | 'blue' | 'violet' | 'indigo' | 'gray' | 'plain';
export function pill(text: string, tone: PillTone = 'gray'): string {
  return `<span class="dsh-badge ${tone}">${text}</span>`;
}

/* ---------- Buttons ---------- */
export function btn(label: string, variant: string, toastMsg?: string, href?: string, wfKey?: string, wfAction?: string): string {
  const extra = toastMsg ? ` data-toast="${toastMsg.replace(/"/g, '&quot;')}"` : '';
  const wf = wfKey && wfAction ? ` data-wf="${wfKey}" data-wf-a="${wfAction}"` : '';
  const tag = href ? 'a' : 'button';
  const h = href ? ` href="${href}"` : '';
  return `<${tag}${h} class="dsh-btn ${variant}"${extra}${wf}>${label}</${tag}>`;
}

export function iconBtn(path: string, label: string, variant = 'ghost', toastMsg?: string): string {
  return `<button class="dsh-btn ${variant} sm" aria-label="${label}" data-toast="${(toastMsg || label).replace(/"/g, '&quot;')}">${svg(path)}</button>`;
}

/* ---------- Workflow engine ---------- */
export interface WfTransition {
  to?: string;
  tone?: PillTone;
  sel?: string;
  meta?: string;
  foot?: string;
  insert?: string;
  target?: string;
  into?: string;
  done?: string;
  nav?: string;
  toast?: string;
}
export type WfSpec = Record<string, WfTransition>;

const WF: Record<string, WfSpec> = {};
export function wf(key: string, spec: WfSpec): void {
  WF[key] = spec;
}

/* ---------- Durable state (survives page re-render) ---------- */
interface PersistedCard {
  to?: string;
  tone?: PillTone;
  sel?: string;
  meta?: string;
  foot?: string;
  ins?: string;
}
const cardState = new Map<string, PersistedCard>();
const wfDone = new Map<string, string>();

function keyOf(card: HTMLElement, fallback: string): string {
  const k = card.getAttribute('data-key');
  if (k) return k;
  const t = card.querySelector('.dsh-item-title, .dsh-queue-title, .dsh-shop-name')?.textContent?.trim();
  return t || fallback;
}

/* ---------- Real file downloads / uploads ---------- */
const DL: Record<string, { name: string; content: string; type: string }> = {};
export function registerDownload(key: string, name: string, content: string, type = 'text/plain'): void {
  DL[key] = { name, content, type };
}
export function downloadBtn(label: string, variant: string, key: string): string {
  return `<button class="dsh-btn ${variant}" data-download="${key}">${label}</button>`;
}
export function downloadNow(key: string): void {
  const d = DL[key];
  if (!d) return;
  const blob = new Blob([d.content], { type: d.type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = d.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 800);
}
export interface UploadOpts {
  bucket?: 'listing-photos' | 'avatars' | 'documents' | 'weighbridge-tickets';
  on?: string;
  key?: string;
}
export function uploadBtn(label: string, variant: string, accept = '', opts: UploadOpts = {}): string {
  const bucket = opts.bucket ? ` data-upload-bucket="${opts.bucket}"` : '';
  const on = opts.on ? ` data-upload-on="${opts.on}"` : '';
  const key = opts.key ? ` data-upload-key="${opts.key}"` : '';
  return `<button class="dsh-btn ${variant}" data-upload${accept ? ` data-upload-accept="${accept}"` : ''}${bucket}${on}${key}>${label}</button>`;
}

/**
 * URLs/object paths returned by successful uploads, keyed by the button's
 * `data-upload-key`. `takePendingUpload` consumes (and clears) a value so a
 * form submit can attach the uploaded asset exactly once.
 */
export const pendingUploads: Map<string, string> = new Map();
export function takePendingUpload(key: string): string | undefined {
  const v = pendingUploads.get(key);
  pendingUploads.delete(key);
  return v;
}

export async function doUpload(file: File, opts: UploadOpts, btn: HTMLElement): Promise<void> {
  const original = btn.innerHTML;
  const id = getLiveAccount()?.id || '';
  const bucket = opts.bucket || 'listing-photos';
  btn.innerHTML = 'Uploading…';
  btn.classList.add('disabled');
  try {
    if (bucket === 'listing-photos') {
      const url = await uploadListingPhoto(file, id);
      if (opts.key) pendingUploads.set(opts.key, url);
      if (opts.on) JS[opts.on]?.(url, btn);
      toast('Photo uploaded', 'info');
    } else {
      const { path, url } = await uploadToStorage(bucket, file, id || 'general');
      const ref = bucket === 'avatars' ? url : path;
      if (opts.key) pendingUploads.set(opts.key, ref);
      if (opts.on) JS[opts.on]?.(ref, btn);
      toast(bucket === 'weighbridge-tickets' ? 'Weighbridge photo attached' : 'File uploaded', 'info');
    }
  } catch {
    toast('Upload failed — check your connection', 'error');
  } finally {
    btn.innerHTML = original;
    btn.classList.remove('disabled');
  }
}

/* ---------- JS action hooks (real state changes from dashboards) ---------- */
export const JS: Record<string, (payload: string, el: HTMLElement) => void> = {};
/* Async page fragments (live data): pages register a key; render() fills any
   element marked `data-async="<key>"` after the page paints. */
export const asyncFills: Record<string, () => Promise<string>> = {};
export function jsBtn(label: string, variant: string, fn: string, payload = '', toastMsg?: string): string {
  return `<button class="dsh-btn ${variant}" data-js="${fn}${payload ? ':' + payload : ''}"${toastMsg ? ` data-toast="${toastMsg.replace(/"/g, '&quot;')}"` : ''}>${label}</button>`;
}

export function applyPersisted(root: HTMLElement): void {
  root.querySelectorAll<HTMLElement>('.dsh-item, .dsh-queue-card, .dsh-shop-card').forEach((card) => {
    const ck = keyOf(card, '');
    if (!ck) return;
    const st = cardState.get(ck);
    if (!st) return;
    if (st.to) {
      const sel = st.sel || '.dsh-badge';
      const badge = card.querySelector<HTMLElement>(sel);
      if (badge) badge.outerHTML = pill(st.to, st.tone || 'gray');
    }
    if (st.meta !== undefined) {
      const meta = card.querySelector<HTMLElement>('.dsh-item-meta');
      if (meta) meta.innerHTML = st.meta;
    }
    if (st.foot !== undefined) {
      const foot = card.querySelector<HTMLElement>('.dsh-item-foot');
      if (foot) foot.innerHTML = st.foot;
    }
    if (st.ins !== undefined && !card.querySelector('[data-wf-ins]')) {
      card.insertAdjacentHTML('beforeend', `<span data-wf-ins style="display:contents">${st.ins}</span>`);
    }
  });
  root.querySelectorAll<HTMLElement>('[data-wf][data-wf-a]').forEach((b) => {
    const t = wfDone.get(`${b.dataset.wf}:${b.dataset.wfA}`);
    if (t) {
      b.setAttribute('disabled', '');
      b.classList.add('done');
      b.textContent = t;
    }
  });
}

export function applyWf(key: string, action: string, scope: HTMLElement, el: HTMLElement): boolean {
  const tr = WF[key]?.[action];
  if (!tr) return false;
  const card = (tr.target ? scope.querySelector<HTMLElement>(tr.target) : null) || el.closest<HTMLElement>('.dsh-item, .dsh-queue-card, .dsh-shop-card') || null;
  const k = key + ':' + action;
  if (tr.done) {
    const b = el.tagName === 'A' ? el.querySelector<HTMLButtonElement>('button') : (el as HTMLButtonElement);
    if (b) {
      b.disabled = true;
      b.classList.add('done');
      b.textContent = tr.done;
    }
    wfDone.set(k, tr.done);
  }
  if (card) {
    const ck = keyOf(card, k);
    const st: PersistedCard = {};
    if (tr.to !== undefined) st.to = tr.to;
    if (tr.tone !== undefined) st.tone = tr.tone;
    if (tr.sel !== undefined) st.sel = tr.sel;
    if (tr.meta !== undefined) st.meta = tr.meta;
    if (tr.foot !== undefined) st.foot = tr.foot;
    if (tr.insert !== undefined) st.ins = tr.insert;
    if (Object.keys(st).length) {
      const prev = cardState.get(ck) || {};
      cardState.set(ck, { ...prev, ...st });
    }
    if (tr.to) {
      const sel = tr.sel || '.dsh-badge';
      const badge = card.querySelector<HTMLElement>(sel);
      if (badge) badge.outerHTML = pill(tr.to, tr.tone || 'gray');
    }
    if (tr.meta !== undefined) {
      const meta = card.querySelector<HTMLElement>('.dsh-item-meta');
      if (meta) meta.innerHTML = tr.meta;
    }
    if (tr.foot !== undefined) {
      const foot = card.querySelector<HTMLElement>('.dsh-item-foot');
      if (foot) foot.innerHTML = tr.foot;
    }
    if (tr.insert !== undefined) {
      const dest = tr.into ? scope.querySelector<HTMLElement>(tr.into) : card;
      if (dest && !dest.querySelector('[data-wf-ins]')) {
        dest.insertAdjacentHTML('beforeend', `<span data-wf-ins style="display:contents">${tr.insert}</span>`);
      }
    }
  } else if (tr.insert !== undefined) {
    el.insertAdjacentHTML('afterend', tr.insert);
  }
  if (tr.nav) {
    if (window.location.hash === tr.nav) {
      card?.classList.remove('dsh-flash');
      void card?.offsetWidth;
      card?.classList.add('dsh-flash');
    } else {
      window.location.hash = tr.nav;
    }
  }
  toast(tr.toast || `${action} done`);
  return true;
}

/* ---------- Invoice ---------- */
export function invoice(o: { ref: string; amount: string; terms: string; due: string; status?: string; lines: { l: string; v: string }[] }): string {
  return `<div class="dsh-invoice">
    <div class="dsh-invoice-head"><span>Invoice ${o.ref}</span>${pill(o.status || 'Open', o.status === 'Paid' ? 'green' : 'amber')}</div>
    ${o.lines.map((ln) => `<div class="dsh-invoice-line"><span>${ln.l}</span><span>${ln.v}</span></div>`).join('')}
    <div class="dsh-invoice-total"><span>Total</span><span>${o.amount}</span></div>
    <div class="dsh-invoice-foot">Terms: ${o.terms} · Due ${o.due}</div>
  </div>`;
}

/* ---------- Page head ---------- */
export function head(title: string, sub?: string, actions?: string): string {
  return `<div class="dsh-head" style="display:flex;align-items:flex-end;justify-content:space-between;gap:20px;margin-bottom:22px;flex-wrap:wrap">
    <div><h2 style="margin:0;font-size:20px;font-weight:750;letter-spacing:-0.02em">${title}</h2>${sub ? `<p style="margin:5px 0 0;font-size:13px;color:var(--dsh-text-3)">${sub}</p>` : ''}</div>
    ${actions ? `<div style="display:flex;gap:9px;align-items:center;flex-wrap:wrap">${actions}</div>` : ''}
  </div>`;
}

/* ---------- Hero ---------- */
export function hero(o: { kick?: string; title: string; sub: string; actions?: string; media?: string; bg?: string; stats?: { l: string; v: string }[]; status?: { label: string; tone: 'live' | 'ok' | 'warn' } }): string {
  const stats = o.stats
    ? `<div class="dsh-hero-stats">${o.stats.map((s) => `<div class="dsh-hero-stat"><span class="v">${s.v}</span><span class="l">${s.l}</span></div>`).join('')}</div>`
    : '';
  const kick = o.kick || o.status ? `<span class="dsh-hero-kick">${o.kick ? `<span>${o.kick}</span>` : ''}${o.status ? `<span class="dsh-hero-status ${o.status.tone}"><i></i>${o.status.label}</span>` : ''}</span>` : '';
  return `<div class="dsh-hero"${o.bg ? ` style="background-image:url('${o.bg}')"` : ''}>
    <div class="dsh-hero-body">
      ${kick}
      <h2>${o.title}</h2>
      <p>${o.sub}</p>
      ${o.actions ? `<div class="dsh-hero-actions">${o.actions}</div>` : ''}
      ${stats}
    </div>
    ${o.media && !o.bg ? `<div class="dsh-hero-media">${o.media}</div>` : ''}
  </div>`;
}

/* ---------- Section title ---------- */
export function sec(title: string, action?: string, actionToast?: string, count?: number, actionHref?: string): string {
  return `<div class="dsh-sec"><div class="dsh-sec-head">
    <span class="dsh-sec-title">${title}${count !== undefined ? `<span class="dsh-sec-count">${count}</span>` : ''}</span>
    ${action ? `<a href="${actionHref || '#'}" class="dsh-more" data-toast="${(actionToast || action).replace(/"/g, '&quot;')}">${action}${svg(ICON.chevronRight)}</a>` : ''}
  </div></div>`;
}

/* ---------- Panels ---------- */
export function panel(o: { title?: string; sub?: string; icon?: string; link?: string; linkToast?: string; linkHref?: string; body?: string; flush?: boolean; pad?: string }): string {
  const headHtml = o.title
    ? `<div class="dsh-panel-head">
        <div>
          <div class="dsh-panel-title">${o.icon ? svg(o.icon) : ''} ${o.title}</div>
          ${o.sub ? `<div class="dsh-panel-sub">${o.sub}</div>` : ''}
        </div>
        ${o.link ? `<a href="${o.linkHref || '#'}" class="dsh-panel-link" data-toast="${(o.linkToast || o.link).replace(/"/g, '&quot;')}">${o.link}${svg(ICON.chevronRight)}</a>` : ''}
      </div>`
    : '';
  return `<div class="dsh-panel">${headHtml}<div class="dsh-panel-body ${o.flush ? 'flush' : ''}"${o.pad ? ` style="padding:${o.pad}"` : ''}>${o.body || ''}</div></div>`;
}

/* ---------- Layout ---------- */
export function split(mainHtml: string, railHtml: string): string {
  return `<div class="dsh-split"><div class="dsh-maincol">${mainHtml}</div><div class="dsh-rail">${railHtml}</div></div>`;
}

/* ---------- KPI row ---------- */
export function kpis(stats: { label: string; value: string | number; icon?: string; delta?: string; up?: boolean; spark?: number[]; foot?: string; open?: string }[]): string {
  return `<div class="dsh-kpis">${stats
    .map((s) => {
      const isNum = typeof s.value === 'number';
      const delta = s.delta
        ? `<span class="dsh-kpi-delta ${s.up === undefined ? 'flat' : s.up ? 'up' : 'down'}">${svg(s.up === false ? ICON.trendingDown : ICON.trendingUp)} ${s.delta}</span>`
        : '';
      return `<div class="dsh-kpi"${s.open ? ` data-open="${s.open}"` : ''}>
        <div class="dsh-kpi-top">
          <span class="dsh-kpi-label">${s.label}</span>
          ${s.icon ? `<span class="dsh-kpi-chip">${svg(s.icon)}</span>` : ''}
        </div>
        <div class="dsh-kpi-value" ${isNum ? `data-count="${s.value}"` : ''}>${isNum ? '' : s.value}</div>
        ${delta}
        ${s.foot ? `<div class="dsh-kpi-foot">${s.foot}</div>` : ''}
        ${s.spark ? `<span class="dsh-spark">${sparkline(s.spark)}</span>` : ''}
      </div>`;
    })
    .join('')}</div>`;
}

export function sparkline(data: number[]): string {
  const w = 74, h = 26, n = data.length;
  const max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((d, i) => `${(i / (n - 1)) * w},${h - 3 - ((d - min) / (max - min || 1)) * (h - 6)}`);
  const area = `0,${h} ${pts.join(' ')} ${w},${h}`;
  return `<svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><polygon points="${area}" fill="rgba(var(--ac-rgb),.1)"/><polyline points="${pts.join(' ')}" fill="none" stroke="var(--ac)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
}

/* ---------- Action bar ---------- */
export function actions(items: { label: string; icon?: string; badge?: number; toast: string; href?: string; wf?: string; action?: string }[]): string {
  return `<div class="dsh-actions">${items
    .map((i) => {
      const attrs =
        i.wf && i.action
          ? ` data-wf="${i.wf}" data-wf-a="${i.action}" data-toast="${i.toast.replace(/"/g, '&quot;')}"`
          : i.href
            ? ` href="${i.href}" data-toast="${i.toast.replace(/"/g, '&quot;')}"`
            : ` data-toast="${i.toast.replace(/"/g, '&quot;')}"`;
      const tag = i.href && !i.wf ? 'a' : 'button';
      return `<${tag} class="dsh-action"${attrs}>
        ${i.icon ? svg(i.icon) : ''}<span>${i.label}</span>
        ${i.badge ? `<span class="cnt">${i.badge}</span>` : ''}
      </${tag}>`;
    })
    .join('')}</div>`;
}

/* ---------- Tabs / chips ---------- */
export function tabs(items: { label: string; badge?: number; active?: boolean }[], group = ''): string {
  return `<div class="dsh-tabs"${group ? ` data-tab-group="${group}"` : ''}>${items
    .map((t) => `<button class="dsh-tab ${t.active ? 'active' : ''}" data-tab="${t.label}">${t.label}${t.badge ? `<span class="dsh-tab-badge">${t.badge}</span>` : ''}</button>`)
    .join('')}</div>`;
}

export function chips(items: (string | { label: string; value?: string })[], activeIdx = 0, group = ''): string {
  return `<div class="dsh-chips"${group ? ` data-filter-group="${group}"` : ''}>${items
    .map((c, i) => {
      const label = typeof c === 'string' ? c : c.label;
      const value = typeof c === 'string' ? c : c.value || c.label;
      return `<button class="dsh-chip ${i === activeIdx ? 'active' : ''}" data-filter-value="${value}" data-toast="Filter: ${label}">${label}</button>`;
    })
    .join('')}</div>`;
}

/* ---------- Alerts ---------- */
export function banner(tone: 'info' | 'warn' | 'ok' | 'danger', text: string, action?: string, actionToast?: string, actionHref?: string): string {
  return `<div class="dsh-alert ${tone}">${svg(ICON.alert)}<span>${text}${action ? (actionHref ? `<a class="dsh-alert-link" href="${actionHref}" data-toast="${(actionToast || action).replace(/"/g, '&quot;')}">${action}</a>` : btn(action, 'ghost sm', actionToast || action)) : ''}</span></div>`;
}

/* ---------- States: empty / error / success / loading ---------- */
function artTile(key: string, icon?: string): string {
  const a = ART[key] || ART.grain;
  return `<span class="dsh-art" style="--tg2:${a.g2}">
    <span class="dsh-art-ico">${svg(icon || ICON.spark)}</span>
  </span>`;
}

export function emptyState(o: { icon?: string; title: string; sub: string; action?: string; actionToast?: string; actionHref?: string; hint?: string; art?: string; kick?: string }): string {
  const tile = o.art ? artTile(o.art, o.icon) : `<span class="dsh-state-ico">${svg(o.icon || ICON.search)}</span>`;
  return `<div class="dsh-state dsh-empty${o.art ? ' art' : ''}">
    ${tile}
    ${o.kick ? `<div class="dsh-state-kick">${o.kick}</div>` : ''}
    <div class="dsh-state-title">${o.title}</div>
    <div class="dsh-state-sub">${o.sub}</div>
    ${o.action ? `<div class="dsh-state-act">${btn(o.action, 'primary', o.actionToast || o.action, o.actionHref || undefined)}</div>` : ''}
    ${o.hint ? `<div class="dsh-state-hint">${o.hint}</div>` : ''}
  </div>`;
}

export function errorState(o: { title?: string; message: string; retry?: boolean; action?: string; actionToast?: string; actionHref?: string }): string {
  return `<div class="dsh-state dsh-error-state" role="alert">
    <span class="dsh-state-ico">${svg(ICON.alert)}</span>
    <div class="dsh-state-title">${o.title || 'Something went wrong'}</div>
    <div class="dsh-state-sub">${o.message}</div>
    <div class="dsh-state-act">
      ${o.retry ? `<button type="button" class="dsh-btn ghost" data-retry>${svg(ICON.refresh)}<span>Try again</span></button>` : ''}
      ${o.action ? btn(o.action, 'primary', o.actionToast || o.action, o.actionHref || undefined) : ''}
    </div>
  </div>`;
}

export function successState(o: { title: string; message: string; action?: string; actionToast?: string; actionHref?: string }): string {
  return `<div class="dsh-state dsh-success-state" role="status">
    <span class="dsh-state-ico">${svg(ICON.check)}</span>
    <div class="dsh-state-title">${o.title}</div>
    <div class="dsh-state-sub">${o.message}</div>
    ${o.action ? `<div class="dsh-state-act">${btn(o.action, 'primary', o.actionToast || o.action, o.actionHref || undefined)}</div>` : ''}
  </div>`;
}

export function spinner(label?: string): string {
  return `<span class="dsh-spinner" role="status" aria-live="polite">${label ? `<span class="dsh-spinner-label">${label}</span>` : ''}<span class="dsh-spinner-ring"></span></span>`;
}

export function skeleton(kind: 'card' | 'row' | 'table' = 'card', count = 3): string {
  let html = '';
  if (kind === 'row') {
    for (let i = 0; i < count; i++) html += `<div class="dsh-sk-row"><span class="dsh-sk sk-ico"></span><div><span class="dsh-sk sk-line" style="width:55%"></span><span class="dsh-sk sk-line" style="width:35%"></span></div><span class="dsh-sk sk-chip"></span></div>`;
  } else if (kind === 'table') {
    for (let i = 0; i < count; i++) html += `<div class="dsh-sk-row"><span class="dsh-sk sk-line" style="width:30%"></span><span class="dsh-sk sk-line" style="width:55%"></span><span class="dsh-sk sk-chip"></span></div>`;
  } else {
    for (let i = 0; i < count; i++) html += `<div class="dsh-sk-card"><span class="dsh-sk sk-line" style="width:40%"></span><span class="dsh-sk sk-line" style="width:70%"></span><span class="dsh-sk sk-line" style="width:92%"></span></div>`;
  }
  return `<div class="dsh-skeleton" role="status" aria-label="Loading">${html}</div>`;
}

/* ---------- Progressive disclosure ---------- */
export function disclose(o: { title: string; summary?: string; body: string; open?: boolean }): string {
  return `<div class="dsh-disclose${o.open ? ' open' : ''}">
    <button type="button" class="dsh-disclose-head" data-disclose aria-expanded="${o.open ? 'true' : 'false'}">
      ${svg(ICON.chevronRight)}
      <span class="dsh-disclose-title">${o.title}</span>
      ${o.summary ? `<span class="dsh-disclose-sum">${o.summary}</span>` : ''}
    </button>
    <div class="dsh-disclose-body">${o.body}</div>
  </div>`;
}

/* ---------- Form fields (validation, counters, passwords) ---------- */
export function countBadge(key: string, max: number): string {
  return `<span class="dsh-count" data-count-for="${key}">0/${max}</span>`;
}

export function pwCheck(): string {
  return `<div class="dsh-pw-check" data-pw-check>
    <span data-pw="len">${svg(ICON.check)} 8+ characters</span>
    <span data-pw="num">${svg(ICON.check)} A number</span>
    <span data-pw="up">${svg(ICON.check)} An uppercase letter</span>
    <span data-pw="sym">${svg(ICON.check)} A symbol</span>
  </div>`;
}

/* ---------- Tables ---------- */
export function table(headers: string[], rows: string[][], numericCols: number[] = [], rowOpen: string[] = [], rowFilter: string[] = [], filterGroup = ''): string {
  return `<div class="dsh-table-wrap"><table class="dsh-table"><thead><tr>${headers
    .map((h, i) => `<th${numericCols.includes(i) ? ' class="num"' : ''}>${h}</th>`)
    .join('')}</tr></thead><tbody>${rows
    .map((r, ri) => `<tr${rowOpen[ri] ? ` data-row-open="${rowOpen[ri]}"` : ''}${rowFilter[ri] && filterGroup ? ` data-filter-group="${filterGroup}" data-filter-value="${rowFilter[ri]}"` : ''}>${r.map((c, i) => `<td${numericCols.includes(i) ? ' class="num"' : ''}>${c}</td>`).join('')}</tr>`)
    .join('')}</tbody></table></div>`;
}

/* ---------- List rows ---------- */
export function listRow(icon: string, title: string, sub: string, end?: string, endTone: 'pos' | 'neg' | 'plain' = 'plain', accent = false, href?: string): string {
  const inner = `<span class="dsh-list-ico ${accent ? 'accent' : ''}">${svg(icon)}</span>
    <div class="dsh-list-body"><div class="dsh-list-title">${title}</div><div class="dsh-list-sub">${sub}</div></div>
    ${end ? `<div class="dsh-list-end"><div class="dsh-list-amount ${endTone}">${end}</div></div>` : ''}`;
  if (href) return `<a class="dsh-list-item" href="${href}" data-toast="Opening: ${title}">${inner}</a>`;
  return `<div class="dsh-list-item">${inner}</div>`;
}

/* ---------- Timeline ---------- */
export function timeline(items: { title: string; sub: string; tag?: string }[]): string {
  return `<div class="dsh-timeline">${items
    .map((i) => `<div class="dsh-tl-item"><div class="dsh-tl-title">${i.title}</div><div class="dsh-tl-sub">${i.sub}</div>${i.tag ? `<div class="dsh-tl-tag">${i.tag}</div>` : ''}</div>`)
    .join('')}</div>`;
}

/* ---------- Feed ---------- */
export function feed(items: { icon: string; tone: 'default' | 'danger' | 'warn' | 'ok' | 'accent'; time: string; title: string; desc: string; actions?: string; open?: string }[]): string {
  return `<div class="dsh-feed">${items
    .map(
      (i) => `<div class="dsh-feed-item"${i.open ? ` data-open="${i.open}"` : ''}>
        <span class="dsh-feed-ico ${i.tone !== 'default' ? i.tone : ''}">${svg(i.icon)}</span>
        <div class="dsh-feed-body">
          <div class="dsh-feed-top"><div class="dsh-feed-title">${i.title}</div><div class="dsh-feed-time">${i.time}</div></div>
          <div class="dsh-feed-desc">${i.desc}</div>
          ${i.actions ? `<div class="dsh-feed-actions">${i.actions}</div>` : ''}
        </div>
      </div>`
    )
    .join('')}</div>`;
}

/* ---------- Ledger ---------- */
export function ledger(items: { label: string; value: string }[]): string {
  return `<div class="dsh-ledger">${items
    .map((i) => `<div class="dsh-ledger-item"><div class="dsh-ledger-label">${i.label}</div><div class="dsh-ledger-value">${i.value}</div></div>`)
    .join('')}</div>`;
}

/* ---------- Bars ---------- */
export function bars(items: { label: string; pct: number; alt?: boolean }[]): string {
  return `<div class="dsh-bars">${items
    .map((b) => `<div class="dsh-bar"><span class="dsh-bar-name">${b.label}</span><span class="dsh-bar-track"><span class="dsh-bar-fill ${b.alt ? 'alt' : ''}" style="width:${b.pct}%"></span></span><span class="dsh-bar-value">${b.pct}%</span></div>`)
    .join('')}</div>`;
}

/* ---------- Progress ---------- */
export function steps(current: number, total: number, label?: string): string {
  let html = '<div class="dsh-steps">';
  for (let i = 1; i <= total; i++) html += `<span class="dsh-step ${i < current ? 'do' : i === current ? 'on' : ''}"></span>`;
  html += '</div>';
  if (label) html += `<div class="dsh-steps-label"><span>${label}</span><span>${current}/${total}</span></div>`;
  return html;
}

/* ---------- In-table progress cell ---------- */
export function miniBar(pct: number, tone: 'ok' | 'warn' | 'danger' | 'accent' = 'accent'): string {
  const p = Math.max(0, Math.min(100, pct));
  return `<span class="dsh-mbar" title="${Math.round(p)}%"><i class="${tone}" style="width:${p}%"></i></span>`;
}

export function ring(pct: number, label?: string, size = 72): string {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  return `<div class="dsh-ring" style="width:${size}px;height:${size}px">
    <svg width="${size}" height="${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--dsh-surface-3)" stroke-width="6"/>
      <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="var(--ac)" stroke-width="6" stroke-linecap="round"
        stroke-dasharray="${c}" stroke-dashoffset="${off}" style="transition:stroke-dashoffset 1s var(--dsh-ease)"/>
    </svg>
    <span class="dsh-ring-val">${label !== undefined ? label : pct + '%'}</span>
  </div>`;
}

/* ---------- Route map ---------- */
export function routeMap(a: string, b: string, start: { x: number; y: number }, end: { x: number; y: number }, pct = 45): string {
  return `<div class="dsh-route">
    <span class="dsh-route-pin" style="left:${start.x}%;top:${start.y}%"></span>
    <span class="dsh-route-line" style="left:${start.x}%;top:${start.y}%;width:${pct}%;transform:rotate(${Math.atan2(end.y - start.y, end.x - start.x)}rad);--w:${pct}%"></span>
    <span class="dsh-route-pin end" style="left:${end.x}%;top:${end.y}%"></span>
    <span class="dsh-route-label">${a} → ${b}</span>
  </div>`;
}

/* ---------- Fields ---------- */
export function field(label: string, control: string, hint?: string): string {
  return `<div class="dsh-field"><label class="dsh-label">${label}</label>${control}${hint ? `<span class="dsh-hint">${hint}</span>` : ''}</div>`;
}

export function input(value?: string, placeholder?: string, o: { val?: string; counter?: string; max?: number; type?: string; step?: string; min?: string } = {}): string {
  const extra =
    (o.type ? ` type="${o.type}"` : '') +
    (o.step ? ` step="${o.step}"` : '') +
    (o.min ? ` min="${o.min}"` : '') +
    (o.val ? ` data-val="${o.val}"` : '') +
    (o.counter ? ` data-counter="${o.counter}" maxlength="${o.max ?? 160}"` : '');
  return `<input class="dsh-input"${extra} value="${(value ?? '').replace(/"/g, '&quot;')}" placeholder="${placeholder || ''}" />`;
}
export function select(options: string[], sel = 0, o: { val?: string; ph?: boolean } = {}): string {
  const val = o.val ? ` data-val="${o.val}"` : '';
  const ph = o.ph ? `<option value="" ${sel === -1 ? 'selected' : ''} disabled hidden>Choose…</option>` : '';
  return `<select class="dsh-select"${val}>${ph}${options.map((x, i) => `<option value="${x}"${i === sel ? ' selected' : ''}>${x}</option>`).join('')}</select>`;
}
export function textarea(rows = 3, placeholder?: string, o: { counter?: string; max?: number; val?: string } = {}): string {
  const counter = o.counter ? ` data-counter="${o.counter}" maxlength="${o.max ?? 160}"` : '';
  const val = o.val ? ` data-val="${o.val}"` : '';
  return `<textarea class="dsh-textarea" rows="${rows}"${counter}${val} placeholder="${placeholder || ''}"></textarea>`;
}

/* ---------- Weighbridge stations ---------- */
export interface WeighbridgeStation {
  id: string;
  town: string;
  station: string;
  distanceKm: number;
  lanes: number;
  hours: string;
}

/* Certified ZVIDA weighbridges a farmer/offtaker can nominate on a listing.
   Distances are road estimates from central Harare. */
export const WEIGHBRIDGES: WeighbridgeStation[] = [
  { id: 'harare', town: 'Harare', station: 'GMB Grain Silo', distanceKm: 5, lanes: 3, hours: '24/7' },
  { id: 'ruwa', town: 'Ruwa', station: 'Ruwa Depot', distanceKm: 24, lanes: 2, hours: '06:00–18:00' },
  { id: 'marondera', town: 'Marondera', station: 'Marondera Grain Depot', distanceKm: 72, lanes: 2, hours: '07:00–18:00' },
  { id: 'concession', town: 'Concession', station: 'Concession Depot', distanceKm: 70, lanes: 2, hours: '06:00–20:00' },
  { id: 'glendale', town: 'Glendale', station: 'Glendale Scale', distanceKm: 57, lanes: 2, hours: '06:00–18:00' },
  { id: 'bindura', town: 'Bindura', station: 'Bindura Depot', distanceKm: 88, lanes: 2, hours: '07:00–17:00' },
];

export function weighbridgeByTown(town: string): WeighbridgeStation | undefined {
  return WEIGHBRIDGES.find((w) => w.town.toLowerCase() === (town || '').toLowerCase());
}

/** The certified weighbridge closest to central Harare (lowest distanceKm). */
export function nearestWeighbridge(): WeighbridgeStation {
  return WEIGHBRIDGES.reduce((a, b) => (b.distanceKm < a.distanceKm ? b : a));
}

/** Weighing methods supported across a load: weighbridge, platform scale, or bucket count. */
export type WeightMode = 'weighbridge' | 'scale' | 'buckets';

export function weightModeLabel(m: WeightMode, bucketKg?: number): string {
  if (m === 'weighbridge') return 'Weighbridge';
  if (m === 'buckets') return 'Buckets · ' + (bucketKg || 20) + ' kg capacity';
  return 'Platform scale · ' + (bucketKg || 20) + ' kg bucket';
}

/** A delivery-point select populated with nearby certified weighbridges.
    Option values are the town names (Harare, Ruwa, Marondera, Concession,
    Glendale, Bindura). */
export function weighbridgeSelect(val: string, o: { ph?: boolean; sel?: string; near?: boolean } = {}): string {
  const auto = o.near && !o.sel ? nearestWeighbridge().town : o.sel;
  const ph = o.ph ? `<option value="" disabled hidden ${auto ? '' : 'selected'}>Choose your nearest weighbridge…</option>` : '';
  const opts = WEIGHBRIDGES.map((w) => {
    const sel = w.town === auto ? ' selected' : '';
    return `<option value="${w.town}"${sel}>${w.station} · ${w.town} — ${w.distanceKm} km</option>`;
  }).join('');
  return `<select class="dsh-select" data-val="${val}">${ph}${opts}</select>`;
}

/** Three-way weighing-method selector (Weighbridge / Platform scale / Buckets).
    Choosing Weighbridge reveals the nearest-weighbridge picker (auto-selected);
    Scale and Buckets show their capture rules instead. */
export function weighMethodField(val: string, o: { near?: boolean; wbNote?: boolean } = {}): string {
  const near = nearestWeighbridge();
  const wbVal = val + 'Wb';
  return `<div data-wm>
    <div class="dsh-radio-row">
      <label class="dsh-radio"><input type="radio" name="${val}" data-wm-mode value="weighbridge" checked /> Weighbridge</label>
      <label class="dsh-radio"><input type="radio" name="${val}" data-wm-mode value="scale" /> Platform scale</label>
      <label class="dsh-radio"><input type="radio" name="${val}" data-wm-mode value="buckets" /> Buckets</label>
    </div>
    <div class="dsh-wm-panel" data-wm-panel="weighbridge">
      ${weighbridgeSelect(wbVal, { ph: true, near: o.near ?? true })}
      ${o.wbNote !== false ? `<span class="dsh-hint" data-wb-note="${wbVal}">Closest: ${near.station}, ${near.town} (${near.distanceKm} km) — auto-selected. Other stations: ${WEIGHBRIDGES.map((w) => w.town).join(' · ')}.</span>` : ''}
    </div>
    <div class="dsh-wm-panel" data-wm-panel="scale" style="display:none">
      <span class="dsh-hint">Direct scale reading of the full load at loading — the driver enters the total kg on the load card. No first weight.</span>
    </div>
    <div class="dsh-wm-panel" data-wm-panel="buckets" style="display:none">
      <span class="dsh-hint">Bucket count × bucket capacity (kg) = net weight. Skips the first weigh — you count buckets at the farm instead.</span>
    </div>
  </div>`;
}

/* ---------- Chat ---------- */
export function chat(thread: { name: string; preview: string; time: string }, messages: { sent: boolean; text: string; time?: string }[], quick?: string[]): string {
  const convs = quick
    ? `<div class="dsh-chat-quick">${quick.map((q) => `<button class="dsh-chip" data-toast="Sending: ${q}">${q}</button>`).join('')}</div>`
    : '';
  return `<div class="dsh-msg">
    <div class="dsh-conv">
      <div class="dsh-conv-head">Messages</div>
      <div class="dsh-conv-item active"><span class="dsh-avatar" style="width:34px;height:34px;font-size:13px">${thread.name.charAt(0)}</span>
        <div class="dsh-conv-body"><div class="dsh-conv-name">${thread.name}</div><div class="dsh-conv-preview">${thread.preview}</div></div>
        <div class="dsh-conv-time">${thread.time}</div>
      </div>
    </div>
    <div class="dsh-chat">
      <div class="dsh-chat-head">${svg(ICON.messages)} ${thread.name}</div>
      <div class="dsh-chat-body">${messages
        .map((m) => `<div class="dsh-bubble ${m.sent ? 'sent' : 'recv'}">${m.text}${m.time ? `<span class="t">${m.time}</span>` : ''}</div>`)
        .join('')}</div>
      ${convs}
      <div class="dsh-chat-input">
        <input class="dsh-input" placeholder="Type a message…" />
        <button class="dsh-chat-send" data-toast="Message sent" aria-label="Send">${svg(ICON.send)}</button>
      </div>
    </div>
  </div>`;
}

/* ---------- Docs ---------- */
export function docs(items: { name: string; meta: string; icon?: string; dl?: string }[]): string {
  return `<div class="dsh-panel flush"><div class="dsh-panel-body" style="padding: 6px 20px 10px">${items
    .map((d) => `<div class="dsh-doc"><span class="dsh-doc-ico">${svg(d.icon || ICON.file)}</span><div><div class="dsh-doc-name">${d.name}</div><div class="dsh-doc-meta">${d.meta}</div></div>${d.dl ? `<button class="dsh-doc-end" data-download="${d.dl}">${svg(ICON.download)} Download</button>` : `<span class="dsh-doc-end">${svg(ICON.download)} Download</span>`}</div>`)
    .join('')}</div></div>`;
}

/* ---------- Profile ---------- */
export function profile(items: { k: string; v: string }[]): string {
  return `<div class="dsh-profile">${items.map((i) => `<div><span class="k">${i.k}</span><span class="v">${i.v}</span></div>`).join('')}</div>`;
}

/* ---------- Account header (professional settings-page hero) ---------- */
export function accountHeader(o: {
  initials: string;
  name: string;
  role: string;
  email: string;
  meta: string;
  verified?: boolean;
  live?: boolean;
  stats?: { label: string; value: string }[];
}): string {
  const ver = o.verified ? pill('Verified', 'green') : pill('Pending verification', 'amber');
  const mode = o.live ? pill('LIVE', 'blue') : pill('DEMO', 'gray');
  const stats = o.stats?.length
    ? `<div style="display:flex;gap:28px;flex-wrap:wrap;margin-top:18px;padding-top:14px;border-top:1px solid var(--dsh-border)">
        ${o.stats.map((s) => `<div style="min-width:92px"><div style="font-size:17px;font-weight:750;letter-spacing:-0.01em">${s.value}</div><div style="font-size:11px;color:var(--dsh-text-3);text-transform:uppercase;letter-spacing:.05em;margin-top:2px">${s.label}</div></div>`).join('')}
      </div>`
    : '';
  return `<div class="dsh-panel"><div class="dsh-panel-body" style="padding:22px 24px">
    <div style="display:flex;align-items:center;gap:18px;flex-wrap:wrap">
      <span class="dsh-avatar" style="width:64px;height:64px;font-size:24px;background:linear-gradient(135deg,var(--ac),var(--ac-deep));color:#fff">${o.initials}</span>
      <div style="flex:1;min-width:200px">
        <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
          <span style="font-size:17px;font-weight:750;letter-spacing:-0.01em">${o.name}</span>
          ${ver}${mode}
        </div>
        <div style="font-size:13px;color:var(--dsh-text-2);margin-top:3px">${o.role}</div>
        <div style="font-size:12.5px;color:var(--dsh-text-3);margin-top:2px">${o.email} · ${o.meta}</div>
      </div>
    </div>
    ${stats}
  </div></div>`;
}

/* ---------- Preferences (language / currency / alert toggles) ---------- */
export function prefsPanel(o: {
  p: string;
  submit: string;
  lang?: string;
  cur?: string;
  email?: boolean;
  sms?: boolean;
}): string {
  const langOpts = ['English', 'Shona', 'Ndebele'];
  const curOpts = ['USD ($)', 'ZiG (ZWL)', 'ZAR (R)'];
  const langSel = select(langOpts, Math.max(0, langOpts.indexOf(o.lang || 'English')), { val: o.p + 'Lang' });
  const curSel = select(curOpts, Math.max(0, curOpts.indexOf(o.cur || 'USD ($)')), { val: o.p + 'Cur' });
  const radio = (name: string, on: boolean) =>
    `<div class="dsh-radio-row">
      <label class="dsh-radio"><input type="radio" name="${name}" data-val="${name}" value="on"${on ? ' checked' : ''} /> On</label>
      <label class="dsh-radio"><input type="radio" name="${name}" data-val="${name}" value="off"${on ? '' : ' checked'} /> Off</label>
    </div>`;
  return `${sec('Preferences')}
  ${panel({
    title: 'Language, currency & alerts',
    body: `
      <div data-form>
      <div class="dsh-field-grid">
        ${field('Language', langSel)}
        ${field('Display currency', curSel)}
      </div>
      <div class="dsh-field-grid">
        ${field('Email notifications', radio(o.p + 'NEmail', o.email !== false))}
        ${field('SMS alerts', radio(o.p + 'NSms', o.sms !== false))}
      </div>
      <div class="dsh-btn-row">${submitBtn('Save Preferences', 'primary', o.submit)}</div>
      </div>`,
  })}`;
}

/* ---------- Item card ---------- */
export function itemCard(o: { title: string; badge?: string; badgeTone?: PillTone; time?: string; meta?: string; foot?: string; lead?: string; thumb?: string; cls?: string; open?: string; key?: string; tab?: string; group?: string }): string {
  const thumb = o.thumb ? `<span style="display:inline-flex;align-items:center;margin-right:10px">${photo(o.thumb, 'xs')}</span>` : '';
  return `<div class="dsh-item ${o.cls || ''}"${o.open ? ` data-open="${o.open}"` : ''}${o.key ? ` data-key="${o.key}"` : ''}${o.group ? ` data-tab-group="${o.group}"` : ''}${o.tab ? ` data-tab="${o.tab}"` : ''}>
    <div class="dsh-item-top">
      <span class="dsh-item-title">${thumb}<span>${o.title}</span></span>
      ${o.badge ? pill(o.badge, o.badgeTone || 'gray') : ''}
    </div>
    ${o.time ? `<div class="dsh-item-time">${o.time}</div>` : ''}
    ${o.meta ? `<div class="dsh-item-meta">${o.meta}</div>` : ''}
    ${o.foot ? `<div class="dsh-item-foot">${o.foot}</div>` : ''}
  </div>`;
}

/* ---------- Marketplace (shared, persists in localStorage) ---------- */
export interface MarketProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
  seller: string;
  stock: number;
  rating: number;
  reviews: number;
  thumb: string;
}

export interface MarketOrder {
  id: string;
  ref: string;
  buyer: string;
  userId?: string;
  address: string;
  delivery: string;
  payment: string;
  placedAt: string;
  items: { id: string; name: string; price: number; qty: number; thumb: string; seller: string; unit: string }[];
  status: string;
  tone: PillTone;
  flow: string[];
  step: number;
  total: number;
  history: { t: string; d: string }[];
}

const MK_KEY = 'zvida_market_v2';
const MK_FLOW = ['Placed', 'Confirmed', 'Processing', 'Shipped', 'Out for delivery', 'Delivered'];

function mkWrap(status: string): { status: string; tone: PillTone } {
  switch (status) {
    case 'NEW': return { status, tone: 'amber' };
    case 'CONFIRMED': return { status, tone: 'green' };
    case 'PROCESSING': return { status, tone: 'blue' };
    case 'SHIPPED': return { status, tone: 'indigo' };
    case 'OUT_FOR_DELIVERY': return { status: 'OUT FOR DELIVERY', tone: 'blue' };
    case 'DELIVERED': return { status, tone: 'green' };
    case 'PAID': return { status, tone: 'green' };
    case 'CANCELLED': return { status, tone: 'red' };
    case 'ESCALATED': return { status, tone: 'red' };
    default: return { status, tone: 'gray' };
  }
}

/* ZVIDA's own marketplace catalog — the full range of grains and inputs ZVIDA
   always carries. This is the guaranteed floor for every account (including a
   brand-new real account), so the marketplace is never empty. Real accounts
   merge their own and other users' listings on top via mergeCatalog(). */
function zvidaGoods(): MarketProduct[] {
  return [
    { id: 'g-maize', name: 'Maize', category: 'Grain', price: 230, unit: 'ton', seller: 'ZVIDA', stock: 60, rating: 4.6, reviews: 141, thumb: 'grain' },
    { id: 'g-soya', name: 'Soya', category: 'Grain', price: 580, unit: 'ton', seller: 'ZVIDA', stock: 45, rating: 4.7, reviews: 118, thumb: 'soya' },
    { id: 'g-wheat', name: 'Wheat', category: 'Grain', price: 360, unit: 'ton', seller: 'ZVIDA', stock: 30, rating: 4.5, reviews: 97, thumb: 'wheat' },
    { id: 'g-sorghum', name: 'Sorghum', category: 'Grain', price: 290, unit: 'ton', seller: 'ZVIDA', stock: 40, rating: 4.4, reviews: 82, thumb: 'sorghum' },
    { id: 'g-sugarbeans', name: 'Sugar Beans', category: 'Grain', price: 420, unit: 'ton', seller: 'ZVIDA', stock: 25, rating: 4.8, reviews: 74, thumb: 'sugarbeans' },
    { id: 'g-millet', name: 'Millet', category: 'Grain', price: 380, unit: 'ton', seller: 'ZVIDA', stock: 20, rating: 4.3, reviews: 56, thumb: 'millet' },
    { id: 'fert', name: 'NPK Fertilizer 10-26-26', category: 'Fertilizer', price: 45, unit: '50kg bag', seller: 'Vendor Supplies Ltd', stock: 20, rating: 4.5, reviews: 128, thumb: 'fert' },
    { id: 'seed', name: 'SC403 Maize Seed', category: 'Seeds', price: 18, unit: 'kg', seller: 'Vendor Supplies Ltd', stock: 48, rating: 4.7, reviews: 96, thumb: 'seed' },
    { id: 'chem', name: 'Roundup Herbicide', category: 'Chemicals', price: 15, unit: '1L', seller: 'Vendor Supplies Ltd', stock: 12, rating: 4.2, reviews: 61, thumb: 'chem' },
    { id: 'feed', name: 'Poultry Mash Feed', category: 'Stockfeed', price: 12, unit: '50kg bag', seller: 'FeedRight', stock: 60, rating: 4.4, reviews: 204, thumb: 'feed' },
    { id: 'chicks', name: 'Day-old Chicks (Cobb)', category: 'Livestock', price: 1.5, unit: 'unit', seller: 'ChickCorp', stock: 0, rating: 4.0, reviews: 42, thumb: 'chicks' },
    { id: 'tractor', name: 'Tractor Rental (Case IH)', category: 'Equipment', price: 50, unit: 'day', seller: 'Harness Rentals', stock: 5, rating: 4.8, reviews: 33, thumb: 'tractor' },
    { id: 'grain', name: 'Maize Grain (Stockfeed)', category: 'Stockfeed', price: 150, unit: 'ton', seller: 'Miller Corp', stock: 40, rating: 4.3, reviews: 88, thumb: 'grain' },
    { id: 'wheat', name: 'Wheat Bran (Stockfeed)', category: 'Stockfeed', price: 180, unit: 'ton', seller: 'Miller Corp', stock: 25, rating: 4.6, reviews: 57, thumb: 'wheat' },
  ];
}

/* Live/user listings take precedence; the ZVIDA baseline fills any gap so the
   marketplace always carries the full range. De-duplicated by name + seller. */
function mergeCatalog(primary: MarketProduct[], base: MarketProduct[]): MarketProduct[] {
  const seen = new Set<string>();
  const out: MarketProduct[] = [];
  const key = (p: MarketProduct) => `${p.name}|${p.seller}`.toLowerCase();
  for (const p of [...primary, ...base]) {
    const k = key(p);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(p);
  }
  return out;
}

function mkSeed(): { cat: MarketProduct[]; cart: Record<string, number>; orders: MarketOrder[]; seq: number; rfqs: LiveRfq[] } {
  const cat: MarketProduct[] = zvidaGoods();
  const o = (
    ref: string, buyer: string, address: string, delivery: string, payment: string, placedAt: string,
    items: MarketOrder['items'], step: number, status?: string
  ): MarketOrder => ({
    id: 'mk' + ref.replace(/\D/g, ''),
    ref,
    buyer,
    address,
    delivery,
    payment,
    placedAt,
    items,
    status: status ?? (step === 0 ? 'NEW' : (['CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'][step - 1] ?? 'DELIVERED')),
    tone: 'blue',
    flow: [...MK_FLOW],
    step,
    total: items.reduce((s, i) => s + i.price * i.qty, 0),
    history: MK_FLOW.slice(0, step + 1).map((s, i) => ({ t: s, d: i === 0 ? placedAt : `${placedAt} · pipeline` })),
  });
  return {
    cat,
    cart: { fert: 2, seed: 1 },
    seq: 2221,
    rfqs: [],
    orders: [
      o('#C-2212', 'James (Farmer)', 'Farm 42, Ruwa', 'Standard', 'ZVIDA Wallet', 'Jul 31, 2026 · 08:12', [{ id: 'fert', name: 'NPK Fertilizer 10-26-26', price: 45, qty: 4, thumb: 'fert', seller: 'Vendor Supplies Ltd', unit: '50kg bag' }], 0),
      o('#C-2211', 'James (Farmer)', 'Farm 42, Ruwa', 'Standard', 'ZVIDA Wallet', 'Jul 30, 2026 · 16:40', [{ id: 'seed', name: 'SC403 Maize Seed', price: 18, qty: 10, thumb: 'seed', seller: 'Vendor Supplies Ltd', unit: 'kg' }], 2),
      o('#C-2210', 'Peter (Farmer)', 'Farm 12, Marondera', 'Express', 'Input Loan Credit', 'Jul 29, 2026 · 09:05', [{ id: 'chem', name: 'Roundup Herbicide', price: 15, qty: 6, thumb: 'chem', seller: 'Vendor Supplies Ltd', unit: '1L' }], 3),
      o('#C-2209', 'Miller (Offtaker)', 'Miller Corp, Harare', 'Express', 'ZVIDA Wallet', 'Jul 28, 2026 · 14:30', [{ id: 'grain', name: 'Maize Grain (Stockfeed)', price: 150, qty: 4, thumb: 'grain', seller: 'Miller Corp', unit: 'ton' }, { id: 'fert', name: 'NPK Fertilizer 10-26-26', price: 45, qty: 6, thumb: 'fert', seller: 'Vendor Supplies Ltd', unit: '50kg bag' }], 2),
      o('#C-2208', 'James (Farmer)', 'Farm 42, Ruwa', 'Standard', 'ZVIDA Wallet', 'Jul 25, 2026 · 11:20', [{ id: 'feed', name: 'Poultry Mash Feed', price: 12, qty: 10, thumb: 'feed', seller: 'FeedRight', unit: '50kg bag' }, { id: 'grain', name: 'Maize Grain (Stockfeed)', price: 150, qty: 1, thumb: 'grain', seller: 'Miller Corp', unit: 'ton' }], 5),
      o('#C-2213', 'Miller (Offtaker)', 'Miller Corp, Harare', 'Standard', 'ZVIDA Wallet', 'Jul 27, 2026 · 10:20', [{ id: 'wheat', name: 'Wheat Bran (Stockfeed)', price: 180, qty: 2, thumb: 'wheat', seller: 'Miller Corp', unit: 'ton' }], 0),
      o('#C-2214', 'Miller (Offtaker)', 'Miller Corp, Harare', 'Express', 'ZVIDA Wallet', 'Jul 26, 2026 · 15:05', [{ id: 'fert', name: 'NPK Fertilizer 10-26-26', price: 45, qty: 4, thumb: 'fert', seller: 'Vendor Supplies Ltd', unit: '50kg bag' }], 3),
      o('#C-2215', 'Miller (Offtaker)', 'Miller Corp, Harare', 'Standard', 'ZVIDA Wallet', 'Jul 24, 2026 · 09:40', [{ id: 'chem', name: 'Roundup Herbicide', price: 15, qty: 3, thumb: 'chem', seller: 'Vendor Supplies Ltd', unit: '1L' }, { id: 'grain', name: 'Maize Grain (Stockfeed)', price: 150, qty: 2, thumb: 'grain', seller: 'Miller Corp', unit: 'ton' }], 5),
      o('#C-2216', 'James (Farmer)', 'Farm 42, Ruwa', 'Standard', 'ZVIDA Wallet', 'Jul 23, 2026 · 13:15', [{ id: 'chem', name: 'Roundup Herbicide', price: 15, qty: 2, thumb: 'chem', seller: 'Vendor Supplies Ltd', unit: '1L' }], 0, 'CANCELLED'),
      o('#C-2217', 'James (Farmer)', 'Farm 42, Ruwa', 'Standard', 'ZVIDA Wallet', 'Jul 22, 2026 · 11:00', [{ id: 'fert', name: 'NPK Fertilizer 10-26-26', price: 45, qty: 2, thumb: 'fert', seller: 'Vendor Supplies Ltd', unit: '50kg bag' }], 1),
      o('#C-2218', 'James (Farmer)', 'Farm 42, Ruwa', 'Express', 'ZVIDA Wallet', 'Jul 21, 2026 · 16:30', [{ id: 'seed', name: 'SC403 Maize Seed', price: 18, qty: 5, thumb: 'seed', seller: 'Vendor Supplies Ltd', unit: 'kg' }], 4),
      o('#C-2219', 'James (Farmer)', 'Farm 42, Ruwa', 'Standard', 'ZVIDA Wallet', 'Jul 20, 2026 · 08:45', [{ id: 'tractor', name: 'Tractor Rental (Case IH)', price: 50, qty: 1, thumb: 'tractor', seller: 'Harness Rentals', unit: 'day' }], 0, 'ESCALATED'),
      o('#C-2220', 'James (Farmer)', 'Farm 42, Ruwa', 'Standard', 'ZVIDA Wallet', 'Jul 18, 2026 · 14:20', [{ id: 'feed', name: 'Poultry Mash Feed', price: 12, qty: 5, thumb: 'feed', seller: 'FeedRight', unit: '50kg bag' }], 5, 'PAID'),
    ],
  };
}

let marketStore: { cat: MarketProduct[]; cart: Record<string, number>; orders: MarketOrder[]; seq: number; rfqs: LiveRfq[] } | null = null;

function mkLoad(): typeof marketStore {
  if (marketStore) return marketStore;
  try {
    const raw = localStorage.getItem(MK_KEY);
    marketStore = raw ? JSON.parse(raw) : null;
    if (marketStore && !Array.isArray(marketStore.rfqs)) marketStore.rfqs = [];
  } catch {
    marketStore = null;
  }
  if (!marketStore) {
    marketStore = mkSeed();
    mkSave();
  }
  return marketStore;
}

function mkSave(): void {
  try {
    localStorage.setItem(MK_KEY, JSON.stringify(marketStore));
  } catch {
    /* storage unavailable — session keeps state in memory */
  }
}

export function marketMoney(v: number): string {
  return '$' + v.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function marketCatalog(seller?: string): MarketProduct[] {
  const c = mkLoad()!.cat;
  return seller ? c.filter((p) => p.seller === seller) : c;
}

export function marketProduct(id: string): MarketProduct | undefined {
  return mkLoad()!.cat.find((p) => p.id === id);
}

export function marketAddProduct(p: MarketProduct): void {
  mkLoad()!.cat.unshift(p);
  mkSave();
  void persistProduct(p as unknown as LiveProduct);
}

export function marketRemoveProduct(id: string): void {
  mkLoad()!.cat = mkLoad()!.cat.filter((p) => p.id !== id);
  mkSave();
  void deleteProduct(id);
}

export function marketOrders(seller?: string): MarketOrder[] {
  const all = [...mkLoad()!.orders].reverse();
  return seller ? all.filter((o) => o.items.some((i) => i.seller === seller)) : all;
}

/* Real accounts are scoped to their own rows by user_id; demo accounts match
   the seeded persona name stored in `currentUser` (e.g. "James (Farmer)"). */
export function marketMyOrders(): MarketOrder[] {
  const a = getLiveAccount();
  if (a && !a.isDemo) {
    return marketOrders().filter((o) => o.userId === a.id);
  }
  const name = currentUser.split(' (')[0];
  return marketOrders().filter((o) => o.buyer === currentUser || o.buyer.startsWith(name));
}

export function marketOrder(id: string): MarketOrder | undefined {
  return mkLoad()!.orders.find((o) => o.id === id);
}

export function marketCartLines(): MarketOrder['items'] {
  const s = mkLoad()!;
  return Object.entries(s.cart)
    .filter(([, q]) => (q || 0) > 0)
    .map(([id, q]) => {
      const p = marketProduct(id)!;
      return { id, name: p.name, price: p.price, qty: q || 0, thumb: p.thumb, seller: p.seller, unit: p.unit };
    });
}

export function marketQty(): number {
  const s = mkLoad()!;
  return Object.values(s.cart).reduce((a, b) => a + (b || 0), 0);
}

export function marketQtyOf(id: string): number {
  return mkLoad()!.cart[id] || 0;
}

export function marketSubtotal(): number {
  return marketCartLines().reduce((s, i) => s + i.price * i.qty, 0);
}

export function marketSetQty(id: string, qty: number): void {
  const s = mkLoad()!;
  if (qty <= 0) delete s.cart[id];
  else s.cart[id] = qty;
  mkSave();
}

export function marketAdd(id: string, qty = 1): void {
  marketSetQty(id, marketQtyOf(id) + qty);
}

export function marketRemove(id: string): void {
  marketSetQty(id, 0);
}

export function marketLastOrder(): MarketOrder | undefined {
  const s = mkLoad()!;
  return s.orders[s.orders.length - 1];
}

/* ---------- RFQs (live accounts only; demo accounts keep hardcoded pages) ---------- */

export function marketMyRfqs(): LiveRfq[] {
  const me = liveUserId();
  return mkLoad()!.rfqs.filter((r) => me && r.offtakerId === me);
}

export function marketOpenRfqs(): LiveRfq[] {
  const me = liveUserId();
  return mkLoad()!.rfqs.filter((r) => r.status === 'OPEN' && r.offtakerId !== me);
}

export function marketAddRfq(r: LiveRfq): void {
  mkLoad()!.rfqs.unshift(r);
  mkSave();
  void persistRfq(r);
}

export function marketRemoveRfq(id: string): void {
  mkLoad()!.rfqs = mkLoad()!.rfqs.filter((r) => r.id !== id);
  mkSave();
  void deleteRfq(id);
}

export function marketPlace(buyer: string): MarketOrder {
  const s = mkLoad()!;
  const lines = marketCartLines();
  const ref = '#C-' + s.seq++;
  const order: MarketOrder = {
    id: 'mk' + (s.seq - 1),
    ref,
    buyer,
    userId: liveUserId(),
    address: 'Farm 42, Ruwa',
    delivery: 'Standard',
    payment: 'ZVIDA Wallet',
    placedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' · just now',
    items: lines,
    status: 'NEW',
    tone: 'amber',
    flow: [...MK_FLOW],
    step: 0,
    total: lines.reduce((a, i) => a + i.price * i.qty, 0),
    history: [{ t: 'Placed', d: 'Order placed · seller notified' }],
  };
  s.orders.push(order);
  s.cart = {};
  mkSave();
  void persistOrder(order as unknown as LiveOrder);
  return order;
}

function mkAdvance(o: MarketOrder, step: number, note: string): void {
  o.step = Math.min(step, o.flow.length - 1);
  o.status = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'][o.step - 1] ?? 'DELIVERED';
  o.tone = mkWrap(o.status).tone;
  o.history.push({ t: o.flow[o.step], d: note });
  if (o.status === 'DELIVERED') o.history.push({ t: 'Delivered', d: 'Signed for · carrier' });
  mkSave();
  void persistOrder(o as unknown as LiveOrder);
}

function mkSet(o: MarketOrder, status: string, note: string): void {
  o.status = status;
  o.tone = mkWrap(status).tone;
  o.history.push({ t: status.replace(/_/g, ' '), d: note });
  mkSave();
  void persistOrder(o as unknown as LiveOrder);
}

export function marketUpdate(id: string, action: string, note?: string): void {
  const o = marketOrder(id);
  if (!o) return;
  const by = (s: string) => note || s;
  switch (action) {
    case 'confirm': mkAdvance(o, 1, by('Confirmed by seller')); break;
    case 'process': mkAdvance(o, 2, by('Picking and packing')); break;
    case 'ship': mkAdvance(o, 3, by('Handed to carrier')); break;
    case 'out': mkAdvance(o, 4, by('Driver en route')); break;
    case 'deliver': mkAdvance(o, 5, by('Delivered to buyer')); break;
    case 'reject': mkSet(o, 'CANCELLED', by('Rejected by seller — buyer notified')); break;
    case 'esc': mkSet(o, 'ESCALATED', by('Escalated to ZVIDA resolution desk')); break;
    case 'pay': mkSet(o, 'PAID', by('Payment released to seller (NET_7)')); break;
    case 'notify': o.history.push({ t: 'Reminder', d: by('Reminder sent to seller') }); mkSave(); break;
    default: break;
  }
}

export function marketRecommend(limit = 3): MarketProduct[] {
  const cat = mkLoad()!.cat;
  const inCart = Object.keys(mkLoad()!.cart);
  return cat.filter((p) => !inCart.includes(p.id)).sort((a, b) => b.rating - a.rating).slice(0, limit);
}

export function stars(r: number): string {
  const full = Math.round(r);
  const star = '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>';
  let h = '';
  for (let i = 1; i <= 5; i++) h += `<span class="dsh-star ${i <= full ? 'on' : ''}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${star}</svg></span>`;
  return `<span class="dsh-stars">${h}</span>`;
}

export function marketProductCard(p: MarketProduct, group = 'shop'): string {
  const stock = p.stock <= 0 ? pill('Out of stock', 'red') : p.stock < 10 ? pill(`${p.stock} left`, 'amber') : pill('In stock', 'green');
  const inCart = marketQtyOf(p.id) > 0 ? `<div class="dsh-shop-incart">In cart: ${marketQtyOf(p.id)} ${marketQtyOf(p.id) === 1 ? 'item' : 'items'}</div>` : '';
  return `<div class="dsh-shop-card" data-filter-group="${group}" data-filter-value="${p.category}" data-product="${p.id}">
    <div class="dsh-shop-thumb">${img(p.thumb, 'wide')}</div>
    <div class="dsh-shop-card-body">
      <div class="dsh-shop-name">${p.name}</div>
      <div class="dsh-shop-rate">${stars(p.rating)} <span class="dsh-shop-rev">${p.reviews} ratings</span></div>
      <div class="dsh-shop-sub">${ZVIDA_COUNTERPARTY} · ${p.unit}</div>
      <div class="dsh-shop-price">${marketMoney(p.price)}</div>
      ${stock}
      ${inCart}
      <div class="dsh-shop-foot">
        ${jsBtn('Add to Cart', 'primary sm', 'marketAdd', p.id, `${p.name} added to cart`)}
        ${jsBtn('Buy Now', 'ghost sm', 'marketBuy', p.id, `Buying ${p.name}`)}
      </div>
    </div>
  </div>`;
}

export function marketCartLine(it: MarketOrder['items'][number]): string {
  return `<div class="dsh-cart-line">
    <div class="dsh-cart-thumb">${img(it.thumb, 'sm')}</div>
    <div class="dsh-cart-info">
      <div class="dsh-cart-name">${it.name}</div>
      <div class="dsh-cart-sub">${ZVIDA_COUNTERPARTY} · ${it.unit} · ${marketMoney(it.price)} each</div>
      <div class="dsh-cart-ctrl">
        ${jsBtn('−', 'ghost sm', 'marketQty', it.id + ':-1')}
        <span class="dsh-cart-qty">${it.qty}</span>
        ${jsBtn('+', 'ghost sm', 'marketQty', it.id + ':1')}
        ${jsBtn('Remove', 'ghost sm', 'marketRemove', it.id, 'Removed from cart')}
      </div>
    </div>
    <div class="dsh-cart-total">${marketMoney(it.price * it.qty)}</div>
  </div>`;
}

export function marketSteps(o: MarketOrder): string {
  return `<div class="dsh-msteps">${o.flow.map((s, i) => `<span class="dsh-mstep ${i < o.step ? 'do' : i === o.step ? 'on' : ''}">${s}</span>`).join('<i class="dsh-msep">›</i>')}</div>`;
}

export function marketOrderFoot(o: MarketOrder, role: 'buyer' | 'seller' | 'admin' | 'driver' = 'buyer'): string {
  const st = mkWrap(o.status);
  if (role === 'seller') {
    if (o.status === 'NEW') return `${jsBtn('Confirm Order', 'primary sm', 'mktAction', o.id + ':confirm', 'Order confirmed')}${jsBtn('Reject', 'danger sm', 'mktAction', o.id + ':reject', 'Order rejected')}`;
    if (o.status === 'CONFIRMED') return jsBtn('Mark Processing', 'primary sm', 'mktAction', o.id + ':process', 'Order marked as processing');
    if (o.status === 'PROCESSING') return jsBtn('Mark Shipped', 'primary sm', 'mktAction', o.id + ':ship', 'Order marked as shipped');
    if (o.status === 'SHIPPED' || o.status === 'OUT_FOR_DELIVERY') return pill('Awaiting delivery', 'indigo');
    if (o.status === 'DELIVERED') return `${pill('Delivered', 'green')}${jsBtn('Call ' + zBuyerName(o, role), 'ghost sm', 'marketCall', zBuyerName(o, role), 'Dialing buyer…')}`;
    return pill(st.status, st.tone);
  }
  if (role === 'driver') {
    if (o.status === 'SHIPPED') return jsBtn('Start Delivery', 'primary sm', 'mktAction', o.id + ':out', 'Picked up — en route');
    if (o.status === 'OUT_FOR_DELIVERY') return jsBtn('Mark Delivered', 'primary sm', 'mktAction', o.id + ':deliver', 'Delivered — signed for');
    return pill(st.status, st.tone);
  }
  if (role === 'admin') {
    return `${jsBtn('Notify Seller', 'ghost sm', 'mktAction', o.id + ':notify', 'Reminder sent')}${o.status === 'DELIVERED' ? jsBtn('Release Payment', 'primary sm', 'mktAction', o.id + ':pay', 'Payment released') : o.status === 'PAID' ? pill('Paid', 'green') : jsBtn('Escalate', 'danger sm', 'mktAction', o.id + ':esc', 'Escalated to resolution desk')}`;
  }
  if (['DELIVERED', 'PAID'].includes(o.status)) return `${jsBtn('Buy Again', 'ghost sm', 'mktBuyAgain', o.id, 'Items added to cart')}${jsBtn('Rate Order', 'ghost sm', 'mktAction', o.id + ':review', 'Thanks for your review')}`;
  if (o.status === 'CANCELLED') return pill('Cancelled', 'red');
  if (o.status === 'ESCALATED') return pill('Escalated — ZVIDA resolving', 'red');
  return pill('Track below', 'blue');
}

export function marketOrderCard(o: MarketOrder, role: 'buyer' | 'seller' | 'admin' | 'driver' = 'buyer'): string {
  const st = mkWrap(o.status);
  const items = o.items.map((i) => `${i.name} ×${i.qty}`).join(', ');
  const open = role === 'admin' || role === 'driver' ? '#marketplace' : '#orders';
  return `${itemCard({
    title: `${o.ref} · ${items}`,
    thumb: o.items[0]?.thumb || 'box',
    badge: st.status,
    badgeTone: st.tone,
    key: o.id,
    open,
    time: `${o.placedAt} · ${o.payment}`,
    meta: `${marketSteps(o)}<br/>Buyer: <b>${zBuyerName(o, role)}</b> · Delivery: ${o.delivery} · Total: <b>${marketMoney(o.total)}</b>`,
    foot: marketOrderFoot(o, role),
  })}`;
}

export function marketBucket(status: string): string {
  switch (status) {
    case 'NEW': return 'Pending';
    case 'CONFIRMED':
    case 'PROCESSING': return 'Loading';
    case 'SHIPPED':
    case 'OUT_FOR_DELIVERY': return 'Offloading';
    case 'DELIVERED':
    case 'PAID': return 'Complete';
    case 'CANCELLED': return 'Cancelled';
    case 'ESCALATED': return 'Escalated';
    default: return status;
  }
}

export function marketOrderGroup(o: MarketOrder, role: 'buyer' | 'seller' | 'admin' | 'driver', filterGroup: string, filterValue: string): string {
  const active = !['DELIVERED', 'PAID', 'CANCELLED', 'ESCALATED'].includes(o.status);
  return `<div data-filter-group="${filterGroup}" data-filter-value="${filterValue}" data-mk-role="${role}"${active ? ' data-filter-active="1"' : ''}>${marketOrderCard(o, role)}</div>`;
}

export function refresh(): void {
  window.dispatchEvent(new HashChangeEvent('hashchange'));
  const cnt = document.querySelector('.dsh-cart-count');
  if (cnt) cnt.textContent = String(marketQty());
}

/* Shared marketplace JS handlers */
let currentUser = 'Buyer';
export function wireMarket(): void {
  if (JS.marketAdd) return;
  JS.marketAdd = (k) => {
    const p = marketProduct(k);
    if (!p) return;
    if (p.stock <= 0) {
      toast(`${p.name} is out of stock`, 'warn');
      return;
    }
    marketAdd(k);
    toast(`${p.name} added to cart (${marketQtyOf(k)})`);
    refresh();
  };
  JS.marketBuy = (k) => {
    const p = marketProduct(k);
    if (!p) return;
    marketSetQty(k, Math.max(marketQtyOf(k) || 0, 1));
    toast(`Buying ${p.name} now`, 'info');
    window.location.hash = '#checkout';
  };
  JS.marketQty = (payload) => {
    const [id, d] = payload.split(':');
    const p = marketProduct(id);
    if (!p) return;
    marketSetQty(id, marketQtyOf(id) + parseInt(d || '0', 10));
    refresh();
  };
  JS.marketRemove = (id) => {
    const p = marketProduct(id);
    marketRemove(id);
    toast(`${p?.name || 'Item'} removed from cart`, 'info');
    refresh();
  };
  JS.marketPlace = (_p, el) => {
    const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('.dsh-checkout .dsh-input'));
    const vals = inputs.map((i) => i.value.trim()).filter(Boolean);
    const addr = vals.length ? vals.join(' · ') : 'Farm 42, Ruwa';
    const wrap = el.closest<HTMLElement>('.dsh-checkout');
    const delivery = wrap?.querySelector<HTMLElement>('.dsh-chips[data-filter-group="delivery"] .dsh-chip.active')?.getAttribute('data-filter-value') || 'Standard';
    const payment = wrap?.querySelector<HTMLElement>('.dsh-chips[data-filter-group="pay"] .dsh-chip.active')?.getAttribute('data-filter-value') || 'ZVIDA Wallet';
    const order = marketPlace(currentUser);
    order.address = addr;
    order.delivery = delivery;
    order.payment = payment;
    if (delivery === 'Express') order.total += 8;
    mkSave();
    toast(`${order.ref} placed — seller notified`);
    window.location.hash = '#order-confirmed';
  };
  JS.marketCall = (who) => toast(`Dialing ${who} — placing the call from your phone`, 'info');
  JS.mktAction = (payload) => {
    const [id, action] = payload.split(':');
    marketUpdate(id, action);
    toast('Order updated');
    refresh();
  };
  JS.mktBuyAgain = (id) => {
    const o = marketOrder(id);
    if (!o) return;
    o.items.forEach((i) => marketSetQty(i.id, (marketQtyOf(i.id) || 0) + i.qty));
    toast('Items added back to your cart', 'info');
    window.location.hash = '#cart';
  };
}

/* ============================================================
   Freight & consignment logistics (persists in localStorage)
   Hub-and-spoke: suppliers -> ZVIDA -> offtakers. ZVIDA pays.
   Weighbridge = first + second weight (net = 2nd - 1st).
   Scale = buckets/bags counted at the farm -> payment pending.
   Terms: COD, COC, NET_3..NET_21. Pending = awaiting ZVIDA pay.
   ============================================================ */
export interface Consignment {
  id: string;
  ref: string;
  contract: string;
  poRef: string;
  order: string;
  commodity: string;
  art: string;
  supplier: string;
  receiver: string;
  from: string;
  dest: string;
  driver: string;
  phone: string;
  truck: string;
  trailer: string;
  weightMode: WeightMode;
  bucketKg: number;
  weight1: number;
  weight2: number;
  bags: number;
  buckets: number;
  inputKg: number;
  unitPrice: number;
  qty: number;
  amount: number;
  payTerm: string;
  status: string;
  tone: PillTone;
  step: number;
  flow: string[];
  history: { t: string; d: string }[];
  due: string;
  slip: string;
  pics: number;
  live: number;
  photos: string[];
  contractId?: string;
  deliveryId?: string;
  driverId?: string;
}

const LG_KEY = 'zvida_freight_v2';
const LG_FLOW = ['Scheduled', 'Loading', 'Weigh 1', 'In Transit', 'Offloading', 'Weigh 2', 'Payment Pending', 'Paid'];

function lgWrap(status: string): { status: string; tone: PillTone } {
  switch (status) {
    case 'PENDING': return { status: 'Pending', tone: 'amber' };
    case 'LOADING': return { status: 'Loading', tone: 'blue' };
    case 'WEIGHED_1': return { status: 'First Weight', tone: 'indigo' };
    case 'IN_TRANSIT': return { status: 'In Transit', tone: 'indigo' };
    case 'OFFLOADING': return { status: 'Offloading', tone: 'blue' };
    case 'WEIGHED_2': return { status: 'Second Weight', tone: 'violet' };
    case 'PENDING_PAYMENT': return { status: 'Payment Pending', tone: 'amber' };
    case 'PAID': return { status: 'Paid', tone: 'green' };
    case 'CANCELLED': return { status: 'Cancelled', tone: 'red' };
    default: return { status, tone: 'gray' };
  }
}

function lgSeed(): { loads: Consignment[]; seq: number } {
  const l = (
    ref: string, contract: string, commodity: string, art: string,
    supplier: string, receiver: string, from: string, dest: string,
    mode: WeightMode, unitPrice: number, payTerm: string,
    driver: string, phone: string, truck: string, trailer: string,
    status: string, w1: number, w2: number, slip: string, due: string, live: number,
    bags = 0, buckets = 0, inputKg = 0, bucketKg = 20
  ): Consignment => {
    const steps: Record<string, number> = { PENDING: 0, LOADING: 1, WEIGHED_1: 2, IN_TRANSIT: 3, OFFLOADING: 4, WEIGHED_2: 5, PENDING_PAYMENT: 6, PAID: 7, CANCELLED: 0 };
    const step = steps[status] ?? 0;
    const qty = mode === 'weighbridge' ? Math.abs(w2 - w1) : inputKg || bags * 50 + buckets * bucketKg;
    return {
      id: 'lg' + ref.replace(/\D/g, '').slice(-4),
      ref, contract, poRef: 'PO-' + contract.replace(/\D/g, ''), order: 'SO-' + ref,
      commodity, art, supplier, receiver, from, dest,
      weightMode: mode, bucketKg, weight1: w1, weight2: w2, bags, buckets, inputKg,
      unitPrice, qty, amount: Math.round((qty / 1000) * unitPrice),
      payTerm, status, tone: lgWrap(status).tone, step, flow: [...LG_FLOW],
      history: [{ t: lgWrap(status).status, d: 'Seeded from matched contract ' + contract }],
      due, slip, pics: 0, live, photos: [],
      driver, phone, truck, trailer,
    };
  };
  return {
    seq: 2226,
    loads: [
      l('LD-2214', '#882', 'Maize', 'grain', 'James (Farmer)', 'Miller Corp (Offtaker)', 'Farm 42, Ruwa', 'Miller Corp, Harare',
        'weighbridge', 200, 'COD', 'John Doe', '+263 77 123 4567', 'ABC-123 · Scania R450', 'XYZ-789 · Grain Tipper 35t',
        'OFFLOADING', 10000, 0, 'WB-8821', 'On delivery', 94),
      l('LD-2215', '#883', 'Soya', 'soya', 'James (Farmer)', 'Miller Corp (Offtaker)', 'Farm 42, Ruwa', 'Miller Corp, Harare',
        'buckets', 450, 'COC', 'John Doe', '+263 77 123 4567', 'ABC-123 · Scania R450', 'XYZ-789 · Grain Tipper 35t',
        'LOADING', 0, 0, '', 'On collection', 0, 0, 0, 0, 20),
      l('LD-2216', '#886', 'Maize', 'grain', 'Peter (Farmer)', 'ZVIDA', 'Farm 12, Marondera', 'ZVIDA Depot, Chegutu',
        'weighbridge', 180, 'NET_14', 'Sarah Moyo', '+263 78 987 6543', 'DEF-456 · FAW 8x4', 'UVW-000 · Side tipper',
        'PENDING_PAYMENT', 12000, 26500, 'WB-8861', 'Aug 14, 2026', 100),
      l('LD-2217', '#887', 'NPK Fertilizer', 'fert', 'Vendor Supplies Ltd', 'ZVIDA', 'Vendor Yard, Norton', 'ZVIDA Depot, Chinhoyi',
        'weighbridge', 560, 'NET_21', '', '', '', '',
        'PENDING', 0, 0, '', 'Aug 21, 2026', 0),
      l('LD-2218', '#888', 'Wheat', 'wheat', 'Peter (Farmer)', 'Miller Corp (Offtaker)', 'Farm 12, Marondera', 'Miller Corp, Harare',
        'weighbridge', 320, 'NET_7', '', '', '', '',
        'PENDING', 0, 0, '', 'Aug 7, 2026', 0),
      l('LD-2219', '#889', 'Maize', 'grain', 'James (Farmer)', 'Miller Corp (Offtaker)', 'Farm 42, Ruwa', 'Miller Corp, Harare',
        'weighbridge', 200, 'NET_3', 'John Doe', '+263 77 123 4567', 'ABC-123 · Scania R450', 'XYZ-789 · Grain Tipper 35t',
        'IN_TRANSIT', 11000, 0, 'WB-8891', 'Aug 3, 2026', 62),
      l('LD-2220', '#890', 'Maize', 'grain', 'James (Farmer)', 'ZVIDA', 'Farm 42, Ruwa', 'ZVIDA Depot, Chegutu',
        'weighbridge', 200, 'NET_14', 'Sarah Moyo', '+263 78 987 6543', 'DEF-456 · FAW 8x4', 'UVW-000 · Side tipper',
        'PENDING_PAYMENT', 8000, 22000, 'WB-8901', 'Aug 14, 2026', 100),
      l('LD-2221', '#891', 'Maize', 'grain', 'James (Farmer)', 'ZVIDA', 'Farm 42, Ruwa', 'ZVIDA Depot, Chegutu',
        'weighbridge', 200, 'NET_14', 'Sarah Moyo', '+263 78 987 6543', 'DEF-456 · FAW 8x4', 'UVW-000 · Side tipper',
        'PAID', 9000, 25000, 'WB-8911', 'Jul 31, 2026', 100),
      l('LD-2222', '#892', 'NPK Fertilizer', 'fert', 'Vendor Supplies Ltd', 'ZVIDA', 'Vendor Yard, Norton', 'ZVIDA Depot, Chinhoyi',
        'weighbridge', 560, 'NET_21', 'Sarah Moyo', '+263 78 987 6543', 'DEF-456 · FAW 8x4', 'UVW-000 · Side tipper',
        'PENDING_PAYMENT', 5000, 15500, 'WB-8921', 'Aug 21, 2026', 100),
      l('LD-2223', '#893', 'NPK Fertilizer', 'fert', 'Vendor Supplies Ltd', 'ZVIDA', 'Vendor Yard, Norton', 'ZVIDA Depot, Chinhoyi',
        'weighbridge', 560, 'NET_21', 'Sarah Moyo', '+263 78 987 6543', 'DEF-456 · FAW 8x4', 'UVW-000 · Side tipper',
        'PAID', 4500, 13500, 'WB-8931', 'Jul 30, 2026', 100),
      l('LD-2224', '#894', 'Maize', 'grain', 'James (Farmer)', 'Miller Corp (Offtaker)', 'Farm 42, Ruwa', 'Miller Corp, Harare',
        'weighbridge', 200, 'NET_7', 'John Doe', '+263 77 123 4567', 'ABC-123 · Scania R450', 'XYZ-789 · Grain Tipper 35t',
        'PAID', 12000, 31000, 'WB-8941', 'Jul 29, 2026', 100),
      l('LD-2225', '#895', 'Soya', 'soya', 'James (Farmer)', 'Miller Corp (Offtaker)', 'Farm 42, Ruwa', 'Miller Corp, Harare',
        'weighbridge', 450, 'NET_7', 'John Doe', '+263 77 123 4567', 'ABC-123 · Scania R450', 'XYZ-789 · Grain Tipper 35t',
        'PENDING_PAYMENT', 10500, 30000, 'WB-8951', 'Aug 7, 2026', 100),
    ],
  };
}

let freightStore: { loads: Consignment[]; seq: number } | null = null;

function lgLoad(): typeof freightStore {
  if (freightStore) return freightStore;
  try {
    const raw = localStorage.getItem(LG_KEY);
    freightStore = raw ? JSON.parse(raw) : null;
  } catch {
    freightStore = null;
  }
  if (!freightStore || !Array.isArray(freightStore.loads)) {
    freightStore = lgSeed();
    lgSave();
  }
  return freightStore;
}

function lgSave(): void {
  try {
    localStorage.setItem(LG_KEY, JSON.stringify(freightStore));
  } catch {
    /* storage unavailable — keep in memory */
  }
}

export function loadCatalog(): Consignment[] {
  return [...lgLoad()!.loads];
}

export function load(id: string): Consignment | undefined {
  return lgLoad()!.loads.find((x) => x.id === id);
}

export function loadsFor(fn: (l: Consignment) => boolean): Consignment[] {
  return [...lgLoad()!.loads].filter(fn).reverse();
}

export function loadTerm(l: Consignment): string {
  if (l.payTerm === 'COD') return pill('COD', 'green');
  if (l.payTerm === 'COC') return pill('COC', 'blue');
  return pill(l.payTerm.replace('NET_', 'NET '), 'amber');
}

export function loadTermNote(l: Consignment): string {
  if (l.payTerm === 'COD') return 'Paid after delivery · after second weight';
  if (l.payTerm === 'COC') return 'Paid on collection at the farm · after second weight';
  return `Paid ${l.payTerm.replace('NET_', '')} days after second weight`;
}

export function loadMoney(v: number): string {
  return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/* ---------- Blind-principal masking ---------- */
export type LoadRole = 'supplier' | 'driver' | 'receiver' | 'admin';

export const ZVIDA_COUNTERPARTY = 'ZVIDA Agro Traders';

function zFromName(l: Consignment, role: LoadRole): string {
  return role === 'receiver' ? ZVIDA_COUNTERPARTY : l.supplier;
}
function zToName(l: Consignment, role: LoadRole): string {
  return role === 'supplier' ? ZVIDA_COUNTERPARTY : l.receiver;
}
function zFromSub(l: Consignment, role: LoadRole): string {
  return role === 'receiver' ? 'ZVIDA Logistics · 5417 Cranbrook, Ruwa, Harare' : l.from;
}
function zToSub(l: Consignment, role: LoadRole): string {
  return role === 'supplier' ? 'ZVIDA Logistics · 5417 Cranbrook, Ruwa, Harare' : l.dest;
}
function zRouteStart(l: Consignment, role: LoadRole): string {
  return role === 'receiver' ? ZVIDA_COUNTERPARTY : l.from;
}
function zRouteEnd(l: Consignment, role: LoadRole): string {
  return role === 'supplier' ? ZVIDA_COUNTERPARTY : l.dest;
}
function zRoute(l: Consignment, role: LoadRole): string {
  return `${zRouteStart(l, role)} → ${zRouteEnd(l, role)}`;
}

export type MarketRole = 'buyer' | 'seller' | 'admin' | 'driver';

function zBuyerName(o: MarketOrder, role: MarketRole): string {
  if (role === 'admin') return o.buyer;
  return ZVIDA_COUNTERPARTY;
}
function zSellerName(name: string, role: MarketRole): string {
  if (role === 'admin') return name;
  return ZVIDA_COUNTERPARTY;
}
function zBuyerAddr(o: MarketOrder, role: MarketRole): string {
  if (role === 'seller') return 'ZVIDA Logistics Hub · Ruwa';
  return o.address;
}

function zTimeline(l: Consignment, role: LoadRole): string {
  const viewer = role === 'receiver' ? 'offtaker' : 'supplier';
  const amount = zamountFor(l, viewer);
  const money = amount ? loadMoney(amount) : '';
  return l.history.map((h) => {
    let d = h.d;
    if (role === 'supplier' || role === 'receiver') {
      d = d.replace(/\$\d{1,3}(?:,\d{3})*\.\d{2}/g, money);
      if (role === 'receiver') {
        d = d.replace(/(paid|released|paid out) to [^·]+/gi, '$1 to ' + ZVIDA_COUNTERPARTY);
      }
    }
    return `<div class="dsh-drawer-event"><span class="t">${h.t}</span><span class="d">${d}</span></div>`;
  }).join('');
}

/* ---------- Ticker ---------- */
export function ticker(items: { name: string; price: string; old?: string }[]): string {
  const once = items
    .map((t) => `<span class="dsh-tick"><span class="dsh-tick-name">${t.name}</span><span class="dsh-tick-price">${t.price}</span>${t.old ? `<span class="dsh-tick-old">${t.old}</span>` : ''}</span>`)
    .join('');
  return `<div class="dsh-ticker"><div class="dsh-ticker-track">${once}${once}</div></div>`;
}

function lgTransition(l: Consignment, action: string, note: string): void {
  const set = (status: string, step: number, t: string, d: string) => {
    l.status = status;
    l.step = step;
    l.tone = lgWrap(status).tone;
    l.history.push({ t, d });
  };
  const qtyKg = l.weightMode === 'weighbridge' ? Math.abs(l.weight2 - l.weight1) : l.inputKg || l.bags * 50 + l.buckets * l.bucketKg;
  switch (action) {
    case 'assign':
      l.driver = 'John Doe';
      l.phone = '+263 77 123 4567';
      l.truck = 'ABC-123 · Scania R450';
      l.trailer = 'XYZ-789 · Grain Tipper 35t';
      set('PENDING', 0, 'Driver assigned', note || 'Assigned to John Doe · dispatched');
      break;
    case 'start':
      set('LOADING', 1, 'Loading started', note || 'Truck on site — loading in progress');
      break;
    case 'w1':
      set('WEIGHED_1', 2, 'First weight recorded', `${l.weight1.toLocaleString()} kg · slip ${l.slip || 'WB-' + l.ref.slice(-4)}`);
      break;
    case 'count':
      l.qty = qtyKg;
      l.amount = Math.round((l.qty / 1000) * l.unitPrice);
      set('PENDING_PAYMENT', 6, 'Load counted — payment pending', `${l.qty.toLocaleString()} kg · ${loadMoney(l.amount)} · ${loadTermNote(l)}`);
      break;
    case 'depart':
      set('IN_TRANSIT', 3, 'Departed', note || 'Truck en route — GPS tracking active');
      break;
    case 'arrive':
      set('OFFLOADING', 4, 'Arrived at destination', note || 'Offloading in progress');
      break;
    case 'w2':
      l.qty = qtyKg;
      l.amount = Math.round((l.qty / 1000) * l.unitPrice);
      set('PENDING_PAYMENT', 6, 'Second weight recorded — payment pending', `Net ${l.qty.toLocaleString()} kg · ${loadMoney(l.amount)} · ${loadTermNote(l)}`);
      break;
    case 'deliver':
      if (l.status === 'OFFLOADING') set('PENDING_PAYMENT', 6, 'Delivery confirmed', note || `Signed off · ${loadTermNote(l)}`);
      break;
    case 'settle':
      set('PAID', 7, 'Payment released', `${loadMoney(l.amount)} paid to ${l.supplier} · ${loadTermNote(l)}`);
      break;
    case 'cancel':
      set('CANCELLED', 0, 'Cancelled', note || 'Load cancelled — parties notified');
      break;
    case 'note':
      l.history.push({ t: 'Event', d: note });
      break;
    default:
      break;
  }
  lgSave();
  void persistLoad(l as unknown as LiveLoad);
  void syncLiveLoad(l, action);
}

/** Push a real consignment transition to the backend (edge functions). */
function syncLiveLoad(l: Consignment, action: string): void {
  if (!liveConfigured() || !l.contractId) return;
  if (action === 'assign') {
    void assignDriverByName(l.contractId, l.driver || '');
    return;
  }
  if (action === 'settle') {
    void settleContract(l.contractId, l.ref);
    return;
  }
  void syncDeliveryStatus(l as unknown as LiveLoad, action);
}

export function freightUpdate(id: string, action: string, note?: string): void {
  const l = load(id);
  if (!l) return;
  lgTransition(l, action, note || '');
}

export function loadSteps(l: Consignment): string {
  return `<div class="dsh-lg-steps">${l.flow
    .map((s, i) => `<span class="dsh-lg-step ${i < l.step ? 'do' : i === l.step ? 'on' : ''}" title="${s}"><i></i></span>`)
    .join('')}</div>`;
}

export function loadProgressBar(l: Consignment): string {
  const pct = l.status === 'IN_TRANSIT' ? Math.max(l.live, (l.step / (l.flow.length - 1)) * 100) : (l.step / (l.flow.length - 1)) * 100;
  const label =
    l.status === 'IN_TRANSIT' ? `En route · ${Math.round(l.live)}% · ETA ${l.live >= 75 ? '45 min' : l.live >= 40 ? '1 h 20 m' : '2 h 10 m'}`
      : l.status === 'OFFLOADING' ? 'Offloading · second weight pending'
        : l.status === 'PENDING_PAYMENT' ? `${l.qty ? (l.qty / 1000).toFixed(1) + ' t delivered · ' : ''}${loadTermNote(l)}`
          : `${lgWrap(l.status).status} · step ${l.step + 1} of ${l.flow.length}`;
  return `<div class="dsh-lg-progress"><div class="dsh-lg-progress-head"><span>${label}</span><span>${Math.round(pct)}%</span></div>
    <div class="dsh-lg-progress-track"><span class="dsh-lg-progress-fill" data-live-pct style="width:${pct}%"></span></div></div>`;
}

export function loadTele(l: Consignment, role: LoadRole = 'supplier'): string {
  if (l.status !== 'IN_TRANSIT') return '';
  return `<div class="dsh-lg-tele" data-live="${l.id}">
    <span class="dsh-live-dot"></span>
    <div class="dsh-lg-tele-grid">
      <div><span class="l">Progress</span><span class="v" data-live-pct-txt>${Math.round(l.live)}%</span></div>
      <div><span class="l">ETA</span><span class="v" data-live-eta>${l.live >= 75 ? '45 min' : l.live >= 40 ? '1 h 20 m' : '2 h 10 m'}</span></div>
      <div><span class="l">Speed</span><span class="v">${Math.round(40 + l.live * 0.35)} km/h</span></div>
      <div><span class="l">Last ping</span><span class="v" data-live-ping>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
    </div>
    ${routeMap(zRouteStart(l, role), zRouteEnd(l, role), { x: 16, y: 60 }, { x: 76, y: 42 }, Math.min(l.live, 95))}
  </div>`;
}

export function loadWeights(l: Consignment): string {
  if (!l.weight1 && !l.weight2 && !l.qty) return '';
  const net = l.qty || (l.weightMode === 'weighbridge' ? Math.abs(l.weight2 - l.weight1) : l.inputKg || l.bags * 50 + l.buckets * l.bucketKg);
  const cells = l.weightMode === 'weighbridge'
    ? `
      <div><span class="l">First weight</span><span class="v">${l.weight1 ? l.weight1.toLocaleString() + ' kg' : '—'}</span></div>
      <div><span class="l">Second weight</span><span class="v">${l.weight2 ? l.weight2.toLocaleString() + ' kg' : '—'}</span></div>
      <div><span class="l">Net quantity</span><span class="v strong">${net ? net.toLocaleString() + ' kg' : '—'}</span></div>
      <div><span class="l">Weighbridge slip</span><span class="v">${l.slip ? pill(l.slip, 'blue') : '—'}</span></div>`
    : `
      <div><span class="l">${l.weightMode === 'buckets' ? 'Bucket capacity' : 'Scale · bucket'}</span><span class="v">${l.bucketKg} kg</span></div>
      <div><span class="l">Bags / Buckets</span><span class="v">${l.bags || '—'} / ${l.buckets || '—'}</span></div>
      <div><span class="l">Net quantity</span><span class="v strong">${net ? net.toLocaleString() + ' kg' : '—'}</span></div>
      <div><span class="l">${l.weightMode === 'buckets' ? 'Load photos' : 'Scale photos'}</span><span class="v">${l.pics ? pill(l.pics + ' captured', 'blue') : '—'}</span></div>`;
  return `<div class="dsh-lg-weights">${cells}</div>`;
}

export function loadAmount(l: Consignment, role: LoadRole = 'supplier'): string {
  if (!l.qty) return '';
  const party = role === 'receiver' ? 'offtaker' : 'supplier';
  const price = zpriceFor(l, party);
  const amount = zamountFor(l, party);
  return `<div class="dsh-lg-amount">
    <div><span class="l">Quantity</span><span class="v">${(l.qty / 1000).toFixed(2)} t</span></div>
    <div><span class="l">Rate</span><span class="v">${loadMoney(price)} / t</span></div>
    <div><span class="l">Amount</span><span class="v strong">${loadMoney(amount)}</span></div>
    <div><span class="l">Terms</span><span class="v">${loadTerm(l)}</span></div>
  </div>`;
}

export function loadWeighForm(l: Consignment, point: 'w1' | 'w2'): string {
  const isW1 = point === 'w1';
  return `<div class="dsh-lg-form">
    <div class="dsh-lg-form-title">${isW1 ? 'First weight' : 'Second weight'} <span class="dsh-lg-form-note">${isW1 ? 'truck on the scale at the farm' : 'truck on the scale at delivery'}</span></div>
    <div class="dsh-lg-form-row">
      <input class="dsh-input" data-wg-id="${l.id}" data-wg="${point}" inputmode="numeric" placeholder="Weight in kg" value="${(isW1 ? l.weight1 : l.weight2) || ''}" />
      ${uploadBtn('Photo', 'ghost', 'image/*', { bucket: 'weighbridge-tickets', on: 'lgPhoto', key: 'lg-photo' })}
    </div>
    <div class="dsh-btn-row">${jsBtn(isW1 ? 'Submit First Weight' : 'Submit Second Weight', 'primary sm', 'lgWeigh', l.id + ':' + point, isW1 ? 'First weight recorded — net on second weight' : 'Second weight recorded — net calculated, payment pending')}</div>
  </div>`;
}

export function loadScaleForm(l: Consignment): string {
  return `<div class="dsh-lg-form">
    <div class="dsh-lg-form-title">Scale measurement <span class="dsh-lg-form-note">weigh one bucket, then count every bucket</span></div>
    <div class="dsh-lg-form-grid">
      <input class="dsh-input" data-wg-id="${l.id}" data-wg="bucketkg" inputmode="numeric" placeholder="Bucket weight (kg)" value="${l.bucketKg || ''}" />
      <input class="dsh-input" data-wg-id="${l.id}" data-wg="bags" inputmode="numeric" placeholder="Bags (50 kg)" value="${l.bags || ''}" />
      <input class="dsh-input" data-wg-id="${l.id}" data-wg="buckets" inputmode="numeric" placeholder="Buckets" value="${l.buckets || ''}" />
      <input class="dsh-input" data-wg-id="${l.id}" data-wg="kgs" inputmode="numeric" placeholder="or total kgs" value="${l.inputKg || ''}" />
    </div>
    <div class="dsh-lg-form-row">
      <span class="dsh-lg-form-note">Take a picture of the scale reading and the full load.</span>
      ${uploadBtn('Photo', 'ghost', 'image/*', { bucket: 'weighbridge-tickets', on: 'lgPhoto', key: 'lg-photo' })}
    </div>
    <div class="dsh-btn-row">${jsBtn('Confirm Final Load', 'primary sm', 'lgCount', l.id, 'Load counted — amount calculated, payment pending')}</div>
  </div>`;
}

export function loadBucketForm(l: Consignment): string {
  return `<div class="dsh-lg-form">
    <div class="dsh-lg-form-title">Bucket count <span class="dsh-lg-form-note">capacity per bucket × buckets counted — no first weight needed</span></div>
    <div class="dsh-lg-form-grid">
      <input class="dsh-input" data-wg-id="${l.id}" data-wg="bucketkg" inputmode="numeric" placeholder="Bucket capacity (kg)" value="${l.bucketKg || ''}" />
      <input class="dsh-input" data-wg-id="${l.id}" data-wg="buckets" inputmode="numeric" placeholder="Buckets counted" value="${l.buckets || ''}" />
      <input class="dsh-input" data-wg-id="${l.id}" data-wg="bags" inputmode="numeric" placeholder="Bags (50 kg)" value="${l.bags || ''}" />
    </div>
    <div class="dsh-lg-form-row">
      <span class="dsh-lg-form-note">Take a picture of the full load and the bucket count.</span>
      ${uploadBtn('Photo', 'ghost', 'image/*', { bucket: 'weighbridge-tickets', on: 'lgPhoto', key: 'lg-photo' })}
    </div>
    <div class="dsh-btn-row">${jsBtn('Confirm Bucket Count', 'primary sm', 'lgCount', l.id, 'Load counted — amount calculated, payment pending')}</div>
  </div>`;
}

/* ---------- Toasts ---------- */
let toastBox: HTMLElement | null = null;
export function toast(message: string, kind: 'success' | 'info' | 'warn' | 'error' = 'success'): void {
  if (!toastBox) {
    toastBox = document.createElement('div');
    toastBox.className = 'dsh-toasts';
    document.body.appendChild(toastBox);
  }
  const el = document.createElement('div');
  el.className = `dsh-toast ${kind}`;
  el.innerHTML = `${svg(kind === 'error' ? ICON.alert : kind === 'info' ? ICON.bell : kind === 'warn' ? ICON.alert : ICON.check)}<span>${message.replace(/</g, '&lt;')}</span>`;
  toastBox.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 3400);
}

function sendMessage(chatEl: HTMLElement | null): void {
  const inp = chatEl?.querySelector<HTMLInputElement>('.dsh-chat-input .dsh-input');
  const body = chatEl?.querySelector<HTMLElement>('.dsh-chat-body');
  const text = (inp?.value || '').trim();
  if (text && body) {
    body.insertAdjacentHTML('beforeend', `<div class="dsh-bubble sent">${text.replace(/</g, '&lt;')}<span class="t">Now</span></div>`);
    body.scrollTop = body.scrollHeight;
    inp!.value = '';
  }
  toast('Message sent');
}

function orderDetailHtml(o: MarketOrder, role: MarketRole = 'buyer'): string {
  return `
  <div class="dsh-drawer-row">${pill(o.status, mkWrap(o.status).tone)}<span class="dsh-drawer-note">${o.placedAt}</span></div>
  ${marketSteps(o)}
  <div class="dsh-drawer-grid">
    <div><span class="l">Buyer</span><span class="v">${zBuyerName(o, role)}</span></div>
    <div><span class="l">Delivery</span><span class="v">${o.delivery}</span></div>
    <div><span class="l">Address</span><span class="v">${zBuyerAddr(o, role)}</span></div>
    <div><span class="l">Payment</span><span class="v">${o.payment}</span></div>
    <div><span class="l">Items</span><span class="v">${o.items.reduce((s, i) => s + i.qty, 0)}</span></div>
    <div><span class="l">Total</span><span class="v strong">${marketMoney(o.total)}</span></div>
  </div>
  <div class="dsh-drawer-sec">Items</div>
  ${o.items.map((i) => `
    <div class="dsh-drawer-line">
      <span class="dsh-drawer-thumb">${img(i.thumb, 'xs')}</span>
      <span class="dsh-drawer-line-main">${i.name}<span class="dsh-drawer-line-sub">${zSellerName(i.seller, role)} · ${i.unit} · ${marketMoney(i.price)} each</span></span>
      <span class="dsh-drawer-line-qty">×${i.qty}</span>
      <span class="dsh-drawer-line-total">${marketMoney(i.price * i.qty)}</span>
    </div>`).join('')}
  <div class="dsh-drawer-sec">Timeline</div>
  ${o.history.map((h) => `<div class="dsh-drawer-event"><span class="t">${h.t}</span><span class="d">${h.d}</span></div>`).join('')}`;
}

function loadDetailHtml(l: Consignment, role: LoadRole): string {
  const st = lgWrap(l.status);
  return `
  <div class="dsh-drawer-row">${pill(st.status, st.tone)}${loadTerm(l)}<span class="dsh-drawer-note">${l.contract} · Due ${l.due}</span></div>
  <div class="dsh-lg-meta-row">
    <span>${svg(ICON.route)} ${zRoute(l, role)}</span>
    <span>${svg(ICON.truck)} ${l.driver || 'No driver assigned'} · ${l.truck || '—'}</span>
    <span>${svg(ICON.contracts)} ${l.contract} · ${l.poRef} · ${l.order}</span>
  </div>
  <div class="dsh-lg-meta-row">
    <span>${svg(ICON.users)} Supplier: ${zFromName(l, role)}</span>
    <span>${svg(ICON.buy)} Receiver: ${zToName(l, role)}</span>
    <span>${svg(ICON.weighbridge)} ${weightModeLabel(l.weightMode, l.bucketKg)}</span>
  </div>
  ${loadSteps(l)}
  ${loadProgressBar(l)}
  ${loadWeights(l)}
  ${loadAmount(l, role)}
  <div class="dsh-drawer-sec">Timeline</div>
  ${zTimeline(l, role)}`;
}

function productDetailHtml(p: MarketProduct): string {
  const stock = p.stock <= 0 ? pill('Out of stock', 'red') : p.stock < 10 ? pill(`${p.stock} left`, 'amber') : pill('In stock', 'green');
  return `
  <div class="dsh-drawer-row">${pill(p.category, 'blue')}${stock}</div>
  <div class="dsh-drawer-line">
    <span class="dsh-drawer-thumb">${img(p.thumb, 'md')}</span>
    <span class="dsh-drawer-line-main">${p.name}<span class="dsh-drawer-line-sub">${ZVIDA_COUNTERPARTY} · ${p.unit}</span></span>
    <span class="dsh-drawer-line-total">${marketMoney(p.price)}</span>
  </div>
  <div class="dsh-drawer-grid">
    <div><span class="l">Rating</span><span class="v">${stars(p.rating)} <span class="dsh-drawer-note">${p.reviews} reviews</span></span></div>
    <div><span class="l">Unit</span><span class="v">${p.unit}</span></div>
    <div><span class="l">Seller</span><span class="v">${ZVIDA_COUNTERPARTY}</span></div>
    <div><span class="l">Stock</span><span class="v">${p.stock}</span></div>
  </div>`;
}

function closeDetail(): void {
  document.querySelectorAll('[data-drawer-mask], [data-drawer]').forEach((el) => el.remove());
}

function openDetail(title: string, body: string, foot = ''): void {
  const root = document.getElementById('dsh-root') as HTMLElement;
  closeDetail();
  root.insertAdjacentHTML('beforeend', `<div class="dsh-drawer-mask" data-drawer-mask></div><div class="dsh-drawer" data-drawer>
    <div class="dsh-drawer-head">
      <span class="dsh-drawer-title">${title}</span>
      <button type="button" class="dsh-drawer-close" data-drawer-close aria-label="Close">${svg(ICON.x)}</button>
    </div>
    <div class="dsh-drawer-body">${body}</div>
    ${foot ? `<div class="dsh-drawer-foot">${foot}</div>` : ''}
  </div>`);
  requestAnimationFrame(() => {
    root.querySelector('.dsh-drawer')?.classList.add('show');
    root.querySelector('.dsh-drawer-mask')?.classList.add('show');
  });
}

export function wireToasts(root: HTMLElement): void {
  const key = '_dsh_wired';
  if ((root as unknown as Record<string, unknown>)[key]) return;
  (root as unknown as Record<string, unknown>)[key] = true;

  const openCard = (card: HTMLElement): void => {
    const title =
      card.querySelector('.dsh-item-title, .dsh-kpi-label, .dsh-shop-name, .dsh-queue-title, .dsh-feed-title, .dsh-doc-name, .dsh-conv-name')?.textContent?.trim() || 'Details';
    const open = card.getAttribute('data-open');
    if (open) {
      if (window.location.hash === open) {
        card.classList.remove('dsh-flash');
        void card.offsetWidth;
        card.classList.add('dsh-flash');
      } else {
        window.location.hash = open;
      }
      toast(`Opening: ${title}`, 'info');
    }
  };

  root.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;

    const modal = target.closest<HTMLElement>('[data-modal-close], [data-modal-mask]');
    if (modal) {
      e.preventDefault();
      closeModal();
      return;
    }

    const dis = target.closest<HTMLElement>('[data-disclose]');
    if (dis) {
      e.preventDefault();
      const wrap = dis.closest<HTMLElement>('.dsh-disclose');
      const open = wrap?.classList.toggle('open') ?? false;
      dis.setAttribute('aria-expanded', String(open));
      return;
    }

    const rt = target.closest<HTMLElement>('[data-retry]');
    if (rt) {
      e.preventDefault();
      const btnEl = rt as HTMLButtonElement;
      const original = btnEl.innerHTML;
      btnEl.disabled = true;
      btnEl.innerHTML = spinner();
      void hydrateLive().finally(() => {
        btnEl.disabled = false;
        const still = btnEl.closest('[data-offline]') || btnEl.closest('.dsh-error-state');
        btnEl.innerHTML = still ? original : 'Retried';
        if (!still) setTimeout(() => { if (btnEl.isConnected) btnEl.innerHTML = original; }, 1600);
      });
      return;
    }

    const dc = target.closest<HTMLElement>('[data-drawer-close], [data-drawer-mask]');
    if (dc) {
      e.preventDefault();
      closeDetail();
      return;
    }

    const dl = target.closest<HTMLElement>('[data-download]');
    if (dl) {
      e.preventDefault();
      const d = DL[dl.getAttribute('data-download') || ''];
      if (d) {
        const blob = new Blob([d.content], { type: d.type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = d.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(url), 800);
        toast(`Downloaded ${d.name}`, 'info');
      }
      return;
    }

    const up = target.closest<HTMLElement>('[data-upload]');
    if (up) {
      e.preventDefault();
      const inp = document.createElement('input');
      inp.type = 'file';
      inp.accept = up.getAttribute('data-upload-accept') || '*';
      inp.onchange = () => {
        const f = inp.files?.[0];
        if (!f) return;
        if (!liveConfigured()) {
          toast(`${f.name} attached`, 'info');
          return;
        }
        const opts: UploadOpts = {
          bucket: (up.getAttribute('data-upload-bucket') as UploadOpts['bucket']) || 'listing-photos',
          on: up.getAttribute('data-upload-on') || undefined,
          key: up.getAttribute('data-upload-key') || undefined,
        };
        void doUpload(f, opts, up);
      };
      inp.click();
      return;
    }

    const rrow = target.closest<HTMLElement>('[data-row-open]');
    if (rrow) {
      e.preventDefault();
      const hash = rrow.getAttribute('data-row-open') || '';
      toast(`Opening: ${hash.replace('#', '')}`, 'info');
      window.location.hash = hash;
      return;
    }

    const js = target.closest<HTMLElement>('[data-js]');
    if (js) {
      e.preventDefault();
      const [fn, ...rest] = (js.getAttribute('data-js') || '').split(':');
      const payload = rest.join(':');
      if (JS[fn]) JS[fn](payload, js);
      return;
    }

    const tab = target.closest<HTMLElement>('.dsh-tab');
    if (tab) {
      e.preventDefault();
      const wrap = tab.closest('.dsh-tabs');
      wrap?.querySelectorAll('.dsh-tab').forEach((t) => t.classList.toggle('active', t === tab));
      const group = wrap?.getAttribute('data-tab-group');
      if (group) {
        root.querySelectorAll<HTMLElement>(`[data-tab-group="${group}"][data-tab]`).forEach((el) => {
          el.style.display = el.getAttribute('data-tab') === tab.getAttribute('data-tab') ? '' : 'none';
        });
      }
      toast(`Showing: ${tab.dataset.tab || tab.textContent}`);
      return;
    }

    const chip = target.closest<HTMLElement>('.dsh-chip');
    if (chip) {
      const wrap = chip.closest('.dsh-chips');
      wrap?.querySelectorAll('.dsh-chip').forEach((c) => c.classList.toggle('active', c === chip));
      const group = wrap?.getAttribute('data-filter-group');
      if (group) {
        const v = chip.getAttribute('data-filter-value') || '';
        root.querySelectorAll<HTMLElement>(`[data-filter-group="${group}"]`).forEach((el) => {
          const active = v === 'Active' && el.getAttribute('data-filter-active') === '1';
          el.style.display = v === 'All' || active || el.getAttribute('data-filter-value') === v ? '' : 'none';
        });
      }
    }

    const mrow = target.closest<HTMLElement>('.dsh-match');
    if (mrow) {
      e.preventDefault();
      const wrap = mrow.closest('.dsh-panel-body, .dsh-match');
      wrap?.querySelectorAll('.dsh-match').forEach((m) => m.classList.toggle('selected', m === mrow));
      const t = mrow.querySelector('.dsh-match-title')?.textContent?.trim() || 'Candidate';
      toast(`${t} selected for matching`);
      return;
    }

    const conv = target.closest<HTMLElement>('.dsh-conv-item');
    if (conv) {
      const name = conv.querySelector('.dsh-conv-name')?.textContent || 'Conversation';
      toast(`Conversation: ${name}`, 'info');
      return;
    }

    const sendBtn = target.closest<HTMLElement>('.dsh-chat-send');
    if (sendBtn) {
      sendMessage(sendBtn.closest('.dsh-chat'));
      return;
    }

    const quick = target.closest<HTMLElement>('.dsh-chat-quick .dsh-chip');
    if (quick) {
      const chatEl = quick.closest<HTMLElement>('.dsh-chat');
      const inp = chatEl?.querySelector<HTMLInputElement>('.dsh-chat-input .dsh-input');
      if (inp) inp.value = quick.textContent?.trim() || '';
      sendMessage(chatEl);
      return;
    }

    const thumb = target.closest<HTMLElement>('.dsh-gallery .dsh-thumb');
    if (thumb) {
      e.preventDefault();
      const key = thumb.closest<HTMLElement>('[data-gallery-key]')?.getAttribute('data-gallery-key') || '';
      if (key && JS.openGallery) {
        JS.openGallery(key, thumb);
        return;
      }
      toast('Opening product gallery', 'info');
      return;
    }

    const card = target.closest<HTMLElement>('.dsh-item, .dsh-lg-card, .dsh-kpi, .dsh-shop-card, .dsh-queue-card, .dsh-feed-item, .dsh-doc');
    if (card && !target.closest('button, a, input, select, textarea, label')) {
      const role = (card.closest<HTMLElement>('[data-mk-role]')?.getAttribute('data-mk-role') || card.getAttribute('data-lg-role') || 'buyer') as 'buyer' | 'seller' | 'admin' | 'driver';
      const oKey = card.getAttribute('data-key');
      if (oKey && oKey.startsWith('mk')) {
        const o = marketOrder(oKey);
        if (o) {
          openDetail(`Order ${o.ref}`, orderDetailHtml(o, role), marketOrderFoot(o, role));
          return;
        }
      }
      const lKey = card.getAttribute('data-live-card');
      if (lKey) {
        const l = load(lKey);
        if (l) {
          const lrole = (card.getAttribute('data-lg-role') || 'supplier') as 'supplier' | 'driver' | 'receiver' | 'admin';
          openDetail(`Load ${l.ref}`, loadDetailHtml(l, lrole), lgFoot(l, lrole));
          return;
        }
      }
      const pid = card.getAttribute('data-product');
      if (pid) {
        const p = marketProduct(pid);
        if (p) {
          openDetail(p.name, productDetailHtml(p), `${jsBtn('Add to Cart', 'primary sm', 'marketAdd', p.id, `${p.name} added to cart`)}${jsBtn('Buy Now', 'ghost sm', 'marketBuy', p.id, `Buying ${p.name}`)}`);
          return;
        }
      }
      if (card.hasAttribute('data-open')) {
        openCard(card);
        return;
      }
    }

    const wfEl = target.closest<HTMLElement>('[data-wf]');
    if (wfEl && wfEl.dataset.wf && wfEl.dataset.wfA) {
      e.preventDefault();
      if (applyWf(wfEl.dataset.wf, wfEl.dataset.wfA, root, wfEl)) return;
    }

    const t = target.closest('[data-toast]') as HTMLElement | null;
    if (t && t.dataset.toast) {
      const href = (t as HTMLAnchorElement).getAttribute('href');
      if (t.tagName === 'A' && href && href !== '#') {
        toast(t.dataset.toast);
      } else {
        e.preventDefault();
        toast(t.dataset.toast);
      }
    }
  });

  root.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeDetail();
      closeModal();
      return;
    }
    if (e.key !== 'Enter') return;
    const search = (e.target as HTMLElement).closest<HTMLInputElement>('[data-mkt-search]');
    if (search) {
      e.preventDefault();
      const q = search.value.trim().toLowerCase();
      root.querySelectorAll<HTMLElement>('.dsh-shop-card[data-product]').forEach((card) => {
        const name = card.querySelector<HTMLElement>('.dsh-shop-name')?.textContent?.toLowerCase() || '';
        const seller = card.querySelector<HTMLElement>('.dsh-shop-sub')?.textContent?.toLowerCase() || '';
        card.style.display = !q || name.includes(q) || seller.includes(q) ? '' : 'none';
      });
      toast(q ? `Searching products: ${search.value.trim()}` : 'Showing all products', 'info');
      return;
    }
    const inp = (e.target as HTMLElement).closest<HTMLInputElement>('.dsh-chat-input .dsh-input');
    if (inp) {
      e.preventDefault();
      sendMessage(inp.closest('.dsh-chat'));
    }
  });

  wireForms(root);
}

/* ---------- Modals (confirm / error / success) ---------- */
export function modalHtml(o: { title: string; body: string; foot?: string; tone?: 'default' | 'error' | 'success' }): string {
  return `<div class="dsh-modal-mask" data-modal-mask>
    <div class="dsh-modal ${o.tone && o.tone !== 'default' ? `tone-${o.tone}` : ''}" role="dialog" aria-modal="true" aria-label="${o.title}">
      <div class="dsh-modal-head"><span class="dsh-modal-title">${o.title}</span><button type="button" class="dsh-modal-close" data-modal-close aria-label="Close">${svg(ICON.x)}</button></div>
      <div class="dsh-modal-body">${o.body}</div>
      ${o.foot ? `<div class="dsh-modal-foot">${o.foot}</div>` : ''}
    </div>
  </div>`;
}

let confirmAction: (() => void) | null = null;

export function openModal(html: string): void {
  closeModal();
  const host = document.createElement('div');
  host.setAttribute('data-modal-host', '');
  host.innerHTML = html;
  document.body.appendChild(host.firstElementChild as HTMLElement);
  document.body.classList.add('dsh-no-scroll');
  requestAnimationFrame(() => document.querySelector('.dsh-modal-mask')?.classList.add('show'));
}

export function closeModal(): void {
  document.body.classList.remove('dsh-no-scroll');
  document.querySelectorAll('[data-modal-host]').forEach((el) => el.remove());
}

export function confirmModal(title: string, message: string, confirmLabel: string, onConfirm: () => void, danger = true): void {
  confirmAction = onConfirm;
  openModal(modalHtml({
    title,
    tone: danger ? 'error' : 'default',
    body: `<p class="dsh-modal-msg">${message}</p>`,
    foot: `<div class="dsh-btn-row right">${jsBtn('Cancel', 'ghost', 'closeModal')}${jsBtn(confirmLabel, danger ? 'danger' : 'primary', 'runConfirmAction')}</div>`,
  }));
}

export function errorModal(title: string, message: string, actionLabel = 'Got it'): void {
  openModal(modalHtml({ title, tone: 'error', body: `<p class="dsh-modal-msg">${message}</p>`, foot: `<div class="dsh-btn-row right">${jsBtn(actionLabel, 'primary', 'closeModal')}</div>` }));
}

export function successModal(title: string, message: string, actionLabel = 'Done'): void {
  openModal(modalHtml({ title, tone: 'success', body: `<p class="dsh-modal-msg">${message}</p>`, foot: `<div class="dsh-btn-row right">${jsBtn(actionLabel, 'primary', 'closeModal')}</div>` }));
}

JS.closeModal = () => closeModal();
JS.runConfirmAction = () => {
  const fn = confirmAction;
  closeModal();
  confirmAction = null;
  fn?.();
};

/* ---------- Form validation & feedback ---------- */
export interface FieldVal {
  req?: boolean;
  min?: number;
  max?: number;
  num?: { min?: number; max?: number; step?: number };
  ph?: RegExp;
  msg?: string;
}

export const FORM_RULES: Record<string, FieldVal> = {};
export function formRules(rules: Record<string, FieldVal>): void {
  Object.assign(FORM_RULES, rules);
}

function setFieldError(ctl: HTMLElement, msg: string): void {
  const field = ctl.closest('.dsh-field');
  if (!field) return;
  let err = field.querySelector<HTMLElement>('.dsh-field-err');
  if (!err) {
    err = document.createElement('div');
    err.className = 'dsh-field-err';
    field.appendChild(err);
  }
  err.textContent = msg;
  field.classList.add('invalid');
}

function clearFieldError(ctl: HTMLElement): void {
  const field = ctl.closest('.dsh-field');
  field?.querySelector('.dsh-field-err')?.remove();
  field?.classList.remove('invalid');
}

export function checkField(ctl: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement, spec: FieldVal, show: boolean): boolean {
  clearFieldError(ctl);
  const v = (ctl.value || '').trim();
  const isSelect = ctl.tagName === 'SELECT';
  let msg = '';
  if (isSelect && spec.req && !ctl.value) {
    msg = spec.msg || 'Please choose an option.';
  } else if (spec.req && !isSelect && !v) {
    msg = spec.msg || 'Please fill this in before continuing.';
  } else if (v && !isSelect) {
    if (spec.min !== undefined && v.length < spec.min) msg = `Needs at least ${spec.min} characters.`;
    else if (spec.max !== undefined && v.length > spec.max) msg = `Keep it under ${spec.max} characters.`;
  }
  if (!msg && v && spec.ph && !spec.ph.test(v)) msg = spec.msg || 'Please check the format — e.g. +263 77 123 4567.';
  if (!msg && v && spec.num) {
    const n = parseFloat(v);
    const range = spec.num.min !== undefined && spec.num.max !== undefined ? ` between ${spec.num.min} and ${spec.num.max}` : spec.num.min !== undefined ? ` of at least ${spec.num.min}` : spec.num.max !== undefined ? ` up to ${spec.num.max}` : '';
    if (Number.isNaN(n) || (spec.num.min !== undefined && n < spec.num.min) || (spec.num.max !== undefined && n > spec.num.max)) {
      msg = spec.msg || `Enter a number${range}.`;
    } else if (spec.num.step !== undefined && spec.num.step > 0 && !Number.isNaN(n)) {
      ctl.value = String((Math.round(n / spec.num.step) * spec.num.step).toFixed(2).replace(/\.?0+$/, ''));
    }
  }
  if (msg && show) setFieldError(ctl, msg);
  return !msg;
}

function updatePwCheck(box: HTMLElement, value: string): void {
  const checks: [string, boolean][] = [
    ['len', value.length >= 8],
    ['num', /\d/.test(value)],
    ['up', /[A-Z]/.test(value)],
    ['sym', /[^A-Za-z0-9]/.test(value)],
  ];
  checks.forEach(([k, ok]) => box.querySelector<HTMLElement>(`[data-pw="${k}"]`)?.classList.toggle('ok', ok));
}

function computeValidity(form: HTMLElement): boolean {
  const ctrls = [...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select')];
  let ok = true;
  for (const c of ctrls) {
    if (!c.dataset.val) continue;
    const spec = FORM_RULES[c.dataset.val];
    if (!spec) continue;
    if (!checkField(c, spec, false)) ok = false;
  }
  return ok;
}

function showAllErrors(form: HTMLElement): void {
  const ctrls = [...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>('input, textarea, select')];
  let firstBad: HTMLElement | null = null;
  for (const c of ctrls) {
    if (!c.dataset.val) continue;
    const spec = FORM_RULES[c.dataset.val];
    if (!spec) continue;
    if (!checkField(c, spec, true) && !firstBad) firstBad = c.closest('.dsh-field') as HTMLElement | null;
  }
  if (firstBad) firstBad.scrollIntoView({ block: 'center', behavior: 'smooth' });
}

function updateSubmit(form: HTMLElement): void {
  const btnEl = form.querySelector<HTMLButtonElement>('[data-submit]');
  if (btnEl) {
    const ok = computeValidity(form);
    btnEl.disabled = !ok;
    btnEl.title = ok ? '' : 'Complete the highlighted fields to continue';
  }
}

function ensureCounters(form: HTMLElement): void {
  form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('[data-counter]').forEach((el) => {
    const max = parseInt(el.getAttribute('maxlength') || '160', 10);
    const field = el.closest('.dsh-field');
    const key = el.getAttribute('data-counter') || '';
    if (field && !field.querySelector('[data-count-for]')) {
      const badge = document.createElement('span');
      badge.className = 'dsh-count';
      badge.setAttribute('data-count-for', key);
      badge.textContent = `0/${max}`;
      field.appendChild(badge);
    }
    const out = field?.querySelector<HTMLElement>(`[data-count-for="${key}"]`);
    if (out) out.textContent = `${el.value.length}/${max}`;
  });
}

function beginSubmit(form: HTMLElement): boolean {
  if (!computeValidity(form)) {
    showAllErrors(form);
    toast('Please fix the highlighted fields before saving', 'error');
    return false;
  }
  if (form.hasAttribute('data-submitting')) return false;
  form.setAttribute('data-submitting', '');
  const btnEl = form.querySelector<HTMLButtonElement>('[data-submit]');
  if (btnEl) {
    btnEl.disabled = true;
    btnEl.setAttribute('data-reset', btnEl.textContent || 'Save');
    btnEl.innerHTML = spinner('Saving');
  }
  form.dispatchEvent(new CustomEvent('dsh-valid-submit', { bubbles: true }));
  return true;
}

export function restoreSubmit(form: HTMLElement): void {
  form.removeAttribute('data-submitting');
  const btnEl = form.querySelector<HTMLButtonElement>('[data-submit]');
  if (btnEl) {
    btnEl.disabled = false;
    btnEl.innerHTML = btnEl.getAttribute('data-reset') || 'Save';
  }
}

export function submitBtn(label: string, variant: string, key: string): string {
  return `<button type="button" class="dsh-btn ${variant}" data-submit data-form-submit="${key}">${label}</button>`;
}

export function onValidSubmit(key: string, fn: (form: HTMLElement) => void): void {
  if (typeof document === 'undefined') return;
  const listener = (e: Event): void => {
    const form = (e.target as HTMLElement).closest<HTMLElement>('[data-form]');
    const btn = document.querySelector<HTMLElement>(`[data-form-submit="${key}"]`);
    if (form && btn && form.contains(btn)) fn(form);
  };
  document.addEventListener('dsh-valid-submit', listener as EventListener);
}

export function wireForms(root: HTMLElement): void {
  root.addEventListener('input', (e) => {
    const t = e.target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
    if (!t || !t.isConnected || !t.closest('[data-form]')) return;
    const form = t.closest<HTMLElement>('[data-form]')!;
    t.dataset.touched = '1';
    if (t.dataset.counter !== undefined) {
      const max = parseInt(t.getAttribute('maxlength') || '160', 10);
      const out = form.querySelector<HTMLElement>(`[data-count-for="${t.dataset.counter}"]`);
      if (out) out.textContent = `${(t as HTMLInputElement).value.length}/${max}`;
    }
    if (t.dataset.val) {
      const spec = FORM_RULES[t.dataset.val];
      if (spec) checkField(t, spec, t.dataset.touched === '1');
      if (t.tagName === 'SELECT') {
        const note = form.querySelector<HTMLElement>(`[data-wb-note="${t.dataset.val}"]`);
        if (note) {
          const w = weighbridgeByTown((t as HTMLSelectElement).value);
          note.textContent = w ? `${w.station}, ${w.town} · ${w.lanes} lanes · ${w.hours} · ${w.distanceKm} km from Harare` : '';
          note.style.display = w ? '' : 'none';
        }
      }
      if (t.matches('input[data-wm-mode]')) {
        const wm = t.closest<HTMLElement>('[data-wm]');
        if (wm) {
          const m = (t as HTMLInputElement).value;
          wm.querySelectorAll<HTMLElement>('[data-wm-panel]').forEach((p) => {
            p.style.display = p.getAttribute('data-wm-panel') === m ? '' : 'none';
          });
        }
      }
    }
    if (t.type === 'password' && t === form.querySelector<HTMLInputElement>('input[type="password"]')) {
      const box = form.querySelector<HTMLElement>('[data-pw-check]');
      if (box) updatePwCheck(box, (t as HTMLInputElement).value);
    }
    updateSubmit(form);
  });
  root.addEventListener('submit', (e) => {
    const form = (e.target as HTMLElement).closest<HTMLElement>('[data-form]');
    if (form) {
      e.preventDefault();
      beginSubmit(form);
    }
  });
  root.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>('[data-submit]');
    if (b) {
      e.preventDefault();
      const form = b.closest<HTMLElement>('[data-form]');
      if (form) beginSubmit(form);
    }
  });
}

function animateCounters(root: HTMLElement): void {
  root.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
    const target = parseFloat(el.dataset.count || '0');
    const dur = 900;
    const t0 = performance.now();
    const fmt = target % 1 !== 0 ? 1 : 0;
    const tick = (now: number) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(fmt);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

/* ---------- Freight documents ---------- */
export function loadDocs(l: Consignment): string {
  const lines = (title: string, extra: string[]): string =>
    [title, `Reference: ${l.ref}`, `Contract: ${l.contract}`, `Order: ${l.order}`, `PO: ${l.poRef}`,
      `Commodity: ${l.commodity}`, `Supplier: ${l.supplier}`, `Receiver: ${l.receiver}`,
      `Route: ${l.from} -> ${l.dest}`, `Driver: ${l.driver} · Truck: ${l.truck} / ${l.trailer}`,
      `First weight: ${l.weight1.toLocaleString()} kg`, `Second weight: ${l.weight2.toLocaleString()} kg`,
      `Net: ${l.qty.toLocaleString()} kg (${(l.qty / 1000).toFixed(2)} t)`, `Rate: ${loadMoney(l.unitPrice)} / t`,
      `Amount: ${loadMoney(l.amount)}`, `Terms: ${l.payTerm} · ${loadTermNote(l)}`,
      ...extra, 'Generated by ZVIDA Freight Ops'].join('\n');
  registerDownload(l.id + '-invoice', `Invoice_${l.ref}.txt`, lines('INVOICE', [`Due: ${l.due}`]), 'text/plain');
  registerDownload(l.id + '-dn', `DeliveryNote_${l.ref}.txt`, lines('DELIVERY NOTE', ['Signed at destination']), 'text/plain');
  registerDownload(l.id + '-slip', `WeighbridgeSlip_${l.ref}.txt`, lines('WEIGHBRIDGE SLIP', [`Slip: ${l.slip || 'WB-' + l.ref.slice(-4)}`]), 'text/plain');
  registerDownload(l.id + '-po', `PO_${l.ref}.txt`, lines('PURCHASE ORDER', [`Order number: ${l.order}`]), 'text/plain');
  return `<div class="dsh-lg-docs">
    ${downloadBtn('Invoice', 'ghost sm', l.id + '-invoice')}
    ${downloadBtn('Delivery Note', 'ghost sm', l.id + '-dn')}
    ${downloadBtn('Weighbridge Slip', 'ghost sm', l.id + '-slip')}
    ${downloadBtn('PO', 'ghost sm', l.id + '-po')}
  </div>`;
}

export function freightFeed(loads: Consignment[], limit = 5, target = '#deliveries'): string {
  const events = loads
    .flatMap((l) => l.history.map((h) => ({ l, h })))
    .sort((a, b) => b.l.ref.localeCompare(a.l.ref))
    .slice(0, limit);
  return `<div class="dsh-lg-feed">${events
    .map(({ l, h }) => `<div class="dsh-lg-feed-item" data-open="${target}">
      <span class="dsh-lg-feed-ico">${svg(ICON.clock)}</span>
      <div class="dsh-lg-feed-body">
        <div class="dsh-lg-feed-top"><span>${l.ref} · ${h.t}</span><span class="t">${h.d.slice(0, 40)}</span></div>
        <div class="dsh-lg-feed-sub">${l.commodity} · ${l.supplier} → ${l.receiver}</div>
      </div>
    </div>`).join('')}</div>`;
}

/* ============================================================
   ZVIDA physical documents — Purchase Order, Delivery Note,
   Invoice (per-party pricing) and Payment Confirmation.
   Issued automatically as a contract moves through milestones.
   ============================================================ */
type ZdocRole = 'supplier' | 'receiver' | 'driver' | 'admin';
type ZdocKind = 'PO' | 'DN' | 'INV' | 'FIS' | 'PC' | 'POD';

const ZDOC_STYLES = `
.z-doc{font-family:Georgia,'Times New Roman',serif;color:#111;line-height:1.5;background:#fff;margin:0 auto;max-width:760px;}
.z-inner{padding:4px 2px;}
.z-head{display:flex;justify-content:space-between;align-items:center;gap:16px;border-bottom:3px double #1a1a1a;padding-bottom:14px;margin-bottom:14px;}
.z-brandbox{display:flex;align-items:center;gap:14px;}
.z-logo{width:76px;height:76px;object-fit:contain;flex:none;border-radius:10px;box-shadow:0 1px 4px rgba(0,0,0,.14);border:1px solid #e2e2da;}
.z-brand{font-size:27px;font-weight:700;letter-spacing:.4px;color:#0f5132;}
.z-tag{font-size:12.5px;color:#556;font-style:italic;margin-top:2px;}
.z-addr{font-size:11.5px;color:#444;margin-top:7px;line-height:1.6;}
.z-docno{text-align:right;flex:none;}
.z-docno-kind{display:block;font-size:20px;font-weight:700;color:#0f5132;text-transform:uppercase;letter-spacing:1.2px;}
.z-docno-num{display:block;font-size:12.5px;color:#333;font-weight:600;margin-top:4px;letter-spacing:.5px;}
.z-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px 20px;background:#f7f7f3;border:1px solid #ddd;border-radius:8px;padding:12px 15px;margin-bottom:14px;}
.z-grid>div{display:flex;flex-direction:column;gap:1px;}
.z-k{font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:#777;font-weight:600;}
.z-v{font-size:13.5px;font-weight:600;color:#111;}
.z-v.strong{color:#0f5132;font-size:15px;}
.z-parties{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;}
.z-parties>div{border:1px solid #ddd;border-radius:8px;padding:12px 15px;background:#fbfbf8;}
.z-role{font-size:10px;text-transform:uppercase;letter-spacing:.8px;color:#777;font-weight:600;margin-bottom:4px;}
.z-name{font-size:15px;font-weight:700;color:#111;}
.z-sub{font-size:12px;color:#555;margin-top:2px;}
.z-table{width:100%;border-collapse:collapse;font-size:13px;margin-bottom:14px;}
.z-table th{background:#0f5132;color:#fff;text-align:left;padding:8px 10px;font-size:11px;text-transform:uppercase;letter-spacing:.6px;font-weight:600;}
.z-table th.r,.z-table td.r{text-align:right;}
.z-table td{padding:9px 10px;border-bottom:1px solid #e4e4de;color:#111;}
.z-table tfoot td{font-weight:700;background:#f2f2ec;font-size:14px;border-bottom:none;}
.z-inwords{border:1px solid #ddd;border-left:4px solid #0f5132;border-radius:6px;padding:10px 14px;margin-bottom:14px;display:flex;flex-direction:column;gap:3px;background:#fbfbf8;}
.z-note{font-size:12px;color:#555;margin-bottom:18px;}
.z-signs{display:flex;justify-content:space-between;gap:18px;margin:26px 0 10px;}
.z-sign{flex:1;text-align:center;}
.z-line{border-bottom:1.5px solid #111;margin-bottom:8px;}
.z-sign-label{font-size:12px;font-weight:700;color:#111;}
.z-sign-sub{font-size:11px;color:#666;margin-top:2px;}
.z-foot{font-size:10.5px;color:#777;border-top:1px solid #ccc;padding-top:10px;margin-top:22px;text-align:center;}
.z-print{background:#fff;margin:0;padding:30px;}
@media print{.z-print{background:#fff;padding:0;}body{print-color-adjust:exact;-webkit-print-color-adjust:exact;}}`;

type ZdocMetaOf = { label: string; prefix: string; file: string };
const ZDOC_META: Record<ZdocKind, ZdocMetaOf> = {
  PO: { label: 'Purchase Order', prefix: 'PO', file: 'Purchase_Order' },
  DN: { label: 'Delivery Note', prefix: 'DN', file: 'Delivery_Note' },
  INV: { label: 'Invoice', prefix: 'INV', file: 'Invoice' },
  FIS: { label: 'ZIMRA e-Invoice', prefix: 'FIS', file: 'ZIMRA_eInvoice' },
  PC: { label: 'Payment Confirmation', prefix: 'PC', file: 'Payment_Confirmation' },
  POD: { label: 'Proof of Delivery', prefix: 'POD', file: 'Proof_of_Delivery' },
};

const ZDOC_TRIGGER: Record<ZdocKind, string[]> = {
  PO: ['PENDING', 'LOADING', 'WEIGHED_1', 'IN_TRANSIT', 'OFFLOADING', 'WEIGHED_2', 'PENDING_PAYMENT', 'PAID'],
  DN: ['LOADING', 'WEIGHED_1', 'IN_TRANSIT', 'OFFLOADING', 'WEIGHED_2', 'PENDING_PAYMENT', 'PAID'],
  INV: ['PENDING_PAYMENT', 'PAID'],
  FIS: ['PENDING_PAYMENT', 'PAID'],
  PC: ['PAID'],
  POD: ['OFFLOADING', 'WEIGHED_2', 'PENDING_PAYMENT', 'PAID'],
};

interface ZdocDef {
  key: string;
  kind: ZdocKind;
  label: string;
  name: string;
  meta: string;
  sheet: string;
  print: string;
}

const ZDOCS: Record<string, ZdocDef> = {};

function znum(l: Consignment, prefix: string): string {
  return prefix + '-2026-' + String(l.contract.replace(/\D/g, '')).padStart(4, '0');
}

const ZIMRA_VAT_RATE = 0.15;

function zfisSeries(): string {
  const seed = Date.now().toString(36).toUpperCase();
  return seed.slice(-7).padStart(7, '0');
}

function zfisCheck(series: string): string {
  let sum = 0;
  for (let i = 0; i < series.length; i++) sum += parseInt(series[i], 10) * (i + 1);
  return String(97 - (sum % 97)).padStart(2, '0');
}

function zfisNumber(l: Consignment, party: 'supplier' | 'offtaker'): string {
  const series = zfisSeries();
  return series + zfisCheck(series) + (party === 'offtaker' ? 'O' : 'S');
}

function zfisCode(l: Consignment, party: 'supplier' | 'offtaker'): string {
  const base = l.contract.replace(/\D/g, '') + l.ref.replace(/\D/g, '') + party;
  let h = 0;
  for (let i = 0; i < base.length; i++) h = (h * 31 + base.charCodeAt(i)) >>> 0;
  return (h >>> 0).toString(16).toUpperCase().padStart(8, '0');
}

function zvatSplit(total: number): { net: number; vat: number } {
  const net = Math.round((total / (1 + ZIMRA_VAT_RATE)) * 100) / 100;
  return { net, vat: Math.round((total - net) * 100) / 100 };
}

function zqty(l: Consignment): string {
  return l.qty ? (l.qty / 1000).toFixed(2) + ' t' : '—';
}

export function zpriceFor(l: Consignment, party: 'supplier' | 'offtaker'): number {
  return party === 'offtaker' ? Math.max(1, Math.round(l.unitPrice * 1.2)) : l.unitPrice;
}

export function zamountFor(l: Consignment, party: 'supplier' | 'offtaker'): number {
  return l.qty ? Math.round((l.qty / 1000) * zpriceFor(l, party)) : 0;
}

function zinWords(amount: number): string {
  if (!amount) return 'To be calculated on weigh-out';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const three = (n: number): string => {
    const parts: string[] = [];
    const h = Math.floor(n / 100);
    const t = n % 100;
    if (h) parts.push(ones[h] + ' Hundred');
    if (t) {
      if (t < 20) parts.push(ones[t]);
      else parts.push(tens[Math.floor(t / 10)] + (t % 10 ? '-' + ones[t % 10] : ''));
    }
    return parts.join(' ');
  };
  const whole = Math.floor(amount);
  const cents = Math.round((amount - whole) * 100);
  let out = '';
  const millions = Math.floor(whole / 1000000);
  const thousands = Math.floor((whole % 1000000) / 1000);
  const rest = whole % 1000;
  if (millions) out += three(millions) + ' Million ';
  if (thousands) out += three(thousands) + ' Thousand ';
  if (rest || !out) out += three(rest);
  out = out.trim() + ' US Dollars';
  if (cents) out += ' and ' + String(cents).padStart(2, '0') + '/100 Cents';
  return out;
}

function zdocSign(label: string, sub: string): string {
  return `<div class="z-sign"><div class="z-line"></div><div class="z-sign-label">${label}</div><div class="z-sign-sub">${sub}</div></div>`;
}

function zdocHead(m: ZdocMetaOf, num: string): string {
  return `
    <div class="z-head">
      <div class="z-brandbox">
        <img class="z-logo" src="/logo.jpeg" alt="ZVIDA Agro Traders" />
        <div>
          <div class="z-brand">ZVIDA Agro Traders</div>
          <div class="z-tag">Giving Value to Your Harvest</div>
          <div class="z-addr">5417 Cranbrook, Ruwa, Harare<br/>+263 776 571 481 · +263 717 907 738</div>
        </div>
      </div>
      <div class="z-docno"><span class="z-docno-kind">${m.label}</span><span class="z-docno-num">${num}</span></div>
    </div>`;
}

function zdocShell(l: Consignment, m: ZdocMetaOf, num: string, body: string, foot: string): string {
  return `
    ${zdocHead(m, num)}
    <div class="z-grid">
      <div><span class="z-k">Contract</span><span class="z-v">${l.contract}</span></div>
      <div><span class="z-k">Date</span><span class="z-v">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span></div>
      <div><span class="z-k">Commodity</span><span class="z-v">${l.commodity}</span></div>
      <div><span class="z-k">Terms</span><span class="z-v">${l.payTerm} · ${loadTermNote(l)}</span></div>
    </div>
    ${body}
    ${foot}
    <div class="z-foot">Issued electronically by ZVIDA Agro Traders · 5417 Cranbrook, Ruwa, Harare · +263 776 571 481 · +263 717 907 738. Valid without a wet signature unless one is required. Supplier settlement follows the agreed ${l.payTerm} terms after the second weight.</div>`;
}

function zdocPo(l: Consignment, role: ZdocRole): { body: string; foot: string } {
  const offtaker = role === 'receiver';
  const party: 'supplier' | 'offtaker' = offtaker ? 'offtaker' : 'supplier';
  const buyer = offtaker ? l.receiver : ZVIDA_COUNTERPARTY;
  const supplier = offtaker ? ZVIDA_COUNTERPARTY : l.supplier;
  const buyerSub = offtaker ? l.dest : '5417 Cranbrook, Ruwa, Harare';
  const supplierSub = offtaker ? '5417 Cranbrook, Ruwa, Harare' : 'Collection: ' + l.from;
  const price = zpriceFor(l, party);
  const amount = zamountFor(l, party);
  const body = `
    <div class="z-parties">
      <div><div class="z-role">Buyer</div><div class="z-name">${buyer}</div><div class="z-sub">${buyerSub}</div></div>
      <div><div class="z-role">Supplier</div><div class="z-name">${supplier}</div><div class="z-sub">${supplierSub}</div></div>
    </div>
    <table class="z-table">
      <thead><tr><th>Commodity</th><th>Quantity</th><th>Rate (USD/t)</th><th class="r">Amount</th></tr></thead>
      <tbody><tr><td>${l.commodity}</td><td>${zqty(l)}</td><td>${loadMoney(price)}</td><td class="r">${l.qty ? loadMoney(amount) : '—'}</td></tr></tbody>
      <tfoot><tr><td colspan="3" class="r">Total</td><td class="r">${l.qty ? loadMoney(amount) : 'To be weighed'}</td></tr></tfoot>
    </table>
    <div class="z-note">Delivery point: <b>${zToSub(l, role)}</b> · Order <b>${l.order}</b> · PO <b>${l.poRef}</b>. This order is accepted by the supplier signing at the collection point.</div>`;
  const foot = `
    <div class="z-signs">
      ${zdocSign('Supplier Signature', 'Accepted on collection · ID verified')}
      ${zdocSign('ZVIDA Brokerage', 'Authorised by ZVIDA')}
    </div>`;
  return { body, foot };
}

function zdocDn(l: Consignment, role: ZdocRole): { body: string; foot: string } {
  const body = `
    <div class="z-parties">
      <div><div class="z-role">From</div><div class="z-name">${zFromName(l, role)}</div><div class="z-sub">${zFromSub(l, role)}</div></div>
      <div><div class="z-role">To</div><div class="z-name">${zToName(l, role)}</div><div class="z-sub">${zToSub(l, role)}</div></div>
    </div>
    <div class="z-grid">
      <div><span class="z-k">Truck</span><span class="z-v">${l.truck || '—'}</span></div>
      <div><span class="z-k">Trailer</span><span class="z-v">${l.trailer || '—'}</span></div>
      <div><span class="z-k">Driver</span><span class="z-v">${l.driver || '—'}${l.phone ? ' · ' + l.phone : ''}</span></div>
      <div><span class="z-k">Carrier</span><span class="z-v">ZVIDA Logistics</span></div>
    </div>
    <table class="z-table">
      <thead><tr><th>Commodity</th><th>First weight</th><th>Second weight</th><th class="r">Net</th></tr></thead>
      <tbody><tr><td>${l.commodity}</td><td>${l.weight1 ? l.weight1.toLocaleString() + ' kg' : '—'}</td><td>${l.weight2 ? l.weight2.toLocaleString() + ' kg' : '—'}</td><td class="r">${zqty(l)}</td></tr></tbody>
    </table>
    <div class="z-note">Weighbridge slip: <b>${l.slip || 'WB-' + l.ref.slice(-4)}</b> · Load reference <b>${l.ref}</b>. Signed by the supplier when issued and by the driver when the load is accepted for carriage.</div>`;
  const foot = `
    <div class="z-signs">
      ${zdocSign('Supplier Signature', 'Issued at loading point')}
      ${zdocSign('Driver Signature', 'Received for carriage')}
      ${zdocSign('Receiver Signature', 'Confirmed on arrival')}
    </div>`;
  return { body, foot };
}

function zdocInv(l: Consignment, party: 'supplier' | 'offtaker'): { body: string; foot: string } {
  const price = zpriceFor(l, party);
  const amount = zamountFor(l, party);
  const billTo = party === 'offtaker' ? l.receiver : l.supplier;
  const body = `
    <div class="z-parties">
      <div><div class="z-role">Issued by</div><div class="z-name">ZVIDA Agro Traders</div><div class="z-sub">5417 Cranbrook, Ruwa, Harare</div></div>
      <div><div class="z-role">Bill to</div><div class="z-name">${billTo}</div><div class="z-sub">Contract ${l.contract} · ${l.order}</div></div>
    </div>
    <table class="z-table">
      <thead><tr><th>Description</th><th>Quantity</th><th>Rate (USD/t)</th><th class="r">Amount</th></tr></thead>
      <tbody><tr><td>${l.commodity} — ${party === 'offtaker' ? 'delivered to ' + l.dest : 'delivered from ' + l.from}</td><td>${zqty(l)}</td><td>${loadMoney(price)}</td><td class="r">${l.qty ? loadMoney(amount) : '—'}</td></tr></tbody>
      <tfoot><tr><td colspan="3" class="r">Total</td><td class="r">${l.qty ? loadMoney(amount) : 'To be weighed'}</td></tr></tfoot>
    </table>
    <div class="z-inwords"><span class="z-k">Amount in words</span><span class="z-v">${zinWords(amount)}</span></div>
    <div class="z-note">${party === 'offtaker' ? 'Payable to ZVIDA Agro Traders' : 'Settlement to the supplier wallet'} · ${l.payTerm} · due ${l.due} · generated at the payment milestone.</div>`;
  const foot = `
    <div class="z-signs">
      ${zdocSign('ZVIDA Brokerage', 'Auto-issued · ' + (party === 'offtaker' ? 'offtaker invoice' : 'supplier invoice'))}
    </div>`;
  return { body, foot };
}

function zdocFis(l: Consignment, party: 'supplier' | 'offtaker'): { body: string; foot: string } {
  const total = zamountFor(l, party);
  const { net, vat } = zvatSplit(total);
  const receiptNo = zfisNumber(l, party);
  const fiscalCode = zfisCode(l, party);
  const supplier = party === 'offtaker' ? ZVIDA_COUNTERPARTY : l.supplier;
  const body = `
    <div class="z-grid">
      <div><span class="z-k">ZIMRA e-Invoice no.</span><span class="z-v strong">${receiptNo}</span></div>
      <div><span class="z-k">Fiscal code</span><span class="z-v">${fiscalCode}</span></div>
      <div><span class="z-k">VAT registration</span><span class="z-v">VAT 40000091-45</span></div>
      <div><span class="z-k">VAT rate</span><span class="z-v">${(ZIMRA_VAT_RATE * 100).toFixed(0)}%</span></div>
      <div><span class="z-k">Issued by</span><span class="z-v">ZVIDA Agro Traders · TPIN 10012345-68</span></div>
      <div><span class="z-k">Customer TPIN</span><span class="z-v">${supplier}</span></div>
    </div>
    <table class="z-table">
      <thead><tr><th>Description</th><th>Quantity</th><th class="r">Net (USD)</th><th class="r">VAT (USD)</th><th class="r">Total (USD)</th></tr></thead>
      <tbody><tr><td>${l.commodity} — ${party === 'offtaker' ? 'sale to ' + l.receiver : 'purchase from ' + l.supplier} · contract ${l.contract}</td><td>${zqty(l)}</td><td class="r">${l.qty ? loadMoney(net) : '—'}</td><td class="r">${l.qty ? loadMoney(vat) : '—'}</td><td class="r">${l.qty ? loadMoney(total) : '—'}</td></tr></tbody>
      <tfoot><tr><td colspan="2" class="r">${l.qty ? 'Net ' + loadMoney(net) + ' · VAT 15% ' + loadMoney(vat) : ''}</td><td colspan="2" class="r">Total incl. VAT</td><td class="r">${l.qty ? loadMoney(total) : 'To be weighed'}</td></tr></tfoot>
    </table>
    <div class="z-inwords"><span class="z-k">Amount in words</span><span class="z-v">${zinWords(total)}</span></div>
    <div class="z-note">Fiscalised electronically under the ZIMRA Tax Invoice / e-Receipt framework. Check digit verified · ${l.payTerm} · due ${l.due} · generated at the payment milestone.</div>`;
  const foot = `
    <div class="z-signs">
      ${zdocSign('ZVIDA Brokerage', 'Auto-issued · fiscalised to ZIMRA')}
      ${zdocSign('Supplier', 'Tax invoice received')}
    </div>`;
  return { body, foot };
}

function zdocPc(l: Consignment, role: ZdocRole): { body: string; foot: string } {
  const party: 'supplier' | 'offtaker' = role === 'receiver' ? 'offtaker' : 'supplier';
  const amount = zamountFor(l, party);
  const paidTo = role === 'receiver' ? ZVIDA_COUNTERPARTY : l.supplier;
  const body = `
    <div class="z-grid">
      <div><span class="z-k">Paid to</span><span class="z-v">${paidTo}</span></div>
      <div><span class="z-k">Amount</span><span class="z-v strong">${l.qty ? loadMoney(amount) : '—'}</span></div>
      <div><span class="z-k">Method</span><span class="z-v">ZVIDA Wallet · Bank Transfer</span></div>
      <div><span class="z-k">Load</span><span class="z-v">${l.ref} · ${l.contract}</span></div>
    </div>
    <div class="z-inwords"><span class="z-k">Amount in words</span><span class="z-v">${zinWords(amount)}</span></div>
    <table class="z-table">
      <thead><tr><th>Commodity</th><th>Net quantity</th><th>Rate (USD/t)</th><th class="r">Amount</th></tr></thead>
      <tbody><tr><td>${l.commodity}</td><td>${zqty(l)}</td><td>${loadMoney(zpriceFor(l, party))}</td><td class="r">${l.qty ? loadMoney(amount) : '—'}</td></tr></tbody>
    </table>
    <div class="z-note">Reference <b>${l.order}</b> · released ${l.due} · ${loadTermNote(l)}. This confirms that the full amount has been ${role === 'receiver' ? 'settled with ZVIDA' : 'released to the supplier'} and the contract is closed.</div>`;
  const foot = `
    <div class="z-signs">
      ${zdocSign('Supplier Signature', 'Payment received · balance zero')}
      ${zdocSign('ZVIDA Brokerage', 'Released by ZVIDA')}
      ${zdocSign('Witness', 'Verified by an independent witness')}
    </div>`;
  return { body, foot };
}

function zdocPod(l: Consignment): { body: string; foot: string } {
  const body = `
    <div class="z-parties">
      <div><div class="z-role">Delivered by</div><div class="z-name">${l.driver || 'ZVIDA Logistics'}</div><div class="z-sub">Truck ${l.truck || '—'}${l.trailer ? ' · ' + l.trailer : ''}</div></div>
      <div><div class="z-role">Delivered to</div><div class="z-name">${l.receiver}</div><div class="z-sub">${l.dest}</div></div>
    </div>
    <table class="z-table">
      <thead><tr><th>Commodity</th><th>Net quantity</th><th class="r">Reference</th></tr></thead>
      <tbody><tr><td>${l.commodity}</td><td>${zqty(l)}</td><td class="r">${l.ref}</td></tr></tbody>
    </table>
    <div class="z-note">Signed electronically at the point of delivery${l.slip ? ' · weighbridge slip ' + l.slip : ''}.</div>`;
  const foot = `
    <div class="z-signs">
      ${zdocSign('Driver Signature', l.driver || 'Driver')}
      ${zdocSign('Receiver Signature', 'Received in good order')}
    </div>`;
  return { body, foot };
}

function zdocAssemble(l: Consignment, kind: ZdocKind, num: string, body: string, foot: string): { sheet: string; print: string; name: string } {
  const m = ZDOC_META[kind];
  const inner = zdocShell(l, m, num, body, foot);
  const sheet = `<div class="z-doc"><div class="z-inner">${inner}</div></div>`;
  const name = `${m.file}_${num.replace('#', '')}.html`;
  const print = `<!doctype html><html><head><meta charset="utf-8"><title>${num} — ${m.label}</title><style>${ZDOC_STYLES}</style></head><body class="z-print">${sheet}</body></html>`;
  return { sheet, print, name };
}

function zdocRegister(l: Consignment, role: ZdocRole = 'admin'): void {
  const put = (key: string, kind: ZdocKind, num: string, body: string, foot: string, meta: string): void => {
    const { sheet, print, name } = zdocAssemble(l, kind, num, body, foot);
    ZDOCS[key] = { key, kind, label: ZDOC_META[kind].label, name, meta, sheet, print };
    registerDownload(key, name, sheet, 'text/html');
  };
  if (role !== 'driver') {
    const po = zdocPo(l, role);
    put(l.id + '-po', 'PO', znum(l, 'PO'), po.body, po.foot, `Contract ${l.contract} · ${l.commodity} · accept & sign at collection`);
  }
  const dn = zdocDn(l, role);
  put(l.id + '-dn', 'DN', znum(l, 'DN'), dn.body, dn.foot, `Contract ${l.contract} · ${zRoute(l, role)} · signed on dispatch`);
  if (role === 'admin') {
    const invS = zdocInv(l, 'supplier');
    put(l.id + '-inv-s', 'INV', znum(l, 'INV') + '-S', invS.body, invS.foot, `Contract ${l.contract} · supplier rate ${loadMoney(zpriceFor(l, 'supplier'))}/t`);
    const invO = zdocInv(l, 'offtaker');
    put(l.id + '-inv-o', 'INV', znum(l, 'INV') + '-O', invO.body, invO.foot, `Contract ${l.contract} · offtaker rate ${loadMoney(zpriceFor(l, 'offtaker'))}/t`);
    const legacyInv = ZDOCS[l.id + '-inv-o'];
    if (legacyInv) registerDownload(l.id + '-invoice', `Invoice_${l.ref}.html`, legacyInv.sheet, 'text/html');
    const fisS = zdocFis(l, 'supplier');
    put(l.id + '-fis-s', 'FIS', zfisNumber(l, 'supplier'), fisS.body, fisS.foot, `Contract ${l.contract} · VAT ${loadMoney(zvatSplit(zamountFor(l, 'supplier')).vat)} @ 15%`);
    const fisO = zdocFis(l, 'offtaker');
    put(l.id + '-fis-o', 'FIS', zfisNumber(l, 'offtaker'), fisO.body, fisO.foot, `Contract ${l.contract} · VAT ${loadMoney(zvatSplit(zamountFor(l, 'offtaker')).vat)} @ 15%`);
    const pc = zdocPc(l, role);
    put(l.id + '-pc', 'PC', znum(l, 'PC'), pc.body, pc.foot, `Contract ${l.contract} · ${loadMoney(zamountFor(l, 'supplier'))} received`);
  } else if (role !== 'driver') {
    const side: 'supplier' | 'offtaker' = role === 'receiver' ? 'offtaker' : 'supplier';
    const inv = zdocInv(l, side);
    put(l.id + '-inv-' + (role === 'receiver' ? 'o' : 's'), 'INV', znum(l, 'INV') + (role === 'receiver' ? '-O' : '-S'), inv.body, inv.foot, `Contract ${l.contract} · rate ${loadMoney(zpriceFor(l, side))}/t`);
    const fis = zdocFis(l, side);
    put(l.id + '-fis-' + (role === 'receiver' ? 'o' : 's'), 'FIS', zfisNumber(l, side), fis.body, fis.foot, `Contract ${l.contract} · VAT ${loadMoney(zvatSplit(zamountFor(l, side)).vat)} @ 15%`);
    const pc = zdocPc(l, role);
    put(l.id + '-pc', 'PC', znum(l, 'PC'), pc.body, pc.foot, `Contract ${l.contract} · ${loadMoney(zamountFor(l, side))} settled`);
  }
  if (role === 'driver' || role === 'admin') {
    const pod = zdocPod(l);
    put(l.id + '-pod', 'POD', znum(l, 'POD'), pod.body, pod.foot, `Contract ${l.contract} · signed on delivery`);
  }
}

function zdocAvail(l: Consignment, role: ZdocRole): ZdocKind[] {
  if (l.status === 'CANCELLED') return [];
  const out: ZdocKind[] = [];
  if (role !== 'driver' && ZDOC_TRIGGER.PO.includes(l.status)) out.push('PO');
  if (ZDOC_TRIGGER.DN.includes(l.status)) out.push('DN');
  if (role !== 'driver' && ZDOC_TRIGGER.INV.includes(l.status)) out.push('INV');
  if (role !== 'driver' && ZDOC_TRIGGER.FIS.includes(l.status)) out.push('FIS');
  if (role !== 'driver' && ZDOC_TRIGGER.PC.includes(l.status)) out.push('PC');
  if (role === 'driver' && ZDOC_TRIGGER.POD.includes(l.status)) out.push('POD');
  return out;
}

function zdocDocKey(l: Consignment, kind: ZdocKind, role: ZdocRole): string {
  if (kind === 'INV' || kind === 'FIS') {
    const suffix = role === 'receiver' ? 'o' : 's';
    return l.id + '-' + (kind === 'FIS' ? 'fis' : 'inv') + '-' + suffix;
  }
  return l.id + '-' + kind.toLowerCase();
}

function zdocBtn(label: string, key: string): string {
  const z = ZDOCS[key];
  if (!z) return '';
  return `<span class="dsh-zdoc-pill">${downloadBtn(label, 'ghost sm', key)}${jsBtn('View', 'ghost sm', 'zdocView', key, 'Opening ' + z.label)}</span>`;
}

function zdocPills(l: Consignment, role: ZdocRole): string {
  zdocRegister(l, role);
  const kinds = zdocAvail(l, role);
  if (!kinds.length) return '';
  const btns: string[] = [];
  for (const k of kinds) {
    if (k === 'INV' && role === 'admin') {
      btns.push(zdocBtn('Invoice · Supplier Rate', l.id + '-inv-s'));
      btns.push(zdocBtn('Invoice · Offtaker Rate', l.id + '-inv-o'));
    } else if (k === 'FIS' && role === 'admin') {
      btns.push(zdocBtn('ZIMRA e-Invoice · Supplier', l.id + '-fis-s'));
      btns.push(zdocBtn('ZIMRA e-Invoice · Offtaker', l.id + '-fis-o'));
    } else {
      btns.push(zdocBtn(k === 'INV' ? 'Invoice' : ZDOC_META[k].label, zdocDocKey(l, k, role)));
    }
  }
  return `<div class="dsh-lg-docs">${btns.join('')}</div>`;
}

function zdocRows(loads: Consignment[], role: ZdocRole): { l: Consignment; keys: { label: string; key: string }[] }[] {
  const rows: { l: Consignment; keys: { label: string; key: string }[] }[] = [];
  for (const l of loads) {
    const keys: { label: string; key: string }[] = [];
    for (const k of zdocAvail(l, role)) {
      if (k === 'INV' && role === 'admin') {
        keys.push({ label: 'Invoice · Supplier Rate', key: l.id + '-inv-s' });
        keys.push({ label: 'Invoice · Offtaker Rate', key: l.id + '-inv-o' });
      } else if (k === 'FIS' && role === 'admin') {
        keys.push({ label: 'ZIMRA e-Invoice · Supplier', key: l.id + '-fis-s' });
        keys.push({ label: 'ZIMRA e-Invoice · Offtaker', key: l.id + '-fis-o' });
      } else {
        keys.push({ label: k === 'INV' ? 'Invoice' : ZDOC_META[k].label, key: zdocDocKey(l, k, role) });
      }
    }
    if (keys.length) rows.push({ l, keys });
  }
  return rows;
}

function zdocRow(key: string): string {
  const z = ZDOCS[key];
  if (!z) return '';
  return `<div class="dsh-doc">
    <span class="dsh-doc-ico">${svg(ICON.file)}</span>
    <div>
      <div class="dsh-doc-name">${z.label} · ${z.name.replace(/\.html$/, '')}</div>
      <div class="dsh-doc-meta">${z.meta}</div>
    </div>
    <span class="dsh-doc-actions">${jsBtn('View', 'ghost sm', 'zdocView', key, 'Opening ' + z.label)}${downloadBtn('Download', 'ghost sm', key)}</span>
  </div>`;
}

function zdocLoads(role: ZdocRole, who: string): Consignment[] {
  return loadCatalog()
    .reverse()
    .filter((l) => {
      if (role === 'admin') return true;
      if (role === 'supplier') return l.supplier.includes(who);
      if (role === 'receiver') return l.receiver.includes(who);
      return l.driver.includes(who);
    });
}

function zdocCollectKeys(loads: Consignment[], role: ZdocRole): string[] {
  const keys: string[] = [];
  for (const row of zdocRows(loads, role)) for (const k of row.keys) keys.push(k.key);
  return keys;
}

export function zdocDocuments(role: ZdocRole, who = ''): string {
  const loads = zdocLoads(role, who);
  loads.forEach((l) => zdocRegister(l, role));
  const rows = zdocRows(loads, role);
  const groups = new Map<string, { l: Consignment; keys: { label: string; key: string }[] }[]>();
  for (const r of rows) {
    const arr = groups.get(r.l.contract) || [];
    arr.push(r);
    groups.set(r.l.contract, arr);
  }
  const openCount = loads.filter((l) => !['PAID', 'CANCELLED'].includes(l.status)).length;
  const pendingPay = loads.filter((l) => l.status === 'PENDING_PAYMENT').length;
  const settled = loads.filter((l) => l.status === 'PAID').length;
  const total = rows.reduce((s, r) => s + r.keys.length, 0);
  const podCount = rows.filter((r) => r.keys.some((k) => k.key.endsWith('-pod'))).length;
  const contractHref = role === 'driver' ? '#trips' : role === 'admin' ? '#deliveries' : '#contracts';
  const lead = role === 'driver'
    ? `Trip documents are issued as each load moves: the delivery note at loading and the proof of delivery when the load is signed off.`
    : role === 'admin'
      ? `Every contract document lives here — the purchase order, delivery note, both invoice copies (supplier and offtaker rates), the ZIMRA fiscalised e-invoice at the payment milestone and the payment confirmation. The 15% VAT register can be exported as CSV for your quarterly ZIMRA return.`
      : `Documents are issued automatically as each contract moves: the purchase order on acceptance, the delivery note at loading, the invoice and ZIMRA e-invoice at the payment milestone, and the payment confirmation when settled.`;
  const kpisBlock = role === 'driver'
    ? kpis([
        { label: 'Trips', value: loads.length, icon: ICON.trips, delta: total + ' documents available', up: true, spark: [1, 2, 2, 3, 3, 4, Math.max(loads.length, 1)], foot: 'Your consignments', open: '#trips' },
        { label: 'Active', value: openCount, icon: ICON.truck, delta: 'In progress', up: false, spark: [0, 1, 1, 2, 1, 2, Math.max(openCount, 1)], foot: 'Not yet delivered', open: '#trips' },
        { label: 'Proof of Delivery', value: podCount, icon: ICON.check, delta: 'Signed on delivery', up: true, spark: [0, 0, 1, 1, 2, 2, Math.max(podCount, 1)], foot: 'Closed trips', open: '#documents' },
      ])
    : kpis([
        { label: 'Contracts', value: groups.size, icon: ICON.contracts, delta: total + ' documents available', up: true, spark: [1, 2, 2, 3, 4, 5, Math.max(groups.size, 1)], foot: 'Across this season', open: role === 'admin' ? '#deliveries' : '#contracts' },
        { label: 'Awaiting ZVIDA Payment', value: pendingPay, icon: ICON.payments, delta: 'Invoice issued at milestone', up: false, spark: [0, 1, 1, 2, 1, 2, Math.max(pendingPay, 1)], foot: 'Payment pending', open: role === 'admin' ? '#payments' : role === 'receiver' ? '#deliveries' : '#contracts' },
        { label: 'Settled', value: settled, icon: ICON.wallet, delta: 'Payment confirmations issued', up: true, spark: [1, 1, 2, 2, 3, 3, Math.max(settled, 1)], foot: 'Closed contracts', open: role === 'admin' ? '#payments' : role === 'receiver' ? '#deliveries' : '#contracts' },
      ]);
  return `
    ${kpisBlock}
    ${banner('info', lead)}
    ${rows.length ? Array.from(groups.entries()).map(([contract, ls]) => `
      ${sec(`${contract} · ${ls[0].l.commodity}`, 'Open contract', 'Opening contract', ls.length, contractHref)}
      ${panel({
        body: `<div style="padding:0 6px">${ls.flatMap((r) => r.keys.map((k) => zdocRow(k.key))).join('')}</div>`,
        flush: true,
      })}
    `).join('') : banner('ok', 'No documents available yet — documents appear as your contracts move through their milestones.')}
    ${rows.length ? `${jsBtn('Download All', 'primary sm', 'zdocAll', role + '|' + who, 'Downloading all documents')}` : ''}
    ${role !== 'driver' && rows.length ? `${jsBtn('Tax Export (CSV)', 'ghost sm', 'zdocTax', role + '|' + who, 'Downloading VAT register')}` : ''}
  `;
}

export function wireZdoc(): void {
  if (JS.zdocView) return;
  JS.zdocView = (key) => {
    const z = ZDOCS[key];
    if (!z) return;
    openDetail(z.label + ' · ' + z.name.replace(/\.html$/, ''), `<div class="z-sheet"><style>${ZDOC_STYLES}</style>${z.sheet}</div>`, `${downloadBtn('Download', 'primary sm', key)}${jsBtn('Print / Save as PDF', 'ghost sm', 'zdocPrint', key, 'Opening print dialog')}`);
  };
  JS.zdocPrint = (key) => {
    const z = ZDOCS[key];
    if (!z) return;
    const w = window.open('', '_blank', 'width=920,height=1180');
    if (!w) {
      toast('Pop-up blocked — allow pop-ups to print', 'warn');
      return;
    }
    w.document.write(z.print);
    w.document.close();
    w.focus();
    setTimeout(() => {
      try {
        w.print();
      } catch {
        /* ignore */
      }
    }, 300);
  };
  JS.zdocAll = (payload) => {
    const [role, who] = payload.split('|');
    const loads = zdocLoads(role as ZdocRole, who);
    loads.forEach((l) => zdocRegister(l, role as ZdocRole));
    const keys = zdocCollectKeys(loads, role as ZdocRole);
    keys.forEach((key, i) => window.setTimeout(() => downloadNow(key), i * 160));
    toast(`Downloading ${keys.length} documents`);
  };
  JS.zdocTax = (payload) => {
    const [role, who] = payload.split('|');
    const loads = zdocLoads(role as ZdocRole, who).filter((l) => ZDOC_TRIGGER.FIS.includes(l.status));
    if (!loads.length) {
      toast('No fiscalised e-invoices yet — they are issued at the payment milestone', 'warn');
      return;
    }
    const esc = (s: string | number): string => {
      const t = String(s ?? '');
      return /[",\n]/.test(t) ? '"' + t.replace(/"/g, '""') + '"' : t;
    };
    const sides: ('supplier' | 'offtaker')[] = role === 'admin' ? ['supplier', 'offtaker'] : [role === 'receiver' ? 'offtaker' : 'supplier'];
    const lines: string[][] = [['Receipt No', 'Fiscal code', 'Date', 'Contract', 'Load Ref', 'Type', 'Commodity', 'Qty (t)', 'Net (USD)', 'VAT 15% (USD)', 'Total incl. VAT (USD)']];
    const month = new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).replace(' ', '');
    for (const l of loads) {
      for (const side of sides) {
        const total = zamountFor(l, side);
        const { net, vat } = zvatSplit(total);
        lines.push([zfisNumber(l, side), zfisCode(l, side), new Date().toLocaleDateString('en-US'), l.contract, l.ref, side, l.commodity, (l.qty / 1000).toFixed(2), net.toFixed(2), vat.toFixed(2), total.toFixed(2)]);
      }
    }
    const csv = lines.map((r) => r.map(esc).join(',')).join('\n');
    const key = 'z-tax-' + Date.now();
    registerDownload(key, `ZIMRA_VAT_Register_${month}.csv`, csv, 'text/csv');
    downloadNow(key);
    toast(`Exported ${loads.length} fiscalised e-invoice(s)`);
  };
}

function geoTrackBtns(l: Consignment, role: 'supplier' | 'driver'): string {
  const geo = geoTracking()
    ? `${pill('GPS live', 'green')}${jsBtn('Stop GPS', 'ghost sm', 'geoOff')}`
    : `${jsBtn('Track GPS', 'primary sm', 'geoOn')}`;
  const manual = role === 'driver' ? jsBtn('Report Arrival', 'ghost sm', 'lgAction', l.id + ':arrive', 'Arrived — offloading') : '';
  return `${geo}${jsBtn(`Radius ${geoRadiusKm()} km`, 'ghost sm', 'geoRadius')}${manual}`;
}

function lgFoot(l: Consignment, role: 'supplier' | 'driver' | 'receiver' | 'admin'): string {
  const s = l.status;
  const call = (who: string) => jsBtn('Call', 'ghost sm', 'lgCall', who + '|' + l.phone, `Dialing ${who}…`);
  if (role === 'admin') {
    if (s === 'PENDING_PAYMENT') return `${jsBtn('Release Payment', 'primary sm', 'lgSettle', l.id, `${loadMoney(l.amount)} released to ${l.supplier}`)}${jsBtn('Hold', 'ghost sm', 'lgAction', l.id + ':note', 'Payment held')}${call('Supplier ' + l.supplier)}${zdocPills(l, 'admin')}`;
    if (s === 'PENDING' && !l.driver) return `${jsBtn('Assign Driver', 'primary sm', 'lgAction', l.id + ':assign', 'Driver John Doe assigned')}${call('Supplier ' + l.supplier)}${zdocPills(l, 'admin')}`;
    if (s === 'IN_TRANSIT' || s === 'OFFLOADING') return `${jsBtn('Verify Weights', 'ghost sm', 'lgAction', l.id + ':note', 'Weight verification queued')}${call('Driver ' + l.driver)}${zdocPills(l, 'admin')}`;
    return `${call('Supplier ' + l.supplier)}${zdocPills(l, 'admin')}`;
  }
  if (role === 'supplier') {
    if (s === 'PENDING') return `${jsBtn('Start Loading', 'primary sm', 'lgAction', l.id + ':start', 'Loading started — driver notified')}${zdocPills(l, 'supplier')}`;
    if (s === 'LOADING' && l.weightMode === 'weighbridge') return loadWeighForm(l, 'w1');
    if (s === 'LOADING' && l.weightMode === 'scale') return loadScaleForm(l);
    if (s === 'LOADING' && l.weightMode === 'buckets') return loadBucketForm(l);
    if (s === 'WEIGHED_1') return `${jsBtn('Hand Over to Driver', 'primary sm', 'lgAction', l.id + ':depart', 'Truck departed — GPS tracking on')}${call('Driver ' + l.driver)}${zdocPills(l, 'supplier')}`;
    if (s === 'IN_TRANSIT') return `${jsBtn('Track Live', 'primary sm', 'lgAction', l.id + ':arrive', 'Opening live tracking',)}${geoTrackBtns(l, 'supplier')}${call('Driver ' + l.driver)}${zdocPills(l, 'supplier')}`;
    if (s === 'OFFLOADING') return `${call('Driver ' + l.driver)}${zdocPills(l, 'supplier')}`;
    if (s === 'PENDING_PAYMENT') return `${jsBtn('Track Payment', 'ghost sm', 'lgAction', l.id + ':note', 'Payment due ' + l.due)}${call('Driver ' + l.driver)}${zdocPills(l, 'supplier')}`;
    if (s === 'PAID') return `${pill('Payment received · Receipt sent', 'green')}${zdocPills(l, 'supplier')}`;
    return '';
  }
  if (role === 'driver') {
    if (s === 'PENDING' && !l.driver) return jsBtn('Accept Load', 'primary sm', 'lgAction', l.id + ':assign', 'Load accepted — dispatch notified');
    if (s === 'PENDING') return jsBtn('Start Loading', 'primary sm', 'lgAction', l.id + ':start', 'Loading started — GPS tracking on');
    if (s === 'LOADING' && l.weightMode === 'weighbridge') return loadWeighForm(l, 'w1');
    if (s === 'LOADING' && l.weightMode === 'scale') return loadScaleForm(l);
    if (s === 'LOADING' && l.weightMode === 'buckets') return loadBucketForm(l);
    if (s === 'WEIGHED_1') return `${jsBtn('Start Trip', 'primary sm', 'lgAction', l.id + ':depart', 'Departed — ETA calculated')}${zdocPills(l, 'driver')}`;
    if (s === 'IN_TRANSIT') return `${geoTrackBtns(l, 'driver')}${call('Dispatch')}`;
    if (s === 'OFFLOADING' && l.weightMode === 'weighbridge') return loadWeighForm(l, 'w2');
    if (s === 'OFFLOADING') return `${jsBtn('Offload Complete', 'primary sm', 'lgAction', l.id + ':deliver', 'Offload confirmed — delivery complete')}${zdocPills(l, 'driver')}`;
    if (s === 'PENDING_PAYMENT') return `${pill('Trip complete · payment pending', 'amber')}${zdocPills(l, 'driver')}`;
    if (s === 'PAID') return `${pill('Trip complete · paid', 'green')}${zdocPills(l, 'driver')}`;
    return '';
  }
  if (role === 'receiver') {
    if (s === 'IN_TRANSIT') return `${jsBtn('Prepare for Offload', 'ghost sm', 'lgAction', l.id + ':note', 'Intake bay reserved')}${call('Driver ' + l.driver)}`;
    if (s === 'OFFLOADING' && l.weightMode === 'weighbridge') return loadWeighForm(l, 'w2');
    if (s === 'OFFLOADING') return `${jsBtn('Confirm Offload', 'primary sm', 'lgAction', l.id + ':deliver', 'Offload confirmed — delivery complete')}${call('Driver ' + l.driver)}`;
    if (s === 'PENDING_PAYMENT') return `${zdocPills(l, 'receiver')}${jsBtn('Pay ZVIDA', 'primary sm', 'lgAction', l.id + ':note', 'Payment to ZVIDA queued')}`;
    if (s === 'PAID') return `${pill('Settled with ZVIDA', 'green')}${zdocPills(l, 'receiver')}`;
    return '';
  }
  return '';
}

export function loadCard(l: Consignment, role: LoadRole = 'supplier'): string {
  const st = lgWrap(l.status);
  const head = `${l.ref} · ${l.commodity}`;
  const meta = `
    <div class="dsh-lg-meta-row">
      <span>${svg(ICON.route)} ${zRoute(l, role)}</span>
      <span>${svg(ICON.truck)} ${l.driver || 'No driver assigned'} · ${l.truck || '—'}</span>
      <span>${svg(ICON.contracts)} ${l.contract} · ${l.poRef} · ${l.order}</span>
    </div>
    <div class="dsh-lg-meta-row">
      <span>${svg(ICON.users)} Supplier: ${zFromName(l, role)}</span>
      <span>${svg(ICON.buy)} Receiver: ${zToName(l, role)}</span>
      <span>${svg(ICON.weighbridge)} ${weightModeLabel(l.weightMode, l.bucketKg)}</span>
    </div>`;
  return `<div class="dsh-lg-card" data-live-card="${l.id}" data-lg-role="${role}">
    <div class="dsh-lg-card-head">
      <span class="dsh-lg-thumb">${img(l.art, 'xs')}</span>
      <div class="dsh-lg-card-title">
        <div class="dsh-lg-ref">${head}</div>
        <div class="dsh-lg-sub">${l.contract} · Due ${l.due} · ${l.payTerm}</div>
      </div>
      <span class="dsh-lg-badges">${pill(st.status, st.tone)}${loadTerm(l)}</span>
    </div>
    ${meta}
    ${loadSteps(l)}
    ${loadProgressBar(l)}
    ${loadTele(l, role)}
    ${loadWeights(l)}
    ${loadAmount(l, role)}
    ${lgFoot(l, role)}
  </div>`;
}

export function freightKpis(loads: Consignment[]): { inTransit: number; loading: number; pendingPay: number; pendingValue: number; paid: number; paidValue: number; offloading: number } {
  const inTransit = loads.filter((l) => l.status === 'IN_TRANSIT').length;
  const loading = loads.filter((l) => ['LOADING', 'WEIGHED_1', 'OFFLOADING'].includes(l.status)).length;
  const pending = loads.filter((l) => l.status === 'PENDING_PAYMENT');
  const paid = loads.filter((l) => l.status === 'PAID');
  return {
    inTransit, loading, offloading: loads.filter((l) => l.status === 'OFFLOADING').length,
    pendingPay: pending.length, pendingValue: pending.reduce((s, l) => s + l.amount, 0),
    paid: paid.length, paidValue: paid.reduce((s, l) => s + l.amount, 0),
  };
}

/* ---------- Geofenced arrival detection ---------- */
interface GeoPoint {
  lat: number;
  lng: number;
  town: string;
}

const GEO_POINTS: Record<string, GeoPoint> = {
  Harare: { lat: -17.8252, lng: 31.0335, town: 'Harare' },
  Ruwa: { lat: -17.893, lng: 31.243, town: 'Ruwa' },
  Marondera: { lat: -18.188, lng: 31.544, town: 'Marondera' },
  Chinhoyi: { lat: -17.369, lng: 30.201, town: 'Chinhoyi' },
  Masvingo: { lat: -20.079, lng: 30.827, town: 'Masvingo' },
  Mutare: { lat: -18.973, lng: 32.669, town: 'Mutare' },
  Bulawayo: { lat: -20.15, lng: 28.583, town: 'Bulawayo' },
  Bindura: { lat: -17.296, lng: 31.33, town: 'Bindura' },
  Gweru: { lat: -19.45, lng: 29.82, town: 'Gweru' },
  Concession: { lat: -17.3667, lng: 30.9833, town: 'Concession' },
  Glendale: { lat: -17.3667, lng: 31.0667, town: 'Glendale' },
};

function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function geoDest(l: Consignment): GeoPoint | null {
  if (!l.dest) return null;
  const key = l.dest.split('·')[0].split(',')[0].trim();
  return GEO_POINTS[key] || GEO_POINTS[l.dest.trim()] || null;
}

const GEO_RADIUS_KEY = 'zvida_geo_radius_km';
const GEO_RADII = [1, 3, 5, 10, 20];

export function geoRadiusKm(): number {
  try {
    const v = parseFloat(localStorage.getItem(GEO_RADIUS_KEY) || '3');
    return v > 0 && v <= 50 ? v : 3;
  } catch {
    return 3;
  }
}

export function setGeoRadiusKm(km: number): void {
  try {
    localStorage.setItem(GEO_RADIUS_KEY, String(Math.max(0.5, Math.min(50, km))));
  } catch {
    /* ignore */
  }
}

let geoPos: { lat: number; lng: number; at: number } | null = null;
let geoWatchId: number | null = null;
const geoArrived = new Set<string>();

export function geoTracking(): boolean {
  return geoWatchId !== null;
}

export function startGeoWatch(): void {
  if (geoWatchId !== null || !('geolocation' in navigator)) return;
  geoWatchId = navigator.geolocation.watchPosition(
    (pos) => {
      geoPos = { lat: pos.coords.latitude, lng: pos.coords.longitude, at: Date.now() };
    },
    () => {
      /* permission denied / position unavailable — leave geoPos null */
    },
    { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 }
  );
}

export function stopGeoWatch(): void {
  if (geoWatchId !== null) {
    navigator.geolocation.clearWatch(geoWatchId);
    geoWatchId = null;
  }
  geoPos = null;
}

function geofenceTick(): void {
  const p = geoPos;
  if (!p) return;
  const radius = geoRadiusKm();
  const els = document.querySelectorAll<HTMLElement>('[data-live-card]');
  els.forEach((card) => {
    const id = card.getAttribute('data-live-card') || '';
    const l = load(id);
    if (!l || l.status !== 'IN_TRANSIT' || geoArrived.has(id)) return;
    const d = geoDest(l);
    if (!d) return;
    const km = haversineKm(p, d);
    if (km > radius) return;
    geoArrived.add(id);
    lgTransition(l, 'arrive', `GPS detected arrival at ${d.town} · ${km.toFixed(1)} km from destination`);
    toast(`Truck arrived at ${d.town} — offloading started`, 'success');
    const uid = liveUserId();
    if (uid) void notifyUser(uid, `Arrived — ${l.ref}`, `${l.commodity} load reached ${d.town}; offloading in progress`, 'info', { url: '#deliveries' });
  });
}

/* Shared freight JS handlers + live telemetry simulation */
let freightLiveTimer: number | null = null;
export function wireFreight(): void {
  if (JS.lgAction) return;
  JS.lgAction = (payload) => {
    const [id, action, ...rest] = (payload || '').split(':');
    freightUpdate(id, action, rest.join(':'));
    toast(action === 'settle' ? 'Payment released — receipt sent' : 'Freight updated');
    refresh();
  };
  JS.lgWeigh = (payload) => {
    const [id, point] = (payload || '').split(':');
    const l = load(id);
    if (!l) return;
    const inp = document.querySelector<HTMLInputElement>(`input[data-wg-id="${id}"][data-wg="${point}"]`);
    const val = parseFloat((inp?.value || '').replace(/,/g, ''));
    if (!val || val <= 0) {
      toast('Enter a valid weight in kg', 'warn');
      return;
    }
    if (point === 'w1') l.weight1 = val;
    else l.weight2 = val;
    l.pics += 1;
    lgTransition(l, point, 'Submitted by ' + currentUser);
    toast(point === 'w1' ? 'First weight recorded — second weight will set net' : `Second weight recorded — net ${Math.abs(l.weight2 - l.weight1).toLocaleString()} kg`, point === 'w1' ? 'info' : 'success');
    refresh();
  };
  JS.lgCount = (payload) => {
    const l = load(payload);
    if (!l) return;
    const get = (w: string) => parseFloat(document.querySelector<HTMLInputElement>(`input[data-wg-id="${payload}"][data-wg="${w}"]`)?.value?.replace(/,/g, '') || '0');
    l.bucketKg = get('bucketkg') || l.bucketKg;
    l.bags = get('bags');
    l.buckets = get('buckets');
    l.inputKg = get('kgs');
    if (l.weightMode === 'buckets') {
      if (!l.bucketKg || !l.buckets) {
        toast('Enter bucket capacity (kg) and buckets counted', 'warn');
        return;
      }
    } else if (!l.inputKg && !l.bags && !l.buckets) {
      toast('Enter buckets, bags or total kgs', 'warn');
      return;
    }
    l.qty = l.inputKg || l.bags * 50 + l.buckets * l.bucketKg;
    l.amount = Math.round((l.qty / 1000) * l.unitPrice);
    l.pics += 1;
    lgTransition(l, 'count', 'Counted by ' + currentUser);
    toast(`${l.qty.toLocaleString()} kg (${l.buckets} buckets × ${l.bucketKg} kg) · ${loadMoney(l.amount)} — payment pending`, 'success');
    refresh();
  };
  JS.lgSettle = (payload) => {
    const l = load(payload);
    if (!l) return;
    lgTransition(l, 'settle', 'Released by ' + currentUser);
    toast(`${loadMoney(l.amount)} paid to ${l.supplier} · ${loadTermNote(l)}`);
    refresh();
  };
  JS.lgCall = (payload) => {
    const [who, phone] = (payload || '|').split('|');
    toast(`Dialing ${who} ${phone} — placing the call from your phone`, 'info');
  };
  JS.lgDocs = (payload) => {
    const [id, type] = (payload || ':').split(':');
    downloadNow(id + '-' + type);
    toast('Document downloaded', 'info');
  };
  JS.lgPhoto = (url, btn) => {
    const card = btn?.closest<HTMLElement>('[data-live-card]');
    const id = card?.getAttribute('data-live-card') || '';
    const l = load(id);
    if (!l) return;
    l.photos = l.photos || [];
    l.photos.push(url);
    l.pics = (l.pics || 0) + 1;
    lgSave();
    void persistLoad(l as unknown as LiveLoad);
  };
  JS.geoOn = () => {
    startGeoWatch();
    toast(geoTracking() ? `GPS tracking on — arrival auto-detects within ${geoRadiusKm()} km of destination` : 'GPS tracking requested', 'success');
    refresh();
  };
  JS.geoOff = () => {
    stopGeoWatch();
    toast('GPS tracking off', 'info');
    refresh();
  };
  JS.geoRadius = () => {
    const next = GEO_RADII[(GEO_RADII.indexOf(geoRadiusKm()) + 1) % GEO_RADII.length];
    setGeoRadiusKm(next);
    toast(`Arrival radius set to ${next} km`, 'info');
    refresh();
  };

  if (freightLiveTimer === null) {
    freightLiveTimer = window.setInterval(() => {
      geofenceTick();
      const els = document.querySelectorAll<HTMLElement>('[data-live-card]');
      if (!els.length) return;
      els.forEach((card) => {
        const id = card.getAttribute('data-live-card') || '';
        const l = load(id);
        if (!l || l.status !== 'IN_TRANSIT') return;
        l.live = Math.min(l.live + 2 + Math.floor(Math.random() * 3), 98);
        lgSave();
        void persistLoad(l as unknown as LiveLoad);
        const pctTxt = card.querySelector<HTMLElement>('[data-live-pct-txt]');
        const eta = card.querySelector<HTMLElement>('[data-live-eta]');
        const ping = card.querySelector<HTMLElement>('[data-live-ping]');
        if (pctTxt) pctTxt.textContent = Math.round(l.live) + '%';
        if (eta) eta.textContent = l.live >= 75 ? '45 min' : l.live >= 40 ? '1 h 20 m' : '2 h 10 m';
        if (ping) ping.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      });
    }, 8000);
  }
}

/* ---------- Live Supabase hydration ---------- */
let liveMode = false;
export function isLiveMode(): boolean {
  return liveMode;
}

/* Identity of the signed-in real account, used to scope dashboards to their
   own rows instead of the demo personas' seeded names. */
export function liveUserId(): string {
  const a = getLiveAccount();
  return a && !a.isDemo ? a.id : '';
}

export function liveUserName(): string {
  const a = getLiveAccount();
  return a && !a.isDemo ? a.name : '';
}

export async function hydrateLive(): Promise<void> {
  try {
    /* A real account must never fall back to demo seed data, so clear the
       local demo stores before anything loads. Empty DB → empty dashboards. */
    if (liveConfigured()) {
      localStorage.removeItem(MK_KEY);
      localStorage.removeItem(LG_KEY);
      clearDemoReceipts();
    }
    const m = mkLoad()!;
    const f = lgLoad()!;
    const live = await syncAll({
      products: m.cat,
      orders: m.orders,
      orderSeq: m.seq,
      loads: f.loads,
      loadSeq: f.seq,
      rfqs: m.rfqs,
    });
    document.querySelectorAll('[data-offline]').forEach((el) => el.remove());
    if (!live) return;
    liveMode = true;
    m.cat = mergeCatalog(live.products as unknown as MarketProduct[], zvidaGoods());
    m.orders = live.orders as unknown as MarketOrder[];
    m.seq = live.orderSeq;
    m.rfqs = live.rfqs as unknown as LiveRfq[];
    f.loads = live.loads as unknown as Consignment[];
    f.seq = live.loadSeq;
    mkSave();
    lgSave();
    const badge = document.querySelector('.dsh-live-badge');
    if (badge) {
      badge.textContent = 'LIVE';
      badge.classList.add('on');
    }
    refresh();
  } catch {
    const badge = document.querySelector('.dsh-live-badge');
    if (badge) badge.textContent = 'OFFLINE';
    const root = document.getElementById('dsh-root');
    if (root && !root.querySelector('[data-offline]')) {
      root.insertAdjacentHTML('afterbegin', `<div data-offline>${errorState({
        title: 'Could not connect to ZVIDA',
        message: 'Your internet connection dropped, so your saved data is not refreshing. Orders, loads and market prices will update once you are back online.',
        retry: true,
      })}</div>`);
    }
  }
}

/* Granular live refetch — realtime events name the table that changed, so each
   one re-hydrates only the store it feeds instead of a full syncAll. */
const TABLE_REFRESH: Record<string, () => Promise<void>> = {
  listings: refreshLiveCatalog,
  market_orders: refreshLiveOrders,
  contracts: refreshLiveLoads,
  deliveries: refreshLiveLoads,
  rfqs: refreshLiveRfqs,
  notifications: async () => {},
  payments: async () => {},
  messages: async () => {},
};

export async function hydrateTables(tables: string[]): Promise<void> {
  const seen = new Set<string>();
  for (const t of tables) {
    if (seen.has(t)) continue;
    seen.add(t);
    const fn = TABLE_REFRESH[t];
    if (fn) await fn();
  }
  if (seen.size) refresh();
}

async function refreshLiveCatalog(): Promise<void> {
  try {
    const m = mkLoad()!;
    const live = await fetchProducts();
    m.cat = mergeCatalog(live as unknown as MarketProduct[], zvidaGoods());
    mkSave();
  } catch { /* ignore */ }
}

async function refreshLiveOrders(): Promise<void> {
  try {
    const m = mkLoad()!;
    const o = await fetchOrders();
    m.orders = o.orders as unknown as MarketOrder[];
    m.seq = o.seq;
    mkSave();
  } catch { /* ignore */ }
}

async function refreshLiveLoads(): Promise<void> {
  try {
    const f = lgLoad()!;
    const l = await fetchLoads();
    f.loads = l.loads as unknown as Consignment[];
    f.seq = l.seq;
    lgSave();
  } catch { /* ignore */ }
}

async function refreshLiveRfqs(): Promise<void> {
  try {
    const m = mkLoad()!;
    const [open, mine] = await Promise.all([fetchOpenRfqs(), fetchMyRfqs()]);
    const seen = new Set<string>();
    m.rfqs = [...mine, ...open].filter((r) => (seen.has(r.id) ? false : (seen.add(r.id), true)));
    mkSave();
  } catch { /* ignore */ }
}

/* ============================================================
   Shell upgrades v2.5 — theme, command palette, popovers,
   notification center, keyboard shortcuts, a11y
   ============================================================ */

type ThemePref = 'light' | 'dark' | 'system';
const THEME_KEY = 'zvd-theme';
let themePref: ThemePref = 'system';
let currentTheme: 'light' | 'dark' = 'light';
let appEl: HTMLElement | null = null;
let paletteEl: HTMLElement | null = null;
let activePop: { btn: HTMLElement; panel: HTMLElement } | null = null;

function systemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function resolveTheme(p: ThemePref): 'light' | 'dark' { return p === 'system' ? systemTheme() : p; }
function loadThemePref(): ThemePref {
  try {
    const t = localStorage.getItem(THEME_KEY);
    if (t === 'light' || t === 'dark' || t === 'system') return t;
  } catch { /* ignore */ }
  return 'system';
}
function setTheme(p: ThemePref): void {
  themePref = p;
  try { localStorage.setItem(THEME_KEY, p); } catch { /* ignore */ }
  currentTheme = resolveTheme(p);
  document.documentElement.setAttribute('data-theme', currentTheme);
  appEl?.setAttribute('data-theme', currentTheme);
  document.querySelectorAll<HTMLElement>('[data-theme-check]').forEach((el) => {
    el.style.display = el.getAttribute('data-theme-check') === themePref ? 'inline-flex' : 'none';
  });
}

/* ---------- Popovers / menus ---------- */
function closeAllPops(): void {
  if (activePop) {
    activePop.panel.classList.remove('open');
    activePop.btn.classList.remove('open');
    activePop.btn.setAttribute('aria-expanded', 'false');
    activePop = null;
  }
}
function togglePop(btn: HTMLElement, panel: HTMLElement): void {
  if (activePop && activePop.btn === btn) { closeAllPops(); return; }
  closeAllPops();
  panel.classList.add('open');
  btn.classList.add('open');
  btn.setAttribute('aria-expanded', 'true');
  activePop = { btn, panel };
}
document.addEventListener('click', (e) => {
  if (!activePop) return;
  const t = e.target as Node;
  if (activePop.btn.contains(t) || activePop.panel.contains(t)) return;
  closeAllPops();
});

/* ---------- Notification dropdown ---------- */
let lastNotifs: { id: string; title: string; body?: string; type: string; read: boolean; created_at?: string }[] = [];

function notifIcon(type: string): string {
  switch (type) {
    case 'contract': return ICON.contracts;
    case 'delivery': return ICON.deliveries;
    case 'message': return ICON.messages;
    case 'payment': return ICON.payments;
    case 'price': return ICON.trendingUp;
    case 'dispute': return ICON.disputes;
    default: return ICON.bell;
  }
}
function timeAgo(iso?: string): string {
  if (!iso) return '';
  const s = (Date.now() - new Date(iso).getTime()) / 1000;
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}
function demoNotifs(): { id: string; title: string; body?: string; type: string; read: boolean; created_at?: string }[] {
  const ago = (m: number) => new Date(Date.now() - m * 60000).toISOString();
  return [
    { id: 'd1', title: 'Market prices updated', body: 'Maize grain is now US$230/t — your listings auto-refresh.', type: 'price', read: false, created_at: ago(25) },
    { id: 'd2', title: 'Your contract is ready', body: 'Contract ZV-DEMO-1 for 10 t of maize awaits your review.', type: 'contract', read: false, created_at: ago(95) },
    { id: 'd3', title: 'New support reply', body: 'Dispatch replied to your ticket #1023.', type: 'message', read: false, created_at: ago(160) },
  ];
}
function renderNotifList(panel: HTMLElement, items: { id: string; title: string; body?: string; type: string; read: boolean; created_at?: string }[]): void {
  const list = panel.querySelector<HTMLElement>('[data-notif-list]');
  if (!list) return;
  if (!items.length) {
    list.innerHTML = `<div class="dsh-notif-empty">${svg(ICON.bell)}<b>All caught up</b><span>New notifications will appear here.</span></div>`;
    return;
  }
  list.innerHTML = items.map((n) => `
    <div class="dsh-notif-item ${n.read ? '' : 'unread'}">
      <span class="dsh-notif-ico">${svg(notifIcon(n.type))}</span>
      <span class="dsh-notif-body">
        <span class="dsh-notif-text">${String(n.title).replace(/</g, '&lt;')}</span>
        ${n.body ? `<span class="dsh-notif-sub">${String(n.body).replace(/</g, '&lt;')}</span>` : ''}
      </span>
      <span class="dsh-notif-time">${timeAgo(n.created_at)}</span>
      ${n.read ? '' : '<span class="dsh-notif-dot"></span>'}
    </div>`).join('');
}

/* ---------- User menu ---------- */
function userMenuItemsHtml(isDemo: boolean): string {
  const themeRows = ([['light', 'Light', ICON.sun], ['dark', 'Dark', ICON.moon], ['system', 'System', ICON.monitor]] as const).map(([k, label, icon]) => `
    <button type="button" class="dsh-pop-item" data-theme-opt="${k}">
      ${svg(icon)}<span class="grow"><span>${label}</span></span>
      <span class="check" data-theme-check="${k}">${svg(ICON.check)}</span>
    </button>`).join('');
  return `
    <button type="button" class="dsh-pop-item" data-action="settings">
      ${svg(ICON.settings)}<span class="grow"><span>Account settings</span><span class="dsh-pop-sub">Profile, verification, payouts</span></span>
    </button>
    <div class="dsh-pop-sep"></div>
    <div class="dsh-pop-head">Appearance</div>
    ${themeRows}
    ${isDemo ? `
    <div class="dsh-pop-sep"></div>
    <button type="button" class="dsh-pop-item" data-action="reset-demo">
      ${svg(ICON.refresh)}<span class="grow"><span>Reset demo data</span><span class="dsh-pop-sub">Restore the sample dataset</span></span>
    </button>` : ''}
    <div class="dsh-pop-sep"></div>
    <button type="button" class="dsh-pop-item danger" data-action="signout">
      ${svg(ICON.logout)}<span class="grow"><span>Sign out</span></span>
    </button>`;
}

/* ---------- Command palette ---------- */
interface PaletteQuickAction { icon: string; name: string; desc: string; run: () => void }
type PaletteRow = { icon: string; name: string; desc: string; text: string; run: () => void };
interface PaletteState {
  items: { el: HTMLElement; run: () => void; text: string }[];
  groups: Map<HTMLElement, HTMLElement[]>;
  live: { gEl: HTMLElement; els: HTMLElement[]; rows: () => PaletteRow[] };
}
let paletteState: PaletteState | null = null;
let paletteActiveIdx = 0;

function visiblePaletteItems(): { el: HTMLElement; run: () => void }[] {
  return paletteState ? paletteState.items.filter((i) => i.el.style.display !== 'none') : [];
}
function movePaletteActive(dir: number): void {
  const vis = visiblePaletteItems();
  if (!vis.length) return;
  paletteActiveIdx = (paletteActiveIdx + dir + vis.length) % vis.length;
  vis.forEach((i, idx) => i.el.classList.toggle('active', idx === paletteActiveIdx));
  vis[paletteActiveIdx].el.scrollIntoView({ block: 'nearest' });
}
function refreshLiveGroup(qq: string): { el: HTMLElement; run: () => void; text: string }[] {
  if (!paletteState) return [];
  const { gEl, rows } = paletteState.live;
  while (gEl.nextSibling) gEl.nextSibling.remove();
  const matches = qq ? rows().filter((r) => r.text.includes(qq)).slice(0, 25) : [];
  const items = matches.map((it) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dsh-palette-item';
    btn.innerHTML = `<span class="dsh-palette-ico">${svg(it.icon)}</span>
      <span class="dsh-palette-main"><span class="dsh-palette-name">${it.name}</span><span class="dsh-palette-desc">${it.desc}</span></span>`;
    btn.addEventListener('click', () => { closePalette(); it.run(); });
    gEl.after(btn);
    return { el: btn, run: it.run, text: it.text };
  });
  paletteState.live.els = items.map((i) => i.el);
  gEl.style.display = items.length ? '' : 'none';
  return items;
}
function filterPalette(q: string): void {
  if (!paletteState) return;
  const qq = q.trim().toLowerCase();
  const staticItems = [...paletteState.groups.values()].flat().map((el) => paletteState!.items.find((i) => i.el === el)!).filter(Boolean);
  paletteState.items = [...staticItems, ...refreshLiveGroup(qq)];
  paletteState.groups.forEach((children, gEl) => {
    let any = false;
    for (const c of children) {
      const info = paletteState!.items.find((i) => i.el === c);
      const show = !qq || (info ? info.text.includes(qq) : false);
      c.style.display = show ? '' : 'none';
      if (show) any = true;
    }
    gEl.style.display = any ? '' : 'none';
  });
  paletteState.items.forEach((i) => i.el.classList.remove('active'));
  paletteActiveIdx = 0;
  const first = paletteState.items.find((i) => i.el.style.display !== 'none');
  if (first) first.el.classList.add('active');
}
function buildPalette(cfg: RoleCfg, quick: PaletteQuickAction[], liveRows: () => PaletteRow[]): void {
  if (!paletteEl) return;
  const results = paletteEl.querySelector<HTMLElement>('[data-palette-results]');
  if (!results) return;
  results.innerHTML = '';
  paletteState = { items: [], groups: new Map(), live: { gEl: document.createElement('div'), els: [], rows: liveRows } };
  const addGroup = (label: string, rows: { icon: string; name: string; desc: string; run: () => void }[]) => {
    const gEl = document.createElement('div');
    gEl.className = 'dsh-palette-group';
    gEl.textContent = label;
    results.appendChild(gEl);
    const children: HTMLElement[] = [];
    for (const it of rows) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'dsh-palette-item';
      btn.innerHTML = `<span class="dsh-palette-ico">${svg(it.icon)}</span>
        <span class="dsh-palette-main"><span class="dsh-palette-name">${it.name}</span><span class="dsh-palette-desc">${it.desc}</span></span>`;
      btn.addEventListener('click', () => { closePalette(); it.run(); });
      results.appendChild(btn);
      paletteState!.items.push({ el: btn, run: it.run, text: `${it.name} ${it.desc}`.toLowerCase() });
      children.push(btn);
    }
    gEl.style.display = children.length ? '' : 'none';
    paletteState!.groups.set(gEl, children);
  };
  addGroup('Pages', cfg.pages.filter((p) => !p.hidden).map((p) => ({
    icon: p.icon,
    name: p.label,
    desc: p.sub || cfg.roleLabel,
    run: () => { window.location.hash = '#' + p.id; },
  })));
  addGroup('Quick actions', quick);
  const liveGEl = document.createElement('div');
  liveGEl.className = 'dsh-palette-group';
  liveGEl.textContent = 'Live results';
  liveGEl.style.display = 'none';
  results.appendChild(liveGEl);
  paletteState.live.gEl = liveGEl;
}
function initPalette(cfg: RoleCfg, quick: PaletteQuickAction[], liveRows: () => PaletteRow[]): void {
  if (!appEl || appEl.querySelector('[data-palette]')) return;
  const mask = document.createElement('div');
  mask.className = 'dsh-palette-mask';
  mask.setAttribute('data-palette', '');
  mask.innerHTML = `
    <div class="dsh-palette" role="dialog" aria-modal="true" aria-label="Search ZVIDA">
      <div class="dsh-palette-input">
        ${svg(ICON.search)}
        <input type="text" placeholder="Search pages, orders, loads, products…" autocomplete="off" spellcheck="false" aria-label="Search" />
        <kbd class="dsh-kbd">esc</kbd>
      </div>
      <div class="dsh-palette-results" data-palette-results></div>
      <div class="dsh-palette-foot">
        <span><kbd class="dsh-kbd">↑</kbd><kbd class="dsh-kbd">↓</kbd> navigate</span>
        <span class="sp"></span>
        <span><kbd class="dsh-kbd">↵</kbd> select · <kbd class="dsh-kbd">esc</kbd> close</span>
      </div>
    </div>`;
  appEl.appendChild(mask);
  paletteEl = mask;
  buildPalette(cfg, quick, liveRows);
  const input = mask.querySelector<HTMLInputElement>('.dsh-palette-input input');
  input?.addEventListener('input', () => filterPalette(input.value));
  mask.addEventListener('click', (e) => { if (e.target === mask) closePalette(); });
  mask.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); movePaletteActive(1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); movePaletteActive(-1); }
    else if (e.key === 'Enter') { e.preventDefault(); visiblePaletteItems()[paletteActiveIdx]?.run(); }
    else if (e.key === 'Escape') { e.preventDefault(); closePalette(); }
  });
}
function openPalette(): void {
  if (!paletteEl) return;
  closeAllPops();
  filterPalette('');
  paletteEl.classList.add('open');
  document.body.classList.add('dsh-no-scroll');
  const input = paletteEl.querySelector<HTMLInputElement>('.dsh-palette-input input');
  requestAnimationFrame(() => input?.focus());
}
function closePalette(): void {
  if (!paletteEl) return;
  paletteEl.classList.remove('open');
  document.body.classList.remove('dsh-no-scroll');
}

/* Global keyboard shortcuts: Ctrl/Cmd+K or "/" open the palette. */
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    openPalette();
    return;
  }
  const target = e.target as HTMLElement | null;
  const typing = Boolean(target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable));
  if (!typing && e.key === '/') {
    e.preventDefault();
    openPalette();
    return;
  }
  if (e.key === 'Escape') closeAllPops();
});

/* ---------- Boot ---------- */
/* ---------- Sidebar nav ---------- */
function navHtml(cfg: RoleCfg): string {
  const pages = cfg.pages.filter((p) => !p.hidden);
  const activeId = cfg.pages[0].id;
  const link = (p: PageCfg) => `<a href="#${p.id}" class="dsh-link ${p.id === activeId ? 'active' : ''}" data-page="${p.id}">${svg(p.icon)}<span>${p.label}</span></a>`;
  if (!cfg.navGroups) return `<div class="dsh-nav-label">Menu</div>${pages.map(link).join('')}`;
  let html = '';
  for (const g of cfg.navGroups) {
    const members = pages.filter((p) => g.pages.includes(p.id));
    if (!members.length) continue;
    html += `<div class="dsh-nav-group"><div class="dsh-nav-label">${g.label}</div>${members.map(link).join('')}</div>`;
  }
  return html;
}

/* ---------- New-account empty state (everything except marketplace + forms) ---------- */
const EMPTY_CTA: Record<string, { label: string; href: string; toast: string }> = {
  farmer: { label: 'Browse the shop', href: '#shop', toast: 'Opening the input store' },
  offtaker: { label: 'Browse the shop', href: '#shop', toast: 'Opening the input store' },
  vendor: { label: 'Add a product', href: '#listings', toast: 'Opening the product form' },
  driver: { label: 'Contact dispatch', href: '#support', toast: 'Opening driver support' },
  zvida: { label: 'Open the marketplace', href: '#marketplace', toast: 'Opening the marketplace' },
  support: { label: 'Refresh', href: '#inbox', toast: 'Refreshing' },
};

const EMPTY_HINTS: Record<string, string> = {
  today: 'Your daily overview — active contracts, loads, orders and payouts — will appear here once your first deal moves.',
  contracts: 'When ZVIDA issues a contract for your harvest, the load pipeline, weighbridge steps and settlements will appear here.',
  deliveries: 'Consignments, weighbridge progress and settled deals will appear here as soon as activity begins.',
  finance: 'Payouts, invoices and your transaction history will appear here after your first deal.',
  perf: 'Your reliability score, ratings and delivery record will appear here after your first deal.',
  documents: 'Invoices, weighbridge certificates and receipts will be filed here automatically as you trade.',
  farm: 'Your farm profile, crop diary and equipment register will appear here once you fill them in.',
  quality: 'Inspection reports and quality certificates for inbound loads will appear here.',
  warehouse: 'Your warehouse inventory, receipts and storage capacity will appear here once you add stock.',
  inventory: 'Your product stock levels will appear here once you list your first product.',
  dispatch: 'When ZVIDA places dispatch orders, your consignment queue will appear here.',
  trips: 'Consignments assigned to you will appear here, ready to start, with weighbridge and GPS steps.',
  earnings: 'Trip earnings and payout deposits will appear here once you complete your first trip.',
  control: 'Once the first listing is approved and matched, live operations, spreads and risk flags will show here.',
  listings: 'Listings submitted for approval will appear here for you to review.',
  matches: 'Anonymous supplier listings and offtaker RFQs will appear here for blind matching.',
  disputes: 'Quality and payment disputes will appear here for resolution.',
  payments: 'Pending and released payments will appear here as contracts settle.',
  reports: 'Operational and financial reports will appear here as activity grows.',
  inbox: 'Support tickets from farmers, vendors and offtakers will appear here.',
  tickets: 'Every support ticket raised on ZVIDAMBANO will appear here.',
  users: 'Signed-up users will appear here as they join ZVIDAMBANO.',
};

const EMPTY_ART: Record<string, string> = {
  today: 'farm',
  contracts: 'grain',
  deliveries: 'truck',
  finance: 'money',
  perf: 'shield2',
  documents: 'seed',
  farm: 'farm',
  quality: 'scan',
  warehouse: 'silo',
  inventory: 'box',
  dispatch: 'truck',
  trips: 'route',
  earnings: 'money',
  control: 'factory',
  listings: 'grain',
  matches: 'seed',
  disputes: 'shield2',
  payments: 'money',
  reports: 'factory',
  inbox: 'support',
  tickets: 'support',
  users: 'seed',
  _role_farmer: 'farm',
  _role_vendor: 'truck',
  _role_offtaker: 'silo',
  _role_driver: 'truck',
  _role_zvida: 'factory',
  _role_support: 'support',
};

/* ---------- New-account onboarding checklist (real accounts only) ---------- */
export interface OnboardStats {
  orders: number;
  loads: number;
  listings: number;
  rfqs: number;
  verified: boolean;
}

interface OnboardTask {
  icon: string;
  label: string;
  hint: string;
  done: (s: OnboardStats) => boolean;
  cta?: { label: string; href?: string; toast?: string };
}

const ONBOARD_DISMISS_KEY = 'zvd-onboard-dismissed';

function onboardDismissed(cfg: RoleCfg, s?: DashboardSession): boolean {
  if (!s) return false;
  try {
    const list: string[] = JSON.parse(localStorage.getItem(ONBOARD_DISMISS_KEY) || '[]');
    return list.includes(`${cfg.key}:${s.id}`);
  } catch {
    return false;
  }
}

const VERIFY_TASK: OnboardTask = {
  icon: ICON.shield,
  label: 'Verify your email',
  hint: 'Confirm the link we emailed you — this unlocks payouts and live trading',
  done: (s) => s.verified,
  cta: { label: 'Resend link', toast: 'Verification email sent — check your inbox' },
};

const ONBOARD_TASKS: Record<string, OnboardTask[]> = {
  farmer: [
    VERIFY_TASK,
    { icon: ICON.sell, label: 'List your first harvest', hint: 'Post grain or produce and ZVIDA matches it to buyers', done: (s) => s.listings > 0, cta: { label: 'List now', href: '#sell', toast: 'Opening the listing form' } },
    { icon: ICON.shop, label: 'Place your first order', hint: 'Buy inputs from vendors on the ZVIDAMBANO store', done: (s) => s.orders > 0, cta: { label: 'Shop inputs', href: '#shop', toast: 'Opening the input store' } },
  ],
  vendor: [
    VERIFY_TASK,
    { icon: ICON.listings, label: 'Add your first product', hint: 'Put your catalogue live for ZVIDA customers to order', done: (s) => s.listings > 0, cta: { label: 'Add product', href: '#listings', toast: 'Opening the product form' } },
    { icon: ICON.orders, label: 'Dispatch your first order', hint: 'Confirm and ship an order to a ZVIDA customer', done: (s) => s.orders > 0, cta: { label: 'View orders', href: '#orders', toast: 'Opening orders' } },
  ],
  offtaker: [
    VERIFY_TASK,
    { icon: ICON.buy, label: 'Post a purchase request', hint: 'Tell ZVIDA what you need — RFQs are matched to suppliers', done: (s) => s.rfqs > 0, cta: { label: 'Post an RFQ', href: '#buy', toast: 'Opening the buy page' } },
    { icon: ICON.deliveries, label: 'Receive your first delivery', hint: 'Suppliers dispatch to you through the ZVIDA pipeline', done: (s) => s.loads > 0, cta: { label: 'View deliveries', href: '#deliveries', toast: 'Opening deliveries' } },
  ],
  driver: [
    VERIFY_TASK,
    { icon: ICON.trips, label: 'Complete your first trip', hint: 'Pick up an assigned consignment, weigh it and deliver', done: (s) => s.loads > 0, cta: { label: 'View trips', href: '#trips', toast: 'Opening trips' } },
  ],
  zvida: [
    VERIFY_TASK,
    { icon: ICON.listings, label: 'Review the first listing', hint: 'Approve supplier listings so they go live for buyers', done: (s) => s.listings > 0, cta: { label: 'Review listings', href: '#listings', toast: 'Opening listings' } },
    { icon: ICON.contracts, label: 'Approve the first contract', hint: 'Match an RFQ to a listing and issue the contract', done: (s) => s.loads > 0, cta: { label: 'Open matching', href: '#matches', toast: 'Opening matching' } },
  ],
  support: [
    VERIFY_TASK,
    { icon: ICON.messages, label: 'Resolve the first ticket', hint: 'Farmers, vendors and offtakers raise tickets here', done: () => false, cta: { label: 'Open inbox', href: '#inbox', toast: 'Opening the inbox' } },
  ],
};

function onboardStats(cfg: RoleCfg, s?: DashboardSession): OnboardStats {
  const m = mkLoad()!;
  const f = lgLoad()!;
  return {
    orders: marketMyOrders().length,
    loads: f.loads.length,
    listings: s ? marketCatalog(s.name).length : 0,
    rfqs: s ? m.rfqs.filter((r) => r.offtakerId === s.id).length : 0,
    verified: Boolean(s?.isVerified),
  };
}

function onboardingHtml(cfg: RoleCfg, s: DashboardSession | undefined, stats: OnboardStats): string {
  if (onboardDismissed(cfg, s)) return '';
  const tasks = (ONBOARD_TASKS[cfg.key] || []).filter(Boolean);
  const total = tasks.length;
  const done = tasks.filter((t) => t.done(stats)).length;
  const pct = total ? Math.round((done / total) * 100) : 100;
  const firstName = (s?.name || cfg.name || 'there').trim().split(/\s+/)[0] || 'there';
  const home = `#${cfg.pages[0].id}`;
  const dismiss = `<button type="button" class="dsh-onboard-dismiss" data-onboard-dismiss aria-label="Dismiss onboarding" title="Dismiss">${svg(ICON.x)}</button>`;
  if (total > 0 && done === total) {
    return `<div class="dsh-onboard ok" data-onboard>
      ${dismiss}
      <span class="dsh-onboard-ok-ico">${svg(ICON.check)}</span>
      <div class="dsh-onboard-ok-body">
        <div class="dsh-onboard-ok-title">You're all set, ${firstName}</div>
        <div class="dsh-onboard-ok-sub">Your ${cfg.roleLabel} workspace is live — ZVIDA will notify you the moment a match or order lands.</div>
      </div>
      ${btn('Go to my workspace', 'ghost sm', 'Opening your workspace', home)}
    </div>`;
  }
  const rows = tasks
    .map((t) => {
      const isDone = t.done(stats);
      const end = isDone ? pill('Done', 'green') : t.cta ? btn(t.cta.label, 'primary sm', t.cta.toast || t.cta.label, t.cta.href || undefined) : '';
      return `<div class="dsh-onboard-task ${isDone ? 'done' : ''}">
        <span class="dsh-onboard-task-ico">${svg(isDone ? ICON.check : t.icon)}</span>
        <div class="dsh-onboard-task-body">
          <div class="dsh-onboard-task-title">${t.label}</div>
          <div class="dsh-onboard-task-sub">${t.hint}</div>
        </div>
        <span class="dsh-onboard-task-end">${end}</span>
      </div>`;
    })
    .join('');
  return `<div class="dsh-onboard" data-onboard>
    <div class="dsh-onboard-main">
      <div class="dsh-onboard-head">
        <span class="dsh-onboard-kick">${cfg.roleLabel} workspace · ${done} of ${total} steps</span>
        <h3>Welcome to ZVIDAMBANO, ${firstName}</h3>
        <p>Finish these steps to unlock live trading. Your data stays private to you until you act.</p>
      </div>
      <div class="dsh-onboard-tasks">${rows}</div>
    </div>
    <aside class="dsh-onboard-side">
      ${dismiss}
      ${ring(pct, `${done}/${total}`, 92)}
      <div class="dsh-onboard-side-title">${pct >= 60 ? 'Nearly there' : 'Getting started'}</div>
      <div class="dsh-onboard-side-sub">${pct >= 60 ? 'Finish the last steps and ZVIDA can start matching you.' : 'Complete each step to unlock the live pipeline.'}</div>
    </aside>
  </div>`;
}

function emptyAccountPage(cfg: RoleCfg, page: PageCfg, s: DashboardSession | undefined, stats: OnboardStats): string {
  const cta = EMPTY_CTA[cfg.key] || { label: 'Refresh', href: '#today', toast: 'Refreshing' };
  const art = EMPTY_ART[page.id] || EMPTY_ART['_role_' + cfg.key] || 'seed';
  const hint = EMPTY_HINTS[page.id] || `${page.title} will fill in automatically as you use ZVIDAMBANO.`;
  return `<div data-empty-account>
    ${onboardingHtml(cfg, s, stats)}
    ${emptyState({
      art,
      icon: page.icon,
      kick: page.title,
      title: 'Nothing here yet',
      sub: hint,
      action: cta.label,
      actionToast: cta.toast,
      actionHref: cta.href,
      hint: 'Start with a task above — the moment your first deal moves, this page comes alive.',
    })}
  </div>`;
}

/* ---------- Notification centre (reachable via the bell → "View all") ---------- */
function notificationsPageHtml(cfg: RoleCfg): string {
  const items = isLiveMode() ? lastNotifs : demoNotifs();
  const body = items.length
    ? items
        .map((n) =>
          listRow(notifIcon(n.type), n.title, n.body || n.type, timeAgo(n.created_at || ''), 'plain', true)
        )
        .join('')
    : emptyState({
        icon: ICON.bell,
        art: 'seed',
        title: 'No notifications yet',
        sub: 'Order updates, contract alerts and payout notices will land here as you trade.',
      });
  return `${sec('Notifications')}
    ${panel({ body, flush: true })}
    ${pushOptInBanner()}
    ${banner('info', 'Live updates also arrive in the bell in the top bar.', undefined, undefined, undefined)}`;
}

/* ---------- Web push opt-in ---------- */
function pushOptInBanner(): string {
  if (!isLiveMode()) {
    return banner('info', 'Sign in with your ZVIDA account to receive browser push notifications.', undefined, undefined, undefined);
  }
  if (hasPushPermission()) {
    return banner('ok', 'Browser push notifications are <b>enabled</b>. Updates arrive even when ZVIDA is closed.', undefined, undefined, undefined);
  }
  if (!vapidConfigured()) {
    return banner('warn', 'Push notifications are not configured yet. Add your VAPID key (VITE_VAPID_PUBLIC_KEY) to enable them.', undefined, undefined, undefined);
  }
  return `${banner('info', 'Turn on browser push notifications so contract and payout updates reach you instantly.', undefined, undefined, undefined)}
    <div style="margin-top:8px">${jsBtn('Enable push notifications', 'primary', 'enablePush')}</div>`;
}

function registerPush(): void {
  JS.enablePush = () => {
    void (async () => {
      const ok = await ensurePushSubscription();
      if (ok) toast('Push notifications enabled', 'success');
      else toast('Could not enable push — allow the permission prompt and confirm your VAPID key is set.', 'error');
    })();
  };
}

/* ---------- Two-factor authentication (dashboard enrollment) ---------- */
let mfaPendingFactor: string | null = null;

export function mfaPanel(): string {
  return `<div data-async="mfa-status"></div>`;
}

function mfaSetupBody(r: EnrollResult): string {
  const code = `style="display:block;padding:9px 11px;background:#f1f5f9;border:1px solid #e2e8f0;border-radius:9px;font:600 12.5px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;color:#0f172a;word-break:break-all;margin-top:5px"`;
  return `${banner('info', 'Open your authenticator app, add this ZVIDAMBANO account, then enter the 6-digit code it shows to activate two-factor authentication.')}
    <div class="dsh-field"><label class="dsh-label">Manual entry secret</label><code ${code}>${r.secret || ''}</code></div>
    <div class="dsh-field"><label class="dsh-label">otpauth URI (scan with your app)</label><code ${code}>${(r.uri || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;')}</code></div>
    ${field('Verification code', input(undefined, '6-digit code', { val: 'mfaCode' }))}
    <div class="dsh-btn-row">${jsBtn('Verify & activate', 'primary', 'mfaVerify')}${jsBtn('Cancel', 'ghost sm', 'mfaCancel')}</div>`;
}

asyncFills['mfa-status'] = async () => {
  if (!isLiveMode()) {
    return `${banner('info', 'Two-factor authentication protects real accounts. Demo profiles do not use it.')}`;
  }
  const s = await getMfaStatus();
  if (!s.factors.length) {
    return `${banner('info', 'Protect your account with two-factor authentication (2FA). After enabling, sign-in asks for a 6-digit code from your authenticator app in addition to your password.')}
      <div class="dsh-btn-row">${jsBtn('Set up authenticator', 'primary', 'mfaEnroll')}</div>`;
  }
  const f = s.factors[0];
  return `${banner('ok', 'Two-factor authentication is on — a 6-digit code is required at sign-in.')}
    ${listRow(ICON.shield, f.friendlyName || 'Authenticator app', `TOTP · session security ${(s.aal || 'aal1').toUpperCase()}`, jsBtn('Remove', 'ghost sm', 'mfaDisable', f.id), 'plain')}`;
};

export function registerMfa(): void {
  JS.mfaEnroll = () => {
    void (async () => {
      const el = document.querySelector<HTMLElement>('[data-async="mfa-status"]');
      if (!el) return;
      el.innerHTML = '<div class="dsh-mfa-pending" style="padding:10px 0;color:var(--dsh-text-3);font-size:13px">Starting secure setup…</div>';
      const r = await enrollTotp('Authenticator app');
      if (!r.ok || !r.factorId) {
        el.innerHTML = `${banner('danger', r.error || 'Could not start two-factor setup.')}<div class="dsh-btn-row">${jsBtn('Try again', 'ghost sm', 'mfaEnroll')}</div>`;
        return;
      }
      mfaPendingFactor = r.factorId;
      el.innerHTML = mfaSetupBody(r);
    })();
  };
  JS.mfaVerify = () => {
    const el = document.querySelector<HTMLElement>('[data-async="mfa-status"]');
    const code = el?.querySelector<HTMLInputElement>('[data-val="mfaCode"]')?.value.trim() || '';
    if (!/^\d{6}$/.test(code)) {
      toast('Enter the 6-digit code from your authenticator app', 'warn');
      return;
    }
    if (!mfaPendingFactor) {
      toast('No pending setup — start again', 'warn');
      refresh();
      return;
    }
    void verifyTotpEnrollment(mfaPendingFactor, code).then((ok) => {
      if (ok) {
        mfaPendingFactor = null;
        toast('Two-factor authentication enabled', 'success');
        refresh();
      } else {
        toast('That code was not accepted — check your authenticator app', 'error');
      }
    });
  };
  JS.mfaCancel = () => {
    mfaPendingFactor = null;
    refresh();
  };
  JS.mfaDisable = (id) => {
    void unEnrollMfa(id).then((r) => {
      toast(r.ok ? 'Two-factor authentication removed' : r.error || 'Could not remove two-factor authentication', r.ok ? 'success' : 'error');
      refresh();
    });
  };
}

/* ---------- Warehouse receipts (buying power & input credit) ---------- */
const WR_COMMODITIES = ['Maize', 'Soya', 'Wheat', 'Sorghum', 'Sugar Beans', 'Millet'];
const WR_GRADES = ['Grade A', 'Grade B', 'Grade C'];
const WR_STORAGE = [
  'GMB Grain Silo — Harare',
  'ZVIDA Hub — Ruwa',
  'ZVIDA Hub — Marondera',
  'GMB Depot — Chinhoyi',
  'ZVIDA Hub — Masvingo',
  'GMB Grain Silo — Mutare',
];

function wrDate(d: string): string {
  if (!d) return '—';
  const t = new Date(d);
  return isNaN(t.getTime()) ? d : t.toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' });
}

function wrTone(status: string): PillTone {
  if (status === 'PLEDGED') return 'amber';
  if (status === 'RELEASED' || status === 'REDEEMED') return 'green';
  if (status === 'EXPIRED') return 'red';
  return 'blue';
}

function wrTonnes(kg: number): string {
  const t = kg / 1000;
  return `${t.toLocaleString([], { maximumFractionDigits: 1 })} t`;
}

function wrStat(label: string, value: string): string {
  return `<div style="flex:1;min-width:104px;background:var(--dsh-surface-3);border:1px solid var(--dsh-border);border-radius:14px;padding:10px 12px">
    <div style="font-size:11px;color:var(--dsh-text-3)">${label}</div>
    <div style="font-size:15px;font-weight:700;margin-top:2px;color:var(--dsh-text)">${value}</div>
  </div>`;
}

function wrRow(r: WarehouseReceipt): string {
  const id = r.id;
  const actions =
    r.status === 'ISSUED'
      ? `${jsBtn('Pledge', 'primary sm', 'wrPledge', id, 'Receipt pledged — buying power increased')} ${jsBtn('Receipt', 'ghost sm', 'wrPdf', id)} ${jsBtn('Delete', 'ghost sm', 'wrDelete', id, 'Receipt deleted')}`
      : r.status === 'PLEDGED'
        ? `${jsBtn('Release', 'ghost sm', 'wrRelease', id, 'Receipt released — collateral returned')} ${jsBtn('Receipt', 'ghost sm', 'wrPdf', id)}`
        : `${jsBtn('Receipt', 'ghost sm', 'wrPdf', id)}`;
  return `<div style="display:flex;align-items:center;gap:10px;padding:12px 0;border-bottom:1px solid var(--dsh-border)">
    <span class="dsh-doc-ico" style="flex:none">${svg(ICON.warehouse)}</span>
    <div style="flex:1;min-width:0">
      <div style="font-size:13.5px;font-weight:600;color:var(--dsh-text)">${r.receipt_number} · ${r.commodity}</div>
      <div style="font-size:12px;color:var(--dsh-text-3);margin-top:2px">${wrTonnes(r.quantity_kg)} · ${r.storage_location || '—'} · Issued ${wrDate(r.issue_date)}</div>
    </div>
    <div style="display:flex;align-items:center;gap:6px;flex-wrap:wrap;justify-content:flex-end">
      ${r.collateralized_amount ? `<span style="font-size:12px;color:var(--dsh-text-2)">${marketMoney(r.collateralized_amount)}</span>` : ''}
      ${pill(r.status, wrTone(r.status))}
      ${actions}
    </div>
  </div>`;
}

export function warehouseReceiptsBody(holderId: string, receipts: WarehouseReceipt[]): string {
  const power = marketMoney(buyingPower(receipts));
  const pledged = wrTonnes(pledgedTonnes(receipts) * 1000);
  const stored = wrTonnes(totalTonnes(receipts) * 1000);
  const rows = receipts.length ? receipts.map(wrRow).join('') : '';
  return `<div data-wr-panel="${holderId}">
    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:8px">
      ${wrStat('Buying power', power)}
      ${wrStat('Pledged collateral', pledged)}
      ${wrStat('Grain stored', stored)}
    </div>
    ${rows || emptyState({ icon: ICON.warehouse, title: 'No warehouse receipts yet', sub: 'Register grain you hold in certified storage to start building buying power.', art: 'seed' })}
    <div class="dsh-disclose">
      <button type="button" class="dsh-disclose-head" data-disclose aria-expanded="false">
        ${svg(ICON.plus)}
        <span class="dsh-disclose-title">Register stored grain</span>
        <span class="dsh-disclose-sum">Issue a warehouse receipt</span>
      </button>
      <div class="dsh-disclose-body">
        <div data-form data-wr-holder="${holderId}">
          <div class="dsh-field-grid">
            ${field('Commodity', select(WR_COMMODITIES, -1, { val: 'wrCommodity', ph: true }))}
            ${field('Quantity (kg)', input(undefined, 'e.g. 12000', { val: 'wrQty', type: 'number', min: '1', step: '50' }))}
          </div>
          <div class="dsh-field-grid">
            ${field('Grade', select(WR_GRADES, -1, { val: 'wrGrade', ph: true }))}
            ${field('Storage', select(WR_STORAGE, -1, { val: 'wrStorage', ph: true }))}
          </div>
          <div class="dsh-btn-row" style="margin-top:12px">${submitBtn('Issue receipt', 'primary', 'wr-issue')}</div>
        </div>
      </div>
    </div>
  </div>`;
}

async function warehouseReceiptsFill(holderId: string): Promise<string> {
  if (!isLiveMode() || !holderId) return warehouseReceiptsBody(holderId, []);
  try {
    const receipts = await getWarehouseReceipts(holderId);
    return warehouseReceiptsBody(holderId, receipts);
  } catch {
    return errorState({ title: 'Could not load receipts', message: 'Check your connection and try again.', retry: true });
  }
}

export function warehouseReceiptsPanel(holderId: string, opts: { title?: string; icon?: string } = {}): string {
  const title = opts.title || 'Buying Power';
  const icon = opts.icon || ICON.wallet;
  const body = isLiveMode() && holderId
    ? `<div data-async="warehouse-receipts"></div>`
    : warehouseReceiptsBody(holderId, demoReceipts(holderId));
  return panel({ title, icon, body });
}

function wrRefresh(holderId: string): void {
  if (isLiveMode() && holderId) {
    const el = document.querySelector<HTMLElement>('[data-async="warehouse-receipts"]');
    if (el) {
      void warehouseReceiptsFill(holderId).then((h) => {
        if (document.body.contains(el)) el.innerHTML = h;
      });
    }
    return;
  }
  const host = document.querySelector<HTMLElement>(`[data-wr-panel="${holderId}"]`);
  if (host) host.outerHTML = warehouseReceiptsBody(holderId, demoReceipts(holderId));
}

async function wrSetStatus(id: string, status: WarehouseReceipt['status']): Promise<void> {
  const rec = await getWarehouseReceipt(id);
  if (!rec) {
    toast('Receipt not found', 'error');
    return;
  }
  const collateral = status === 'PLEDGED' ? Math.round((rec.quantity_kg / 1000) * 400) : null;
  try {
    await updateWarehouseReceipt(id, { status, collateralized_amount: collateral });
    toast(status === 'PLEDGED' ? 'Receipt pledged as collateral' : 'Receipt released', 'success');
    wrRefresh(rec.holder_id);
  } catch (err) {
    toast(err instanceof Error ? err.message : 'Could not update receipt', 'error');
  }
}

async function wrDelete(id: string): Promise<void> {
  const rec = await getWarehouseReceipt(id);
  if (!rec) {
    toast('Receipt not found', 'error');
    return;
  }
  try {
    await deleteWarehouseReceipt(id);
    toast('Receipt deleted', 'success');
    wrRefresh(rec.holder_id);
  } catch (err) {
    toast(err instanceof Error ? err.message : 'Could not delete receipt', 'error');
  }
}

async function wrPdf(id: string): Promise<void> {
  const rec = await getWarehouseReceipt(id);
  if (!rec) {
    toast('Receipt not found', 'error');
    return;
  }
  const key = `wr-${id}`;
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>${rec.receipt_number}</title>
<style>body{font-family:system-ui,sans-serif;color:#111;padding:32px;max-width:640px;margin:0 auto}
h1{font-size:18px;margin:0 0 4px}.muted{color:#666;font-size:12px}
table{width:100%;border-collapse:collapse;margin:20px 0}td,th{border:1px solid #ddd;padding:8px 10px;font-size:13px;text-align:left}
th{background:#f5f5f5;width:38%}.stamp{margin-top:24px;border-top:2px solid #111;padding-top:10px;font-size:12px;color:#333}</style></head>
<body>
<h1>ZVIDA Warehouse Receipt</h1>
<div class="muted">Evidenced storage of grain · Issued by ${rec.issued_by || 'ZVIDA'}</div>
<table>
<tr><th>Receipt number</th><td>${rec.receipt_number}</td></tr>
<tr><th>Commodity</th><td>${rec.commodity}</td></tr>
<tr><th>Quantity</th><td>${wrTonnes(rec.quantity_kg)} (${rec.quantity_kg.toLocaleString()} kg)</td></tr>
<tr><th>Grade</th><td>${rec.quality_grade || '—'}</td></tr>
<tr><th>Storage location</th><td>${rec.storage_location || '—'}</td></tr>
<tr><th>Issue date</th><td>${wrDate(rec.issue_date)}</td></tr>
<tr><th>Maturity date</th><td>${wrDate(rec.maturity_date || '')}</td></tr>
<tr><th>Status</th><td>${rec.status}</td></tr>
${rec.collateralized_amount ? `<tr><th>Collateralised value</th><td>${marketMoney(rec.collateralized_amount)}</td></tr>` : ''}
</table>
<div class="stamp">ZVIDAMBANO — digitising Zimbabwe&apos;s grain trade. Verify this receipt in-app.</div>
</body></html>`;
  registerDownload(key, `${rec.receipt_number}.html`, html, 'text/html');
  downloadNow(key);
  toast(`Downloaded ${rec.receipt_number}`, 'success');
}

async function wrIssue(form: HTMLElement): Promise<void> {
  const holder = form.getAttribute('data-wr-holder') || '';
  const commodity = formValue(form, 'wrCommodity');
  const grade = formValue(form, 'wrGrade');
  const storage = formValue(form, 'wrStorage');
  const qty = parseFloat(formValue(form, 'wrQty'));
  if (!holder || !commodity || !qty || !grade || !storage) {
    toast('Complete all fields to issue a receipt', 'warn');
    return;
  }
  try {
    const rec = await issueWarehouseReceipt({
      holder_id: holder,
      commodity,
      quantity_kg: qty,
      quality_grade: grade,
      storage_location: storage,
    });
    toast(`Receipt ${rec.receipt_number} issued`, 'success');
    wrRefresh(holder);
  } catch (err) {
    toast(err instanceof Error ? err.message : 'Could not issue receipt', 'error');
  }
}

export function registerWarehouseReceipts(): void {
  formRules({
    wrCommodity: { req: true, msg: 'Choose the commodity.' },
    wrQty: { req: true, num: { min: 1, max: 500000, step: 50 }, msg: 'Enter the quantity in kg (1 – 500,000).' },
    wrGrade: { req: true, msg: 'Select a grade.' },
    wrStorage: { req: true, msg: 'Choose certified storage.' },
  });
  asyncFills['warehouse-receipts'] = () => warehouseReceiptsFill(liveUserId());
  JS.wrPledge = (payload) => { void wrSetStatus(payload, 'PLEDGED'); };
  JS.wrRelease = (payload) => { void wrSetStatus(payload, 'RELEASED'); };
  JS.wrDelete = (payload) => { void wrDelete(payload); };
  JS.wrPdf = (payload) => { void wrPdf(payload); };
  onValidSubmit('wr-issue', (form) => { void wrIssue(form); });
}

export function boot(cfg: RoleCfg): void {
  wireMarket();
  wireFreight();
  wireZdoc();
  registerWarehouseReceipts();
  registerPush();
  registerMfa();

  const s = cfg.session;
  setLiveAccount(s ? { id: s.id, role: s.role, name: s.name, isDemo: s.isDemo } : null);
  const isDemo = Boolean(s && s.isDemo);
  const name = isDemo ? cfg.name : s?.name || cfg.name;
  const company = isDemo ? cfg.company : s?.company || cfg.company;
  const initials = isDemo ? cfg.initials : s?.initials || cfg.initials;
  currentUser = `${name} (${cfg.roleLabel})`;

  const resetDemo = () => {
    if (!confirm('Reset this demo account back to its default sample data?')) return;
    try {
      localStorage.removeItem(MK_KEY);
      localStorage.removeItem(LG_KEY);
    } catch {
      /* ignore */
    }
    window.location.reload();
  };

  const body = document.body;
  appEl = null;
  body.innerHTML = `
  <div class="dsh-app" style="--ac:${cfg.accent};--ac-hover:${cfg.accentHover};--ac-soft:${cfg.accentLight};--ac-rgb:${cfg.accentRgb};--ac-deep:${cfg.accentHover}">
    <div class="dsh-overlay" id="dsh-overlay"></div>
    <aside class="dsh-sidebar">
      <a href="#${cfg.pages[0].id}" class="dsh-brand">
        <img src="logo.jpeg" alt="" class="dsh-brand-img" />
        <span class="dsh-brand-text"><span class="dsh-brand-name">ZVIDAMBANO</span><span class="dsh-brand-role">${cfg.roleLabel}</span></span>
      </a>
      <nav class="dsh-nav">
        ${navHtml(cfg)}
      </nav>
      <div class="dsh-side-foot">
        <div class="dsh-pop-wrap">
          <button type="button" class="dsh-user" aria-haspopup="menu" aria-expanded="false">
            ${avatar(initials, 34)}
            <span class="dsh-user-info"><span class="dsh-user-name">${name}</span><span class="dsh-user-role">${company}</span></span>
            <span class="dsh-logout" id="dsh-logout" title="Sign out">${svg(ICON.logout)}</span>
          </button>
          <div class="dsh-pop up" data-pop="user">
            <div class="dsh-pop-head">
              ${avatar(initials, 32)}
              <span class="grow" style="min-width:0;line-height:1.35">
                <span style="display:block;font-size:13px;font-weight:700;color:var(--dsh-text)">${name}</span>
                <span style="display:block;font-size:11px;color:var(--dsh-text-3)">${company}</span>
              </span>
              ${pill(isDemo ? 'Demo' : 'Live', isDemo ? 'amber' : 'green')}
            </div>
            ${userMenuItemsHtml(isDemo)}
          </div>
        </div>
      </div>
    </aside>

    <div class="dsh-main">
      <header class="dsh-topbar">
        <button type="button" class="dsh-menu-btn" id="dsh-menu" aria-label="Toggle menu">${svg(ICON.menu)}</button>
        <div class="dsh-title">
          <h1 id="dsh-title">${cfg.pages[0].title}</h1>
          <p id="dsh-sub">${cfg.pages[0].sub || company}</p>
        </div>
        <button type="button" class="dsh-search" id="dsh-searchbox" aria-label="Search (Ctrl+K)">${svg(ICON.search)}<span class="dsh-search-ph">Search ZVIDA…</span><kbd class="dsh-kbd">ctrl&nbsp;K</kbd></button>
        <button type="button" class="dsh-searchbtn" id="dsh-searchbtn" aria-label="Search">${svg(ICON.search)}</button>
        <span class="dsh-live-badge" id="dsh-live-badge" title="${isDemo ? 'Demo account — sample data, resets locally' : 'Live ZVIDA account'}">${isDemo ? 'DEMO' : 'OFFLINE'}</span>
        ${cfg.pages.some((p) => p.id === 'cart') ? `<button type="button" class="dsh-cartbtn" id="dsh-cart" aria-label="Cart">${svg(ICON.shop)}<span class="dsh-cart-count">${marketQty()}</span></button>` : ''}
        <button type="button" class="dsh-theme" id="dsh-theme" aria-label="Toggle dark mode" title="Toggle dark mode">${svg(ICON.sun, 'sun')}${svg(ICON.moon, 'moon')}</button>
        <div class="dsh-pop-wrap">
          <button type="button" class="dsh-bell" id="dsh-bell" aria-label="Notifications" aria-haspopup="dialog" aria-expanded="false">${svg(ICON.bell)}<span class="dsh-bell-count">0</span></button>
          <div class="dsh-pop dsh-notif" data-pop="notif">
            <div class="dsh-notif-head">
              <span class="dsh-notif-title">${svg(ICON.bell)}Notifications</span>
              <button type="button" class="dsh-notif-clear" data-notif-clear>Mark all read</button>
            </div>
            <div class="dsh-notif-list" data-notif-list></div>
            <div class="dsh-notif-foot"><a href="#notifications" class="dsh-notif-view">View all notifications</a></div>
          </div>
        </div>
        <span class="dsh-top-sep"></span>
        <div class="dsh-pop-wrap">
          <button type="button" class="dsh-me" aria-haspopup="menu" aria-expanded="false">
            ${avatar(initials, 34)}
            <span class="dsh-me-info"><span class="dsh-me-name">${name}</span><span class="dsh-me-role">${cfg.roleLabel}</span></span>
          </button>
          <div class="dsh-pop" data-pop="user">
            <div class="dsh-pop-head">
              ${avatar(initials, 32)}
              <span class="grow" style="min-width:0;line-height:1.35">
                <span style="display:block;font-size:13px;font-weight:700;color:var(--dsh-text)">${name}</span>
                <span style="display:block;font-size:11px;color:var(--dsh-text-3)">${company}</span>
              </span>
              ${pill(isDemo ? 'Demo' : 'Live', isDemo ? 'amber' : 'green')}
            </div>
            ${userMenuItemsHtml(isDemo)}
          </div>
        </div>
      </header>
      <main class="dsh-content" id="dsh-root"></main>
    </div>
  </div>`;

  const app = body.querySelector('.dsh-app') as HTMLElement;
  const sidebar = body.querySelector('.dsh-sidebar') as HTMLElement;
  const overlay = document.getElementById('dsh-overlay') as HTMLElement;
  const root = document.getElementById('dsh-root') as HTMLElement;
  const title = document.getElementById('dsh-title') as HTMLElement;
  const sub = document.getElementById('dsh-sub') as HTMLElement;

  const closeSidebar = () => app.classList.remove('sidebar-open');
  (document.getElementById('dsh-menu') as HTMLButtonElement).addEventListener('click', () => app.classList.toggle('sidebar-open'));
  overlay.addEventListener('click', closeSidebar);
  sidebar.querySelectorAll('.dsh-link').forEach((a) => a.addEventListener('click', closeSidebar));

  appEl = app;
  setTheme(loadThemePref());

  /* ---------- Command palette ---------- */
  const quickActions: PaletteQuickAction[] = [
    {
      icon: ICON.bell,
      name: 'Notifications',
      desc: 'View unread activity',
      run: () => { (document.getElementById('dsh-bell') as HTMLButtonElement)?.click(); },
    },
    {
      icon: currentTheme === 'dark' ? ICON.sun : ICON.moon,
      name: `Switch to ${currentTheme === 'dark' ? 'light' : 'dark'} mode`,
      desc: 'Appearance',
      run: () => setTheme(currentTheme === 'dark' ? 'light' : 'dark'),
    },
    ...(isDemo
      ? [{ icon: ICON.refresh, name: 'Reset demo data', desc: 'Restore the sample dataset', run: () => resetDemo() }]
      : []),
    {
      icon: ICON.settings,
      name: 'Account settings',
      desc: 'Profile, verification, payouts',
      run: () => { const p = cfg.pages.find((pg) => pg.id === 'settings' || pg.id === 'account'); if (p) window.location.hash = '#' + p.id; else toast('Account settings', 'info'); },
    },
    { icon: ICON.logout, name: 'Sign out', desc: 'End this session', run: () => { void signOutAndRedirect(); } },
  ];
  const livePaletteRows = (): PaletteRow[] => {
    const m = mkLoad()!;
    const f = lgLoad()!;
    const navTo = (ids: string[]) => {
      const id = cfg.pages.find((pg) => ids.includes(pg.id))?.id || cfg.pages[0].id;
      window.location.hash = '#' + id;
    };
    const rows: PaletteRow[] = [];
    m.cat.slice(0, 40).forEach((p) =>
      rows.push({
        icon: ICON.shop,
        name: p.name,
        desc: `Marketplace · ${marketMoney(p.price)} / ${p.unit} · ${p.seller}`,
        text: `${p.name} ${p.seller} ${p.category} ${p.unit}`.toLowerCase(),
        run: () => { toast(`Opened ${p.name}`); navTo(['shop', 'marketplace', 'sell']); },
      })
    );
    f.loads.slice(0, 30).forEach((l) =>
      rows.push({
        icon: ICON.truck,
        name: `Load ${l.ref} — ${l.commodity}`,
        desc: `${l.supplier} → ${l.receiver} · ${l.status}`,
        text: `load ${l.ref} ${l.commodity} ${l.supplier} ${l.receiver} ${l.from} ${l.dest} ${l.status} ${l.truck} ${l.driver}`.toLowerCase(),
        run: () => { toast(`Opened load ${l.ref}`); navTo(['contracts', 'deliveries', 'loads', 'trips']); },
      })
    );
    m.orders.slice(0, 30).forEach((o) =>
      rows.push({
        icon: ICON.orders,
        name: o.ref,
        desc: `${o.buyer} · ${o.status} · ${marketMoney(o.total)}`,
        text: `order ${o.ref} ${o.buyer} ${o.status} ${o.id}`.toLowerCase(),
        run: () => { toast(`Opened ${o.ref}`); navTo(['orders', 'marketplace']); },
      })
    );
    return rows;
  };
  initPalette(cfg, quickActions, livePaletteRows);
  (document.getElementById('dsh-searchbox') as HTMLButtonElement).addEventListener('click', () => openPalette());
  (document.getElementById('dsh-searchbtn') as HTMLButtonElement).addEventListener('click', () => openPalette());
  (document.getElementById('dsh-theme') as HTMLButtonElement).addEventListener('click', () => setTheme(currentTheme === 'dark' ? 'light' : 'dark'));

  /* ---------- Sign out ---------- */
  (document.getElementById('dsh-logout') as HTMLElement).addEventListener('click', () => { void signOutAndRedirect(); });

  /* ---------- User menus ---------- */
  const menuAction = (action: string): void => {
    switch (action) {
      case 'settings': {
        closeAllPops();
        const p = cfg.pages.find((pg) => pg.id === 'settings' || pg.id === 'account');
        if (p) window.location.hash = '#' + p.id;
        else toast('Account settings', 'info');
        break;
      }
      case 'signout':
        void signOutAndRedirect();
        break;
      case 'reset-demo':
        closeAllPops();
        resetDemo();
        break;
    }
  };
  app.querySelectorAll<HTMLElement>('[data-pop="user"]').forEach((pop) => {
    pop.addEventListener('click', (e) => {
      const t = (e.target as HTMLElement).closest<HTMLElement>('[data-action],[data-theme-opt]');
      if (!t) return;
      const action = t.getAttribute('data-action');
      if (action) { menuAction(action); return; }
      const opt = t.getAttribute('data-theme-opt');
      if (opt === 'light' || opt === 'dark' || opt === 'system') setTheme(opt);
    });
  });
  app.querySelectorAll<HTMLElement>('.dsh-user, .dsh-me').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('#dsh-logout')) return;
      const wrap = btn.closest<HTMLElement>('.dsh-pop-wrap');
      const panel = wrap?.querySelector<HTMLElement>('[data-pop]');
      if (panel) togglePop(btn, panel);
    });
  });

  /* ---------- Notifications ---------- */
  const bellBtn = document.getElementById('dsh-bell') as HTMLButtonElement;
  const bellCount = () => body.querySelector('.dsh-bell-count') as HTMLElement | null;
  const notifPanel = bellBtn.closest<HTMLElement>('.dsh-pop-wrap')?.querySelector<HTMLElement>('[data-pop="notif"]') as HTMLElement;

  const refreshBell = async () => {
    if (isDemo) {
      const b = bellCount();
      if (b) {
        b.textContent = String(demoNotifs().length);
        b.style.display = '';
        b.title = 'Sample notifications';
      }
      return;
    }
    const n = await fetchUnreadNotifications();
    const b = bellCount();
    if (!b) return;
    b.textContent = String(n.count);
    b.style.display = n.count ? '' : 'none';
    if (n.count && n.latest[0]) b.title = n.latest[0].title;
  };

  bellBtn.addEventListener('click', () => {
    if (isDemo) {
      togglePop(bellBtn, notifPanel);
      if (activePop) renderNotifList(notifPanel, demoNotifs());
      return;
    }
    togglePop(bellBtn, notifPanel);
    if (!activePop) return;
    renderNotifList(notifPanel, lastNotifs);
    void (async () => {
      const n = await fetchUnreadNotifications();
      lastNotifs = n.latest;
      if (activePop && activePop.btn === bellBtn) renderNotifList(notifPanel, n.latest);
    })();
  });
  notifPanel.querySelector('[data-notif-clear]')?.addEventListener('click', () => {
    if (!isDemo) void markNotificationsRead();
    lastNotifs = [];
    renderNotifList(notifPanel, []);
    const b = bellCount();
    if (b) { b.textContent = '0'; b.style.display = 'none'; }
    toast('All notifications marked as read', 'info');
  });
  notifPanel.querySelector('[data-notif-view]')?.addEventListener('click', () => closeAllPops());

  (document.getElementById('dsh-cart') as HTMLButtonElement)?.addEventListener('click', () => {
    window.location.hash = '#cart';
    toast(marketQty() ? `Opening cart (${marketQty()} items)` : 'Your cart is empty', 'info');
  });

  const liveBadge = document.getElementById('dsh-live-badge');
  liveBadge?.addEventListener('click', () => {
    if (isDemo) resetDemo();
    else toast(getLiveAccount() ? 'Connected to ZVIDA — data is live' : 'Reconnecting…', 'info');
  });

  window.matchMedia('(prefers-color-scheme: dark)').addEventListener?.('change', () => { if (themePref === 'system') setTheme('system'); });

  onAuthChange((session) => {
    if (!session) {
      window.location.href = '/login.html';
      return;
    }
    if (!isDemo) void refreshBell();
  });

  /* Real accounts start empty: never flash the demo seed before hydration. */
  if (!isDemo) {
    try {
      localStorage.removeItem(MK_KEY);
      localStorage.removeItem(LG_KEY);
    } catch {
      /* ignore */
    }
    clearDemoReceipts();
    marketStore = { cat: zvidaGoods(), cart: {}, orders: [], seq: 1, rfqs: [] };
    freightStore = { loads: [], seq: 1 };
  }

  const render = (id: string) => {
    closeAllPops();
    const isNotifPage = id === 'notifications';
    const page = cfg.pages.find((p) => p.id === id) || cfg.pages[0];
    title.textContent = isNotifPage ? 'Notifications' : page.title;
    sub.textContent = isNotifPage ? 'Everything happening in your workspace' : (page.sub || company);
    let html = isNotifPage ? notificationsPageHtml(cfg) : page.render();
    if (!isDemo && !isNotifPage) {
      const m = mkLoad()!;
      const f = lgLoad()!;
      const stats = onboardStats(cfg, s);
      const noActivity = m.orders.length === 0 && f.loads.length === 0;
      const keep = Boolean(cfg.keepEmpty && cfg.keepEmpty.includes(page.id));
      if (noActivity && !keep) {
        html = emptyAccountPage(cfg, page, s, stats);
      } else if (liveMode && noActivity) {
        html = onboardingHtml(cfg, s, stats) + html;
      }
    }
    root.innerHTML = html;
    applyPersisted(root);
    sidebar.querySelectorAll('.dsh-link').forEach((a) => a.classList.toggle('active', a.getAttribute('data-page') === page.id));
    wireToasts(root);
    root.querySelectorAll<HTMLElement>('[data-onboard-dismiss]').forEach((b) =>
      b.addEventListener('click', () => {
        try {
          if (s) {
            const list: string[] = JSON.parse(localStorage.getItem(ONBOARD_DISMISS_KEY) || '[]');
            if (!list.includes(`${cfg.key}:${s.id}`)) list.push(`${cfg.key}:${s.id}`);
            localStorage.setItem(ONBOARD_DISMISS_KEY, JSON.stringify(list));
          }
        } catch {
          /* ignore */
        }
        b.closest('.dsh-onboard')?.remove();
      })
    );
    animateCounters(root);
    root.querySelectorAll<HTMLElement>('[data-async]').forEach((el) => {
      const fn = asyncFills[el.getAttribute('data-async') || ''];
      if (!fn) return;
      el.innerHTML = skeleton('row', 2);
      void fn().then((h) => {
        if (document.body.contains(el)) el.innerHTML = h;
      });
    });
    window.scrollTo(0, 0);
    closeSidebar();
  };

  sidebar.querySelectorAll('.dsh-link').forEach((a) => a.addEventListener('click', () => render((a as HTMLElement).dataset.page || '')));
  window.addEventListener('hashchange', () => render(window.location.hash.slice(1)));

  const initial = window.location.hash.slice(1);
  const first = cfg.pages.some((p) => p.id === initial) ? initial : cfg.pages[0].id;
  root.innerHTML = `${skeleton('card', 2)}<div style="height:14px"></div>${skeleton('row', 4)}`;
  setTimeout(() => render(first), 320);

  if (isDemo) {
    if (liveBadge) {
      liveBadge.textContent = 'DEMO';
      liveBadge.classList.add('demo');
    }
    void refreshBell();
  } else {
    void hydrateLive();
    void refreshBell();
    const stopLive = startRealtime({
      onTables: (tables) => {
        void hydrateTables(tables);
        void refreshBell();
      },
      onAnnounce: (title, body) => {
        toast(`${title}${body ? ` — ${body}` : ''}`, 'info');
      },
      onPresence: (count) => {
        const b = document.getElementById('dsh-live-badge');
        if (b) b.title = count > 1 ? `${count} devices online` : 'Connected to ZVIDA — data is live';
      },
      onForceLogout: () => {
        void signOutAndRedirect();
      },
    });
    window.addEventListener('beforeunload', stopLive);
  }

  if (isDemo) {
    let n = 2;
    setInterval(() => {
      n = Math.min(n + 1, 9);
      const b = bellCount();
      if (b) b.textContent = String(n);
    }, 20000);
  }
}
