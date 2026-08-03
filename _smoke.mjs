import { JSDOM } from 'jsdom';
import { createServer } from 'vite';

const args = process.argv.slice(2);
const mode = args.find((a) => !a.startsWith('--')) || 'farmer';
const isReal = args.includes('--real');
const stubRole = { vendor: 'supplier', zvida: 'broker' }[mode] || mode;

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>', {
  url: `http://localhost/${mode}-dashboard.html`,
  runScripts: 'outside-only',
  pretendToBeVisual: true,
});
const { window } = dom;

globalThis.window = window;
globalThis.document = window.document;
Object.defineProperty(globalThis, 'navigator', { value: window.navigator, configurable: true });
globalThis.localStorage = window.localStorage;
globalThis.sessionStorage = window.sessionStorage;
globalThis.HTMLElement = window.HTMLElement;
globalThis.HTMLInputElement = window.HTMLInputElement;
globalThis.HTMLButtonElement = window.HTMLButtonElement;
globalThis.HTMLFormElement = window.HTMLFormElement;
globalThis.Node = window.Node;
globalThis.Event = window.Event;
globalThis.KeyboardEvent = window.KeyboardEvent;
globalThis.CustomEvent = window.CustomEvent;
globalThis.getComputedStyle = window.getComputedStyle.bind(window);
globalThis.requestAnimationFrame = window.requestAnimationFrame.bind(window);
globalThis.cancelAnimationFrame = window.cancelAnimationFrame.bind(window);
window.matchMedia = window.matchMedia || (() => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {}, addListener: () => {}, removeListener: () => {} }));
if (typeof window.HashChangeEvent !== 'function') {
  window.HashChangeEvent = class HashChangeEvent extends window.Event {
    constructor(type, init = {}) {
      super(type, init);
      this.newURL = init.newURL || '';
      this.oldURL = init.oldURL || '';
    }
  };
}
globalThis.HashChangeEvent = window.HashChangeEvent;

const errors = [];
window.addEventListener('error', (e) => errors.push('window.onerror: ' + (e.error?.stack || e.message)));
window.addEventListener('unhandledrejection', (e) => errors.push('unhandledrejection: ' + (e.reason?.stack || e.reason)));
process.on('uncaughtException', (e) => errors.push('uncaughtException: ' + e.stack));

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });

const supabaseMod = await server.ssrLoadModule('/src/lib/supabase.ts');
const supabase = supabaseMod.supabase;

const email = isReal ? 'new.farmer@example.com' : 'james@zvida.zw';
supabase.auth.getUser = async () => ({
  data: {
    user: {
      id: 'user-123',
      email,
      user_metadata: { full_name: 'James Test' },
      email_confirmed_at: new Date().toISOString(),
    },
  },
  error: null,
});
if (isReal) {
  /* Empty real DB: every read resolves to no rows (brand-new account), except
     the session's own users row which must resolve to the logged-in role.
     Queries resolve after ~900ms so hydration lands after the shell renders
     (mirrors network latency; the shell paints at t≈320ms). */
  const q = {
    data: [],
    error: null,
    _table: '',
    _sel: '',
    select: function (cols) { this._sel = String(cols); return this; },
    eq: () => q, is: () => q, filter: () => q, in: () => q,
    or: () => q, order: () => q, limit: () => q, single: () => q,
    then: (res) => new Promise((r) => setTimeout(() => res({ data: [], error: null }), 900)),
    maybeSingle: async function () {
      if (this._table === 'users' && this._sel.includes('role')) {
        return { data: { role: stubRole, full_name: 'James Test', phone: null, is_demo: false }, error: null };
      }
      return { data: null, error: null };
    },
  };
  supabase.from = (t) => { q._table = t; return q; };
  supabase.channel = () => ({ on: () => ({ subscribe: () => ({}) }), subscribe: () => ({}) });
  supabase.removeChannel = () => {};
} else {
  supabase.from = () => ({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({ data: { role: stubRole, full_name: 'James Test', phone: null, is_demo: true }, error: null }),
      }),
    }),
  });
  supabase.channel = () => ({ on: () => ({ subscribe: () => ({}) }), subscribe: () => ({}) });
  supabase.removeChannel = () => {};
}

