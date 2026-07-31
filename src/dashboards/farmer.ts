import { boot, ICON, svg, pill, btn, hero, kpis, actions, sec, panel, split, ticker, banner, field, input, select, textarea, table, listRow, timeline, steps, ring, img, itemCard, profile, docs, chat, chips, wf, routeMap, invoice, ledger, bars, registerDownload, downloadBtn, downloadNow, uploadBtn, jsBtn, JS, toast, marketCatalog, marketProductCard, marketCartLine, marketCartLines, marketQty, marketSubtotal, marketMoney, marketPlace, marketOrders, marketSteps, marketOrderCard, marketOrderGroup, marketLastOrder, marketRecommend, marketBucket, loadCatalog, loadCard } from './core';
import type { PillTone } from './core';

wf('f-sched-882', {
  start: {
    to: 'IN TRANSIT',
    tone: 'indigo',
    nav: '#contracts',
    toast: 'Loading started — ZVIDA notified',
    meta: 'Driver: <b>John Doe</b> (+263 77 123 4567) · Truck ABC-123 (Scania R450) · Trailer XYZ-789<br/>Contract #882 · 20 tons Maize · Truck en route to Miller Corp',
    foot: btn('Track Live', 'primary sm', 'Opening live tracking', undefined, 'f-sched-882', 'track') + jsBtn('Call Driver', 'ghost sm', 'callDriver', 'John Doe +263 77 123 4567', 'Dialing John Doe…'),
  },
  track: {
    nav: '#contracts',
    insert: routeMap('Farm 42 Ruwa', 'Miller Corp Harare', { x: 16, y: 62 }, { x: 76, y: 40 }, 74),
    toast: 'Live tracking opened — truck moving at 72 km/h',
  },
});

wf('f-sched-883', {
  track: {
    nav: '#contracts',
    insert: routeMap('Farm 12 Marondera', 'Miller Corp Harare', { x: 20, y: 66 }, { x: 78, y: 36 }, 46),
    toast: 'Live tracking opened — ETA 2 hours',
  },
});

wf('f-fin-882', {
  view: {
    nav: '#finance',
    insert: invoice({
      ref: '#882',
      amount: '$4,200',
      terms: 'NET_3',
      due: 'Aug 2, 2026',
      status: 'Scheduled',
      lines: [
        { l: 'Maize 20t @ $210/t', v: '$4,200' },
        { l: 'Seed loan deduction', v: '-$400' },
        { l: 'Payout due to you', v: '$3,800' },
      ],
    }),
    toast: 'Invoice #882 opened',
  },
});

wf('f-fin-883', {
  view: {
    nav: '#finance',
    insert: invoice({
      ref: '#883',
      amount: '$3,600',
      terms: 'NET_3',
      due: 'Aug 5, 2026',
      status: 'Scheduled',
      lines: [
        { l: 'Soya 10t @ $360/t', v: '$3,600' },
        { l: 'Payout due to you', v: '$3,600' },
      ],
    }),
    toast: 'Invoice #883 opened',
  },
});

wf('f-soya-list', {
  pause: { to: 'PAUSED', tone: 'gray', toast: 'Listing paused', foot: btn('Resume', 'ghost sm', 'Listing resumed', undefined, 'f-soya-list', 'resume') },
  resume: {
    to: 'ACTIVE',
    tone: 'green',
    toast: 'Listing reactivated',
    foot: btn('Edit', 'ghost sm', 'Editing listing', '#sell') + btn('Pause', 'ghost sm', 'Listing paused', undefined, 'f-soya-list', 'pause'),
  },
});

wf('f-soya-new', {
  withdraw: { done: 'Withdrawn', toast: 'Listing withdrawn' },
});

wf('f-wheat', {
  accept: {
    to: 'ACCEPTED',
    tone: 'green',
    toast: 'Counter-offer accepted — contract issued',
    meta: 'Contract issued at <b>$370/t</b> · ZVIDA will arrange pickup.',
    foot: btn('View Contract', 'outline sm', 'Opening contract', '#contracts'),
  },
  counter: { to: 'COUNTER SENT', tone: 'blue', toast: 'Counter-offer sent to ZVIDA', meta: 'Your counter: <b>$380/t</b> · Awaiting ZVIDA reply.', foot: pill('Awaiting ZVIDA reply', 'blue') },
  decline: { to: 'DECLINED', tone: 'red', toast: 'Counter-offer declined', meta: 'Listing closed — you declined ZVIDA’s offer.', foot: btn('Re-list', 'outline sm', 'Opening listing form', '#sell') },
});

const LISTINGS: { title: string; thumb: string; badge: string; badgeTone: PillTone; meta: string; foot: string }[] = [];

let LIST_EDIT: null | { kind: 'soya' } = null;
let SOYA = { qty: '10', reserve: '450' };

JS.editListing = (_p, el) => {
  LIST_EDIT = { kind: 'soya' };
  window.location.hash = '#today';
  window.location.hash = '#sell';
  toast(`Listing loaded into the form — update and save`, 'info');
};
JS.cancelEdit = (target) => {
  LIST_EDIT = null;
  const cur = window.location.hash;
  window.location.hash = '#today';
  window.location.hash = cur || `#${target || 'sell'}`;
  toast('Edit cancelled', 'info');
};

