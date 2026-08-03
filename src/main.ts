import './styles.css';
import './design-system.css';
import { initDesignSystem, FormValidator, openModal, closeModal, toast } from './ui-utils';
import ZvidaSearch from './search';
import { registerServiceWorker, onOnlineStatusChange } from './lib/pwa';
import { initializeAuth, onAuthChange, getAuthState } from './lib/auth';
import { supabase } from './lib/supabase';
import { initAuthUI } from './lib/auth-ui';
import { canAccessDashboard, type UserRole } from './lib/auth-utils';
import { initializeRealtimeSubscriptions } from './lib/realtime';
import { stateManager } from './lib/state-manager';

interface CommodityPrice {
  name: string;
  current: number;
  previous: number;
  unit?: string;
}

interface Depot {
  name: string;
  lat: number;
  lng: number;
}

const COMMODITIES: CommodityPrice[] = [
  { name: 'Maize', current: 365, previous: 380 },
  { name: 'Wheat', current: 520, previous: 540 },
  { name: 'Soya Beans', current: 620, previous: 645 },
  { name: 'Sugar Beans', current: 680, previous: 710 },
  { name: 'Ground Nuts', current: 2.3, previous: 2.6, unit: '/kg' },
  { name: 'Rice', current: 780, previous: 810 },
];

const DEPOTS: Depot[] = [
  { name: 'Harare', lat: -17.8252, lng: 31.0335 },
  { name: 'Chinhoyi', lat: -17.3551, lng: 30.1976 },
  { name: 'Marondera', lat: -18.1853, lng: 31.5519 },
  { name: 'Bindura', lat: -17.3028, lng: 31.3305 },
  { name: 'Gweru', lat: -19.4513, lng: 29.8172 },
  { name: 'Masvingo', lat: -20.0735, lng: 30.8745 },
  { name: 'Mutare', lat: -18.9707, lng: 32.6711 },
  { name: 'Bulawayo', lat: -20.1325, lng: 28.5804 },
  { name: 'Kwekwe', lat: -18.9282, lng: 29.9126 },
  { name: 'Chiredzi', lat: -21.0491, lng: 31.6684 },
];

declare const L: any;

function initMobileNav(): void {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');

  if (!hamburger || !nav) return;

  function openMenu(): void {
    nav!.classList.add('open');
    hamburger!.classList.add('active');
  }

  function closeMenu(): void {
    nav!.classList.remove('open');
    hamburger!.classList.remove('active');
  }

  hamburger.addEventListener('click', () => {
    if (nav.classList.contains('open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  nav.querySelectorAll('.nav-link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('click', (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!nav.contains(target) && !hamburger.contains(target)) {
      closeMenu();
    }
  });
}

function initStickyHeader(): void {
  const header = document.getElementById('header');
  if (!header) return;

  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 10);
  });
}

function initMap(): void {
  const mapEl = document.getElementById('map');
  if (!mapEl || typeof L === 'undefined') return;

  const map = L.map('map', { scrollWheelZoom: false }).setView([-19.0154, 31.0], 6);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  const greenIcon = L.divIcon({
    className: 'custom-marker',
    html: '<div style="width:24px;height:24px;background:#16a34a;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.3);"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  DEPOTS.forEach((depot) => {
    L.marker([depot.lat, depot.lng], { icon: greenIcon })
      .addTo(map)
      .bindPopup(`<strong>${depot.name}</strong><br>Procurement Depot`);
  });
}

function initStatCounters(): void {
  const stats = document.querySelectorAll<HTMLElement>('.stat-number');
  let animated = false;

  function animate(): void {
    if (animated) return;

    const statsSection = document.querySelector('.stats');
    if (!statsSection) return;

    const rect = statsSection.getBoundingClientRect();
    if (rect.top > window.innerHeight * 0.85) return;

    animated = true;

    stats.forEach((el) => {
      const text = el.textContent ?? '';
      const match = text.match(/^([\d,]+)/);
      if (!match) return;

      const target = parseInt(match[1].replace(/,/g, ''), 10);
      const suffix = text.replace(match[1], '');
      const step = Math.ceil(target / 40);
      let current = 0;

      const interval = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(interval);
        }
        el.textContent = current.toLocaleString() + suffix;
      }, 30);
    });
  }

  window.addEventListener('scroll', animate);
  animate();
}

function initNewsletterForm(): void {
  const form = document.getElementById('newsletter-form');
  if (!form) return;

  form.addEventListener('submit', (e: Event) => {
    e.preventDefault();
    const input = form.querySelector<HTMLInputElement>('.newsletter-input');
    if (input?.value) {
      alert(`Subscribed with ${input.value}`);
      input.value = '';
    }
  });
}

