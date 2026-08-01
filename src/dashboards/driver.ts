import { boot, ICON, pill, btn, hero, kpis, actions, sec, panel, split, banner, field, input, listRow, ledger, itemCard, profile, tabs, wf, jsBtn, registerDownload, downloadNow, JS, toast, downloadBtn, chips, marketOrders, marketOrderCard, marketOrderGroup, marketBucket, loadCatalog, loadCard, zdocDocuments } from './core';

JS.callDispatch = () => {
  toast('Dialing ZVIDA dispatch +263 24 277 8800 — placing the call from your phone', 'info');
};
JS.openWhatsApp = () => {
  toast('Opening WhatsApp — +263 77 000 8800', 'info');
};
JS.saveSettings = () => {
  const b = document.querySelector('[data-js="saveSettings"]') as HTMLButtonElement | null;
  if (b) {
    b.textContent = 'Saved';
    b.disabled = true;
  }
  toast('Payment settings saved');
};
JS.downloadStatement = () => {
  downloadNow('d-stmt');
  toast('Statement downloaded');
};

registerDownload('d-stmt', 'Statement_Jul2026.csv', [
  'Trip,Route,Amount,Date,Status',
  'LD-2042,Norton to Chegutu,180,Jul 30,Paid',
  'LD-2041,Chinhoyi to Norton,210,Jul 29,Paid',
  'LD-2039,Norton to Kadoma,160,Jul 28,Paid',
  'LD-2037,Harare to Mutare,240,Jul 27,Paid',
].join('\n'), 'text/csv');
registerDownload('d-lic', 'Driver_License_JohnDoe.pdf', pdfBlob(['ZVIDAMBANO DRIVER RECORDS', '', 'Driver: John Doe', 'License: DL-2024-0042', 'Class: Heavy Commercial (C)', 'Valid until: Dec 2026', 'Status: Verified']), 'application/pdf');
registerDownload('d-ins', 'Insurance_ABC123.pdf', pdfBlob(['ZVIDAMBANO VEHICLE RECORDS', '', 'Vehicle: ABC-123 Scania R450', 'Cover: Comprehensive', 'Insured value: $85,000', 'Status: Active']), 'application/pdf');

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

wf('d-hero-start', {
  start: { nav: '#trips', toast: 'Loading started — GPS tracking on' },
});
wf('d-delay', {
  report: { done: 'Reported', toast: 'Delay reported — dispatch notified' },
});