JS.callDriver = (who) => {
  toast(`Dialing ${who} — placing the call from your phone`, 'info');
};
JS.submitListing = () => {
  if (LIST_EDIT) {
    const ins = document.querySelectorAll<HTMLInputElement>('.dsh-input');
    SOYA.qty = (ins[0]?.value || SOYA.qty).trim() || SOYA.qty;
    SOYA.reserve = (ins[2]?.value || SOYA.reserve).trim() || SOYA.reserve;
    LIST_EDIT = null;
    window.location.hash = '#today';
    window.location.hash = '#sell';
    toast('Listing updated');
    return;
  }
  LISTINGS.unshift({
    title: 'Maize · 20t · Reserve $200/t',
    thumb: 'grain',
    badge: 'PENDING APPROVAL',
    badgeTone: 'amber',
    meta: 'Submitted just now · Awaiting ZVIDA approval.',
    foot: `${btn('Withdraw', 'danger sm', 'Listing withdrawn', undefined, 'f-soya-new', 'withdraw')}`,
  });
  toast('Listing submitted for approval');
  window.location.hash = '#sell';
};
JS.dlAll = () => {
  ['inv-882', 'rcpt-882', 'inv-880', 'rcpt-880', 'cert-882', 'wb-882'].forEach((k) => downloadNow(k));
  toast('Downloaded 6 documents');
};
JS.diaryAdd = () => {
  const tl = document.querySelector('.dsh-timeline');
  if (tl) tl.insertAdjacentHTML('afterbegin', `<div class="dsh-tl-item"><div class="dsh-tl-title">Manual diary entry</div><div class="dsh-tl-sub">Added just now</div><div class="dsh-tl-tag">Note</div></div>`);
  toast('Diary entry added');
};
JS.equipAdd = () => {
  const eq = document.querySelector('[data-eq-list]');
  if (eq) eq.insertAdjacentHTML('beforeend', listRow(ICON.truck, 'Knapsack Sprayer', 'Just added · Operational', 'Ready'));
  toast('Equipment added');
};
JS.voiceRecord = () => {
  const b = document.querySelector('[data-js="voiceRecord"]') as HTMLButtonElement | null;
  if (!b) return;
  if (b.classList.contains('dsh-rec')) {
    b.classList.remove('dsh-rec');
    b.textContent = 'Record';
    toast('Voice note saved and sent to ZVIDA');
  } else {
    b.classList.add('dsh-rec');
    b.textContent = 'Stop & Send';
    toast('Recording… tap Stop & Send when done');
  }
};
JS.voicePlay = () => {
  toast('Playing latest voice note · 0:42', 'info');
};
JS.submitTicket = () => {
  const b = document.querySelector('[data-js="submitTicket"]') as HTMLButtonElement | null;
  if (b) {
    b.textContent = 'Submitted';
    b.disabled = true;
  }
  toast('Ticket #T-104 submitted — we reply within 24h');
};
JS.openGallery = (key) => {
  const names: Record<string, string> = {
    rice: 'Premium Rice 25kg',
    samp: 'Maize Meal Samp',
    flour: 'Flour 10kg',
    bran: 'Wheat Bran',
    soyaMeal: 'Soya Meal',
    popcorn: 'Popcorn',
    beans: 'Navy Beans',
    groundnuts: 'Groundnuts',
  };
  document.querySelector('.dsh-lightbox')?.remove();
  const l = document.createElement('div');
  l.className = 'dsh-lightbox';
  l.innerHTML = `<div class="dsh-lightbox-back" data-close></div>
    <div class="dsh-lightbox-card">
      <div class="dsh-lightbox-img">${img(key, 'lg')}</div>
      <div class="dsh-lightbox-title">${names[key] || 'Product'}</div>
      <div class="dsh-lightbox-sub">Browse more products in the input store below.</div>
      <button class="dsh-btn primary" data-close>Close</button>
    </div>`;
  document.body.appendChild(l);
  l.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).closest('[data-close]')) l.remove();
  });
};

function pdfBlob(lines: string[]): string {
  const safe = (s: string) => s.replace(/[()\\]/g, '');
  const stream = lines.map((l) => `BT /F1 11 Tf 72 ${720 - lines.indexOf(l) * 16} Td (${safe(l)}) Tj ET`).join('\n');
  const parts: string[] = [];
  const offsets: number[] = [];
  let off = 0;
  const push = (s: string) => {
    parts.push(s);
    offsets.push(off);
    off += s.length;
  };
  push('%PDF-1.4\n');
  push('1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n');
  push('2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n');
  push('3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]/Contents 4 0 R/Resources<</Font<</F1 5 0 R>>>>>>endobj\n');
  push(`4 0 obj<</Length ${stream.length}>>stream\n${stream}\nendstream\nendobj\n`);
  push('5 0 obj<</Type/Font/Subtype/Type1/BaseFont/Helvetica>>endobj\n');
  push('xref\n0 6\n0000000000 65535 f \n');
  offsets.slice(1).forEach((o) => push(String(o).padStart(10, '0') + ' 00000 n \n'));
  const xs = off;
  push(`trailer<</Size 6/Root 1 0 R>>\nstartxref\n${xs}\n%%EOF`);
  return parts.join('');
}