interface Product {
  name: string;
  variant: string;
  category: string;
  price: number;
  unit: string;
  available: number;
  availUnit: string;
  location: string;
  gmo?: boolean;
  image?: string;
}

const PRODUCTS: Product[] = [
  { name: 'Maize', variant: 'White', category: 'Grains & Cereals', price: 380, unit: 'ton', available: 28, availUnit: 'ton', location: 'Chiredzi', gmo: true, image: '/maize-grainco2-300x232.jpg' },
  { name: 'Wheat', variant: 'Hard Red', category: 'Grains & Cereals', price: 520, unit: 'ton', available: 180, availUnit: 'ton', location: 'Chinhoyi', gmo: true, image: '/wheat-grainco-300x232.jpg' },
  { name: 'Wheat Bran', variant: '', category: 'Stockfeed', price: 195, unit: 'ton', available: 153, availUnit: 'ton', location: 'Gweru', image: '/Wheat-Bran-grainco.jpg' },
  { name: 'Soya Meal', variant: '', category: 'Stockfeed', price: 450, unit: 'ton', available: 23, availUnit: 'ton', location: 'Kwekwe', gmo: true, image: '/soya-meal-grainco-300x232.jpg' },
  { name: 'Soya Beans', variant: 'Conventional', category: 'Legumes & Pulses', price: 620, unit: 'ton', available: 181, availUnit: 'ton', location: 'Masvingo', gmo: true, image: '/soya-bean-grainco.jpg' },
  { name: 'Samp', variant: 'Coarse', category: 'Grains & Cereals', price: 350, unit: 'ton', available: 130, availUnit: 'ton', location: 'Gweru', image: '/samp-grainco.jpg' },
  { name: 'Rice', variant: 'Long Grain', category: 'Grains & Cereals', price: 780, unit: 'ton', available: 143, availUnit: 'ton', location: 'Marondera', gmo: true, image: '/rice-grain-co.jpg' },
  { name: 'Popcorn', variant: 'White', category: 'Grains & Cereals', price: 450, unit: 'ton', available: 69, availUnit: 'ton', location: 'Chinhoyi', gmo: true, image: '/popcorn-grain-co.jpg' },
  { name: 'Navy Beans', variant: '', category: 'Legumes & Pulses', price: 600, unit: 'ton', available: 54, availUnit: 'ton', location: 'Bulawayo', image: '/Navy-Beans-grainco.jpg' },
  { name: 'Ground Nuts', variant: 'Runner', category: 'Legumes & Pulses', price: 2500, unit: 'ton', available: 36, availUnit: 'ton', location: 'Marondera', gmo: true, image: '/groundnuts-grain-co.jpg' },
];

function formatPrice(n: number): string {
  return n >= 1000 ? n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : n.toFixed(2);
}

function renderProduct(p: Product): string {
  return `
    <div class="pcard" data-category="${p.category}">
      ${p.image ? `<img class="pcard-img" src="${p.image}" alt="${p.name}" />` : ''}
      <div class="pcard-body">
        <div class="pcard-top">
          <span class="pcard-badge">In Stock</span>
          <span class="pcard-category">${p.category}</span>
        </div>
        <h3 class="pcard-name">${p.name}${p.gmo ? '<span class="pcard-gmo">GMO</span>' : ''}</h3>
        ${p.variant ? `<p class="pcard-variant">${p.variant}</p>` : ''}
        <div class="pcard-price">
          <span class="pcard-amount">USD ${formatPrice(p.price)}</span>
          <span class="pcard-unit">/ ${p.unit}</span>
        </div>
        <p class="pcard-stock">${p.available.toLocaleString()} ${p.availUnit} available</p>
        <div class="pcard-footer">
          <span class="pcard-location">${p.location}</span>
          <button class="btn btn-primary pcard-btn" type="button">Configure Order</button>
        </div>
      </div>
    </div>`;
}

let orderProduct: Product | null = null;
let currentProducts: Product[] = [];

function orderRef(): string {
  return 'ZV-ORD-' + Math.random().toString(36).slice(2, 8).toUpperCase();
}

