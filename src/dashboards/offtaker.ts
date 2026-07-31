import { boot, ICON, pill, btn, hero, kpis, actions, sec, panel, split, banner, field, input, select, table, listRow, bars, ring, img, itemCard, chat, tabs, chips, wf, invoice, steps, jsBtn, uploadBtn, registerDownload, downloadNow, JS, toast, ledger, marketCatalog, marketProductCard, marketCartLine, marketCartLines, marketQty, marketSubtotal, marketMoney, marketPlace, marketOrders, marketOrderCard, marketOrderGroup, marketLastOrder, marketSteps, marketRecommend, marketBucket, loadCatalog, loadCard } from './core';
import type { PillTone } from './core';

const OFF_LISTINGS: { title: string; thumb: string; badge: string; badgeTone: PillTone; meta: string; foot: string }[] = [];

let OFF_EDIT: null | { kind: 'bran' | 'maize' } = null;
let BRAN = { qty: '10', price: '150' };
let OMAIZE = { qty: '8', price: '120' };

JS.callDriver = (who) => {
  toast(`Dialing ${who} — placing the call from your phone`, 'info');
};
JS.editOffListing = (_p, el) => {
  const key = el.closest<HTMLElement>('[data-key]')?.getAttribute('data-key');
  OFF_EDIT = { kind: key === 'o-maize' ? 'maize' : 'bran' };
  window.location.hash = '#today';
  window.location.hash = '#sell';
  toast('Listing loaded into the form — update and save', 'info');
};
JS.cancelOffEdit = () => {
  OFF_EDIT = null;
  const cur = window.location.hash;
  window.location.hash = '#today';
  window.location.hash = cur || '#sell';
  toast('Edit cancelled', 'info');
};
JS.submitOffListing = () => {
  if (OFF_EDIT) {
    const ins = document.querySelectorAll<HTMLInputElement>('.dsh-input');
    const rec = OFF_EDIT.kind === 'maize' ? OMAIZE : BRAN;
    rec.qty = (ins[0]?.value || rec.qty).trim() || rec.qty;
    rec.price = (ins[1]?.value || rec.price).trim() || rec.price;
    OFF_EDIT = null;
    window.location.hash = '#today';
    window.location.hash = '#sell';
    toast('Listing updated');
    return;
  }
  OFF_LISTINGS.unshift({
    title: 'Maize Bran · 10t · $150/t',
    thumb: 'bran',
    badge: 'PENDING APPROVAL',
    badgeTone: 'amber',
    meta: 'Submitted just now · Awaiting ZVIDA approval.',
    foot: `${btn('Withdraw', 'danger sm', 'Listing withdrawn', undefined, 'o-sell-list', 'withdraw')}`,
  });
  toast('Listing submitted for approval');
  window.location.hash = '#sell';
};
JS.exportInventory = () => {
  downloadNow('o-inv');
  toast('Inventory CSV exported');
};

registerDownload('o-inv', 'Inventory_Jul31.csv', [
  'Batch,Commodity,Volume,Received,Status',
  'B-1042,Maize,320,Jul 18,Overstock',
  'B-1041,Soya,85,Jul 16,Normal',
  'B-1040,Wheat,140,Jul 14,Normal',
  'B-1039,Maize,60,Jul 08,Low',
].join('\n'), 'text/csv');

wf('o-sell-list', {
  pause: { to: 'PAUSED', tone: 'gray', toast: 'Listing paused', foot: btn('Resume', 'ghost sm', 'Listing resumed', undefined, 'o-sell-list', 'resume') },
  resume: {
    to: 'ACTIVE',
    tone: 'green',
    toast: 'Listing reactivated',
    foot: btn('Edit', 'ghost sm', 'Editing listing', '#sell') + btn('Pause', 'ghost sm', 'Listing paused', undefined, 'o-sell-list', 'pause'),
  },
  withdraw: { done: 'Withdrawn', toast: 'Listing withdrawn' },
});

wf('o-rfq', {
  request: { done: 'Requested', toast: 'Contract requested — ZVIDA notified' },
  submit: { done: 'Submitted', toast: 'RFQ submitted — ZVIDA will match anonymously' },
});

wf('o-list', {
  submit: { done: 'Submitted', toast: 'Listing submitted for approval' },
});

wf('o-quality-882', {
  approve: {
    target: '.js-q882',
    sel: '.dsh-badge',
    to: 'APPROVED',
    tone: 'green',
    nav: '#quality',
    done: 'Approved',
    toast: 'Quality approved — ZVIDA notified',
    foot: btn('View Invoice', 'primary sm', 'Opening invoice INV-2210', undefined, 'o-pay-2210', 'view'),
  },
  reject: { target: '.js-q882', sel: '.dsh-badge', to: 'REJECTED', tone: 'red', nav: '#quality', done: 'Rejected', toast: 'Dispute raised with ZVIDA', foot: pill('Dispute filed with ZVIDA', 'amber') },
});
wf('o-quality-881', {
  approve: { target: '.js-q881', sel: '.dsh-badge', to: 'APPROVED', tone: 'green', nav: '#quality', done: 'Approved', toast: 'Quality approved — ZVIDA notified' },
  reject: { target: '.js-q881', sel: '.dsh-badge', to: 'REJECTED', tone: 'red', nav: '#quality', done: 'Rejected', toast: 'Dispute raised with ZVIDA' },
});