registerDownload('inv-882', 'Invoice_882.pdf', pdfBlob(['ZVIDAMBANO INVOICE #882', '', 'Contract #882 - 20 tons Maize (COD)', 'Rate: $210/t', 'Amount: $4,200', 'Seed loan deduction: -$400', 'Payout due: $3,800', 'Terms: NET_3 - due Aug 2, 2026']), 'application/pdf');
registerDownload('rcpt-882', 'Receipt_882.pdf', pdfBlob(['ZVIDAMBANO RECEIPT #882', '', 'Contract #882 - $4,200', 'Status: Received Jul 31, 2026']), 'application/pdf');
registerDownload('inv-880', 'Invoice_880.pdf', pdfBlob(['ZVIDAMBANO INVOICE #880', '', 'Contract #880 - 20 tons Maize', 'Amount: $4,000', 'Terms: NET_3', 'Status: Paid']), 'application/pdf');
registerDownload('rcpt-880', 'Receipt_880.pdf', pdfBlob(['ZVIDAMBANO RECEIPT #880', '', 'Contract #880 - $4,000', 'Status: Received Jul 15, 2026']), 'application/pdf');
registerDownload('cert-882', 'Weighbridge_Certificate_882.pdf', pdfBlob(['WEIGHBRIDGE CERTIFICATE #882', '', 'Gross: 30,000 kg', 'Tare: 10,000 kg', 'Net: 20,000 kg', 'Station: Ruwa Weighbridge']), 'application/pdf');
registerDownload('wb-882', 'Gross_Weight_882.jpg', 'Weighbridge capture - gross 30,000 kg', 'image/jpeg');