try {
  await server.ssrLoadModule('/src/dashboards/' + mode + '.ts');
  await new Promise((r) => setTimeout(r, isReal ? 3500 : 2500));

  const checks = [];
  const ok = (name, pass, extra = '') => {
    checks.push({ name, pass });
    console.log((pass ? 'PASS' : 'FAIL') + '  ' + name + (extra ? '  [' + extra + ']' : ''));
  };

  const root = document.getElementById('dsh-root');
  ok('shell rendered', !!root && root.innerHTML.length > 100, String(root?.innerHTML.length));

  const hasShop = mode === 'farmer' || mode === 'offtaker';
  if (isReal) {
    // 1. New real account: badge goes LIVE after hydration
    const t0 = Date.now();
    while (Date.now() - t0 < 8000) {
      const b = document.querySelector('.dsh-live-badge');
      if (b && b.textContent === 'LIVE') break;
      await new Promise((r) => setTimeout(r, 100));
    }
    const badge = document.querySelector('.dsh-live-badge');
    ok('real account badge LIVE', badge?.textContent === 'LIVE', String(badge?.textContent));

    // 2. Marketplace is fully populated even with an empty DB
    if (hasShop) {
      window.location.hash = '#shop';
      window.dispatchEvent(new window.Event('hashchange'));
      await new Promise((r) => setTimeout(r, 150));
      const cards = [...document.querySelectorAll('.dsh-shop-card .dsh-shop-name')].map((n) => n.textContent);
      const need = ['Maize', 'Soya', 'Wheat', 'Sorghum', 'Sugar Beans', 'Millet', 'NPK Fertilizer 10-26-26', 'SC403 Maize Seed'];
      const missing = need.filter((n) => !cards.includes(n));
      ok('marketplace shows full ZVIDA catalog', cards.length >= 14 && missing.length === 0,
        'cards=' + cards.length + ' missing=' + missing.join(','));
      ok('no empty-store message', !document.body.textContent.includes('No products in the store yet'));
    } else {
      ok('marketplace check N/A for role', true, mode);
    }
  } else {
    const badge = document.querySelector('.dsh-bell-count');
    ok('demo bell badge = 3', badge?.textContent === '3', String(badge?.textContent));

    document.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'k', ctrlKey: true, bubbles: true }));
    const mask = document.querySelector('[data-palette]');
    ok('palette opens', !!mask && mask.classList.contains('open'));
    const input = mask?.querySelector('.dsh-palette-input input');
    input.value = 'wheat';
    input.dispatchEvent(new window.Event('input', { bubbles: true }));
    await new Promise((r) => setTimeout(r, 50));
    const liveGroup = [...document.querySelectorAll('.dsh-palette-group')].find((g) => g.textContent === 'Live results');
    const liveItems = liveGroup ? [...document.querySelectorAll('.dsh-palette-item')].filter((i) => (liveGroup.compareDocumentPosition(i) & Node.DOCUMENT_POSITION_FOLLOWING)) : [];
    ok('palette live search shows rows', !!liveGroup && liveGroup.style.display !== 'none' && liveItems.length > 0,
      'live rows=' + liveItems.length);
    const names = [...document.querySelectorAll('.dsh-palette-name')].map((n) => n.textContent).join(' | ');
    ok('palette shows quick actions', /Notifications|Account settings/.test(names), names.slice(0, 80));
    input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    ok('palette closes', !mask.classList.contains('open'));

    window.location.hash = '#notifications';
    window.dispatchEvent(new window.Event('hashchange'));
    await new Promise((r) => setTimeout(r, 100));
    ok('notifications page renders', document.getElementById('dsh-title')?.textContent === 'Notifications' && /Market prices updated/.test(document.body.textContent));
  }

  // Marketplace always populated in demo too
  if (hasShop) {
    window.location.hash = '#shop';
    window.dispatchEvent(new window.Event('hashchange'));
    await new Promise((r) => setTimeout(r, 150));
    const cards = [...document.querySelectorAll('.dsh-shop-card .dsh-shop-name')].map((n) => n.textContent);
    const need = ['Maize', 'Soya', 'Wheat', 'Sorghum', 'Sugar Beans', 'Millet'];
    ok('shop grid shows all grains', need.every((n) => cards.includes(n)),
      'cards=' + cards.length + ' grains=' + need.filter((n) => cards.includes(n)).length + '/6');
  }

  // Settings page renders + CRUD handlers wired (demo persists to localStorage)
  window.location.hash = '#settings';
  window.dispatchEvent(new window.Event('hashchange'));
  await new Promise((r) => setTimeout(r, 150));
  ok('settings page renders', document.getElementById('dsh-title')?.textContent === 'Settings', String(document.getElementById('dsh-title')?.textContent));
  const fills = [...document.querySelectorAll('[data-async]')];
  ok('settings async fills present', fills.length > 0, 'fills=' + fills.length);
  await new Promise((r) => setTimeout(r, 400));
  const prefsBtn = document.querySelector('[data-form-submit="fm-prefs"], [data-form-submit="of-prefs"], [data-form-submit="zv-prefs"], [data-form-submit="sp-prefs"]');
  ok('preferences panel renders', !!prefsBtn, String(!!prefsBtn));
  if (!isReal) {
    if (mode === 'farmer') {
      const pay = document.querySelector('input[data-val="fPay"]');
      const farm = document.querySelector('input[data-val="fFarm"]');
      ok('demo payout prefilled', pay?.value === 'EcoCash +263 77 123 4567', String(pay?.value));
      ok('demo farm prefilled', farm?.value === 'James Moyo Family Farm', String(farm?.value));
      const btn = document.querySelector('[data-form-submit="fm-settings"]');
      btn?.click();
      await new Promise((r) => setTimeout(r, 150));
      ok('demo payout save toasts', document.body.textContent.includes('Payout details saved'));
      const payInput = document.querySelector('input[data-val="fPay"]');
      if (payInput) {
        payInput.value = 'EcoCash +263 77 999 8888';
        payInput.dispatchEvent(new window.Event('input', { bubbles: true }));
      }
      btn?.click();
      await new Promise((r) => setTimeout(r, 150));
      ok('demo payout edit saves again', document.body.textContent.includes('Payout details saved'));
    } else if (mode === 'offtaker') {
      const co = document.querySelector('input[data-val="ofCompany"]');
      ok('demo company prefilled', co?.value === 'Miller Corporation', String(co?.value));
    } else if (mode === 'zvida' || mode === 'support') {
      const nm = document.querySelector('input[data-val="zName"], input[data-val="sName"]');
      ok('demo profile prefilled', !!nm && nm.value.length > 0, String(nm?.value));
    }
  }

  // Weighbridge picker on listing forms (Harare, Ruwa, Marondera, Concession, Glendale, Bindura)
  if (mode === 'farmer') {
    window.location.hash = '#sell';
    window.dispatchEvent(new window.Event('hashchange'));
    await new Promise((r) => setTimeout(r, 150));
    const wb = document.querySelector('select[data-val="fWeight"]');
    const opts = wb ? [...wb.querySelectorAll('option')].map((o) => o.value) : [];
    const towns = ['Harare', 'Ruwa', 'Marondera', 'Concession', 'Glendale', 'Bindura'];
    ok('listing weighbridge picker', opts.length === 7 && towns.every((t) => opts.includes(t)), 'options=' + opts.join(','));
  } else if (mode === 'offtaker') {
    window.location.hash = '#buy';
    window.dispatchEvent(new window.Event('hashchange'));
    await new Promise((r) => setTimeout(r, 150));
    const wbs = [...document.querySelectorAll('select[data-val="oPoint"]')];
    const opts = wbs.length ? [...wbs[0].querySelectorAll('option')].map((o) => o.value) : [];
    const towns = ['Harare', 'Ruwa', 'Marondera', 'Concession', 'Glendale', 'Bindura'];
    ok('RFQ weighbridge picker', wbs.length > 0 && opts.length === 7 && towns.every((t) => opts.includes(t)), 'forms=' + wbs.length + ' options=' + opts.join(','));
  }

  // Dark mode toggle
  const themeBtn = document.getElementById('dsh-theme');
  themeBtn?.dispatchEvent(new window.Event('click', { bubbles: true }));
  await new Promise((r) => setTimeout(r, 50));
  ok('dark mode toggles', document.documentElement.dataset.theme === 'dark');

  await new Promise((r) => setTimeout(r, 300));
  console.log('=== captured errors ===');
  console.log(errors.length ? errors.join('\n---\n') : '(none)');
  process.exit(errors.length || checks.some((c) => !c.pass) ? 1 : 0);
} catch (e) {
  errors.push('smoke threw: ' + (e?.stack || e));
  console.log('=== captured errors ===');
  console.log(errors.join('\n---\n'));
  process.exit(1);
}