const P = {
  today: {
    id: 'today',
    label: 'Today',
    icon: ICON.dashboard,
    title: 'Today',
    sub: 'John Doe · Truck ABC-123',
    render: () => {
      const mine = loadCatalog().filter((l) => l.driver === 'John Doe' && !['PAID', 'CANCELLED'].includes(l.status));
      return `
      <div class="dsh-offline"><span class="pulse"></span> Online · Last sync 08:00 AM</div>
      ${hero({
        kick: 'Online · GPS tracking active',
        title: 'Good morning, John',
        sub: 'Two loads scheduled today. Weighbridge steps are ready when you reach the farm.',
        actions: `${btn('Start Load', 'primary', 'Loading started — GPS tracking on', undefined, 'd-hero-start', 'start')}${btn('Contact ZVIDA', 'onlight', 'Opening ZVIDA support', '#support')}`,
        bg: 'dash/hero-truck.jpg',
        stats: [
          { l: 'Trips (month)', v: '23' },
          { l: 'Earnings (month)', v: '$1,820' },
          { l: 'On-time rate', v: '97%' },
        ],
      })}
      ${actions([
        { label: 'Start Load', icon: ICON.truck, toast: 'Opening first weight capture', href: '#weighbridge' },
        { label: 'Upload First Weight', icon: ICON.camera, toast: 'Opening weighbridge capture', href: '#weighbridge' },
        { label: 'Confirm Offload', icon: ICON.check, toast: 'Opening second weight capture', href: '#weighbridge' },
        { label: 'Report Delay', icon: ICON.alert, toast: 'Delay reported — dispatch notified', wf: 'd-delay', action: 'report' },
      ])}
      ${kpis([
        { label: 'Trips (Month)', value: 23, icon: ICON.trips, delta: '+3 this week', up: true, spark: [10, 14, 12, 18, 20, 22, 23], foot: 'Total trips', open: '#trips' },
        { label: 'Earnings (Month)', value: '$1,820', icon: ICON.earnings, delta: '+15% vs last month', up: true, spark: [20, 26, 30, 34, 40, 44, 50], foot: 'Before deposits', open: '#earnings' },
        { label: 'Pending Deposits', value: '$200', icon: ICON.wallet, delta: `${mine.length} active loads`, up: false, spark: [12, 14, 13, 16, 15, 18, 17], foot: 'Paid after offload', open: '#earnings' },
        { label: 'On-time Rate', value: 97, icon: ICON.shield, delta: 'Across 23 trips', up: true, spark: [90, 92, 94, 93, 95, 96, 97], foot: '% of trips', open: '#trips' },
      ])}
      ${split(`
        ${sec('Today’s Consignments', 'View all', 'Opening all trips', undefined, '#trips')}
        ${mine.length ? mine.map((l) => loadCard(l, 'driver')).join('') : banner('ok', 'No active consignments today.')}
      `, `
        ${panel({
          title: 'Consignment Snapshot',
          icon: ICON.trips,
          body: ledger([
            { label: 'Active loads', value: String(mine.length) },
            { label: 'Loading / first weight', value: String(mine.filter((l) => ['LOADING', 'WEIGHED_1'].includes(l.status)).length) },
            { label: 'Offloading / second weight', value: String(mine.filter((l) => ['OFFLOADING', 'WEIGHED_2'].includes(l.status)).length) },
            { label: 'Awaiting payment', value: String(mine.filter((l) => l.status === 'PENDING_PAYMENT').length) },
          ]),
        })}
        ${panel({
          title: 'Earnings Snapshot',
          icon: ICON.earnings,
          body: `
            ${listRow(ICON.finance, 'LD-2042 · Norton → Chegutu', 'Paid · 2 hours ago', '+$180', 'pos', false, '#earnings')}
            ${listRow(ICON.finance, 'LD-2041 · Chinhoyi → Norton', 'Paid · Yesterday', '+$210', 'pos', false, '#earnings')}
            ${listRow(ICON.wallet, 'Deposits pending', 'Awaiting offload confirmation', '+$200', 'pos', false, '#earnings')}`,
          link: 'View earnings',
          linkToast: 'Opening earnings page',
          linkHref: '#earnings',
        })}
        ${panel({
          title: 'Support',
          icon: ICON.messages,
          body: `${listRow(ICON.phone, 'ZVIDA dispatch', '+263 4 123 4567', jsBtn('Call', 'ghost sm', 'callDispatch', '', 'Dialing ZVIDA dispatch…'), 'plain', false, '#support')}
            ${listRow(ICON.messages, 'WhatsApp group', 'Region 3 drivers · active', jsBtn('Open', 'ghost sm', 'openWhatsApp', '', 'Opening WhatsApp…'), 'plain', false, '#support')}`,
        })}
      `)}
    `;
    },
  },
  trips: {
    id: 'trips',
    label: 'My Trips',
    icon: ICON.trips,
    title: 'My Trips',
    sub: 'History & milestones',
    render: () => {
      const mine = loadCatalog().filter((l) => l.driver === 'John Doe');
      const active = mine.filter((l) => !['PAID', 'CANCELLED'].includes(l.status));
      const done = mine.filter((l) => ['PAID', 'CANCELLED'].includes(l.status));
      return `
      ${tabs([{ label: 'Active', badge: active.length, active: true }, { label: 'Completed', badge: done.length + 23 }], 'dtrips')}
      <div data-tab-group="dtrips" data-tab="Active">
      ${active.length ? active.map((l) => loadCard(l, 'driver')).join('') : banner('ok', 'No active trips — new consignments will appear here.')}
      </div>
      <div data-tab-group="dtrips" data-tab="Completed" style="display:none">
      ${done.length ? done.map((l) => loadCard(l, 'driver')).join('') : ''}
      ${sec('Trip History')}
      ${panel({
        body: `
          ${listRow(ICON.route, 'LD-2042 · Norton → Chegutu', 'Completed · 2 hours ago', '+$180', 'pos', false, '#earnings')}
          ${listRow(ICON.route, 'LD-2041 · Chinhoyi → Norton', 'Completed · Yesterday', '+$210', 'pos', false, '#earnings')}
          ${listRow(ICON.route, 'LD-2039 · Norton → Kadoma', 'Completed · 2 days ago', '+$160', 'pos', false, '#earnings')}
          ${listRow(ICON.route, 'LD-2037 · Harare → Mutare', 'Completed · 3 days ago', '+$240', 'pos', false, '#earnings')}`,
      })}
      </div>
    `;
    },
  },
  documents: {
    id: 'documents',
    label: 'Documents',
    icon: ICON.file,
    title: 'Trip Documents',
    sub: 'Delivery notes & proof of delivery',
    render: () => zdocDocuments('driver', 'John Doe'),
  },
  weighbridge: {
    id: 'weighbridge',
    label: 'Weighbridge',
    icon: ICON.weighbridge,
    title: 'Weighbridge',
    sub: 'First & second weights',
    render: () => {
      const mine = loadCatalog().filter((l) => l.driver === 'John Doe' && !['PAID', 'CANCELLED'].includes(l.status));
      const atScale = mine.filter((l) => ['LOADING', 'WEIGHED_1', 'OFFLOADING'].includes(l.status));
      return `
      ${banner('info', 'Record the first weight at loading and the second weight at offloading. Scale loads use bucket counts. The system calculates net and amount automatically.')}
      ${sec('Weighbridge Queue', 'My trips', 'Opening your trips', mine.length, '#trips')}
      ${(atScale.length ? atScale : mine).length ? (atScale.length ? atScale : mine).map((l) => loadCard(l, 'driver')).join('') : banner('ok', 'No loads at the scale right now.')}
      ${sec('System Calculates')}
      ${panel({
        body: ledger([
          { label: 'Weighbridge', value: 'Net = W2 − W1' },
          { label: 'Scale', value: 'Bags × 50 + buckets × bucket size' },
          { label: 'Amount', value: 'Net tonnes × rate' },
        ]),
      })}
    `;
    },
  },
  earnings: {
    id: 'earnings',
    label: 'Earnings',
    icon: ICON.earnings,
    title: 'Earnings',
    sub: 'Payouts & deposit status',
    render: () => `
      ${kpis([
        { label: 'Earnings (Month)', value: '$1,820', icon: ICON.earnings, delta: '+15% vs last month', up: true, spark: [20, 26, 30, 34, 40, 44, 50], foot: 'Across all trips', open: '#earnings' },
        { label: 'Trips Completed', value: 23, icon: ICON.trips, delta: '+3 this week', up: true, spark: [12, 14, 16, 18, 20, 21, 23], foot: 'This month', open: '#trips' },
        { label: 'Pending Deposits', value: '$200', icon: ICON.wallet, delta: '2 loads awaiting offload', up: false, spark: [10, 12, 14, 13, 15, 16, 17], foot: 'Loads #882 · #883', open: '#trips' },
        { label: 'On-time Rate', value: 97, icon: ICON.shield, delta: 'Across 23 trips', up: true, spark: [90, 92, 94, 93, 95, 96, 97], foot: '% of trips', open: '#trips' },
      ])}
      ${sec('Deposit Status — Load #882')}
      ${itemCard({
        title: 'Deposit schedule',
        thumb: 'grain',
        open: '#earnings',
        meta: `Loading deposit: <b>$100</b> ${pill('Paid', 'green')}<br/>Final deposit (offloading): <b>$100</b> ${pill('Pending', 'amber')}`,
        foot: btn('Open Load #882', 'ghost sm', 'Opening load #882', '#trips'),
      })}
      ${sec('Payment History')}
      ${panel({
        body: `
          ${listRow(ICON.finance, 'LD-2042 · Norton → Chegutu', 'Paid · 2 hours ago', '+$180', 'pos', false, '#trips')}
          ${listRow(ICON.finance, 'LD-2041 · Chinhoyi → Norton', 'Paid · Yesterday', '+$210', 'pos', false, '#trips')}
          ${listRow(ICON.finance, 'LD-2039 · Norton → Kadoma', 'Paid · 2 days ago', '+$160', 'pos', false, '#trips')}
          ${listRow(ICON.finance, 'LD-2037 · Harare → Mutare', 'Paid · 3 days ago', '+$240', 'pos', false, '#trips')}`,
      })}
      <div class="dsh-btn-row" style="margin-top:12px">${jsBtn('Download Statement', 'outline', 'downloadStatement', '', 'Statement downloaded')}</div>
    `,
  },
  settings: {
    id: 'settings',
    label: 'Settings',
    icon: ICON.settings,
    title: 'Settings',
    sub: 'Profile, vehicle & payments',
    render: () => `
      ${split(`
        ${sec('Profile')}
        ${panel({
          title: 'Personal',
          icon: ICON.users,
          body: profile([
            { k: 'Name', v: 'John Doe' },
            { k: 'Phone', v: '+263 77 123 4567' },
            { k: 'Email', v: 'john.doe@driver.com' },
            { k: 'License', v: `DL-2024-0042 ${pill('Verified', 'green')}` },
          ]),
        })}
        ${sec('Vehicle')}
        ${panel({
          title: 'Truck',
          icon: ICON.truck,
          body: profile([
            { k: 'Truck', v: 'ABC-123 · Scania R450 (White)' },
            { k: 'Trailer', v: 'XYZ-789 · Grain Tipper, 35t' },
          ]),
        })}
      `, `
        ${sec('Payment Details')}
        ${panel({
          title: 'Payouts',
          icon: ICON.wallet,
          body: `
            ${field('Bank / Mobile money', input('EcoCash +263 77 123 4567'))}
            <div class="dsh-btn-row">${jsBtn('Save Changes', 'primary', 'saveSettings', '', 'Settings saved')}</div>`,
        })}
        ${panel({
          title: 'Documents',
          icon: ICON.file,
          body: `${listRow(ICON.file, 'Driver license', 'Valid until Dec 2026', downloadBtn('View', 'ghost sm', 'd-lic'), 'plain')}
            ${listRow(ICON.shield, 'Insurance', 'Comprehensive · ABC-123', downloadBtn('View', 'ghost sm', 'd-ins'), 'plain')}`,
        })}
      `)}
    `,
  },
  support: {
    id: 'support',
    label: 'Support',
    icon: ICON.support,
    title: 'Support',
    sub: 'ZVIDA dispatch & driver help',
    render: () => `
      ${kpis([
        { label: 'Dispatch Line', value: '24/7', icon: ICON.phone, delta: 'Always available', up: true, spark: [10, 10, 10, 10, 10, 10, 10], foot: '+263 24 277 8800', open: '#support' },
        { label: 'Open Queries', value: 1, icon: ICON.messages, delta: 'Fuel advance · resolved', up: true, spark: [3, 2, 2, 1, 1, 1, 1], foot: 'Avg reply 15 min', open: '#support' },
      ])}
      ${panel({
        title: 'Contact ZVIDA dispatch',
        icon: ICON.phone,
        body: `
          ${banner('info', 'For emergencies, load issues or trip changes, dispatch is on call 24/7.')}
          <div class="dsh-btn-row">
            ${jsBtn('Call Dispatch', 'primary', 'callDispatch', '', 'Dialing ZVIDA dispatch…')}${jsBtn('WhatsApp', 'outline', 'openWhatsApp', '', 'Opening WhatsApp…')}
          </div>
          ${listRow(ICON.phone, 'Dispatch line', '24/7 · +263 24 277 8800', jsBtn('Call', 'ghost sm', 'callDispatch', '', 'Dialing ZVIDA dispatch…'), 'plain')}
          ${listRow(ICON.messages, 'WhatsApp', '+263 77 000 8800', jsBtn('Chat', 'ghost sm', 'openWhatsApp', '', 'Opening WhatsApp…'), 'plain')}`,
      })}
      ${panel({
        title: 'FAQ',
        icon: ICON.support,
        body: `
          ${listRow(ICON.trips, 'How do weighbridge steps work?', 'View the guide on your trips page', btn('Open', 'ghost sm', 'Opening trips', '#trips'))}
          ${listRow(ICON.earnings, 'When are deposits paid?', '50% at loading, 50% after offload', btn('Open', 'ghost sm', 'Opening earnings', '#earnings'))}
          ${listRow(ICON.shield, 'What if I hit a delay?', 'Report it from Today — dispatch recalculates', btn('Open', 'ghost sm', 'Opening today', '#today'))}`,
      })}
    `,
  },
  marketplace: {
    id: 'marketplace',
    label: 'Deliveries',
    icon: ICON.shop,
    title: 'Deliveries',
    sub: 'Ship ZVIDA orders',
    render: () => {
      const orders = marketOrders();
      const ready = orders.filter((o) => o.status === 'SHIPPED');
      const onRoad = orders.filter((o) => o.status === 'OUT_FOR_DELIVERY');
      const done = orders.filter((o) => ['DELIVERED', 'PAID'].includes(o.status));
      return `
      ${kpis([
        { label: 'Ready to Pick Up', value: ready.length, icon: ICON.box, delta: 'Shipped by ZVIDA', up: true, spark: [1, 0, 1, 2, 1, 1, ready.length], foot: 'Pick up today', open: '#marketplace' },
        { label: 'Out for Delivery', value: onRoad.length, icon: ICON.route, delta: 'En route to customers', up: false, spark: [0, 1, 1, 0, 2, 1, onRoad.length], foot: 'Track until signed', open: '#marketplace' },
        { label: 'Delivered', value: done.length, icon: ICON.check, delta: 'Signed for', up: true, spark: [2, 3, 3, 4, 4, 5, done.length], foot: 'Past ZVIDA deliveries', open: '#marketplace' },
      ])}
      ${banner('info', 'Pick up shipped orders from ZVIDA and deliver them to the customer. Confirm delivery when the customer signs.')}
      ${sec('Ready to Deliver', 'View trips', 'Opening your trips', ready.length + onRoad.length, '#trips')}
      ${chips(['All', 'Active', 'Pending', 'Loading', 'Offloading', 'Complete'], 0, 'dmkt')}
      ${orders.map((o) => marketOrderGroup(o, 'driver', 'dmkt', marketBucket(o.status))).join('')}
      ${ready.length + onRoad.length === 0 ? banner('ok', 'No ZVIDA deliveries right now. New shipped orders will appear here.') : ''}
    `;
    },
  },
};

boot({
  key: 'driver',
  name: 'John',
  roleLabel: 'Driver',
  company: 'John Doe · Transporter',
  initials: 'J',
  logoText: 'ZVIDAMBANO · DRIVER',
  accent: '#ea580c',
  accentHover: '#c2410c',
  accentLight: '#fff7ed',
  accentRgb: '234, 88, 12',
  gradientEnd: '#f97316',
  pages: [P.today, P.marketplace, P.trips, P.weighbridge, P.documents, P.earnings, P.settings, P.support],
  navGroups: [
    { label: 'Overview', pages: ['today', 'marketplace'] },
    { label: 'Trips', pages: ['trips', 'weighbridge', 'documents', 'earnings'] },
    { label: 'Account', pages: ['settings', 'support'] },
  ],
});
