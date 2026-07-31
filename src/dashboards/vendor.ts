import { boot, ICON, svg, pill, btn, hero, kpis, actions, sec, panel, split, banner, field, input, select, table, listRow, img, itemCard, profile, wf, jsBtn, uploadBtn, registerDownload, downloadNow, JS, toast, chips, marketCatalog, marketAddProduct, marketOrders, marketOrderCard, marketOrderGroup, marketBucket, marketMoney, loadCatalog, loadCard } from './core';
import type { PillTone, MarketProduct } from './core';

const VENDOR = 'Vendor Supplies Ltd';

let PROD_EDIT: null | { oldName: string; name: string; price: string; unit: string } = null;

JS.callBuyer = () => {
  toast('Dialing ZVIDA buyer desk — placing the call from your phone', 'info');
};
JS.editProduct = (_p, el) => {
  const row = el.closest<HTMLTableRowElement>('tr');
  const cells = row?.querySelectorAll('td');
  if (cells && cells.length >= 3) {
    PROD_EDIT = {
      oldName: cells[0].textContent?.trim() || '',
      name: cells[0].textContent?.trim() || '',
      price: (cells[1].textContent || '').trim(),
      unit: (cells[2].textContent || '').trim(),
    };
  }
  window.location.hash = '#today';
  window.location.hash = '#listings';
  toast('Product loaded into the form — update and save', 'info');
};
JS.cancelProdEdit = () => {
  PROD_EDIT = null;
  const cur = window.location.hash;
  window.location.hash = '#today';
  window.location.hash = cur || '#listings';
  toast('Edit cancelled', 'info');
};
JS.submitProduct = () => {
  const ins = document.querySelectorAll<HTMLInputElement>('.dsh-input');
  if (PROD_EDIT) {
    const name = (ins[0]?.value || PROD_EDIT.name).trim() || PROD_EDIT.name;
    const price = parseFloat((ins[1]?.value || PROD_EDIT.price).replace(/[$ ,]/g, '')) || 0;
    const unit = (ins[2]?.value || PROD_EDIT.unit).trim() || PROD_EDIT.unit;
    const oldName = PROD_EDIT.oldName;
    const p = marketCatalog(VENDOR).find((x) => x.name === oldName);
    if (p) {
      p.name = name;
      p.price = price;
      p.unit = unit;
    }
    PROD_EDIT = null;
    window.location.hash = '#today';
    window.location.hash = '#listings';
    toast('Product updated');
    return;
  }
  const category = document.querySelector<HTMLSelectElement>('.dsh-select')?.value || 'Fertilizer';
  const name = (ins[0]?.value || '').trim() || 'New Product';
  const price = parseFloat((ins[1]?.value || '0').replace(/[$ ,]/g, '')) || 0;
  const unit = (ins[2]?.value || '').trim() || 'unit';
  const stock = parseInt(ins[3]?.value || '0', 10) || 0;
  const p: MarketProduct = { id: 'v' + Date.now(), name, category, price, unit, seller: VENDOR, stock, rating: 4.5, reviews: 0, thumb: 'fert' };
  marketAddProduct(p);
  toast('Product listed on the marketplace');
  window.location.hash = '#today';
  window.location.hash = '#listings';
};
JS.saveVendorSettings = () => {
  const b = document.querySelector('[data-js="saveVendorSettings"]') as HTMLButtonElement | null;
  if (b) {
    b.textContent = 'Saved';
    b.disabled = true;
  }
  toast('Bank details saved');
};
JS.downloadStatement = () => {
  downloadNow('v-stmt');
  toast('Statement downloaded');
};

registerDownload('v-stmt', 'Vendor_Statement_Jul2026.csv', [
  'Date,Payout,Source,Status',
  'Jul 15 2026,1120,ORD-5508,Paid',
  'Jul 12 2026,860,ORD-5505,Paid',
  'Jul 10 2026,640,ORD-5502,Paid',
].join('\n'), 'text/csv');