function initOrderFlow(): void {
  const modal = document.getElementById('order-modal');
  const form = document.getElementById('order-form') as HTMLFormElement | null;
  const qtyEl = document.getElementById('order-qty') as HTMLInputElement | null;
  const summaryEl = document.getElementById('order-summary');
  const totalEl = document.getElementById('order-total');
  const nameEl = document.getElementById('order-name') as HTMLInputElement | null;
  const phoneEl = document.getElementById('order-phone') as HTMLInputElement | null;
  const emailEl = document.getElementById('order-email') as HTMLInputElement | null;
  const qtyMsg = document.getElementById('order-qty-msg');

  if (!modal || !form) return;

  function refreshSummary(): void {
    if (!orderProduct) return;
    const q = Math.max(1, parseInt(qtyEl?.value || '1', 10) || 1);
    const total = q * orderProduct.price;
    if (summaryEl) {
      summaryEl.innerHTML = `
        <strong>${orderProduct.name}${orderProduct.variant ? ' &mdash; ' + orderProduct.variant : ''}</strong><br />
        USD ${formatPrice(orderProduct.price)} / ${orderProduct.unit} &middot; ${orderProduct.location} &middot;
        ${orderProduct.available.toLocaleString()} ${orderProduct.availUnit} available`;
    }
    if (totalEl) totalEl.textContent = `USD ${formatPrice(total)}`;
    if (qtyEl) {
      const max = Math.floor(orderProduct.available);
      if (q > max) {
        qtyEl.value = String(max);
        if (qtyMsg) { qtyMsg.textContent = `Only ${max} ${orderProduct.availUnit} available.`; qtyMsg.className = 'ds-msg error'; }
      } else if (qtyMsg) { qtyMsg.textContent = ''; qtyMsg.className = 'ds-msg'; }
    }
  }

  qtyEl?.addEventListener('input', refreshSummary);

  document.getElementById('order-cancel')?.addEventListener('click', () => closeModal('order-modal'));

  form.addEventListener('submit', async (e: Event) => {
    e.preventDefault();
    if (!orderProduct) return;

    const q = parseInt(qtyEl?.value || '0', 10) || 0;
    if (q < 1) {
      toast.error('Invalid quantity', 'Enter a quantity of at least 1 tonne.');
      return;
    }
    const max = Math.floor(orderProduct.available);
    if (q > max) {
      toast.error('Quantity unavailable', `Only ${max} ${orderProduct.availUnit} in stock.`);
      return;
    }

    const name = nameEl?.value.trim() || '';
    const phone = phoneEl?.value.trim() || '';
    const email = emailEl?.value.trim() || '';
    if (!name || !phone || !email) {
      toast.error('Missing details', 'Please provide your name, phone and email.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Invalid email', 'Please enter a valid email address.');
      return;
    }

    const address = (document.getElementById('order-address') as HTMLTextAreaElement | null)?.value.trim() || 'Collection point';
    const delivery = (document.getElementById('order-delivery-method') as HTMLSelectElement | null)?.value || 'ZVIDA Logistics';
    const payment = (document.getElementById('order-payment') as HTMLSelectElement | null)?.value || 'ZVIDA Wallet';
    const total = q * orderProduct.price;
    const placedAt = new Date().toISOString();
    const items = [{
      name: orderProduct.name,
      variant: orderProduct.variant || '',
      category: orderProduct.category,
      qty: q,
      unit: orderProduct.unit,
      price: orderProduct.price,
      location: orderProduct.location,
    }];

    const submitBtn = document.getElementById('order-submit') as HTMLButtonElement | null;
    if (submitBtn) submitBtn.disabled = true;

    const user = getAuthState().user;
    if (user?.id) {
      const ref = orderRef();
      const { error } = await supabase.from('market_orders').insert({
        id: ref,
        ref,
        buyer: user.user_metadata?.full_name || name,
        address,
        delivery,
        payment,
        placed_at: placedAt,
        items,
        history: [{ at: placedAt, status: 'NEW', note: 'Order placed' }],
        status: 'NEW',
        step: 0,
        total,
        user_id: user.id,
      });
      if (submitBtn) submitBtn.disabled = false;
      if (error) {
        console.error('[order] insert failed:', error);
        toast.error('Order failed', error.message || 'Could not place your order.');
        return;
      }
      toast.success('Order placed', `Reference ${ref} — our sales team will contact you shortly.`);
      form.reset();
      if (qtyEl) qtyEl.value = '1';
      refreshSummary();
      closeModal('order-modal');
    } else {
      if (submitBtn) submitBtn.disabled = false;
      const subject = encodeURIComponent(`Order inquiry: ${orderProduct.name} x ${q} ${orderProduct.unit}`);
      const body = encodeURIComponent(
        `Product: ${orderProduct.name}${orderProduct.variant ? ' (' + orderProduct.variant + ')' : ''}\n` +
        `Quantity: ${q} ${orderProduct.unit}\n` +
        `Location: ${orderProduct.location}\n` +
        `Delivery: ${delivery}\n` +
        `Address: ${address}\n` +
        `Payment: ${payment}\n` +
        `Estimated total: USD ${formatPrice(total)}\n` +
        `\nName: ${name}\nPhone: ${phone}\nEmail: ${email}`
      );
      toast.info('Opening your email app', 'Send your order inquiry and we will follow up.');
      window.location.href = `mailto:clemencechikombe@gmail.com?subject=${subject}&body=${body}`;
      form.reset();
      if (qtyEl) qtyEl.value = '1';
      refreshSummary();
      closeModal('order-modal');
    }
  });
}