const P = {
  today: {
    id: 'today',
    label: 'Today',
    icon: ICON.dashboard,
    title: 'Today',
    sub: 'James, Farm 42 Ruwa',
    render: () => `
      ${hero({
        kick: 'Friday, 31 July 2026',
        title: 'Good morning, James',
        sub: 'Your maize load arrives at 08:00. Track deliveries, release payments and manage your silo — all in one place.',
        actions: `${btn('List Produce', 'onlight', 'Opening new listing form', '#sell')}${btn('Contact ZVIDA', 'onlight', 'Opening chat with ZVIDA', '#messages')}`,
        bg: 'dash/hero-farm.jpg',
        stats: [
          { l: 'Silo balance', v: '30 t' },
          { l: 'Active contracts', v: '3' },
          { l: 'Next payout', v: '$4,200' },
        ],
      })}
      ${actions([
        { label: 'New Listing', icon: ICON.sell, toast: 'Opening new listing form', href: '#sell' },
        { label: 'Voice Note', icon: ICON.mic, toast: 'Opening voice notes', href: '#messages' },
        { label: 'Track Truck', icon: ICON.route, toast: 'Opening live truck tracking', href: '#contracts' },
        { label: 'Call ZVIDA', icon: ICON.phone, toast: 'Opening chat with ZVIDA', href: '#messages' },
      ])}
      ${kpis([
        { label: 'Active Contracts', value: 3, icon: ICON.contracts, delta: '1 new this week', up: true, spark: [2, 3, 3, 4, 3, 4, 3], foot: 'Across this season', open: '#contracts' },
        { label: 'Silo Balance', value: 30, icon: ICON.box, delta: '20t committed', up: true, spark: [20, 30, 28, 34, 30, 32, 30], foot: '50t total capacity', open: '#sell' },
        { label: 'Next Payout', value: '$4,200', icon: ICON.finance, delta: 'NET_3 · in 2 days', up: true, spark: [10, 18, 15, 22, 30, 26, 42], foot: 'Contract #882', open: '#finance' },
        { label: 'On-time Rate', value: 100, icon: ICON.shield, delta: 'Across 12 deals', up: true, spark: [90, 95, 92, 96, 98, 97, 100], foot: '% of deliveries', open: '#perf' },
      ])}
      ${ticker([
        { name: 'Maize', price: '$295/t', old: '$310/t' },
        { name: 'Soya', price: '$520/t', old: '$505/t' },
        { name: 'Wheat', price: '$360/t' },
        { name: 'Ground Nuts', price: '$2.30/kg' },
        { name: 'Sugar Beans', price: '$680/t' },
        { name: 'Rice', price: '$780/t' },
        { name: 'Sorghum', price: '$340/t' },
      ])}
      ${split(`
        ${sec('Today’s Schedule', 'View all', 'Opening full schedule', undefined, '#contracts')}
        ${itemCard({
          time: '08:00 AM',
          thumb: 'grain',
          title: 'Truck ABC-123 arrives at your farm',
          badge: 'LOADING',
          badgeTone: 'blue',
          open: '#contracts',
          key: 'c882',
          meta: `Driver: <b>John Doe</b> (+263 77 123 4567) · Truck ABC-123 (Scania R450) · Trailer XYZ-789 (Grain Tipper, 35t)<br/>Contract #882 · 20 tons Maize · ${pill('50% paid (Loading)', 'green')} ${pill('50% pending (Offloading)', 'amber')}`,
          foot: `${jsBtn('Call Driver', 'ghost sm', 'callDriver', 'John Doe +263 77 123 4567', 'Dialing John Doe…')}${btn('Start Loading', 'primary sm', 'Loading started — ZVIDA notified', undefined, 'f-sched-882', 'start')}`,
        })}
        ${itemCard({
          time: '10:30 AM',
          thumb: 'soya',
          title: 'Loading Soya at Farm 12 · ETA 2 hours',
          badge: 'LOADING',
          badgeTone: 'blue',
          open: '#contracts',
          key: 'c883',
          meta: `Driver: <b>Sarah Moyo</b> (+263 78 987 6543) · Truck DEF-456<br/>Contract #883 · 10 tons Soya`,
          foot: btn('Track Live', 'primary sm', 'Opening live tracking', undefined, 'f-sched-883', 'track'),
        })}
        ${itemCard({
          time: '02:00 PM',
          thumb: 'wheat',
          title: 'Payout for Contract #882 ($4,200) scheduled',
          badge: 'SCHEDULED',
          badgeTone: 'green',
          open: '#finance',
          meta: 'NET_3 · Funds release automatically when the countdown completes.',
          foot: btn('View Invoice', 'outline sm', 'Opening invoice', undefined, 'f-fin-882', 'view'),
        })}
        ${sec('Late Payment Radar')}
        ${banner('ok', 'No overdue payments. All funds on schedule.', 'View history', 'Opening payment history', '#finance')}
      `, `
        ${panel({
          title: 'Silo Status',
          icon: ICON.box,
          sub: 'Maize · 2026 harvest',
          body: `
            <div style="display:flex;align-items:center;gap:18px">
              ${ring(60, '30 t', 84)}
              <div style="flex:1;min-width:0">
                <div style="font-size:13.5px;font-weight:700">30 of 50 tons remaining</div>
                <div style="font-size:12px;color:var(--dsh-text-3);margin:4px 0 12px">20 tons committed against active contracts.</div>
                ${steps(3, 5, 'Committed capacity')}
              </div>
            </div>`,
          link: 'Manage silo',
          linkToast: 'Opening silo management',
          linkHref: '#sell',
        })}
        ${panel({
          title: 'Field Watch',
          icon: ICON.cloud,
          body: `
            ${banner('info', 'Rain forecast for Mashonaland East tomorrow. Keep harvest tarps ready.')}
            <div style="font-size:12px;color:var(--dsh-text-3)">Updated 06:00 AM · Weather by MetZim</div>`,
        })}
        ${panel({
          title: 'Quick Support',
          icon: ICON.messages,
          body: `
            ${listRow(ICON.finance, 'When will I get paid?', 'NET_3 or NET_7 after delivery confirmation', '', 'plain', false, '#finance')}
            ${listRow(ICON.route, 'Track a delivery', 'Open Today → Track Truck', '', 'plain', false, '#contracts')}
            ${listRow(ICON.sell, 'List produce fast', 'Go to Sell → Create New Listing', '', 'plain', false, '#sell')}`,
        })}
      `)}
    `,
  },
  sell: {
    id: 'sell',
    label: 'Sell',
    icon: ICON.sell,
    title: 'Sell',
    sub: 'Virtual silo & listings',
    render: () => `
      ${sec('My Stock (Virtual Silo)')}
      ${panel({
        body: `
          <div style="display:flex;align-items:center;gap:26px;flex-wrap:wrap">
            ${ring(60, '30 t', 88)}
            <div style="flex:1;min-width:240px">
              <div style="font-size:15px;font-weight:750;letter-spacing:-0.01em;margin-bottom:4px">Maize — 30 tons remaining</div>
              <div style="font-size:13px;color:var(--dsh-text-2);margin-bottom:12px">50t total − 20t sold. You have 30 tons available to list.</div>
              ${steps(3, 5, 'Committed against active contracts')}
            </div>
            ${pill('List now', 'green')}
          </div>`,
      })}
      ${split(`
        ${sec('Create New Listing')}
        ${panel({
          title: 'New listing',
          icon: ICON.plus,
          body: `
            ${field('Commodity', select(['Maize', 'Soya', 'Wheat', 'Groundnuts', 'Livestock'], LIST_EDIT ? 1 : 0))}
            <div class="dsh-field-grid">
              ${field('Quantity (tons)', input(LIST_EDIT ? SOYA.qty : '20.0'))}
              ${field('Grade', select(['Grade A', 'Grade B', 'Grade C']))}
            </div>
            <div class="dsh-field-grid">
              ${field('Moisture %', input('14.5'))}
              ${field('Reserve Price ($/t)', input(LIST_EDIT ? SOYA.reserve : '200.00'))}
            </div>
            ${LIST_EDIT ? banner('ok', `Editing your <b>Soya</b> listing — update and save.`) : banner('info', 'ZVIDA is currently offering <b>$295/t</b> for Maize.')}
            ${field('Collection type', `
              <div class="dsh-radio-row">
                <label class="dsh-radio"><input type="radio" name="collection" checked /> COD — I deliver to ZVIDA</label>
                <label class="dsh-radio"><input type="radio" name="collection" /> COC — ZVIDA collects from farm</label>
              </div>`)}
            <div class="dsh-btn-row" style="justify-content:space-between">
              ${uploadBtn('Upload photo', 'ghost sm', 'image/*')}
              <span>
                ${LIST_EDIT ? jsBtn('Cancel', 'ghost', 'cancelEdit', 'sell', 'Edit cancelled') : ''}
                ${jsBtn(LIST_EDIT ? 'Save Changes' : 'Submit Listing', 'primary', 'submitListing', '', LIST_EDIT ? 'Listing updated' : 'Listing submitted for approval')}
              </span>
            </div>`,
        })}
      `, `
        ${sec('My Active Listings')}
        ${LISTINGS.map((l) => itemCard({ title: l.title, thumb: l.thumb, badge: l.badge, badgeTone: l.badgeTone, time: l.meta, open: '#sell', foot: l.foot })).join('')}
        ${itemCard({
          key: 'soya',
          title: `Soya · ${SOYA.qty}t · Reserve $${SOYA.reserve}/t`,
          thumb: 'soya',
          badge: 'ACTIVE',
          badgeTone: 'green',
          open: '#sell',
          meta: 'Hidden from your marketplace view.',
          foot: `${jsBtn('Edit', 'ghost sm', 'editListing', 'soya', 'Listing loaded into the form')}${btn('Pause', 'ghost sm', 'Listing paused', undefined, 'f-soya-list', 'pause')}`,
        })}
        ${itemCard({
          title: 'Wheat · 15t · Reserve $380/t',
          thumb: 'wheat',
          badge: 'COUNTER-OFFER',
          badgeTone: 'amber',
          open: '#sell',
          meta: 'ZVIDA counter-offer: <b>$370/t</b>',
          foot: `${btn('Accept', 'success sm', 'Counter-offer accepted', undefined, 'f-wheat', 'accept')}${btn('Counter', 'outline sm', 'Sending counter-offer', undefined, 'f-wheat', 'counter')}${btn('Decline', 'danger sm', 'Counter-offer declined', undefined, 'f-wheat', 'decline')}`,
        })}
      `)}
    `,
  },
  shop: {
    id: 'shop',
    label: 'Shop',
    icon: ICON.shop,
    title: 'Shop',
    sub: 'Buy inputs from verified sellers',
    render: () => `
      ${sec('Popular This Week')}
      <div class="dsh-gallery">
        <div data-gallery-key="rice">${img('rice', 'lg')}</div>
        <div data-gallery-key="samp">${img('samp', 'lg')}</div>
        <div data-gallery-key="flour">${img('flour', 'lg')}</div>
        <div data-gallery-key="bran">${img('bran', 'lg')}</div>
        <div data-gallery-key="soyaMeal">${img('soyaMeal', 'lg')}</div>
        <div data-gallery-key="popcorn">${img('popcorn', 'lg')}</div>
        <div data-gallery-key="beans">${img('beans', 'lg')}</div>
        <div data-gallery-key="groundnuts">${img('groundnuts', 'lg')}</div>
      </div>
      ${sec('Input Store', marketQty() > 0 ? `Cart (${marketQty()})` : 'Cart', 'Opening cart', undefined, '#cart')}
      ${field('Search', `<input class="dsh-input dsh-search2" data-mkt-search placeholder="Search inputs, sellers, categories…" />`)}
      ${chips(['All', 'Fertilizer', 'Seeds', 'Chemicals', 'Stockfeed', 'Livestock', 'Equipment'], 0, 'shop')}
      <div class="dsh-shop-grid">
        ${marketCatalog().map((p) => marketProductCard(p, 'shop')).join('')}
      </div>
      <div style="font-size:12px;color:var(--dsh-text-3);margin-top:18px">ZVIDA-verified sellers only. Your own grain listings are hidden here — manage them under Sell.</div>
    `,
  },
  cart: {
    id: 'cart',
    label: 'Cart',
    icon: ICON.shop,
    title: 'Cart',
    sub: 'Inputs for your farm',
    hidden: true,
    render: () => {
      const lines = marketCartLines();
      const cards =
        lines.length === 0
          ? `${panel({ title: 'Your cart is empty', icon: ICON.shop, body: banner('info', 'Add inputs from the shop — they will appear here.', 'Continue shopping', 'Opening the input store', '#shop') })}`
          : lines.map((it) => marketCartLine(it)).join('');
      const subtotal = marketSubtotal();
      const total = subtotal + 12;
      return `
      ${kpis([
        { label: 'Items', value: marketQty(), icon: ICON.shop, delta: 'Verified sellers only', up: true, spark: [1, 2, 2, 3, 2, 3, 3], foot: 'Across 3 stores', open: '#shop' },
        { label: 'Subtotal', value: marketMoney(subtotal), icon: ICON.wallet, delta: 'Input costs', up: true, spark: [20, 30, 40, 60, 80, 100, 120], foot: 'Before delivery', open: '#checkout' },
        { label: 'Available Credit', value: '$50,000', icon: ICON.finance, delta: 'Line of credit', up: true, spark: [40, 40, 42, 42, 44, 44, 50], foot: 'Against warehouse receipts', open: '#finance' },
      ])}
      ${split(`
        ${sec('Cart Items')}
        ${panel({ body: cards, pad: '4px 20px 10px' })}
        ${sec('Frequently Bought Together')}
        <div class="dsh-shop-grid">
          ${marketRecommend().map((p) => marketProductCard(p, 'rec')).join('')}
        </div>
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
            ${banner('ok', 'Delivery to Farm 42, Ruwa by <b>Saturday</b>. ZVIDA-backed sellers only.')}
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
            ${field('Full name', input('James'))}
            ${field('Phone', input('+263 77 555 0011'))}
          </div>
          <div class="dsh-field-grid">
            ${field('Street / Farm', input('Farm 42, Ruwa'))}
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
            ${chips(['ZVIDA Wallet (Balance $8,940)', 'Input Loan Credit', 'EcoCash'], 0, 'pay')}
            <div data-filter-group="pay" data-filter-value="ZVIDA Wallet (Balance $8,940)">
              ${banner('ok', 'Paid instantly from your wallet. No extra fees.')}
            </div>
            <div data-filter-group="pay" data-filter-value="Input Loan Credit" style="display:none">
              ${banner('warn', 'Borrowed against warehouse receipts at 2.5% flat. Auto-deducted at payout.')}
            </div>
            <div data-filter-group="pay" data-filter-value="EcoCash" style="display:none">
              ${banner('info', 'You will receive an EcoCash payment request after the order is confirmed.')}
            </div>
            ${field('Delivery notes', input(undefined, 'e.g. Leave at the silo gate'))}`,
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
        title: last ? `Reference ${last.ref}` : 'Reference #C-2210',
        icon: ICON.check,
        body: `
          ${last ? marketSteps(last) : ''}
          <div style="display:flex;align-items:center;gap:18px;margin-top:10px">
            ${img(last?.items[0]?.thumb || 'fert', 'md')}
            <div style="flex:1;min-width:0">
              <div style="font-size:13.5px;font-weight:700">${last ? last.address : 'Delivery to Farm 42, Ruwa by Saturday'}</div>
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
      const orders = marketOrders().filter((o) => o.buyer.startsWith('James') || o.buyer === 'James (Farmer)');
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
  contracts: {
    id: 'contracts',
    label: 'Contracts',
    icon: ICON.contracts,
    title: 'Contracts',
    sub: 'Live loads & payments',
    render: () => {
      const mine = loadCatalog().filter((l) => l.supplier.startsWith('James'));
      const open = mine.filter((l) => !['PAID', 'CANCELLED'].includes(l.status));
      const pendingPay = mine.filter((l) => l.status === 'PENDING_PAYMENT');
      const settled = mine.filter((l) => l.status === 'PAID');
      const payout = pendingPay.reduce((s, l) => s + l.amount, 0);
      return `
      ${kpis([
        { label: 'Active Loads', value: open.length, icon: ICON.truck, delta: 'In motion', up: true, spark: [1, 2, 2, 1, 2, 3, Math.max(open.length, 1)], foot: 'Your consignments', open: '#contracts' },
        { label: 'Awaiting ZVIDA Payment', value: pendingPay.length, icon: ICON.wallet, delta: `${marketMoney(payout)} held in escrow`, up: false, spark: [0, 1, 0, 1, 1, 2, Math.max(pendingPay.length, 1)], foot: 'Releases on terms', open: '#contracts' },
        { label: 'Settled', value: settled.length, icon: ICON.check, delta: 'Paid to your wallet', up: true, spark: [1, 1, 2, 2, 3, 3, Math.max(settled.length, 1)], foot: 'Completed loads', open: '#contracts' },
      ])}
      ${banner('info', 'Record the first weighbridge weight (or the scale bucket count) to push the load forward. ZVIDA pays into your wallet after delivery — COD, COC or NET terms.')}
      ${sec('My Consignments', 'Settled history', 'Opening settled loads', settled.length, '#contracts')}
      ${open.length ? open.map((l) => loadCard(l, 'supplier')).join('') : banner('ok', 'No open consignments — check back after harvest.')}
      ${sec('Completed Deals')}
      ${panel({
        body: table(['Contract', 'Commodity', 'Amount', 'Paid'], [
          ['#880', 'Maize', '$4,000', 'Jul 15, 2026'],
          ['#879', 'Soya', '$3,600', 'Jul 12, 2026'],
          ['#878', 'Maize', '$2,450', 'Jul 10, 2026'],
        ], [2], ['#finance', '#finance', '#finance']),
        flush: true,
      })}
    `;
    },
  },
  finance: {
    id: 'finance',
    label: 'Finance',
    icon: ICON.finance,
    title: 'Finance',
    sub: 'Payouts & transactions',
    render: () => `
      ${kpis([
        { label: 'Balance (USD)', value: '$8,940', icon: ICON.wallet, delta: 'Updated today', up: true, spark: [20, 28, 26, 34, 40, 38, 44], foot: 'Wallet balance', open: '#perf' },
        { label: 'Next Payout', value: '$4,200', icon: ICON.clock, delta: 'NET_3 · in 2 days', up: true, spark: [10, 14, 12, 18, 24, 22, 28], foot: 'Contract #882', open: '#contracts' },
        { label: 'Seed Loan', value: '$400', icon: ICON.reports, delta: 'Auto-deducted', up: false, spark: [10, 10, 10, 10, 10, 10, 10], foot: 'Due at payout', open: '#finance' },
        { label: 'Total Earned', value: '$12,580', icon: ICON.trendingUp, delta: 'Since January', up: true, spark: [20, 30, 28, 40, 52, 60, 66], foot: 'This season', open: '#perf' },
      ])}
      ${split(`
        ${sec('Upcoming Payments')}
        ${itemCard({
          title: 'Contract #882 — $4,200',
          thumb: 'grain',
          badge: 'Paid in 2 days · NET_3',
          badgeTone: 'green',
          key: 'c882',
          meta: 'Countdown: <b>2d 04h 12m</b> until automatic release.',
          foot: btn('View Invoice', 'outline sm', 'Opening invoice #882', undefined, 'f-fin-882', 'view'),
        })}
        ${itemCard({
          title: 'Contract #883 — $3,600',
          thumb: 'soya',
          badge: 'Paid in 5 days · NET_3',
          badgeTone: 'green',
          key: 'c883',
          meta: 'Countdown: <b>5d 04h 12m</b> until automatic release.',
          foot: btn('View Invoice', 'outline sm', 'Opening invoice #883', undefined, 'f-fin-883', 'view'),
        })}
        ${sec('Upcoming Deductions')}
        ${itemCard({
          title: 'Seed Loan — $400',
          badge: 'Auto-applied',
          badgeTone: 'amber',
          meta: 'Deducted from Contract #882. You will receive <b>$3,800</b>.',
          foot: btn('View Invoice', 'ghost sm', 'Opening invoice #882', undefined, 'f-fin-882', 'view'),
        })}
        ${sec('Transaction History')}
        ${panel({
          body: `
            ${listRow(ICON.check, 'Contract #880', 'Jul 15, 2026 · Received', '+$4,000', 'pos', false, '#contracts')}
            ${listRow(ICON.check, 'Contract #879', 'Jul 12, 2026 · Received', '+$3,600', 'pos', false, '#contracts')}
            ${listRow(ICON.check, 'Contract #878', 'Jul 10, 2026 · Received', '+$2,450', 'pos', false, '#contracts')}
            ${listRow(ICON.check, 'Contract #877', 'Jul 05, 2026 · Received', '+$1,540', 'pos', false, '#contracts')}
            ${listRow(ICON.check, 'Contract #876', 'Jul 01, 2026 · Received', '+$990', 'pos', false, '#contracts')}`,
        })}
      `, `
        ${sec('Your Documents')}
        ${docs([
          { name: 'Invoice_882.pdf', meta: 'Contract #882 · $4,200', dl: 'inv-882' },
          { name: 'Receipt_882.pdf', meta: 'Contract #882 · $4,200 received', dl: 'rcpt-882' },
          { name: 'Weighbridge_882.pdf', meta: 'Contract #882 · gross/tare/net', dl: 'cert-882' },
          { name: 'Invoice_880.pdf', meta: 'Contract #880 · $4,000', dl: 'inv-880' },
          { name: 'Receipt_880.pdf', meta: 'Contract #880 · $4,000 received', dl: 'rcpt-880' },
        ])}
        ${jsBtn('Download All Documents', 'primary', 'dlAll', '', 'Downloaded all documents')}
      `)}
    `,
  },
  perf: {
    id: 'perf',
    label: 'Performance',
    icon: ICON.shield,
    title: 'Performance',
    sub: 'Reliability, ratings & delivery record',
    render: () => `
      ${kpis([
        { label: 'On-time Rate', value: 100, icon: ICON.shield, delta: 'Across 12 deals', up: true, spark: [90, 95, 92, 96, 98, 97, 100], foot: '% of deliveries', open: '#perf' },
        { label: 'ZVIDA Score', value: 92, icon: ICON.spark, delta: 'Top 10% of suppliers', up: true, spark: [80, 84, 82, 88, 90, 88, 92], foot: 'Out of 100', open: '#perf' },
        { label: 'Dispute-free Deals', value: 12, icon: ICON.check, delta: 'No open disputes', up: true, spark: [8, 9, 10, 10, 11, 11, 12], foot: 'Out of 12 deals', open: '#perf' },
        { label: 'Avg Buyer Rating', value: '4.9', icon: ICON.quality, delta: '2 buyer ratings', up: true, spark: [10, 20, 30, 40, 42, 46, 49], foot: 'Out of 5.0', open: '#perf' },
      ])}
      ${split(`
        ${sec('Delivery Track Record')}
        ${panel({
          body: table(['Contract', 'Commodity', 'Qty', 'On-time', 'Rating'], [
            ['#882', 'Maize', '20t', pill('Yes', 'green'), '—'],
            ['#880', 'Maize', '18.2t', pill('Yes', 'green'), '5.0'],
            ['#879', 'Soya', '9.8t', pill('Yes', 'green'), '4.8'],
            ['#878', 'Maize', '20t', pill('Yes', 'green'), '5.0'],
            ['#877', 'Ground Nuts', '4t', pill('Yes', 'green'), '—'],
          ]),
          flush: true,
        })}
        ${sec('Reliability Breakdown')}
        ${panel({
          body: bars([
            { label: 'On-time loading', pct: 100 },
            { label: 'Moisture consistency', pct: 92 },
            { label: 'Documentation accuracy', pct: 96 },
            { label: 'Quality vs spec', pct: 95 },
          ]),
        })}
      `, `
        ${panel({
          title: 'ZVIDA Score',
          icon: ICON.spark,
          body: `
            <div style="display:flex;align-items:center;gap:18px">
              ${ring(92, '92', 84)}
              <div style="flex:1;min-width:0">
                <div style="font-size:13.5px;font-weight:700">Top 10% of suppliers</div>
                <div style="font-size:12px;color:var(--dsh-text-3);margin:4px 0 12px">Score unlocks priority matching and faster NET_3 payouts.</div>
                ${steps(5, 5, 'Tier 2 · 5 of 5')}
              </div>
            </div>`,
        })}
        ${panel({
          title: 'Buyer Ratings',
          icon: ICON.quality,
          body: `
            ${listRow(ICON.quality, 'Miller Corp', '12 loads · Always on time', '5.0', 'pos')}
            ${listRow(ICON.quality, 'GrainCorp', '8 loads · Great moisture', '4.8', 'pos')}`,
        })}
      `)}
    `,
  },
  farm: {
    id: 'farm',
    label: 'Farm',
    icon: ICON.farm,
    title: 'Farm',
    sub: 'Profile, diary & equipment',
    render: () => `
      ${panel({
        title: 'Farm profile',
        icon: ICON.farm,
        body: profile([
          { k: 'Farm', v: `James’s Farm, Ruwa, Zimbabwe ${pill('Verified · Tier 2', 'green')}` },
          { k: 'GPS', v: '-17.883, 31.033' },
          { k: 'Total acreage', v: '20 hectares' },
          { k: 'Member since', v: 'January 2024' },
        ]),
      })}
      ${split(`
        ${sec('Crop Diary')}
        ${panel({
          body: timeline([
            { title: 'Planted SC403 Maize (Field A)', sub: 'Jul 10, 2026 · 5 ha' },
            { title: 'Sprayed Insecticide (Field B)', sub: 'Jul 05, 2026' },
            { title: 'Applied Urea Fertilizer (Field A)', sub: 'Jun 28, 2026' },
            { title: 'Planted Soya (Field C)', sub: 'Jun 15, 2026 · 3 ha' },
          ]),
        })}
        ${jsBtn('Add Entry', 'outline sm', 'diaryAdd', '', 'Diary entry added')}
      `, `
        ${sec('Equipment')}
        ${panel({
          body: `
            <div data-eq-list>
            ${listRow(ICON.truck, 'Tractor (Case IH)', 'Maintenance due in 50 hours', 'In use')}
            ${listRow(ICON.truck, 'Trailer', 'Operational', 'Ready')}
            ${listRow(ICON.truck, 'Harrow', 'Needs repair', 'Attention', 'neg')}
            </div>`,
        })}
        ${jsBtn('Add Equipment', 'outline sm', 'equipAdd', '', 'Equipment added')}
      `)}
    `,
  },
  messages: {
    id: 'messages',
    label: 'Messages',
    icon: ICON.messages,
    title: 'Messages',
    sub: 'Chat & support',
    render: () => `
      ${chat(
        { name: 'Contract #882 · Maize', preview: 'Truck #12 arrives 08:00', time: 'Today' },
        [
          { sent: false, text: 'ZVIDA: Truck #12 will arrive at 08:00 AM tomorrow.', time: '07:45 AM' },
          { sent: true, text: 'You: Ok, I will be ready.', time: '07:50 AM' },
          { sent: false, text: 'ZVIDA: Great. Don’t forget the moisture reading before loading.', time: '07:52 AM' },
        ],
        ['Where is my truck?', 'Payment status?', 'Upload weighbridge photo']
      )}
      ${sec('Voice Notes')}
      ${panel({
        title: 'Send a voice note',
        icon: ICON.mic,
        body: `
          ${banner('info', 'Tap record, speak, and send — ZVIDA transcribes it and files it against your contract.')}
          <div class="dsh-btn-row">
            ${jsBtn('Record', 'primary', 'voiceRecord', '', 'Recording started')}${jsBtn('Play Latest', 'ghost sm', 'voicePlay', '', 'Playing your latest voice note')}
          </div>
          ${listRow(ICON.mic, 'Grain moisture update — today 09:15 AM', 'Filed against Contract #882', '0:42', 'plain', false, '#messages')}
          ${listRow(ICON.mic, 'Silo capacity note — yesterday', 'Filed against Contract #881', '0:31', 'plain', false, '#messages')}`,
      })}
      ${sec('Support — FAQ & Tickets')}
      ${panel({
        title: 'Support',
        icon: ICON.messages,
        body: `
          ${listRow(ICON.leaf, 'How do I list my produce?', 'Go to Sell → Create New Listing', '', 'plain', false, '#sell')}
          ${listRow(ICON.finance, 'When will I get paid?', 'NET_3 or NET_7 after delivery confirmation', '', 'plain', false, '#finance')}
          ${listRow(ICON.route, 'How do I track my delivery?', 'Open Today → Track Truck', '', 'plain', false, '#contracts')}
          <div class="dsh-field-grid" style="margin-top:16px">
            ${field('Subject', input(undefined, 'What is the issue?'))}
            ${field('Priority', select(['Low', 'Medium', 'High', 'Urgent']))}
          </div>
          ${field('Message', textarea(3, 'Describe your problem…'))}
          <div class="dsh-btn-row">${uploadBtn('Attach screenshot', 'ghost sm', 'image/*')}${jsBtn('Submit Ticket', 'primary', 'submitTicket', '', 'Ticket #T-104 submitted — we reply within 24h')}</div>`,
      })}
    `,
  },
};

boot({
  key: 'farmer',
  name: 'James',
  roleLabel: 'Farmer',
  company: 'James’s Farm',
  initials: 'J',
  logoText: 'ZVIDAMBANO · FARMER',
  accent: '#059669',
  accentHover: '#047857',
  accentLight: '#ecfdf5',
  accentRgb: '5, 150, 105',
  gradientEnd: '#10b981',
  pages: [P.today, P.sell, P.shop, P.orders, P.cart, P.checkout, P['order-confirmed'], P.contracts, P.finance, P.perf, P.farm, P.messages],
});