wf('v-list', {
  submit: { done: 'Submitted', toast: 'Product listed on the marketplace' },
});
wf('v-stock', {
  add: { done: 'Added', toast: 'Product form opened' },
  restock: {
    done: 'Sent',
    nav: '#inventory',
    toast: 'Restock request sent to ZVIDA',
    insert: banner('ok', 'Restock request sent to ZVIDA — you will be notified when confirmed.'),
  },
});

const P = {
  today: {
    id: 'today',
    label: 'Today',
    icon: ICON.dashboard,
    title: 'Today',
    sub: 'Vendor Supplies Ltd',
    render: () => {
      const mine = marketOrders(VENDOR);
      const open = mine.filter((o) => !['DELIVERED', 'CANCELLED'].includes(o.status));
      const newCount = mine.filter((o) => o.status === 'NEW').length;
      return `
      ${hero({
        kick: 'Vendor Supplies Ltd · Verified',
        title: 'Good morning',
        sub: `${open.length} orders to fulfil and 7 low-stock items need attention today.`,
        actions: `${btn('New Order', 'primary', 'Opening new orders', '#orders')}`,
        bg: 'dash/hero-warehouse.jpg',
        stats: [
          { l: 'Orders today', v: String(mine.length) },
          { l: 'Month sales', v: '$8,900' },
          { l: 'Fulfilment rate', v: '98%' },
        ],
      })}
      ${actions([
        { label: 'New Orders', icon: ICON.orders, badge: newCount, toast: 'Opening new orders', href: '#orders' },
        { label: 'Add Product', icon: ICON.plus, toast: 'Opening product form', href: '#listings' },
        { label: 'Restock Alert', icon: ICON.alert, badge: 7, toast: 'Opening low stock items', href: '#inventory' },
        { label: 'Payouts', icon: ICON.wallet, toast: 'Opening payouts', href: '#finance' },
      ])}
      ${kpis([
        { label: 'Open Orders', value: open.length, icon: ICON.orders, delta: `${newCount} need action`, up: false, spark: [1, 2, 3, 2, 4, 3, 4], foot: 'Across the marketplace', open: '#orders' },
        { label: 'Month Sales', value: '$8,900', icon: ICON.trendingUp, delta: '+9% this month', up: true, spark: [20, 26, 24, 30, 36, 40, 44], foot: 'Gross revenue', open: '#finance' },
        { label: 'Pending Payouts', value: '$2,400', icon: ICON.wallet, delta: '3 payouts queued', up: false, spark: [12, 14, 18, 16, 20, 22, 24], foot: 'NET_7 terms', open: '#finance' },
        { label: 'Fulfilment Rate', value: 98, icon: ICON.shield, delta: 'Across 300 orders', up: true, spark: [90, 93, 95, 94, 96, 97, 98], foot: '% of orders', open: '#orders' },
      ])}
      ${split(`
        ${sec('Orders to Fulfil', 'View all', 'Opening order pipeline', undefined, '#orders')}
        ${open.length === 0 ? banner('ok', 'No open orders right now. New marketplace orders will appear here.') : open.slice(0, 3).map((o) => marketOrderCard(o, 'seller')).join('')}
      `, `
        ${sec('Low Stock Alerts')}
        ${banner('warn', '7 items below reorder level. Restock advised this week.', 'View stock', 'Opening inventory', '#inventory')}
        ${panel({
          body: table(['Product', 'Stock', 'Reorder level'], [
            ['NPK Fertilizer', '12 bags', '20 bags'],
            ['SC403 Maize Seed', '8 kg', '25 kg'],
            ['Roundup Herbicide', '5 L', '15 L'],
          ]),
          flush: true,
        })}
        ${panel({
          title: 'Marketplace Today',
          icon: ICON.trendingUp,
          body: `${listRow(ICON.orders, 'Orders placed', `${mine.length} all-time · ${newCount} new`, String(newCount), 'plain', true)}
            ${listRow(ICON.wallet, 'Revenue (delivered)', 'Confirmed marketplace orders', marketMoney(mine.filter((o) => o.status === 'DELIVERED').reduce((s, o) => s + o.total, 0)), 'pos')}`,
        })}
      `)}`;
    },
  },
  inventory: {
    id: 'inventory',
    label: 'Inventory',
    icon: ICON.inventory,
    title: 'Inventory',
    sub: 'Stock levels & restock',
    render: () => `
      ${kpis([
        { label: 'Total Products', value: 94, icon: ICON.inventory, delta: '+3 this month', up: true, spark: [10, 12, 12, 13, 14, 14, 15], foot: 'Listed SKUs', open: '#listings' },
        { label: 'Stock Value', value: '$18,400', icon: ICON.wallet, delta: 'Restock advised', up: false, spark: [30, 34, 32, 36, 35, 38, 37], foot: 'At cost', open: '#inventory' },
        { label: 'Low Stock Items', value: 7, icon: ICON.alert, delta: 'Below reorder level', up: false, spark: [4, 5, 6, 5, 7, 6, 7], foot: 'Restock advised', open: '#inventory' },
        { label: 'Out of Stock', value: 2, icon: ICON.x, delta: 'Restock immediately', up: false, spark: [1, 2, 2, 3, 2, 2, 2], foot: 'Require action', open: '#inventory' },
      ])}
      ${sec('Stock Levels')}
      ${panel({
        body: table(['', 'Product', 'Stock', 'Unit', 'Status'], [
          [img('fert', 'xs'), 'NPK Fertilizer', '12', 'bags', pill('Low', 'amber')],
          [img('seed', 'xs'), 'SC403 Maize Seed', '48', 'kg', pill('Ok', 'green')],
          [img('chem', 'xs'), 'Roundup Herbicide', '5', 'L', pill('Low', 'amber')],
          [img('feed', 'xs'), 'Poultry Mash Feed', '60', 'bags', pill('Ok', 'green')],
          [img('chicks', 'xs'), 'Day-old Chicks', '0', 'units', pill('Out of stock', 'red')],
        ], [], ['#listings', '#listings', '#listings', '#listings', '#listings']),
        flush: true,
      })}
      <div class="dsh-btn-row" style="margin-top:12px">${btn('Add Product', 'primary', 'Product form opened', '#listings')}${btn('Restock Request', 'outline', 'Restock request sent to ZVIDA', undefined, 'v-stock', 'restock')}</div>
    `,
  },
  listings: {
    id: 'listings',
    label: 'Listings',
    icon: ICON.listings,
    title: 'Listings',
    sub: 'Add & manage products',
    render: () => `
      ${split(`
        ${sec('Add Product')}
        ${panel({
          title: 'New product',
          icon: ICON.plus,
          body: `
            <div class="dsh-field-grid">
              ${field('Product name', input(PROD_EDIT ? PROD_EDIT.name : undefined, 'e.g. NPK Fertilizer'))}
              ${field('Category', select(['Fertilizer', 'Seeds', 'Chemicals', 'Stockfeed', 'Livestock', 'Equipment'], PROD_EDIT ? 0 : 0))}
            </div>
            <div class="dsh-field-grid">
              ${field('Price', input(PROD_EDIT ? PROD_EDIT.price : undefined, '$ 45.00'))}
              ${field('Unit', input(PROD_EDIT ? PROD_EDIT.unit : undefined, '50kg bag'))}
            </div>
            <div class="dsh-field-grid">
              ${field('Stock quantity', input('20'))}
              ${field('Reorder level', input('5'))}
            </div>
            <div style="margin-bottom:14px">
              <span class="dsh-label">Product image</span>
              ${img('fert', 'wide')}
              <div style="margin-top:10px">${uploadBtn('Upload image', 'ghost sm', 'image/*')}</div>
            </div>
            ${PROD_EDIT ? banner('ok', `Editing <b>${PROD_EDIT.name}</b> — update and save.`) : ''}
            <div class="dsh-btn-row">${PROD_EDIT ? jsBtn('Cancel', 'ghost', 'cancelProdEdit', 'listings', 'Edit cancelled') : ''}${jsBtn(PROD_EDIT ? 'Save Changes' : 'Submit Listing', 'primary', 'submitProduct', '', PROD_EDIT ? 'Product updated' : 'Product listed on the marketplace')}</div>`,
        })}
      `, `
        ${sec('Active Listings')}
        ${panel({
          body: `
            <div data-vend-list>
            ${table(['Product', 'Price', 'Unit', 'Stock', 'Status', ''], marketCatalog(VENDOR).map((p) => [p.name, marketMoney(p.price), p.unit, String(p.stock), p.stock <= 0 ? pill('Out of stock', 'red') : pill('Active', 'green'), jsBtn('Edit', 'ghost sm', 'editProduct', '', 'Product loaded into the form')]))}
            </div>`,
          flush: true,
        })}
        ${panel({
          title: 'Selling Tips',
          icon: ICON.spark,
          body: banner('info', 'Products with real photos sell <b>2.4x</b> faster on average. Keep photos fresh.'),
        })}
      `)}
    `,
  },
  orders: {
    id: 'orders',
    label: 'Orders',
    icon: ICON.orders,
    title: 'Orders',
    sub: 'Marketplace order pipeline',
    render: () => {
      const mine = marketOrders(VENDOR);
      const newCount = mine.filter((o) => o.status === 'NEW').length;
      return `
      ${banner('info', `${newCount} new marketplace orders awaiting your confirmation.`, 'Fulfil now', 'Showing new orders', '#orders')}
      ${sec('Order Pipeline', 'Manage listings', 'Opening your inventory', mine.length, '#inventory')}
      ${chips(['All', 'Active', 'Pending', 'Loading', 'Offloading', 'Complete'], 0, 'vord')}
      ${mine.map((o) => marketOrderGroup(o, 'seller', 'vord', marketBucket(o.status))).join('')}
      ${mine.length === 0 ? banner('ok', 'No orders yet. Farmers see your listings live on the marketplace.') : ''}
    `;
    },
  },
  dispatch: {
    id: 'dispatch',
    label: 'Dispatch',
    icon: ICON.truck,
    title: 'Dispatch',
    sub: 'Consignments to ZVIDA',
    render: () => {
      const mine = loadCatalog().filter((l) => l.supplier === VENDOR);
      const open = mine.filter((l) => !['PAID', 'CANCELLED'].includes(l.status));
      const settled = mine.filter((l) => l.status === 'PAID');
      const payout = mine.filter((l) => l.status === 'PENDING_PAYMENT').reduce((s, l) => s + l.amount, 0);
      return `
      ${kpis([
        { label: 'Open Consignments', value: open.length, icon: ICON.truck, delta: 'To ZVIDA depots', up: true, spark: [1, 1, 2, 1, 2, 2, Math.max(open.length, 1)], foot: 'Dispatch queue', open: '#dispatch' },
        { label: 'Awaiting Payment', value: mine.filter((l) => l.status === 'PENDING_PAYMENT').length, icon: ICON.wallet, delta: `${marketMoney(payout)} in escrow`, up: false, spark: [0, 1, 0, 1, 1, 1, Math.max(mine.filter((l) => l.status === 'PENDING_PAYMENT').length, 1)], foot: 'ZVIDA settles on terms', open: '#finance' },
        { label: 'Settled', value: settled.length, icon: ICON.check, delta: 'Paid to your bank', up: true, spark: [1, 2, 1, 2, 3, 3, Math.max(settled.length, 4)], foot: 'Completed loads', open: '#finance' },
      ])}
      ${banner('info', 'Dispatch fertilizer and inputs to ZVIDA depots. Record the first weighbridge weight to start the consignment — ZVIDA pays on NET_21.')}
      ${sec('Dispatch Queue', 'Settled loads', 'Opening settled loads', settled.length, '#finance')}
      ${open.length ? open.map((l) => loadCard(l, 'supplier')).join('') : banner('ok', 'No open consignments right now.')}
    `;
    },
  },
  finance: {
    id: 'finance',
    label: 'Finance',
    icon: ICON.finance,
    title: 'Finance',
    sub: 'Payouts & history',
    render: () => `
      ${kpis([
        { label: 'Month Sales', value: '$8,900', icon: ICON.trendingUp, delta: '+9% this month', up: true, spark: [20, 26, 24, 30, 36, 40, 44], foot: 'Gross revenue', open: '#finance' },
        { label: 'Pending Payouts', value: '$2,400', icon: ICON.wallet, delta: '3 payouts queued', up: false, spark: [12, 14, 18, 16, 20, 22, 24], foot: 'NET_7 terms', open: '#finance' },
        { label: 'Orders This Month', value: 312, icon: ICON.orders, delta: '14 awaiting fulfilment', up: true, spark: [30, 40, 38, 48, 56, 60, 66], foot: 'Across all channels', open: '#orders' },
        { label: 'Fulfilment Rate', value: 98, icon: ICON.shield, delta: 'Across 300 orders', up: true, spark: [90, 93, 95, 94, 96, 97, 98], foot: '% of orders', open: '#orders' },
      ])}
      ${split(`
        ${sec('Pending Payouts')}
        ${panel({
          body: `
            ${listRow(ICON.finance, 'Payout PY-2212', 'ORD-5510 · Processing', '$450', 'pos', false, '#orders')}
            ${listRow(ICON.finance, 'Payout PY-2211', 'ORD-5509 · Shipped', '$375', 'pos', false, '#orders')}
            ${listRow(ICON.finance, 'Payout PY-2210', 'ORD-5508 · Delivered', '$1,120', 'pos', false, '#orders')}`,
        })}
      `, `
        ${sec('Payment History')}
        ${panel({
          body: table(['Date', 'Payout', 'Source', 'Status'], [
            ['Jul 15, 2026', '$1,120', 'ORD-5508', pill('Paid', 'green')],
            ['Jul 12, 2026', '$860', 'ORD-5505', pill('Paid', 'green')],
            ['Jul 10, 2026', '$640', 'ORD-5502', pill('Paid', 'green')],
          ], [], ['#orders', '#orders', '#orders']),
          flush: true,
        })}
        ${jsBtn('Download Statement', 'outline', 'downloadStatement', '', 'Statement downloaded')}
      `)}
    `,
  },
  settings: {
    id: 'settings',
    label: 'Settings',
    icon: ICON.settings,
    title: 'Settings',
    sub: 'Company & banking',
    render: () => `
      ${split(`
        ${sec('Profile')}
        ${panel({
          title: 'Company',
          icon: ICON.users,
          body: profile([
            { k: 'Company', v: 'Vendor Supplies Ltd' },
            { k: 'Location', v: 'Harare, Zimbabwe' },
            { k: 'Phone', v: '+263 77 555 1212' },
            { k: 'Status', v: `${pill('Verified', 'green')}` },
          ]),
        })}
      `, `
        ${sec('Bank Details')}
        ${panel({
          title: 'Payments',
          icon: ICON.wallet,
          body: `
            <div class="dsh-field-grid">
              ${field('Bank', input('CBZ Bank'))}
              ${field('Account number', input('•••• 4921'))}
            </div>
            <div class="dsh-field-grid">
              ${field('Mobile money', input('EcoCash +263 77 555 1212'))}
              ${field('Tax number', input('ZW-8842-113'))}
            </div>
            <div class="dsh-btn-row">${jsBtn('Save Changes', 'primary', 'saveVendorSettings', '', 'Bank details saved')}</div>`,
        })}
        ${panel({
          title: 'Store Rating',
          icon: ICON.shield,
          body: `${listRow(ICON.shield, 'Seller score', '4.9 / 5.0 · 300 orders', 'Top', 'pos', true)}
            ${listRow(ICON.check, 'Fulfilment rate', '98% on time', 'Great', 'pos')}`,
        })}
      `)}
    `,
  },
};

boot({
  key: 'vendor',
  name: 'Vendor',
  roleLabel: 'Vendor',
  company: 'Vendor Supplies Ltd',
  initials: 'V',
  logoText: 'ZVIDAMBANO · VENDOR',
  accent: '#0d9488',
  accentHover: '#0f766e',
  accentLight: '#f0fdfa',
  accentRgb: '13, 148, 136',
  gradientEnd: '#2dd4bf',
  pages: [P.today, P.inventory, P.listings, P.orders, P.dispatch, P.finance, P.settings],
});