function initMarketplace(): void {
  const grid = document.getElementById('product-grid');
  const searchInput = document.getElementById('product-search') as HTMLInputElement | null;
  const categoriesEl = document.getElementById('categories');
  const countEl = document.getElementById('result-count');
  const sortSelect = document.getElementById('product-sort') as HTMLSelectElement | null;

  if (!grid) return;

  let activeCategory = 'all';
  let searchTerm = '';
  let sortValue = 'name-asc';

  function render(): void {
    const filtered = PRODUCTS.filter((p) => {
      const matchCat = activeCategory === 'all' || p.category === activeCategory;
      const matchSearch =
        !searchTerm ||
        p.name.toLowerCase().includes(searchTerm) ||
        p.variant.toLowerCase().includes(searchTerm) ||
        p.category.toLowerCase().includes(searchTerm) ||
        p.location.toLowerCase().includes(searchTerm);
      return matchCat && matchSearch;
    });

    filtered.sort((a, b) => {
      switch (sortValue) {
        case 'name-asc': return a.name.localeCompare(b.name);
        case 'name-desc': return b.name.localeCompare(a.name);
        case 'price-asc': return a.price - b.price;
        case 'price-desc': return b.price - a.price;
        default: return 0;
      }
    });

    if (grid) grid.innerHTML = filtered.map(renderProduct).join('');
    if (countEl) countEl.textContent = `${filtered.length} results`;
    currentProducts = filtered;
  }

  categoriesEl?.addEventListener('click', (e: Event) => {
    const target = e.target as HTMLElement;
    const btn = target.closest('.mp-cat') as HTMLElement | null;
    if (!btn) return;

    categoriesEl.querySelectorAll('.mp-cat').forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    activeCategory = btn.dataset.category ?? 'all';
    render();
  });

  searchInput?.addEventListener('input', () => {
    searchTerm = searchInput.value.toLowerCase().trim();
    render();
  });

  sortSelect?.addEventListener('change', () => {
    sortValue = sortSelect.value;
    render();
  });

  grid.addEventListener('click', (e: Event) => {
    const btn = (e.target as HTMLElement).closest<HTMLElement>('.pcard-btn');
    if (!btn) return;
    const card = btn.closest<HTMLElement>('.pcard');
    if (!card) return;
    const idx = Array.from(grid.children).indexOf(card);
    const product = currentProducts[idx];
    if (!product) return;
    orderProduct = product;

    const qtyEl = document.getElementById('order-qty') as HTMLInputElement | null;
    if (qtyEl) qtyEl.value = '1';
    const summaryEl = document.getElementById('order-summary');
    if (summaryEl) {
      summaryEl.innerHTML = `
        <strong>${product.name}${product.variant ? ' &mdash; ' + product.variant : ''}</strong><br />
        USD ${formatPrice(product.price)} / ${product.unit} &middot; ${product.location} &middot;
        ${product.available.toLocaleString()} ${product.availUnit} available`;
    }
    const totalEl = document.getElementById('order-total');
    if (totalEl) totalEl.textContent = `USD ${formatPrice(product.price)}`;
    const user = getAuthState().user;
    const nameEl = document.getElementById('order-name') as HTMLInputElement | null;
    const emailEl = document.getElementById('order-email') as HTMLInputElement | null;
    if (nameEl && user?.user_metadata?.full_name) nameEl.value = user.user_metadata.full_name;
    if (emailEl && user?.email) emailEl.value = user.email;
    openModal('order-modal');
  });

  render();
}