wf('o-pay-2210', {
  pay: {
    to: 'PAID',
    tone: 'green',
    nav: '#finance',
    toast: 'Invoice INV-2210 paid — $4,800 settled',
    meta: 'Amount: <b>$4,800</b> · Paid in full · Receipt issued',
    foot: btn('View Receipt', 'outline sm', 'Opening receipt', undefined, 'o-pay-2210', 'receipt'),
  },
  view: {
    nav: '#finance',
    insert: invoice({
      ref: 'INV-2210',
      amount: '$4,800',
      terms: 'NET_3',
      due: 'Jul 25, 2026',
      status: 'Due',
      lines: [
        { l: 'Maize 20t @ $240/t', v: '$4,800' },
        { l: 'Load #882 · Net 20t', v: '20t' },
      ],
    }),
    toast: 'Invoice INV-2210 opened',
  },
  receipt: { insert: pill('Receipt emailed to accounts', 'green'), toast: 'Receipt sent' },
});
wf('o-pay-2211', {
  pay: {
    to: 'PAID',
    tone: 'green',
    nav: '#finance',
    toast: 'Invoice INV-2211 paid — $4,500 settled',
    meta: 'Amount: <b>$4,500</b> · Paid in full · Receipt issued',
    foot: btn('View Receipt', 'outline sm', 'Opening receipt', undefined, 'o-pay-2211', 'receipt'),
  },
  view: {
    nav: '#finance',
    insert: invoice({
      ref: 'INV-2211',
      amount: '$4,500',
      terms: 'NET_7',
      due: 'Jul 28, 2026',
      status: 'Due',
      lines: [
        { l: 'Soya 10t @ $450/t', v: '$4,500' },
        { l: 'Load #883 · Net 10t', v: '10t' },
      ],
    }),
    toast: 'Invoice INV-2211 opened',
  },
  receipt: { insert: pill('Receipt emailed to accounts', 'green'), toast: 'Receipt sent' },
});

