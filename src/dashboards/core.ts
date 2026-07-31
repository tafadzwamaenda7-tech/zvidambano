/* ============================================================
   ZVIDA Dashboards — shared shell + UI components (v2)
   ============================================================ */

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
  chevronRight: '<polyline points="9 18 15 12 9 6"/>',
  wallet: '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',
  users:
    '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  sun: '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>',
  map: '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>',
  percent: '<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
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
  const a = ART[key] || ART.grain;
  return `<span class="dsh-thumb ${size}" style="--tg1:${a.g1};--tg2:${a.g2}">${tag ? `<span class="dsh-thumb-tag">${tag}</span>` : ''}${svg(a.p, 'dsh-thumb-ico')}</span>`;
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
export function uploadBtn(label: string, variant: string, accept = ''): string {
  return `<button class="dsh-btn ${variant}" data-upload${accept ? ` data-upload-accept="${accept}"` : ''}>${label}</button>`;
}

/* ---------- JS action hooks (real state changes from dashboards) ---------- */
export const JS: Record<string, (payload: string, el: HTMLElement) => void> = {};
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
export function hero(o: { kick?: string; title: string; sub: string; actions?: string; media?: string; bg?: string; stats?: { l: string; v: string }[] }): string {
  const stats = o.stats
    ? `<div class="dsh-hero-stats">${o.stats.map((s) => `<div class="dsh-hero-stat"><span class="v">${s.v}</span><span class="l">${s.l}</span></div>`).join('')}</div>`
    : '';
  return `<div class="dsh-hero"${o.bg ? ` style="background-image:url('${o.bg}')"` : ''}>
    <div class="dsh-hero-body">
      ${o.kick ? `<span class="dsh-hero-kick">${o.kick}</span>` : ''}
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
        ? `<span class="dsh-kpi-delta ${s.up === undefined ? 'flat' : s.up ? 'up' : 'down'}">${s.up === false ? '↓' : '↑'} ${s.delta}</span>`
        : '';
      return `<div class="dsh-kpi"${s.open ? ` data-open="${s.open}"` : ''}>
        <div class="dsh-kpi-top">
          <span class="dsh-kpi-label">${s.label}</span>
          ${s.icon ? `<span class="dsh-kpi-ico">${svg(s.icon)}</span>` : ''}
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

export function input(value?: string, placeholder?: string): string {
  return `<input class="dsh-input" value="${value || ''}" placeholder="${placeholder || ''}" />`;
}
export function select(options: string[], sel = 0): string {
  return `<select class="dsh-select">${options.map((o, i) => `<option ${i === sel ? 'selected' : ''}>${o}</option>`).join('')}</select>`;
}
export function textarea(rows = 3, placeholder?: string): string {
  return `<textarea class="dsh-textarea" rows="${rows}" placeholder="${placeholder || ''}"></textarea>`;
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

function mkSeed(): { cat: MarketProduct[]; cart: Record<string, number>; orders: MarketOrder[]; seq: number } {
  const cat: MarketProduct[] = [
    { id: 'fert', name: 'NPK Fertilizer 10-26-26', category: 'Fertilizer', price: 45, unit: '50kg bag', seller: 'Vendor Supplies Ltd', stock: 20, rating: 4.5, reviews: 128, thumb: 'fert' },
    { id: 'seed', name: 'SC403 Maize Seed', category: 'Seeds', price: 18, unit: 'kg', seller: 'Vendor Supplies Ltd', stock: 48, rating: 4.7, reviews: 96, thumb: 'seed' },
    { id: 'chem', name: 'Roundup Herbicide', category: 'Chemicals', price: 15, unit: '1L', seller: 'Vendor Supplies Ltd', stock: 12, rating: 4.2, reviews: 61, thumb: 'chem' },
    { id: 'feed', name: 'Poultry Mash Feed', category: 'Stockfeed', price: 12, unit: '50kg bag', seller: 'FeedRight', stock: 60, rating: 4.4, reviews: 204, thumb: 'feed' },
    { id: 'chicks', name: 'Day-old Chicks (Cobb)', category: 'Livestock', price: 1.5, unit: 'unit', seller: 'ChickCorp', stock: 0, rating: 4.0, reviews: 42, thumb: 'chicks' },
    { id: 'tractor', name: 'Tractor Rental (Case IH)', category: 'Equipment', price: 50, unit: 'day', seller: 'Harness Rentals', stock: 5, rating: 4.8, reviews: 33, thumb: 'tractor' },
    { id: 'grain', name: 'Maize Grain (Stockfeed)', category: 'Stockfeed', price: 150, unit: 'ton', seller: 'Miller Corp', stock: 40, rating: 4.3, reviews: 88, thumb: 'grain' },
    { id: 'wheat', name: 'Wheat Bran (Stockfeed)', category: 'Stockfeed', price: 180, unit: 'ton', seller: 'Miller Corp', stock: 25, rating: 4.6, reviews: 57, thumb: 'wheat' },
  ];
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

let marketStore: { cat: MarketProduct[]; cart: Record<string, number>; orders: MarketOrder[]; seq: number } | null = null;

function mkLoad(): typeof marketStore {
  if (marketStore) return marketStore;
  try {
    const raw = localStorage.getItem(MK_KEY);
    marketStore = raw ? JSON.parse(raw) : null;
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
}

export function marketRemoveProduct(id: string): void {
  mkLoad()!.cat = mkLoad()!.cat.filter((p) => p.id !== id);
  mkSave();
}

export function marketOrders(seller?: string): MarketOrder[] {
  const all = [...mkLoad()!.orders].reverse();
  return seller ? all.filter((o) => o.items.some((i) => i.seller === seller)) : all;
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

export function marketPlace(buyer: string): MarketOrder {
  const s = mkLoad()!;
  const lines = marketCartLines();
  const ref = '#C-' + s.seq++;
  const order: MarketOrder = {
    id: 'mk' + (s.seq - 1),
    ref,
    buyer,
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
  return order;
}

function mkAdvance(o: MarketOrder, step: number, note: string): void {
  o.step = Math.min(step, o.flow.length - 1);
  o.status = ['CONFIRMED', 'PROCESSING', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'][o.step - 1] ?? 'DELIVERED';
  o.tone = mkWrap(o.status).tone;
  o.history.push({ t: o.flow[o.step], d: note });
  if (o.status === 'DELIVERED') o.history.push({ t: 'Delivered', d: 'Signed for · carrier' });
  mkSave();
}

function mkSet(o: MarketOrder, status: string, note: string): void {
  o.status = status;
  o.tone = mkWrap(status).tone;
  o.history.push({ t: status.replace(/_/g, ' '), d: note });
  mkSave();
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
  let h = '';
  for (let i = 1; i <= 5; i++) h += `<span class="dsh-star ${i <= full ? 'on' : ''}">★</span>`;
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
      <div class="dsh-shop-sub">${p.seller} · ${p.unit}</div>
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
      <div class="dsh-cart-sub">${it.seller} · ${it.unit} · ${marketMoney(it.price)} each</div>
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

export function marketOrderCard(o: MarketOrder, role: 'buyer' | 'seller' | 'admin' | 'driver' = 'buyer'): string {
  const st = mkWrap(o.status);
  const items = o.items.map((i) => `${i.name} ×${i.qty}`).join(', ');
  let foot = '';
  if (role === 'seller') {
    if (o.status === 'NEW') foot = `${jsBtn('Confirm Order', 'primary sm', 'mktAction', o.id + ':confirm', 'Order confirmed')}${jsBtn('Reject', 'danger sm', 'mktAction', o.id + ':reject', 'Order rejected')}`;
    else if (o.status === 'CONFIRMED') foot = jsBtn('Mark Processing', 'primary sm', 'mktAction', o.id + ':process', 'Order marked as processing');
    else if (o.status === 'PROCESSING') foot = jsBtn('Mark Shipped', 'primary sm', 'mktAction', o.id + ':ship', 'Order marked as shipped');
    else if (o.status === 'SHIPPED' || o.status === 'OUT_FOR_DELIVERY') foot = pill('Awaiting delivery', 'indigo');
    else if (o.status === 'DELIVERED') foot = `${pill('Delivered', 'green')}${jsBtn('Call Buyer', 'ghost sm', 'marketCall', o.buyer, 'Dialing buyer…')}`;
    else foot = pill(st.status, st.tone);
  } else if (role === 'driver') {
    if (o.status === 'SHIPPED') foot = jsBtn('Start Delivery', 'primary sm', 'mktAction', o.id + ':out', 'Picked up — en route');
    else if (o.status === 'OUT_FOR_DELIVERY') foot = jsBtn('Mark Delivered', 'primary sm', 'mktAction', o.id + ':deliver', 'Delivered — signed for');
    else foot = pill(st.status, st.tone);
  } else if (role === 'admin') {
    foot = `${jsBtn('Notify Seller', 'ghost sm', 'mktAction', o.id + ':notify', 'Reminder sent')}${o.status === 'DELIVERED' ? jsBtn('Release Payment', 'primary sm', 'mktAction', o.id + ':pay', 'Payment released') : o.status === 'PAID' ? pill('Paid', 'green') : jsBtn('Escalate', 'danger sm', 'mktAction', o.id + ':esc', 'Escalated to resolution desk')}`;
  } else {
    if (['DELIVERED', 'PAID'].includes(o.status)) foot = `${jsBtn('Buy Again', 'ghost sm', 'mktBuyAgain', o.id, 'Items added to cart')}${jsBtn('Rate Order', 'ghost sm', 'mktAction', o.id + ':review', 'Thanks for your review')}`;
    else if (o.status === 'CANCELLED') foot = pill('Cancelled', 'red');
    else if (o.status === 'ESCALATED') foot = pill('Escalated — ZVIDA resolving', 'red');
    else foot = pill('Track below', 'blue');
  }
  const open = role === 'admin' || role === 'driver' ? '#marketplace' : '#orders';
  return `${itemCard({
    title: `${o.ref} · ${items}`,
    thumb: o.items[0]?.thumb || 'box',
    badge: st.status,
    badgeTone: st.tone,
    key: o.id,
    open,
    time: `${o.placedAt} · ${o.payment}`,
    meta: `${marketSteps(o)}<br/>Buyer: <b>${o.buyer}</b> · Delivery: ${o.delivery} · Total: <b>${marketMoney(o.total)}</b>`,
    foot,
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
  return `<div data-filter-group="${filterGroup}" data-filter-value="${filterValue}"${active ? ' data-filter-active="1"' : ''}>${marketOrderCard(o, role)}</div>`;
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
  weightMode: 'weighbridge' | 'scale';
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
    mode: 'weighbridge' | 'scale', unitPrice: number, payTerm: string,
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
      due, slip, pics: 0, live,
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
        'scale', 450, 'COC', 'John Doe', '+263 77 123 4567', 'ABC-123 · Scania R450', 'XYZ-789 · Grain Tipper 35t',
        'LOADING', 0, 0, '', 'On collection', 0, 0, 0, 0, 20),
      l('LD-2216', '#886', 'Maize', 'grain', 'Peter (Farmer)', 'ZVIDA Brokerage', 'Farm 12, Marondera', 'ZVIDA Depot, Chegutu',
        'weighbridge', 180, 'NET_14', 'Sarah Moyo', '+263 78 987 6543', 'DEF-456 · FAW 8x4', 'UVW-000 · Side tipper',
        'PENDING_PAYMENT', 12000, 26500, 'WB-8861', 'Aug 14, 2026', 100),
      l('LD-2217', '#887', 'NPK Fertilizer', 'fert', 'Vendor Supplies Ltd', 'ZVIDA Brokerage', 'Vendor Yard, Norton', 'ZVIDA Depot, Chinhoyi',
        'weighbridge', 560, 'NET_21', '', '', '', '',
        'PENDING', 0, 0, '', 'Aug 21, 2026', 0),
      l('LD-2218', '#888', 'Wheat', 'wheat', 'Peter (Farmer)', 'Miller Corp (Offtaker)', 'Farm 12, Marondera', 'Miller Corp, Harare',
        'weighbridge', 320, 'NET_7', '', '', '', '',
        'PENDING', 0, 0, '', 'Aug 7, 2026', 0),
      l('LD-2219', '#889', 'Maize', 'grain', 'James (Farmer)', 'Miller Corp (Offtaker)', 'Farm 42, Ruwa', 'Miller Corp, Harare',
        'weighbridge', 200, 'NET_3', 'John Doe', '+263 77 123 4567', 'ABC-123 · Scania R450', 'XYZ-789 · Grain Tipper 35t',
        'IN_TRANSIT', 11000, 0, 'WB-8891', 'Aug 3, 2026', 62),
      l('LD-2220', '#890', 'Maize', 'grain', 'James (Farmer)', 'ZVIDA Brokerage', 'Farm 42, Ruwa', 'ZVIDA Depot, Chegutu',
        'weighbridge', 200, 'NET_14', 'Sarah Moyo', '+263 78 987 6543', 'DEF-456 · FAW 8x4', 'UVW-000 · Side tipper',
        'PENDING_PAYMENT', 8000, 22000, 'WB-8901', 'Aug 14, 2026', 100),
      l('LD-2221', '#891', 'Maize', 'grain', 'James (Farmer)', 'ZVIDA Brokerage', 'Farm 42, Ruwa', 'ZVIDA Depot, Chegutu',
        'weighbridge', 200, 'NET_14', 'Sarah Moyo', '+263 78 987 6543', 'DEF-456 · FAW 8x4', 'UVW-000 · Side tipper',
        'PAID', 9000, 25000, 'WB-8911', 'Jul 31, 2026', 100),
      l('LD-2222', '#892', 'NPK Fertilizer', 'fert', 'Vendor Supplies Ltd', 'ZVIDA Brokerage', 'Vendor Yard, Norton', 'ZVIDA Depot, Chinhoyi',
        'weighbridge', 560, 'NET_21', 'Sarah Moyo', '+263 78 987 6543', 'DEF-456 · FAW 8x4', 'UVW-000 · Side tipper',
        'PENDING_PAYMENT', 5000, 15500, 'WB-8921', 'Aug 21, 2026', 100),
      l('LD-2223', '#893', 'NPK Fertilizer', 'fert', 'Vendor Supplies Ltd', 'ZVIDA Brokerage', 'Vendor Yard, Norton', 'ZVIDA Depot, Chinhoyi',
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

export function loadTele(l: Consignment): string {
  if (l.status !== 'IN_TRANSIT') return '';
  return `<div class="dsh-lg-tele" data-live="${l.id}">
    <span class="dsh-live-dot"></span>
    <div class="dsh-lg-tele-grid">
      <div><span class="l">Progress</span><span class="v" data-live-pct-txt>${Math.round(l.live)}%</span></div>
      <div><span class="l">ETA</span><span class="v" data-live-eta>${l.live >= 75 ? '45 min' : l.live >= 40 ? '1 h 20 m' : '2 h 10 m'}</span></div>
      <div><span class="l">Speed</span><span class="v">${Math.round(40 + l.live * 0.35)} km/h</span></div>
      <div><span class="l">Last ping</span><span class="v" data-live-ping>${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
    </div>
    ${routeMap(l.from, l.dest, { x: 16, y: 60 }, { x: 76, y: 42 }, Math.min(l.live, 95))}
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
      <div><span class="l">Scale · bucket</span><span class="v">${l.bucketKg} kg</span></div>
      <div><span class="l">Bags / Buckets</span><span class="v">${l.bags || '—'} / ${l.buckets || '—'}</span></div>
      <div><span class="l">Net quantity</span><span class="v strong">${net ? net.toLocaleString() + ' kg' : '—'}</span></div>
      <div><span class="l">Scale photos</span><span class="v">${l.pics ? pill(l.pics + ' captured', 'blue') : '—'}</span></div>`;
  return `<div class="dsh-lg-weights">${cells}</div>`;
}

export function loadAmount(l: Consignment): string {
  if (!l.qty) return '';
  return `<div class="dsh-lg-amount">
    <div><span class="l">Quantity</span><span class="v">${(l.qty / 1000).toFixed(2)} t</span></div>
    <div><span class="l">Rate</span><span class="v">${loadMoney(l.unitPrice)} / t</span></div>
    <div><span class="l">Amount</span><span class="v strong">${loadMoney(l.amount)}</span></div>
    <div><span class="l">Terms</span><span class="v">${loadTerm(l)}</span></div>
  </div>`;
}

export function loadWeighForm(l: Consignment, point: 'w1' | 'w2'): string {
  const isW1 = point === 'w1';
  return `<div class="dsh-lg-form">
    <div class="dsh-lg-form-title">${isW1 ? 'First weight' : 'Second weight'} <span class="dsh-lg-form-note">${isW1 ? 'truck on the scale at the farm' : 'truck on the scale at delivery'}</span></div>
    <div class="dsh-lg-form-row">
      <input class="dsh-input" data-wg-id="${l.id}" data-wg="${point}" inputmode="numeric" placeholder="Weight in kg" value="${(isW1 ? l.weight1 : l.weight2) || ''}" />
      ${uploadBtn('Photo', 'ghost', 'image/*')}
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
      ${uploadBtn('Photo', 'ghost', 'image/*')}
    </div>
    <div class="dsh-btn-row">${jsBtn('Confirm Final Load', 'primary sm', 'lgCount', l.id, 'Load counted — amount calculated, payment pending')}</div>
  </div>`;
}

/* ---------- Toasts ---------- */
let toastBox: HTMLElement | null = null;
export function toast(message: string, kind: 'success' | 'info' | 'warn' = 'success'): void {
  if (!toastBox) {
    toastBox = document.createElement('div');
    toastBox.className = 'dsh-toasts';
    document.body.appendChild(toastBox);
  }
  const el = document.createElement('div');
  el.className = `dsh-toast ${kind}`;
  el.innerHTML = `${svg(kind === 'info' ? ICON.bell : kind === 'warn' ? ICON.alert : ICON.check)}<span>${message.replace(/</g, '&lt;')}</span>`;
  toastBox.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 3200);
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
        if (f) toast(`${f.name} attached`, 'info');
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

    const card = target.closest<HTMLElement>('.dsh-item, .dsh-kpi, .dsh-shop-card, .dsh-queue-card, .dsh-feed-item, .dsh-doc');
    if (card && card.hasAttribute('data-open') && !target.closest('button, a, input, select, textarea, label')) {
      openCard(card);
      return;
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
      toast(q ? `Searching marketplace: ${search.value.trim()}` : 'Showing all products', 'info');
      return;
    }
    const inp = (e.target as HTMLElement).closest<HTMLInputElement>('.dsh-chat-input .dsh-input');
    if (inp) {
      e.preventDefault();
      sendMessage(inp.closest('.dsh-chat'));
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
      <span class="dsh-lg-feed-ico" style="--tg1:${l.art};background:linear-gradient(135deg,var(--dsh-surface-3),var(--dsh-surface-2))">${svg(ICON.clock)}</span>
      <div class="dsh-lg-feed-body">
        <div class="dsh-lg-feed-top"><span>${l.ref} · ${h.t}</span><span class="t">${h.d.slice(0, 40)}</span></div>
        <div class="dsh-lg-feed-sub">${l.commodity} · ${l.supplier} → ${l.receiver}</div>
      </div>
    </div>`).join('')}</div>`;
}

function lgFoot(l: Consignment, role: 'supplier' | 'driver' | 'receiver' | 'admin'): string {
  const s = l.status;
  const call = (who: string) => jsBtn('Call', 'ghost sm', 'lgCall', who + '|' + l.phone, `Dialing ${who}…`);
  if (role === 'admin') {
    if (s === 'PENDING_PAYMENT') return `${jsBtn('Release Payment', 'primary sm', 'lgSettle', l.id, `${loadMoney(l.amount)} released to ${l.supplier}`)}${jsBtn('Hold', 'ghost sm', 'lgAction', l.id + ':note', 'Payment held')}${call('Supplier ' + l.supplier)}`;
    if (s === 'PENDING' && !l.driver) return `${jsBtn('Assign Driver', 'primary sm', 'lgAction', l.id + ':assign', 'Driver John Doe assigned')}${call('Supplier ' + l.supplier)}`;
    if (s === 'IN_TRANSIT' || s === 'OFFLOADING') return `${jsBtn('Verify Weights', 'ghost sm', 'lgAction', l.id + ':note', 'Weight verification queued')}${call('Driver ' + l.driver)}`;
    return call('Supplier ' + l.supplier);
  }
  if (role === 'supplier') {
    if (s === 'PENDING') return jsBtn('Start Loading', 'primary sm', 'lgAction', l.id + ':start', 'Loading started — driver notified');
    if (s === 'LOADING' && l.weightMode === 'weighbridge') return loadWeighForm(l, 'w1');
    if (s === 'LOADING' && l.weightMode === 'scale') return loadScaleForm(l);
    if (s === 'WEIGHED_1') return `${jsBtn('Hand Over to Driver', 'primary sm', 'lgAction', l.id + ':depart', 'Truck departed — GPS tracking on')}${call('Driver ' + l.driver)}`;
    if (s === 'IN_TRANSIT') return `${jsBtn('Track Live', 'primary sm', 'lgAction', l.id + ':arrive', 'Opening live tracking',)}${call('Driver ' + l.driver)}`;
    if (s === 'OFFLOADING') return call('Driver ' + l.driver);
    if (s === 'PENDING_PAYMENT') return `${jsBtn('Track Payment', 'ghost sm', 'lgAction', l.id + ':note', 'Payment due ' + l.due)}${call('Driver ' + l.driver)}`;
    if (s === 'PAID') return `${pill('Payment received · Receipt sent', 'green')}${loadDocs(l)}`;
    return '';
  }
  if (role === 'driver') {
    if (s === 'PENDING' && !l.driver) return jsBtn('Accept Load', 'primary sm', 'lgAction', l.id + ':assign', 'Load accepted — dispatch notified');
    if (s === 'PENDING') return jsBtn('Start Loading', 'primary sm', 'lgAction', l.id + ':start', 'Loading started — GPS tracking on');
    if (s === 'LOADING' && l.weightMode === 'weighbridge') return loadWeighForm(l, 'w1');
    if (s === 'LOADING' && l.weightMode === 'scale') return loadScaleForm(l);
    if (s === 'WEIGHED_1') return jsBtn('Start Trip', 'primary sm', 'lgAction', l.id + ':depart', 'Departed — ETA calculated');
    if (s === 'IN_TRANSIT') return `${jsBtn('Report Arrival', 'primary sm', 'lgAction', l.id + ':arrive', 'Arrived — offloading')}${jsBtn('Call Dispatch', 'ghost sm', 'lgCall', 'Dispatch|+263 24 277 8800', 'Dialing ZVIDA dispatch…')}`;
    if (s === 'OFFLOADING' && l.weightMode === 'weighbridge') return loadWeighForm(l, 'w2');
    if (s === 'OFFLOADING') return jsBtn('Offload Complete', 'primary sm', 'lgAction', l.id + ':deliver', 'Offload confirmed — delivery complete');
    if (s === 'PENDING_PAYMENT') return `${pill('Trip complete · payment pending', 'amber')}${loadDocs(l)}`;
    if (s === 'PAID') return `${pill('Trip complete · paid', 'green')}${loadDocs(l)}`;
    return '';
  }
  if (role === 'receiver') {
    if (s === 'IN_TRANSIT') return `${jsBtn('Prepare for Offload', 'ghost sm', 'lgAction', l.id + ':note', 'Intake bay reserved')}${call('Driver ' + l.driver)}`;
    if (s === 'OFFLOADING' && l.weightMode === 'weighbridge') return loadWeighForm(l, 'w2');
    if (s === 'OFFLOADING') return `${jsBtn('Confirm Offload', 'primary sm', 'lgAction', l.id + ':deliver', 'Offload confirmed — delivery complete')}${call('Driver ' + l.driver)}`;
    if (s === 'PENDING_PAYMENT') return `${jsBtn('Download Invoice', 'ghost sm', 'lgDocs', l.id + ':invoice', 'Invoice downloaded')}${jsBtn('Pay ZVIDA', 'primary sm', 'lgAction', l.id + ':note', 'Payment to ZVIDA queued')}`;
    if (s === 'PAID') return `${pill('Settled with ZVIDA', 'green')}${loadDocs(l)}`;
    return '';
  }
  return '';
}

export function loadCard(l: Consignment, role: 'supplier' | 'driver' | 'receiver' | 'admin' = 'supplier'): string {
  const st = lgWrap(l.status);
  const head = `${l.ref} · ${l.commodity}`;
  const meta = `
    <div class="dsh-lg-meta-row">
      <span>${svg(ICON.route)} ${l.from} → ${l.dest}</span>
      <span>${svg(ICON.truck)} ${l.driver || 'No driver assigned'} · ${l.truck || '—'}</span>
      <span>${svg(ICON.contracts)} ${l.contract} · ${l.poRef} · ${l.order}</span>
    </div>
    <div class="dsh-lg-meta-row">
      <span>${svg(ICON.users)} Supplier: ${l.supplier}</span>
      <span>${svg(ICON.buy)} Receiver: ${l.receiver}</span>
      <span>${svg(ICON.weighbridge)} ${l.weightMode === 'weighbridge' ? 'Weighbridge' : 'Scale · ' + l.bucketKg + ' kg bucket'}</span>
    </div>`;
  return `<div class="dsh-lg-card" data-live-card="${l.id}">
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
    ${loadTele(l)}
    ${loadWeights(l)}
    ${loadAmount(l)}
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
    if (!l.inputKg && !l.bags && !l.buckets) {
      toast('Enter buckets, bags or total kgs', 'warn');
      return;
    }
    l.qty = l.inputKg || l.bags * 50 + l.buckets * l.bucketKg;
    l.amount = Math.round((l.qty / 1000) * l.unitPrice);
    l.pics += 1;
    lgTransition(l, 'count', 'Counted by ' + currentUser);
    toast(`${l.qty.toLocaleString()} kg · ${loadMoney(l.amount)} — payment pending`, 'success');
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
  JS.lgPhoto = () => toast('Photo captured — attached to the load record', 'info');

  if (freightLiveTimer === null) {
    freightLiveTimer = window.setInterval(() => {
      const els = document.querySelectorAll<HTMLElement>('[data-live-card]');
      if (!els.length) return;
      els.forEach((card) => {
        const id = card.getAttribute('data-live-card') || '';
        const l = load(id);
        if (!l || l.status !== 'IN_TRANSIT') return;
        l.live = Math.min(l.live + 2 + Math.floor(Math.random() * 3), 98);
        lgSave();
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

/* ---------- Boot ---------- */
export function boot(cfg: RoleCfg): void {
  wireMarket();
  wireFreight();
  currentUser = `${cfg.name} (${cfg.roleLabel})`;
  const body = document.body;
  body.innerHTML = `
  <div class="dsh-app" style="--ac:${cfg.accent};--ac-hover:${cfg.accentHover};--ac-soft:${cfg.accentLight};--ac-rgb:${cfg.accentRgb};--grad:linear-gradient(135deg,${cfg.accent} 0%,${cfg.gradientEnd} 100%);--ac-deep:${cfg.accentHover}">
    <div class="dsh-overlay" id="dsh-overlay"></div>
    <aside class="dsh-sidebar">
      <a href="#${cfg.pages[0].id}" class="dsh-brand">
        <img src="logo.jpeg" alt="" class="dsh-brand-img" />
        <span class="dsh-brand-text"><span class="dsh-brand-name">ZVIDAMBANO</span><span class="dsh-brand-role">${cfg.roleLabel}</span></span>
      </a>
      <nav class="dsh-nav">
        <div class="dsh-nav-label">Menu</div>
        ${cfg.pages
          .filter((p) => !p.hidden)
          .map((p, i) => `<a href="#${p.id}" class="dsh-link ${i === 0 ? 'active' : ''}" data-page="${p.id}">${svg(p.icon)}<span>${p.label}</span></a>`)
          .join('')}
      </nav>
      <div class="dsh-side-foot">
        <button class="dsh-user">
          ${avatar(cfg.initials, 34)}
          <span class="dsh-user-info"><span class="dsh-user-name">${cfg.name}</span><span class="dsh-user-role">${cfg.company}</span></span>
          <span class="dsh-logout" id="dsh-logout" title="Sign out">${svg(ICON.logout)}</span>
        </button>
      </div>
    </aside>

    <div class="dsh-main">
      <header class="dsh-topbar">
        <button class="dsh-menu-btn" id="dsh-menu" aria-label="Toggle menu">${svg(ICON.menu)}</button>
        <div class="dsh-title">
          <h1 id="dsh-title">${cfg.pages[0].title}</h1>
          <p id="dsh-sub">${cfg.pages[0].sub || cfg.company}</p>
        </div>
        <div class="dsh-search">${svg(ICON.search)}<input placeholder="Search contracts, loads, people…" /></div>
        ${cfg.pages.some((p) => p.id === 'cart') ? `<button class="dsh-cartbtn" id="dsh-cart" aria-label="Cart">${svg(ICON.shop)}<span class="dsh-cart-count">${marketQty()}</span></button>` : ''}
        <button class="dsh-bell" id="dsh-bell" aria-label="Notifications">${svg(ICON.bell)}<span class="dsh-bell-count">2</span></button>
        <span class="dsh-top-sep"></span>
        <div class="dsh-me">
          ${avatar(cfg.initials, 34)}
          <div class="dsh-me-info"><div class="dsh-me-name">${cfg.name}</div><div class="dsh-me-role">${cfg.roleLabel}</div></div>
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

  (document.getElementById('dsh-logout') as HTMLElement).addEventListener('click', () => (window.location.href = 'login.html'));
  (document.getElementById('dsh-bell') as HTMLButtonElement).addEventListener('click', () => toast('You have 2 new notifications', 'info'));
  (document.getElementById('dsh-cart') as HTMLButtonElement)?.addEventListener('click', () => {
    window.location.hash = '#cart';
    toast(marketQty() ? `Opening cart (${marketQty()} items)` : 'Your cart is empty', 'info');
  });

  const searchInput = body.querySelector<HTMLInputElement>('.dsh-search input');
  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') toast(`Searching ZVIDA: ${searchInput.value.trim() || 'all results'}`, 'info');
  });
  app.querySelector('.dsh-user')?.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('#dsh-logout')) return;
    toast('Account settings', 'info');
  });

  const render = (id: string) => {
    const page = cfg.pages.find((p) => p.id === id) || cfg.pages[0];
    title.textContent = page.title;
    sub.textContent = page.sub || cfg.company;
    root.innerHTML = page.render();
    applyPersisted(root);
    sidebar.querySelectorAll('.dsh-link').forEach((a) => a.classList.toggle('active', a.getAttribute('data-page') === page.id));
    wireToasts(root);
    animateCounters(root);
    window.scrollTo(0, 0);
    closeSidebar();
  };

  sidebar.querySelectorAll('.dsh-link').forEach((a) => a.addEventListener('click', () => render((a as HTMLElement).dataset.page || '')));
  window.addEventListener('hashchange', () => render(window.location.hash.slice(1)));

  const initial = window.location.hash.slice(1);
  render(cfg.pages.some((p) => p.id === initial) ? initial : cfg.pages[0].id);

  let n = 2;
  setInterval(() => {
    n = Math.min(n + 1, 9);
    const badge = body.querySelector('.dsh-bell-count');
    if (badge) badge.textContent = String(n);
  }, 20000);
}