function initFAQ(): void {
  const faqList = document.getElementById('faq-list');
  if (!faqList) return;

  faqList.addEventListener('click', (e: Event) => {
    const btn = (e.target as HTMLElement).closest('.faq-question') as HTMLElement | null;
    if (!btn) return;

    const item = btn.closest('.faq-item') as HTMLElement;
    const isOpen = item.classList.contains('open');

    // close all
    faqList.querySelectorAll('.faq-item').forEach((el) => {
      el.classList.remove('open');
      el.querySelector('.faq-question')?.setAttribute('aria-expanded', 'false');
    });

    // toggle clicked
    if (!isOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
}

function initContactForm(): void {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e: Event) => {
    e.preventDefault();
    const name = (form.querySelector('#cf-name') as HTMLInputElement)?.value;
    const email = (form.querySelector('#cf-email') as HTMLInputElement)?.value;
    if (name && email) {
      alert(`Thank you, ${name}! Your message has been sent. We'll get back to you at ${email}.`);
      (form as HTMLFormElement).reset();
    }
  });
}

function initSearchBars(): void {
  document.querySelectorAll<HTMLElement>('[data-search-component]').forEach(el => {
    new ZvidaSearch(el);
  });
}

function initHeroCarousel(): void {
  const slides = document.querySelectorAll<HTMLElement>('.hero-carousel-slide');
  const captions = document.querySelectorAll<HTMLElement>('.hero-caption');
  if (slides.length < 2) return;
  let current = 0;
  setInterval(() => {
    slides[current].classList.remove('active');
    captions[current]?.classList.remove('active');
    current = (current + 1) % slides.length;
    slides[current].classList.add('active');
    captions[current]?.classList.add('active');
  }, 4000);
}

function init(): void {
  // Initialize PWA capabilities
  registerServiceWorker({
    onSuccess: () => console.log('[PWA] Ready for offline use'),
    onError: (error) => console.warn('[PWA] Error:', error),
  });

  // Monitor online/offline status
  onOnlineStatusChange((isOnline) => {
    console.log(`[PWA] Connection: ${isOnline ? 'online' : 'offline'}`);
  });

  // Initialize authentication state
  initializeAuth().catch((error) => {
    console.warn('[Auth] Initialization error:', error);
  });

  // Listen to auth changes
  const unsubscribe = onAuthChange((session: any) => {
    if (session) {
      console.log('[Auth] User logged in:', session.user?.email);
      // Magic-link callback or a returning session on the login page: bounce to the dashboard.
      if (window.location.pathname.endsWith('login.html')) {
        const role: string | null = session.user?.user_metadata?.role ?? null;
        const dest = canAccessDashboard(role as UserRole);
        if (dest) window.location.href = dest;
      }
    } else {
      console.log('[Auth] User logged out');
    }
  });

  // Initialize UI components
  initMobileNav();
  initStickyHeader();
  initHeroCarousel();
  initMap();
  initStatCounters();
  initNewsletterForm();
  initMarketplace();
  initOrderFlow();
  initFAQ();
  initContactForm();
  initDesignSystem();
  initSearchBars();
  initAuthUI();
}

document.addEventListener('DOMContentLoaded', init);

/* ---- Design system exports ---- */
export { toast, FormValidator } from './ui-utils';
export { initDesignSystem } from './ui-utils';

/* Auto-init forms with [data-form] */
function initDesignSystemForms(): void {
  document.querySelectorAll<HTMLFormElement>('[data-form]').forEach(form => {
    const v = new FormValidator(form);

    // map data-validate tokens to rules
    form.querySelectorAll<HTMLElement>('[data-validate]').forEach(el => {
      const name = el.getAttribute('name') || '';
      const tokens = el.dataset.validate!.split(' ');
      const rules: { test: (value: string) => boolean; msg: string }[] = [];

      if (tokens.includes('required'))  rules.push({ test: v => v.length > 0, msg: 'Required' });
      if (tokens.includes('email'))     rules.push({ test: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), msg: 'Invalid email' });
      if (tokens.includes('phone'))     rules.push({ test: v => /^\+?[\d\s\-()]{7,}$/.test(v), msg: 'Invalid phone' });
      if (tokens.includes('password'))  rules.push({ test: v => v.length >= 8, msg: 'Min 8 characters' });
      if (tokens.includes('weight'))    rules.push({ test: v => /^\d+(\.\d+)?$/.test(v), msg: 'Invalid weight' });
      if (tokens.includes('currency'))  rules.push({ test: v => /^\d+(\.\d{1,2})?$/.test(v), msg: 'Invalid amount' });

      if (rules.length) v.field(name, rules);
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      form.dispatchEvent(new CustomEvent('form-valid', { bubbles: true }));
    });
  });
}

document.addEventListener('DOMContentLoaded', initDesignSystemForms);