const P = {
  today: {
    id: 'today',
    label: 'Today',
    icon: ICON.dashboard,
    title: 'Today',
    sub: 'Miller Corporation',
    render: () => `
      ${hero({
        kick: 'Offtaker operations',
        title: 'Good morning, Miller',
        sub: 'Load #882 is offloading now and 2 inbound loads are on the way. Confirm quality and keep silos moving.',
        actions: `${btn('Place RFQ', 'onlight', 'Opening RFQ form', '#buy')}${btn('Approve Quality', 'onlight', 'Opening quality queue', '#quality')}`,
        bg: 'dash/hero-silo.jpg',
        stats: [
          { l: 'Inbound loads', v: '2' },
          { l: 'Stock on hand', v: '605 t' },
          { l: 'On-time intake', v: '98%' },
        ],
      })}
      ${actions([
        { label: 'Place RFQ', icon: ICON.buy, badge: 2, toast: 'Opening RFQ form', href: '#buy' },
        { label: 'Approve Quality', icon: ICON.quality, badge: 3, toast: 'Opening quality queue', href: '#quality' },
        { label: 'Pay Invoice', icon: ICON.payments, badge: 2, toast: 'Opening outstanding invoices', href: '#finance' },
        { label: 'Silo Status', icon: ICON.warehouse, toast: 'Opening warehouse', href: '#warehouse' },
      ])}
      ${kpis([
        { label: 'Inbound Loads', value: 2, icon: ICON.deliveries, delta: '1 offloading now', up: true, spark: [2, 3, 2, 4, 3, 2, 2], foot: 'Expected today', open: '#deliveries' },
        { label: 'Stock On Hand', value: 605, icon: ICON.warehouse, delta: 'Maize 320t · Soya 85t', up: true, spark: [30, 40, 38, 45, 50, 48, 52], foot: 'tons across 3 silos', open: '#warehouse' },
        { label: 'Outstanding', value: '$9,300', icon: ICON.finance, delta: '2 invoices due', up: false, spark: [20, 24, 28, 26, 30, 28, 34], foot: 'NET terms', open: '#finance' },
        { label: 'On-time Intake', value: 98, icon: ICON.shield, delta: 'Across 38 loads', up: true, spark: [92, 95, 96, 95, 97, 98, 98], foot: '% of loads', open: '#perf' },
      ])}
      ${split(`
        ${sec('Today’s Schedule', 'View all', 'Opening full schedule', undefined, '#deliveries')}
        ${itemCard({
          time: '08:00 AM',
          thumb: 'grain',
          title: 'Truck ABC-123 arrives at your silo',
          badge: 'OFFLOADING',
          badgeTone: 'blue',
          open: '#deliveries',
          key: 'o882',
          meta: `Commodity: Maize (20t) · Supplier: ZVIDA (anonymous)`,
          foot: `${jsBtn('Confirm Offload', 'success sm', 'lgAction', 'lg2214:deliver', 'Offload confirmed — payment workflow started')}${jsBtn('Call Driver', 'ghost sm', 'callDriver', 'John Doe +263 77 123 4567', 'Dialing John Doe…')}`,
        })}
        ${itemCard({
          time: '10:30 AM',
          thumb: 'soya',
          title: 'Truck DEF-456 en route · ETA 2 hours',
          badge: 'IN TRANSIT',
          badgeTone: 'indigo',
          open: '#deliveries',
          key: 'o883',
          meta: `Commodity: Soya (10t) · Supplier: ZVIDA (anonymous)`,
          foot: jsBtn('Track Live', 'primary sm', 'lgAction', 'lg2218:note', 'Live tracking opened — ETA 2 hours'),
        })}
        ${itemCard({
          time: '02:00 PM',
          thumb: 'wheat',
          title: 'Quality report for Load #882 is ready',
          badge: 'PENDING',
          badgeTone: 'amber',
          open: '#quality',
          meta: `Commodity: Maize (20t) · Supplier: ZVIDA (anonymous)`,
          foot: btn('Review & Approve', 'primary sm', 'Opening quality report', '#quality'),
        })}
      `, `
        ${panel({
          title: 'Silo Snapshot',
          icon: ICON.warehouse,
          sub: 'FIFO inventory',
          body: `
            <div style="display:flex;align-items:center;gap:18px">
              ${ring(70, '605 t', 84)}
              <div style="flex:1;min-width:0">
                <div style="font-size:13.5px;font-weight:700">605 of 850 tons used</div>
                <div style="font-size:12px;color:var(--dsh-text-3);margin:4px 0 12px">Maize 320t · Soya 85t · Wheat 140t · Other 60t</div>
                ${bars([
                  { label: 'Silo 1 (Maize)', pct: 82 },
                  { label: 'Silo 2 (Soya)', pct: 45 },
                  { label: 'Silo 3 (Wheat)', pct: 68 },
                ])}
              </div>
            </div>`,
          link: 'Open warehouse',
          linkToast: 'Opening warehouse page',
          linkHref: '#warehouse',
        })}
        ${panel({
          title: 'Quality Pipeline',
          icon: ICON.quality,
          body: `
            ${listRow(ICON.quality, 'Load #882 · Maize', 'Lab report ready · Grade B', 'Pending', 'plain')}
            ${listRow(ICON.quality, 'Load #881 · Soya', 'Approved · Grade A', 'Approved', 'plain', true)}`,
        })}
      `)}
    `,
  },
  buy: {
    id: 'buy',
    label: 'Buy',
    icon: ICON.buy,
    title: 'Buy',
    sub: 'Commodities & RFQs',
    render: () => `
      ${sec('ZVIDA Listings', 'View all', 'Opening all listings', undefined, '#buy')}
      ${chips(['All', 'Maize', 'Soya', 'Wheat', 'Sorghum', 'Sugar Beans'], 0, 'buy')}
      ${panel({
        body: table(['', 'Commodity', 'Qty', 'Price', 'Origin', 'Grade', ''], [
          [img('grain', 'xs'), 'Maize', '20t', '$240/t', 'Ruwa', 'Grade A', btn('Request Contract', 'primary sm', 'Contract requested — ZVIDA notified', undefined, 'o-rfq', 'request')],
          [img('soya', 'xs'), 'Soya', '10t', '$490/t', 'Marondera', 'Grade A', btn('Request Contract', 'primary sm', 'Contract requested — ZVIDA notified', undefined, 'o-rfq', 'request')],
          [img('wheat', 'xs'), 'Wheat', '15t', '$420/t', 'Bindura', 'Grade B', btn('Request Contract', 'primary sm', 'Contract requested — ZVIDA notified', undefined, 'o-rfq', 'request')],
        ], [], [], ['Maize', 'Soya', 'Wheat'], 'buy'),
        flush: true,
      })}
      ${split(`
        ${sec('Place RFQ')}
        ${panel({
          title: 'New RFQ',
          icon: ICON.buy,
          body: `
            <div class="dsh-field-grid">
              ${field('Commodity', select(['Maize', 'Soya', 'Wheat', 'Sorghum', 'Sugar Beans']))}
              ${field('Target qty', input('20.0', 'tons'))}
            </div>
            <div class="dsh-field-grid">
              ${field('Max price ($/t)', input('240.00'))}
              ${field('Delivery date', input('2026-07-30'))}
            </div>
            ${field('Delivery point', select(['Harare Silo', 'Bulawayo Hub', 'Mutare Warehouse']))}
            ${field('Recurring', `
              <div class="dsh-radio-row">
                <label class="dsh-radio"><input type="checkbox" /> Weekly</label>
                <label class="dsh-radio"><input type="checkbox" /> Monthly</label>
                <label class="dsh-radio"><input type="checkbox" /> Quarterly</label>
              </div>`)}
            <div class="dsh-btn-row" style="margin-top:14px">${btn('Submit RFQ', 'primary', 'RFQ submitted — ZVIDA will match anonymously', undefined, 'o-rfq', 'submit')}</div>`,
        })}
      `, `
        ${sec('Open RFQs')}
        ${panel({
          body: `
            ${listRow(ICON.buy, 'RFQ-2203 · Maize 25t', 'Max $240/t · Harare Silo', 'Matching', 'plain', true)}
            ${listRow(ICON.buy, 'RFQ-2202 · Soya 15t', 'Max $500/t · Bulawayo Hub', 'Matching', 'plain', true)}
            ${listRow(ICON.buy, 'RFQ-2201 · Wheat 20t', 'Max $420/t · Mutare', 'Open', 'plain')}`,
        })}
        ${panel({
          title: 'Buying Power',
          icon: ICON.wallet,
          body: banner('info', 'Line of credit of <b>$50,000</b> available against verified warehouse receipts.'),
        })}
      `)}
    `,
  },
  shop: {
    id: 'shop',
    label: 'Shop',
    icon: ICON.shop,
    title: 'Shop',
    sub: 'Marketplace inputs for your mill',
    render: () => `
      ${sec('Input Store', marketQty() > 0 ? `Cart (${marketQty()})` : 'Cart', 'Opening cart', undefined, '#cart')}
      ${field('Search', `<input class="dsh-input dsh-search2" data-mkt-search placeholder="Search inputs, sellers, categories…" />`)}
      ${chips(['All', 'Fertilizer', 'Seeds', 'Chemicals', 'Stockfeed', 'Livestock', 'Equipment'], 0, 'shop')}
      <div class="dsh-shop-grid">
        ${marketCatalog().map((p) => marketProductCard(p, 'shop')).join('')}
      </div>
      <div style="font-size:12px;color:var(--dsh-text-3);margin-top:18px">ZVIDA-verified sellers only. Bulk grain is bought through RFQs on the Buy page.</div>
    `,
  },
  cart: {
    id: 'cart',
    label: 'Cart',
    icon: ICON.shop,
    title: 'Cart',
    sub: 'Marketplace basket',
    hidden: true,
    render: () => {
      const lines = marketCartLines();
      const subtotal = marketSubtotal();
      const total = subtotal + 12;
      return `
      ${kpis([
        { label: 'Items', value: marketQty(), icon: ICON.shop, delta: 'Verified sellers only', up: true, spark: [1, 2, 2, 3, 2, 3, 3], foot: 'Across the marketplace', open: '#shop' },
        { label: 'Subtotal', value: marketMoney(subtotal), icon: ICON.wallet, delta: 'Input costs', up: true, spark: [20, 30, 40, 60, 80, 100, 120], foot: 'Before delivery', open: '#checkout' },
        { label: 'Available Credit', value: '$50,000', icon: ICON.finance, delta: 'Line of credit', up: true, spark: [40, 40, 42, 42, 44, 44, 50], foot: 'Against warehouse receipts', open: '#finance' },
      ])}
      ${split(`
        ${sec('Cart Items')}
        ${lines.length === 0 ? panel({ title: 'Your cart is empty', icon: ICON.shop, body: banner('info', 'Add inputs from the shop — they will appear here.', 'Browse the shop', 'Opening the input store', '#shop') }) : panel({ body: lines.map((it) => marketCartLine(it)).join(''), pad: '4px 20px 10px' })}
      `, `
        ${panel({
          title: 'Order Summary',
          icon: ICON.wallet,
          body: `
            ${ledger([
              { label: 'Subtotal', value: marketMoney(subtotal) },
              { label: 'Delivery', value: '$12.00' },
              { label: 'Total', value: marketMoney(total) },
            ])}
            ${banner('ok', 'Delivery to Miller Corp, Harare by <b>Saturday</b>. ZVIDA-backed sellers only.')}
            <div class="dsh-btn-row full">${btn('Proceed to Checkout', 'primary', 'Opening checkout', '#checkout')}</div>`,
        })}
      `)}
    `;
    },
  },
  checkout: {
    id: 'checkout',
    label: 'Checkout',
    icon: ICON.wallet,
    title: 'Checkout',
    sub: 'Delivery & payment',
    hidden: true,
    render: () => `
      <div class="dsh-checkout">
      ${sec('Delivery Address')}
      ${panel({
        body: `
          <div class="dsh-field-grid">
            ${field('Full name', input('Miller'))}
            ${field('Phone', input('+263 24 277 2200'))}
          </div>
          <div class="dsh-field-grid">
            ${field('Street / Facility', input('Miller Corp, Harare'))}
            ${field('City / Province', input('Harare'))}
          </div>`,
      })}
      ${sec('Delivery Speed')}
      ${panel({
        body: `
          ${chips([
            { label: 'Standard — Free (Sat)', value: 'Standard' },
            { label: 'Express — +$8.00 (Tomorrow)', value: 'Express' },
          ], 0, 'delivery')}
          <div data-filter-group="delivery" data-filter-value="Standard">
            ${banner('info', 'Free delivery · Arrives <b>Saturday, 08:00–12:00</b>.')}
          </div>
          <div data-filter-group="delivery" data-filter-value="Express" style="display:none">
            ${banner('warn', '+$8.00 · Arrives <b>tomorrow by 14:00</b>. Courier tracked.')}
          </div>`,
      })}
      ${split(`
        ${sec('Payment Method')}
        ${panel({
          body: `
            ${chips(['ZVIDA Wallet (Balance $28,400)', 'Line of Credit', 'EcoCash'], 0, 'pay')}
            <div data-filter-group="pay" data-filter-value="ZVIDA Wallet (Balance $28,400)">
              ${banner('ok', 'Paid instantly from your wallet. No extra fees.')}
            </div>
            <div data-filter-group="pay" data-filter-value="Line of Credit" style="display:none">
              ${banner('warn', 'Drawn against warehouse receipts at 2.5% flat. Auto-deducted at payout.')}
            </div>
            <div data-filter-group="pay" data-filter-value="EcoCash" style="display:none">
              ${banner('info', 'You will receive an EcoCash payment request after the order is confirmed.')}
            </div>
            ${field('Delivery notes', input(undefined, 'e.g. Deliver to the intake bay'))}`,
        })}
      `, `
        ${sec('Summary')}
        ${panel({
          body: `
            ${ledger([
              { label: 'Subtotal', value: marketMoney(marketSubtotal()) },
              { label: 'Delivery', value: '$12.00' },
              { label: 'Total', value: marketMoney(marketSubtotal() + 12) },
            ])}
            <div class="dsh-btn-row full">${jsBtn('Confirm & Place Order', 'primary', 'marketPlace', '', 'Order placed — seller notified')}</div>`,
        })}
      `)}
      </div>
    `,
  },
  'order-confirmed': {
    id: 'order-confirmed',
    label: 'Order Confirmed',
    icon: ICON.check,
    title: 'Order Confirmed',
    sub: 'Thank you',
    hidden: true,
    render: () => {
      const last = marketLastOrder();
      return `
      ${banner('ok', `${last ? last.ref : 'Your order'} was placed. The sellers have been notified and will confirm shortly.`)}
      ${panel({
        title: last ? `Reference ${last.ref}` : 'Reference #C-2213',
        icon: ICON.check,
        body: `
          ${last ? marketSteps(last) : ''}
          <div style="display:flex;align-items:center;gap:18px;margin-top:10px">
            ${img(last?.items[0]?.thumb || 'fert', 'md')}
            <div style="flex:1;min-width:0">
              <div style="font-size:13.5px;font-weight:700">${last ? last.address : 'Delivery to Miller Corp, Harare by Saturday'}</div>
              <div style="font-size:12px;color:var(--dsh-text-3);margin:4px 0 12px">Track your order status anytime from this page.</div>
              ${steps(1, 4, 'Confirmed → Packed → Shipped → Delivered')}
            </div>
          </div>`,
      })}
      <div class="dsh-btn-row">
        ${btn('Track Order', 'outline sm', 'Opening your orders', '#orders')}
        ${btn('Back to Shop', 'primary', 'Opening the input store', '#shop')}
      </div>
    `;
    },
  },
  orders: {
    id: 'orders',
    label: 'Orders',
    icon: ICON.orders,
    title: 'My Orders',
    sub: 'Track and reorder',
    render: () => {
      const orders = marketOrders().filter((o) => o.buyer.startsWith('Miller'));
      const active = orders.filter((o) => !['DELIVERED', 'CANCELLED', 'ESCALATED'].includes(o.status)).length;
      return `
      ${banner('info', `${active} active ${active === 1 ? 'order' : 'orders'} in progress. Sellers confirm within 24 hours.`, 'Go shopping', 'Opening the input store', '#shop')}
      ${sec('Your Orders', 'Shop more', 'Opening the input store', orders.length, '#shop')}
      ${chips(['All', 'Active', 'Pending', 'Loading', 'Offloading', 'Complete'], 0, 'orders')}
      ${orders.length === 0 ? panel({ title: 'No orders yet', icon: ICON.orders, body: banner('info', 'When you place an order it will appear here.', 'Browse the shop', 'Opening the input store', '#shop') }) : ''}
      ${orders.map((o) => marketOrderGroup(o, 'buyer', 'orders', marketBucket(o.status))).join('')}
    `;
    },
  },
  sell: {
    id: 'sell',
    label: 'Sell',
    icon: ICON.sell,
    title: 'Sell',
    sub: 'By-products & overbought grain',
    render: () => `
      ${sec('Inventory — By-products')}
      ${panel({
        body: `
          <div style="display:flex;align-items:center;gap:26px;flex-wrap:wrap">
            ${ring(48, '48 t', 88)}
            <div style="flex:1;min-width:240px">
              <div style="font-size:15px;font-weight:750;letter-spacing:-0.01em;margin-bottom:4px">By-product stock</div>
              <div style="font-size:13px;color:var(--dsh-text-2)">Maize Bran: 25t · Wheat Bran: 15t · Distressed Maize: 8t (stockfeed grade)</div>
            </div>
            ${pill('Listable now', 'green')}
          </div>`,
      })}
      ${split(`
        ${sec('Create New Listing')}
        ${panel({
          title: 'New listing',
          icon: ICON.plus,
          body: `
            <div class="dsh-field-grid">
              ${field('Product type', select(['Maize Bran', 'Wheat Bran', 'Distressed Maize', 'Overbought Grain'], OFF_EDIT ? (OFF_EDIT.kind === 'maize' ? 2 : 0) : 0))}
              ${field('Quantity (tons)', input(OFF_EDIT ? (OFF_EDIT.kind === 'maize' ? OMAIZE.qty : BRAN.qty) : '10.0'))}
            </div>
            <div class="dsh-field-grid">
              ${field('Grade', select(['Stockfeed Grade', 'Grade A', 'Grade B', 'Grade C']))}
              ${field('Selling price ($/t)', input(OFF_EDIT ? (OFF_EDIT.kind === 'maize' ? OMAIZE.price : BRAN.price) : '150.00'))}
            </div>
            ${OFF_EDIT ? banner('ok', `Editing your <b>${OFF_EDIT.kind === 'maize' ? 'Distressed Maize' : 'Maize Bran'}</b> listing — update and save.`) : ''}
            <div class="dsh-btn-row" style="justify-content:space-between">
              ${uploadBtn('Upload photo', 'ghost sm', 'image/*')}
              <span>
                ${OFF_EDIT ? jsBtn('Cancel', 'ghost', 'cancelOffEdit', 'sell', 'Edit cancelled') : ''}
                ${jsBtn(OFF_EDIT ? 'Save Changes' : 'Submit Listing', 'primary', 'submitOffListing', '', OFF_EDIT ? 'Listing updated' : 'Listing submitted for approval')}
              </span>
            </div>`,
        })}
      `, `
        ${sec('My Active Listings')}
        ${OFF_LISTINGS.map((l) => itemCard({ title: l.title, thumb: l.thumb, badge: l.badge, badgeTone: l.badgeTone, time: l.meta, open: '#sell', foot: l.foot })).join('')}
        ${itemCard({
          title: `Maize Bran · ${BRAN.qty}t · $${BRAN.price}/t`,
          thumb: 'bran',
          badge: 'ACTIVE',
          badgeTone: 'green',
          key: 'o-bran',
          open: '#sell',
          foot: `${jsBtn('Edit', 'ghost sm', 'editOffListing', '', 'Listing loaded into the form')}${btn('Pause', 'ghost sm', 'Listing paused', undefined, 'o-sell-list', 'pause')}`,
        })}
        ${itemCard({
          title: `Distressed Maize · ${OMAIZE.qty}t · $${OMAIZE.price}/t`,
          thumb: 'grain',
          badge: 'ACTIVE',
          badgeTone: 'green',
          key: 'o-maize',
          open: '#sell',
          foot: `${jsBtn('Edit', 'ghost sm', 'editOffListing', '', 'Listing loaded into the form')}${btn('Pause', 'ghost sm', 'Listing paused', undefined, 'o-sell-list', 'pause')}`,
        })}
      `)}
    `,
  },
  deliveries: {
    id: 'deliveries',
    label: 'Deliveries',
    icon: ICON.deliveries,
    title: 'Deliveries',
    sub: 'Inbound loads',
    render: () => {
      const mine = loadCatalog().filter((l) => l.receiver.includes('Miller'));
      const open = mine.filter((l) => !['PAID', 'CANCELLED'].includes(l.status));
      const inTransit = open.filter((l) => l.status === 'IN_TRANSIT').length;
      const offloading = open.filter((l) => ['OFFLOADING', 'WEIGHED_2'].includes(l.status)).length;
      const payable = mine.filter((l) => l.status === 'PENDING_PAYMENT');
      const due = payable.reduce((s, l) => s + l.amount, 0);
      return `
      ${kpis([
        { label: 'Inbound Loads', value: open.length, icon: ICON.deliveries, delta: 'From suppliers via ZVIDA', up: true, spark: [2, 3, 2, 3, 4, 3, Math.max(open.length, 1)], foot: 'Awaiting intake', open: '#deliveries' },
        { label: 'Offloading', value: offloading, icon: ICON.weighbridge, delta: 'Record second weight', up: false, spark: [1, 0, 1, 2, 1, 2, Math.max(offloading, 1)], foot: 'At intake bay', open: '#deliveries' },
        { label: 'In Transit', value: inTransit, icon: ICON.truck, delta: 'Live GPS tracking', up: true, spark: [0, 1, 1, 0, 2, 1, Math.max(inTransit, 1)], foot: 'En route to you', open: '#deliveries' },
        { label: 'Payable to ZVIDA', value: payable.length, icon: ICON.payments, delta: `${marketMoney(due)} invoiced`, up: false, spark: [1, 2, 1, 3, 2, 2, Math.max(payable.length, 1)], foot: 'Pay ZVIDA on terms', open: '#finance' },
      ])}
      ${banner('info', 'Inbound consignments from ZVIDA. Record the second weight at intake to confirm net, then offload. You pay ZVIDA — ZVIDA pays the supplier.')}
      ${sec('Inbound Consignments', 'Recent deliveries', 'Opening delivery history', mine.filter((l) => l.status === 'PAID').length, '#deliveries')}
      ${open.length ? open.map((l) => loadCard(l, 'receiver')).join('') : banner('ok', 'No inbound loads right now.')}
      ${sec('Recent Deliveries')}
      ${panel({
        body: table(['Load', 'Commodity', 'Net', 'Delivered'], [
          ['#880', 'Maize', '18.2t', 'Jul 15, 2026'],
          ['#879', 'Soya', '9.8t', 'Jul 12, 2026'],
          ['#878', 'Maize', '20.0t', 'Jul 10, 2026'],
        ], [], ['#finance', '#finance', '#finance']),
        flush: true,
      })}
    `;
    },
  },
  quality: {
    id: 'quality',
    label: 'Quality',
    icon: ICON.quality,
    title: 'Quality',
    sub: 'Lab results & approval',
    render: () => `
      ${tabs([{ label: 'Pending Review', badge: 3, active: true }, { label: 'Approved', badge: 12 }, { label: 'Rejected', badge: 2 }])}
      ${panel({
        body: `
          <div class="js-q882">
            <div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap;margin-bottom:6px">
              ${img('grain', 'sm')}
              ${ring(72, 'B', 76)}
              <div style="flex:1;min-width:200px">
                <div style="font-size:15px;font-weight:700">Load #882 · Maize (20t)</div>
                <div style="font-size:13px;color:var(--dsh-text-2);margin-top:4px">Lab: Moisture <b>14.5%</b> · Protein 8.2% · Foreign matter 1.5%<br/>Spec: Moisture max 14.0% · ${pill('Grade B', 'amber')}</div>
              </div>
              <div class="dsh-btn-row">${btn('Approve', 'success sm', 'Quality approved — ZVIDA notified', undefined, 'o-quality-882', 'approve')}${btn('Reject', 'danger sm', 'Dispute raised with ZVIDA', undefined, 'o-quality-882', 'reject')}</div>
            </div>
          </div>`,
      })}
      ${panel({
        body: `
          <div class="js-q881">
            <div style="display:flex;align-items:center;gap:24px;flex-wrap:wrap;margin-bottom:6px">
              ${img('soya', 'sm')}
              ${ring(96, 'A', 76)}
              <div style="flex:1;min-width:200px">
                <div style="font-size:15px;font-weight:700">Load #881 · Soya (10t)</div>
                <div style="font-size:13px;color:var(--dsh-text-2);margin-top:4px">Lab: Moisture <b>11.8%</b> · Protein 36% · Foreign matter 0.8% · ${pill('Grade A', 'green')}</div>
              </div>
              <div class="dsh-btn-row">${btn('Approve', 'success sm', 'Quality approved — ZVIDA notified', undefined, 'o-quality-881', 'approve')}${btn('Reject', 'danger sm', 'Dispute raised with ZVIDA', undefined, 'o-quality-881', 'reject')}</div>
            </div>
          </div>`,
      })}
      ${sec('Recent Results')}
      ${panel({
        body: table(['Load', 'Commodity', 'Grade', 'Result'], [
          ['#880', 'Maize', 'A', pill('Approved', 'green')],
          ['#879', 'Soya', 'A', pill('Approved', 'green')],
          ['#878', 'Maize', 'B', pill('Approved', 'green')],
        ]),
        flush: true,
      })}
    `,
  },
  finance: {
    id: 'finance',
    label: 'Finance',
    icon: ICON.finance,
    title: 'Finance',
    sub: 'Invoices & payments',
    render: () => `
      ${kpis([
        { label: 'Total Payable', value: '$9,300', icon: ICON.wallet, delta: '2 invoices open', up: false, spark: [30, 28, 34, 30, 36, 34, 40], foot: 'Across all loads', open: '#finance' },
        { label: 'Due In 3 Days', value: '$4,800', icon: ICON.clock, delta: 'Invoice INV-2210', up: false, spark: [10, 14, 18, 16, 20, 24, 26], foot: 'Next due date', open: '#deliveries' },
        { label: 'Paid (Month)', value: '$10,880', icon: ICON.check, delta: '3 invoices settled', up: true, spark: [20, 30, 26, 38, 44, 50, 56], foot: 'This month', open: '#finance' },
        { label: 'Avg Days to Pay', value: 5, icon: ICON.scale, delta: 'On NET terms', up: true, spark: [8, 7, 6, 6, 5, 5, 5], foot: 'days', open: '#perf' },
      ])}
      ${split(`
        ${sec('Outstanding Invoices')}
        ${itemCard({
          title: 'Invoice INV-2210 · Load #882',
          thumb: 'grain',
          badge: 'Due in 3 days',
          badgeTone: 'amber',
          open: '#finance',
          meta: `Amount: <b>$4,800</b> · Terms: NET_3 · Due Jul 25, 2026`,
          foot: `${btn('Pay Now', 'primary sm', 'Invoice payment initiated', undefined, 'o-pay-2210', 'pay')}${btn('View Invoice', 'outline sm', 'Opening invoice', undefined, 'o-pay-2210', 'view')}`,
        })}
        ${itemCard({
          title: 'Invoice INV-2211 · Load #883',
          thumb: 'soya',
          badge: 'Due in 7 days',
          badgeTone: 'amber',
          open: '#finance',
          meta: `Amount: <b>$4,500</b> · Terms: NET_7 · Due Jul 28, 2026`,
          foot: `${btn('Pay Now', 'primary sm', 'Invoice payment initiated', undefined, 'o-pay-2211', 'pay')}${btn('View Invoice', 'outline sm', 'Opening invoice', undefined, 'o-pay-2211', 'view')}`,
        })}
        ${sec('Payment History')}
        ${panel({
          body: `
            ${listRow(ICON.check, 'Invoice INV-2208', 'Jul 15, 2026 · Paid', '-$4,320', 'neg', false, '#finance')}
            ${listRow(ICON.check, 'Invoice INV-2205', 'Jul 12, 2026 · Paid', '-$3,920', 'neg', false, '#finance')}
            ${listRow(ICON.check, 'Invoice INV-2201', 'Jul 10, 2026 · Paid', '-$2,640', 'neg', false, '#finance')}`,
        })}
      `, `
        ${panel({
          title: 'Spend This Month',
          icon: ICON.trendingUp,
          body: bars([
            { label: 'Maize', pct: 62 },
            { label: 'Soya', pct: 24 },
            { label: 'Wheat', pct: 14 },
          ]),
        })}
        ${panel({
          title: 'Payment Method',
          icon: ICON.wallet,
          body: `${listRow(ICON.wallet, 'EcoCash Corporate', 'Default · verified', 'Primary', 'plain', true)}
            ${listRow(ICON.scale, 'Bank Transfer', 'CBZ · •••• 4921', 'Backup', 'plain')}`,
        })}
      `)}
    `,
  },
  warehouse: {
    id: 'warehouse',
    label: 'Warehouse',
    icon: ICON.warehouse,
    title: 'Warehouse',
    sub: 'FIFO inventory & silos',
    render: () => `
      ${banner('warn', 'Overstock alert: <b>Maize</b> is above optimal FIFO target by 40%.')}
      ${sec('FIFO Inventory')}
      ${panel({
        body: table(['', 'Batch', 'Commodity', 'Volume', 'Received', 'Status'], [
          [img('grain', 'xs'), 'B-1042', 'Maize', '320t', 'Jul 18', pill('Overstock', 'amber')],
          [img('soya', 'xs'), 'B-1041', 'Soya', '85t', 'Jul 16', pill('Normal', 'green')],
          [img('wheat', 'xs'), 'B-1040', 'Wheat', '140t', 'Jul 14', pill('Normal', 'green')],
          [img('grain', 'xs'), 'B-1039', 'Maize', '60t', 'Jul 08', pill('Low', 'amber')],
        ], [], ['#quality', '#quality', '#quality', '#quality']),
        flush: true,
      })}
      ${sec('Silo Capacity')}
      ${panel({
        body: bars([
          { label: 'Silo 1 (Maize)', pct: 82 },
          { label: 'Silo 2 (Soya)', pct: 45 },
          { label: 'Silo 3 (Wheat)', pct: 68 },
        ]),
      })}
      <div class="dsh-btn-row" style="margin-top:12px">${jsBtn('Export Inventory', 'outline', 'exportInventory', '', 'Inventory CSV exported')}</div>
    `,
  },
  perf: {
    id: 'perf',
    label: 'Performance',
    icon: ICON.shield,
    title: 'Performance',
    sub: 'Intake reliability, quality & supplier scores',
    render: () => `
      ${kpis([
        { label: 'On-time Intake', value: 98, icon: ICON.shield, delta: 'Across 38 loads', up: true, spark: [92, 95, 96, 95, 97, 98, 98], foot: '% of loads', open: '#perf' },
        { label: 'Quality Pass Rate', value: 96, icon: ICON.quality, delta: 'Passed first check', up: true, spark: [92, 93, 94, 95, 95, 96, 96], foot: '% of samples', open: '#perf' },
        { label: 'Silo Throughput', value: 605, icon: ICON.warehouse, delta: 'This month', up: true, spark: [30, 40, 38, 45, 50, 48, 52], foot: 'tons received', open: '#perf' },
        { label: 'Avg Supplier Rating', value: '4.8', icon: ICON.check, delta: '5 rated suppliers', up: true, spark: [40, 42, 44, 45, 46, 47, 48], foot: 'Out of 5.0', open: '#perf' },
      ])}
      ${split(`
        ${sec('Intake Record')}
        ${panel({
          body: table(['Load', 'Commodity', 'Net', 'On-time', 'Grade'], [
            ['#882', 'Maize', '20t', pill('Yes', 'green'), 'A'],
            ['#880', 'Maize', '18.2t', pill('Yes', 'green'), 'A'],
            ['#879', 'Soya', '9.8t', pill('Yes', 'green'), 'B'],
            ['#878', 'Maize', '20t', pill('Late 10m', 'amber'), 'A'],
            ['#877', 'Ground Nuts', '4t', pill('Yes', 'green'), 'B'],
          ]),
          flush: true,
        })}
        ${sec('Reliability Breakdown')}
        ${panel({
          body: bars([
            { label: 'Intake window adherence', pct: 98 },
            { label: 'Quality checks completed', pct: 100 },
            { label: 'Documentation accuracy', pct: 97 },
          ]),
        })}
      `, `
        ${panel({
          title: 'ZVIDA Score',
          icon: ICON.spark,
          body: `
            <div style="display:flex;align-items:center;gap:18px">
              ${ring(88, '88', 84)}
              <div style="flex:1;min-width:0">
                <div style="font-size:13.5px;font-weight:700">Tier 1 buyer</div>
                <div style="font-size:12px;color:var(--dsh-text-3);margin:4px 0 12px">Score unlocks priority supplier matching and better NET terms.</div>
                ${steps(5, 5, 'Tier 1 · 5 of 5')}
              </div>
            </div>`,
        })}
        ${panel({
          title: 'Supplier Scores',
          icon: ICON.quality,
          body: `
            ${listRow(ICON.quality, 'James (Farm 42, Ruwa)', '12 loads · Always on time', '5.0', 'pos')}
            ${listRow(ICON.quality, 'Prosper (Farm 12, Norton)', '8 loads · Great moisture', '4.9', 'pos')}
            ${listRow(ICON.quality, 'Tapiwa (Farm 7, Chinhoyi)', '6 loads · Late once', '4.5', 'pos')}`,
        })}
      `)}
    `,
  },
  messages: {
    id: 'messages',
    label: 'Messages',
    icon: ICON.messages,
    title: 'Messages',
    sub: 'Chat with ZVIDA',
    render: () => `
      ${chat(
        { name: 'ZVIDA · Load #882', preview: 'ETA updated to 11:00 AM', time: 'Today' },
        [
          { sent: false, text: 'ZVIDA: Load #882 ETA updated to 11:00 AM.', time: '09:15 AM' },
          { sent: true, text: 'You: Received. Silo 1 will be ready.', time: '09:20 AM' },
          { sent: false, text: 'ZVIDA: Quality report will be uploaded after offload.', time: '09:22 AM' },
        ],
        ['ETA update?', 'Weighbridge numbers?', 'Upload lab report']
      )}
    `,
  },
};

boot({
  key: 'offtaker',
  name: 'Miller',
  roleLabel: 'Offtaker',
  company: 'Miller Corporation',
  initials: 'M',
  logoText: 'ZVIDAMBANO · OFFTAKER',
  accent: '#7c3aed',
  accentHover: '#6d28d9',
  accentLight: '#f5f3ff',
  accentRgb: '124, 58, 237',
  gradientEnd: '#a78bfa',
  pages: [P.today, P.buy, P.shop, P.orders, P.cart, P.checkout, P['order-confirmed'], P.sell, P.deliveries, P.quality, P.finance, P.warehouse, P.perf, P.messages],
});
