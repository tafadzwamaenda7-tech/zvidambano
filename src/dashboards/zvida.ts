import { boot, ICON, svg, pill, btn, hero, kpis, actions, sec, panel, split, banner, field, input, textarea, table, listRow, ledger, bars, tabs, img, feed, itemCard, wf, jsBtn, registerDownload, downloadNow, JS, toast, invoice, chips, marketOrders, marketOrderCard, marketOrderGroup, marketBucket, marketMoney, loadCatalog, loadCard, freightKpis, freightFeed, loadMoney } from './core';

JS.callDriver = (who) => {
  toast(`Dialing ${who} — placing the call from your phone`, 'info');
};
JS.exportTax = () => {
  downloadNow('z-tax');
  toast('Tax compliance file exported');
};
JS.exportCarbon = () => {
  downloadNow('z-carbon');
  toast('Carbon footprint report exported');
};

registerDownload('z-tax', 'Tax_Compliance_Jul31.csv', [
  'Contract,Commodity,Spread,Withholding',
  '#882,Maize,800,80',
  '#883,Soya,900,90',
  '#884,Wheat,900,90',
].join('\n'), 'text/csv');
registerDownload('z-carbon', 'Carbon_Footprint_Jul31.csv', [
  'Contract,Km,Mode,kgCO2',
  '#882,22,10t truck,142',
  '#883,84,10t truck,410',
  '#884,96,10t truck,468',
].join('\n'), 'text/csv');

wf('z-notify', { send: { done: 'Sent', toast: 'Broadcast sent to all parties' } });
wf('z-feed-approve', { approve: { done: 'Approved', nav: '#listings', toast: 'Listing approved at $240/t — James notified' } });
wf('z-feed-notify', { notify: { done: 'Notified', nav: '#deliveries', toast: 'Party notified about the delay' } });
wf('z-rev-882', {
  review: {
    target: '.js-z-d882',
    sel: '.dsh-badge',
    to: 'IN REVIEW',
    tone: 'blue',
    nav: '#disputes',
    done: 'In Review',
    toast: 'Resolution panel opened',
    foot: btn('Confirm Decision', 'primary sm', 'Dispute resolved — both parties notified', undefined, 'z-resolve-882', 'confirm'),
  },
});
wf('z-rev-879', { review: { done: 'In Review', nav: '#disputes', toast: 'Resolution panel opened', foot: pill('Awaiting evidence from Peter', 'amber') } });
wf('z-resolve-882', {
  confirm: {
    target: '.js-z-d882',
    to: 'RESOLVED',
    tone: 'green',
    nav: '#disputes',
    toast: 'Dispute resolved — both parties notified',
    foot: pill('Resolved', 'green') + ' <span style="font-size:12px;color:var(--dsh-text-3)">Decision: $50 penalty applied to farmer payout.</span>',
  },
});
wf('z-list-james', {
  approve: { to: 'APPROVED', tone: 'green', nav: '#listings', toast: 'Listing approved — James notified', foot: pill('Live on marketplace', 'green') },
  reject: { to: 'REJECTED', tone: 'red', nav: '#listings', toast: 'Listing rejected — James notified', foot: pill('Rejected', 'red') },
});
wf('z-list-sarah', {
  approve: { to: 'APPROVED', tone: 'green', nav: '#listings', toast: 'Listing approved — Sarah notified', foot: pill('Live on marketplace', 'green') },
  reject: { to: 'REJECTED', tone: 'red', nav: '#listings', toast: 'Listing rejected — Sarah notified', foot: pill('Rejected', 'red') },
});
wf('z-list-peter', {
  approve: { to: 'APPROVED', tone: 'green', nav: '#listings', toast: 'Listing approved — Peter notified', foot: pill('Live on marketplace', 'green') },
  reject: { to: 'REJECTED', tone: 'red', nav: '#listings', toast: 'Listing rejected — Peter notified', foot: pill('Rejected', 'red') },
});
wf('z-automatch', { match: { done: 'Matched', nav: '#deliveries', toast: 'Contract created — parties notified' } });
wf('z-matchall', { all: { done: 'Matched', nav: '#deliveries', toast: '5 contracts created — parties notified' } });
wf('z-pay-882', {
  release: { sel: '.js-due-882', to: 'Released', tone: 'green', nav: '#payments', toast: 'Payment of $4,000 released to James', foot: pill('Released to James · Receipt sent', 'green') },
  hold: { sel: '.js-due-882', to: 'Held', tone: 'amber', nav: '#payments', toast: 'Payment held — reminder scheduled', foot: pill('Held · reminder scheduled', 'amber') },
});
wf('z-pay-883', {
  release: { sel: '.js-due-883', to: 'Released', tone: 'green', nav: '#payments', toast: 'Payment of $3,600 released to Sarah', foot: pill('Released to Sarah · Receipt sent', 'green') },
  hold: { sel: '.js-due-883', to: 'Held', tone: 'amber', nav: '#payments', toast: 'Payment held — reminder scheduled', foot: pill('Held · reminder scheduled', 'amber') },
});
wf('z-pay-884', {
  release: { sel: '.js-due-884', to: 'Released', tone: 'green', nav: '#payments', toast: 'Payment of $4,200 released to Peter', foot: pill('Released to Peter · Receipt sent', 'green') },
  hold: { sel: '.js-due-884', to: 'Held', tone: 'amber', nav: '#payments', toast: 'Payment held — reminder scheduled', foot: pill('Held · reminder scheduled', 'amber') },
});

const P = {
  control: {
    id: 'control',
    label: 'Control Tower',
    icon: ICON.dashboard,
    title: 'Control Tower',
    sub: 'ZVIDA Exchange — live operations',
    render: () => `
      ${hero({
        kick: 'Operations overview',
        title: 'Control Tower',
        sub: 'Today’s spread sits at $4,200 across 12 open loads. Review urgent events, approvals and risk flags below.',
        actions: `${btn('Match Trade', 'onlight', 'Opening blind matching', '#matches')}${btn('Release Payment', 'onlight', 'Opening pending payments', '#payments')}`,
        bg: 'dash/hero-office.jpg',
        stats: [
          { l: 'Spread today', v: '$4,200' },
          { l: 'Open loads', v: '12' },
          { l: 'On-time', v: '96%' },
        ],
      })}
      ${actions([
        { label: 'Match Trade', icon: ICON.match, toast: 'Opening blind matching', href: '#matches' },
        { label: 'Release Payment', icon: ICON.payments, toast: 'Opening pending payments', href: '#payments' },
        { label: 'Approve Listing', icon: ICON.listings, badge: 4, toast: 'Opening approval queue', href: '#listings' },
        { label: 'Notify All', icon: ICON.send, toast: 'Broadcast sent to all parties', wf: 'z-notify', action: 'send' },
      ])}
      ${kpis([
        { label: 'Today’s Spread', value: '$4,200', icon: ICON.spark, delta: '12 loads in motion', up: true, spark: [10, 18, 16, 22, 30, 34, 42], foot: 'Brokerage for the day', open: '#reports' },
        { label: 'This Week', value: '$18,500', icon: ICON.trendingUp, delta: '8% vs last week', up: true, spark: [30, 34, 32, 40, 44, 42, 48], foot: 'Across all load types', open: '#payments' },
        { label: 'Pending Approvals', value: 4, icon: ICON.listings, delta: '2 disputes open', up: false, spark: [5, 6, 4, 7, 5, 4, 4], foot: 'Listings & contracts', open: '#listings' },
        { label: 'On-time Deliveries', value: 96, icon: ICON.shield, delta: 'Across 38 loads', up: true, spark: [90, 92, 94, 93, 95, 96, 96], foot: '% of loads', open: '#deliveries' },
      ])}
      ${split(`
        ${sec('Urgent Feed', 'View all', 'Opening full activity log', undefined, '#reports')}
        ${feed([
          {
            icon: ICON.disputes,
            tone: 'danger',
            time: '09:00 AM',
            title: 'Quality dispute — Miller Corp rejected Load #882',
            desc: 'Maize · 14.5% moisture vs 14% spec · Supplier: James · Offtaker: Miller Corp',
            open: '#disputes',
            actions: btn('Review', 'primary sm', 'Opening dispute review', '#disputes'),
          },
          {
            icon: ICON.listings,
            tone: 'warn',
            time: '10:00 AM',
            title: 'Listing approval — James listed 20t Maize @ $200/t',
            desc: 'Reserve: $200/t · ZVIDA price: $240/t (suggested)',
            open: '#listings',
            actions: btn('Set Price & Approve', 'primary sm', 'Listing approved at $240/t', undefined, 'z-feed-approve', 'approve'),
          },
          {
            icon: ICON.truck,
            tone: 'default',
            time: '11:00 AM',
            title: 'Truck delay — Driver John Doe (ABC-123) in traffic',
            desc: 'ETA delayed by 1 hour · Load #882',
            open: '#deliveries',
            actions: `${btn('Notify Supplier', 'ghost sm', 'Supplier notified', undefined, 'z-feed-notify', 'notify')}${btn('Notify Offtaker', 'ghost sm', 'Offtaker notified', undefined, 'z-feed-notify', 'notify')}`,
          },
          {
            icon: ICON.match,
            tone: 'ok',
            time: '02:00 PM',
            title: 'Blind match — Listing #441 matched to Offtaker #003',
            desc: 'Spread: $800 (20t Maize @ $200 / $240)',
            open: '#deliveries',
            actions: btn('View Contract', 'outline sm', 'Opening contract #882', '#deliveries'),
          },
        ])}
      `, `
        ${panel({
          title: 'At a Glance',
          icon: ICON.spark,
          body: ledger([
            { label: 'Today', value: '$4,200' },
            { label: 'This Week', value: '$18,500' },
            { label: 'This Month', value: '$42,300' },
          ]),
        })}
        ${panel({
          title: 'Risk Overlays',
          icon: ICON.alert,
          body: `
            ${banner('warn', '3 listings over 30 days old. Prices auto-reduce tomorrow.', 'View queue', 'Opening spoilage queue', '#listings')}
            ${banner('info', 'Rain forecast for Mashonaland East tomorrow. 5 loads at risk.', 'View loads', 'Opening affected loads', '#deliveries')}`,
        })}
        ${panel({
          title: 'Recently Matched',
          icon: ICON.match,
          body: `
            ${listRow(ICON.leaf, 'ANON-1 → ANON-B1', 'Maize 20t · spread $800', '+$800', 'pos', false, '#matches')}
            ${listRow(ICON.leaf, 'ANON-3 → ANON-B3', 'Wheat 15t · spread $600', '+$600', 'pos', false, '#matches')}
            ${listRow(ICON.leaf, 'ANON-2 → ANON-B2', 'Soya 10t · spread $500', '+$500', 'pos', false, '#matches')}`,
        })}
      `)}
    `,
  },
  listings: {
    id: 'listings',
    label: 'Listings',
    icon: ICON.listings,
    title: 'Listings',
    sub: 'Approval queue',
    render: () => `
      ${tabs([{ label: 'Pending Approval', badge: 4, active: true }, { label: 'Active Listings', badge: 12 }, { label: 'Rejected', badge: 3 }], 'zlist')}
      ${split(`
        <div data-tab-group="zlist" data-tab="Pending Approval">
        ${pendingListing('James', 'grain', 'Maize', 20, 'Ruwa', 'Grade A', 14.5, 200, 0, '', 240, 'z-list-james')}
        ${pendingListing('Sarah', 'soya', 'Soya', 10, 'Marondera', 'Grade A', 12.0, 450, 15, 'Auto-reducing in 3 days', 490, 'z-list-sarah')}
        ${pendingListing('Peter', 'wheat', 'Wheat', 15, 'Bindura', 'Grade B', 13.2, 380, 32, 'Auto-reducing in 3 days', 420, 'z-list-peter')}
        </div>
        <div data-tab-group="zlist" data-tab="Active Listings" style="display:none">
          ${panel({
            body: table(['Supplier', 'Commodity', 'Qty', 'ZVIDA price', 'Status'], [
              ['Tapiwa', 'Maize', '30t', '$215/t', pill('Live', 'green')],
              ['Rudo', 'Soya', '12t', '$470/t', pill('Live', 'green')],
              ['Farai', 'Wheat', '25t', '$395/t', pill('Live', 'green')],
              ['Tendai', 'Sugar Beans', '8t', '$640/t', pill('Live', 'green')],
            ], [], ['#deliveries', '#deliveries', '#deliveries', '#deliveries']),
            flush: true,
          })}
        </div>
        <div data-tab-group="zlist" data-tab="Rejected" style="display:none">
          ${panel({
            body: table(['Supplier', 'Commodity', 'Reason', 'Date'], [
              ['Blessing', 'Maize', pill('Moisture 16%', 'red'), 'Jul 24'],
              ['Chipo', 'Soya', pill('Unverified GPS', 'red'), 'Jul 20'],
              ['Nomatter', 'Wheat', pill('Duplicate listing', 'red'), 'Jul 18'],
            ]),
            flush: true,
          })}
        </div>
      `, `
        ${panel({
          title: 'Listing Stats',
          icon: ICON.listings,
          body: ledger([
            { label: 'Pending', value: '4' },
            { label: 'Active', value: '12' },
            { label: 'Rejected', value: '3' },
          ]),
        })}
        ${panel({
          title: 'Pricing Policy',
          icon: ICON.percent,
          body: `
            ${banner('info', 'Listings idle for 30+ days auto-reduce at <b>5% per week</b> to clear spoilage risk.')}
            <div style="font-size:12px;color:var(--dsh-text-3)">Spoilage queue runs at 06:00 AM daily.</div>`,
        })}
        ${panel({
          title: 'Spread Benchmarks',
          icon: ICON.scale,
          body: bars([
            { label: 'Maize', pct: 18 },
            { label: 'Soya', pct: 14 },
            { label: 'Wheat', pct: 12 },
          ]),
        })}
      `)}
    `,
  },
  matches: {
    id: 'matches',
    label: 'Matches',
    icon: ICON.match,
    title: 'Matches',
    sub: 'Anonymous blind matching',
    render: () => `
      ${kpis([
        { label: 'Open Listings', value: 12, icon: ICON.listings, delta: '2 expiring soon', up: false, spark: [10, 12, 11, 13, 12, 12, 12], foot: 'Suppliers', open: '#listings' },
        { label: 'Open RFQs', value: 8, icon: ICON.buy, delta: '3 high priority', up: true, spark: [6, 7, 6, 8, 7, 8, 8], foot: 'Offtakers', open: '#listings' },
        { label: 'Top Spread', value: '$800', icon: ICON.spark, delta: 'Maize · ANON-1', up: true, spark: [20, 30, 28, 40, 50, 60, 66], foot: 'Best match today', open: '#reports' },
        { label: 'Avg Spread', value: '$620', icon: ICON.scale, delta: 'Across 8 deals', up: true, spark: [30, 34, 32, 40, 44, 42, 48], foot: 'Per matched deal', open: '#reports' },
      ])}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px">
        ${panel({
          title: 'Supplier listings (anonymous)',
          icon: ICON.leaf,
          body: `
            ${matchRow(true, 'Anonymous Supplier #1', '20t Maize @ $200/t (COD) · Ruwa', 'GPS: -17.883, 31.033 · Grade A')}
            ${matchRow(false, 'Anonymous Supplier #2', '10t Soya @ $450/t (COC) · Marondera', 'GPS: -18.185, 31.550 · Grade A')}
            ${matchRow(false, 'Anonymous Supplier #3', '15t Wheat @ $380/t (COD) · Bindura', 'GPS: -17.292, 31.331 · Grade B')}`,
        })}
        ${panel({
          title: 'Offtaker RFQs (anonymous)',
          icon: ICON.users,
          body: `
            ${matchRow(true, 'Anonymous Buyer #1', '25t Maize @ $240/t · Harare', 'GPS: -17.825, 31.033 · Grade A')}
            ${matchRow(false, 'Anonymous Buyer #2', '15t Soya @ $500/t · Harare', 'GPS: -17.825, 31.033 · Grade A')}
            ${matchRow(false, 'Anonymous Buyer #3', '20t Wheat @ $420/t · Chitungwiza', 'GPS: -18.000, 31.083 · Grade B')}`,
        })}
      </div>
      ${sec('Smart Queue — Top Matches by Spread')}
      <div class="dsh-queue">
        ${smartMatch(1, 'Maize', 20, 200, 240, 800, 'ANON-1', 'ANON-B1', 50)}
        ${smartMatch(2, 'Wheat', 15, 380, 420, 600, 'ANON-3', 'ANON-B3', 40)}
        ${smartMatch(3, 'Soya', 10, 450, 500, 500, 'ANON-2', 'ANON-B2', 70)}
      </div>
      <div class="dsh-btn-row" style="margin-top:16px">${btn('Match All', 'primary', '5 contracts created — parties notified', undefined, 'z-matchall', 'all')}</div>
    `,
  },
  deliveries: {
    id: 'deliveries',
    label: 'Freight Ops',
    icon: ICON.deliveries,
    title: 'Freight Ops',
    sub: 'Consignments, weighbridge & payments',
    render: () => {
      const loads = loadCatalog();
      const k = freightKpis(loads);
      const active = loads.filter((l) => !['PAID', 'CANCELLED'].includes(l.status));
      const pending = loads.filter((l) => l.status === 'PENDING_PAYMENT');
      return `
      ${kpis([
        { label: 'In Transit', value: k.inTransit, icon: ICON.truck, delta: 'Live GPS tracking', up: true, spark: [2, 3, 2, 4, 3, 5, Math.max(k.inTransit, 1)], foot: 'Trucks on the road', open: '#deliveries' },
        { label: 'Loading / Offloading', value: k.loading, icon: ICON.deliveries, delta: 'At weighbridge or bay', up: true, spark: [3, 4, 3, 2, 4, 3, Math.max(k.loading, 1)], foot: 'Being processed', open: '#deliveries' },
        { label: 'Awaiting Payment', value: k.pendingPay, icon: ICON.payments, delta: `${marketMoney(k.pendingValue)} held in escrow`, up: false, spark: [2, 3, 4, 5, 4, 5, Math.max(k.pendingPay, 1)], foot: 'ZVIDA settles on terms', open: '#payments' },
        { label: 'Settled', value: k.paid, icon: ICON.wallet, delta: `${marketMoney(k.paidValue)} paid out`, up: true, spark: [1, 2, 1, 3, 2, 3, Math.max(k.paid, 1)], foot: 'Completed consignments', open: '#payments' },
      ])}
      ${banner('info', 'Consignment ledger — the first and second weighbridge weights set the net (scale loads use bucket counts). Payments sit at <b>awaiting ZVIDA</b> until settlement on the agreed COD / COC / NET terms.')}
      ${split(`
        ${sec('Freight Feed', 'Open report', 'Opening freight report', undefined, '#reports')}
        ${freightFeed(loads, 4)}
        ${sec('Open Consignments', 'Settled history', 'Opening settled consignments', k.paid, '#payments')}
        ${active.map((l) => loadCard(l, 'admin')).join('')}
      `, `
        ${panel({
          title: 'Movement Overview',
          icon: ICON.deliveries,
          body: ledger([
            { label: 'In transit', value: String(k.inTransit) },
            { label: 'Loading / offloading', value: String(k.loading) },
            { label: 'Awaiting payment', value: String(k.pendingPay) },
            { label: 'Settled', value: String(k.paid) },
          ]),
        })}
        ${panel({
          title: 'Payment Releases',
          icon: ICON.payments,
          body: pending.length
            ? pending.map((l) => listRow(ICON.payments, l.ref, `${l.supplier} · ${l.payTerm} · due ${l.due}`, loadMoney(l.amount), 'pos', false, '#payments')).join('')
            : banner('ok', 'No payments pending — all consignments settled.'),
        })}
        ${panel({
          title: 'Vehicle Pool',
          icon: ICON.truck,
          body: loads.filter((l) => l.truck).slice(0, 4).map((l) => listRow(ICON.truck, l.truck, `On ${l.ref} · ${l.driver || 'unassigned'}`, l.status === 'IN_TRANSIT' ? 'En route' : l.status === 'PENDING' ? 'Idle' : 'Active', 'plain', false, '#deliveries')).join('') || banner('info', 'No vehicles assigned yet.'),
        })}
        ${panel({
          title: 'Payment Terms',
          icon: ICON.scale,
          body: banner('info', 'COD and COC settle after the second weight; NET_3–NET_21 settle on the contract due date. Overrides require two-factor approval.'),
        })}
      `)}
    `;
    },
  },
  disputes: {
    id: 'disputes',
    label: 'Disputes',
    icon: ICON.disputes,
    title: 'Disputes',
    sub: 'Resolve quality & weight issues',
    render: () => `
      ${tabs([{ label: 'Open', badge: 2, active: true }, { label: 'In Review', badge: 1 }, { label: 'Resolved', badge: 5 }])}
      ${split(`
        ${itemCard({
          title: 'Contract #882 · James vs Miller Corp',
          thumb: 'grain',
          badge: 'OPEN',
          badgeTone: 'amber',
          cls: 'js-z-d882',
          open: '#disputes',
          meta: `Type: <b>Quality</b> · Moisture 14.5% (exceeds 14% spec)<br/>Lab: Moisture 14.5% · Protein 8.2% · Foreign matter 1.5%<br/>Supplier claim: Grain was 13% at farm.`,
          foot: btn('Review', 'primary sm', 'Opening resolution panel', undefined, 'z-rev-882', 'review'),
        })}
        ${itemCard({
          title: 'Contract #879 · Peter vs Miller Corp',
          thumb: 'wheat',
          badge: 'OPEN',
          badgeTone: 'amber',
          open: '#disputes',
          meta: `Type: <b>Weight</b> · Net 18.5t vs contracted 20t (1.5t short)<br/>Weighbridge: Gross 28.5t / Tare 10t / Net 18.5t · Shortfall 7.5%`,
          foot: btn('Review', 'primary sm', 'Opening resolution panel', undefined, 'z-rev-879', 'review'),
        })}
        ${sec('Resolution — Contract #882')}
        ${panel({
          title: 'Dispute resolution',
          icon: ICON.disputes,
          body: `
            ${banner('info', `Quality prediction: ${pill('80% chance Grade A', 'blue')} based on supplier history.`)}
            ${field('Resolution option', `
              <div class="dsh-radio-row" style="flex-direction:column;gap:12px">
                <label class="dsh-radio"><input type="radio" name="resolution" checked /> Apply penalty to farmer — deduct $50 from supplier payout</label>
                <label class="dsh-radio"><input type="radio" name="resolution" /> Absorb loss — ZVIDA covers the $50</label>
                <label class="dsh-radio"><input type="radio" name="resolution" /> Send truck back — reject entire load</label>
                <label class="dsh-radio"><input type="radio" name="resolution" /> Amend contract — adjust price based on quality</label>
              </div>`)}
            ${field('Resolution notes', textarea(2, 'Explain your decision…'))}
            <div class="dsh-btn-row">${btn('Confirm Decision', 'primary', 'Dispute resolved — both parties notified', undefined, 'z-resolve-882', 'confirm')}</div>`,
        })}
      `, `
        ${panel({
          title: 'Dispute Overview',
          icon: ICON.disputes,
          body: ledger([
            { label: 'Open', value: '2' },
            { label: 'In review', value: '1' },
            { label: 'Resolved', value: '5' },
          ]),
        })}
        ${panel({
          title: 'Resolution Trends',
          icon: ICON.scale,
          body: bars([
            { label: 'Quality', pct: 60 },
            { label: 'Weight', pct: 30 },
            { label: 'Late delivery', pct: 10 },
          ]),
        })}
        ${panel({
          title: 'Fairness Guard',
          icon: ICON.shield,
          body: banner('ok', 'No repeated violations. Supplier and offtaker scores remain stable.'),
        })}
      `)}
    `,
  },
  payments: {
    id: 'payments',
    label: 'Payments',
    icon: ICON.payments,
    title: 'Payments',
    sub: 'Escrow & commission',
    render: () => `
      ${tabs([{ label: 'Pending', badge: 3, active: true }, { label: 'Processing', badge: 2 }, { label: 'Completed', badge: 12 }])}
      ${paymentCard('Contract #882', 'James → Miller Corp', '$4,000', '$4,800', '$800', 'NET_3', 'Due Jul 25 · 2 days', 'js-due-882')}
      ${paymentCard('Contract #883', 'Sarah → Miller Corp', '$3,600', '$4,500', '$900', 'NET_7', 'Due Jul 28 · 5 days', 'js-due-883')}
      ${paymentCard('Contract #884', 'Peter → Miller Corp', '$4,200', '$5,100', '$900', 'NET_21', 'Due Aug 10 · 21 days', 'js-due-884')}
      ${sec('Commission Ledger')}
      ${panel({
        body: ledger([
          { label: 'Today', value: '$4,200' },
          { label: 'This Week', value: '$18,500' },
          { label: 'This Month', value: '$42,300' },
        ]),
      })}
      ${panel({
        title: 'Pending Commission',
        icon: ICON.scale,
        body: `
          ${listRow(ICON.scale, 'Contract #882', 'Spread realized', '+$800', 'pos', false, '#reports')}
          ${listRow(ICON.scale, 'Contract #883', 'Spread realized', '+$900', 'pos', false, '#reports')}
          ${listRow(ICON.scale, 'Contract #884', 'Spread realized', '+$900', 'pos', false, '#reports')}`,
      })}
    `,
  },
  reports: {
    id: 'reports',
    label: 'Reports',
    icon: ICON.reports,
    title: 'Reports',
    sub: 'Margin & volume analytics',
    render: () => `
      ${panel({
        body: ledger([
          { label: 'Gross Margin (Month)', value: '$42,300' },
          { label: 'Cash Flow In', value: '$186k' },
          { label: 'Cash Flow Out', value: '$152k' },
        ]),
      })}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        ${panel({
          title: 'Weekly Margin',
          icon: ICON.trendingUp,
          body: bars([
            { label: 'Week 1', pct: 42 },
            { label: 'Week 2', pct: 55 },
            { label: 'Week 3', pct: 68 },
            { label: 'Week 4', pct: 100 },
          ]),
        })}
        ${panel({
          title: 'Cash Flow — This Month',
          icon: ICON.wallet,
          body: bars([
            { label: 'Inflows', pct: 100 },
            { label: 'Outflows', pct: 78, alt: true },
            { label: 'Net', pct: 22 },
          ]),
        })}
      </div>
      ${sec('Top Commodities by Volume')}
      ${panel({
        body: table(['Commodity', 'Volume', 'Margin'], [
          ['Maize', '420 t', '$18,200'],
          ['Soya', '180 t', '$11,500'],
          ['Wheat', '150 t', '$7,800'],
          ['Sugar Beans', '90 t', '$4,800'],
        ], [2], ['#payments', '#payments', '#payments', '#payments']),
        flush: true,
      })}
      ${sec('Seasonality')}
      ${banner('info', 'Peak volume expected <b>Sep–Nov</b> (harvest season). Plan truck capacity ahead.')}
      <div class="dsh-btn-row">${jsBtn('Export Tax Compliance File', 'outline', 'exportTax', '', 'Tax file exported')}${jsBtn('Export Carbon Footprint Report', 'outline', 'exportCarbon', '', 'Carbon report exported')}</div>
    `,
  },
  marketplace: {
    id: 'marketplace',
    label: 'Marketplace',
    icon: ICON.shop,
    title: 'Marketplace',
    sub: 'E-commerce order oversight',
    render: () => {
      const orders = marketOrders();
      const open = orders.filter((o) => !['DELIVERED', 'PAID', 'CANCELLED', 'ESCALATED'].includes(o.status)).length;
      const gmv = orders.filter((o) => o.status === 'DELIVERED').reduce((s, o) => s + o.total, 0);
      const esc = orders.filter((o) => o.status === 'ESCALATED').length;
      return `
      ${kpis([
        { label: 'Open Orders', value: open, icon: ICON.orders, delta: 'Awaiting fulfilment', up: true, spark: [2, 3, 4, 3, 5, 4, Math.max(open, 2)], foot: 'Across the marketplace', open: '#marketplace' },
        { label: 'GMV (Delivered)', value: marketMoney(gmv), icon: ICON.trendingUp, delta: 'Completed orders', up: true, spark: [40, 60, 90, 80, 120, 140, Math.max(gmv / 10, 10)], foot: 'Sellers paid via NET_7', open: '#marketplace' },
        { label: 'Escalated', value: esc, icon: ICON.alert, delta: 'Needs resolution', up: false, spark: [1, 0, 1, 0, 1, 0, Math.max(esc, 1)], foot: 'Resolution desk', open: '#disputes' },
      ])}
      ${banner('info', 'Monitor farmer orders end-to-end: seller confirms, driver delivers, payment releases. Escalate when buyers and sellers disagree.')}
      ${sec('Order Board', 'Review disputes', 'Opening resolution desk', orders.length, '#disputes')}
      ${chips(['All', 'Active', 'Pending', 'Loading', 'Offloading', 'Complete', 'Escalated'], 0, 'zmkt')}
      ${orders.map((o) => marketOrderGroup(o, 'admin', 'zmkt', marketBucket(o.status))).join('')}
    `;
    },
  },
};

function pendingListing(supplier: string, art: string, commodity: string, qty: number, loc: string, grade: string, moisture: number, reserve: number, spoilage: number, spoilageNote: string, suggested: number, key: string): string {
  const ageTone = spoilage === 0 ? 'green' : spoilage > 30 ? 'red' : 'amber';
  const ageText = spoilage === 0 ? 'New listing' : `Spoilage: ${spoilage} days`;
  return `<div class="dsh-item" style="display:flex;gap:16px">
    ${img(art, 'sm', commodity)}
    <div style="flex:1;min-width:0">
      <div class="dsh-item-top">
        <span class="dsh-item-title">${supplier} · ${commodity} · ${qty}t</span>
        ${pill(ageText, ageTone)}
      </div>
      <div class="dsh-item-meta">${loc} · ${grade} · Moisture ${moisture}% · Reserve <b>$${reserve}/t</b></div>
      ${spoilageNote ? `<div style="font-size:12px;color:var(--dsh-warn);margin-top:4px">${svg(ICON.clock)} ${spoilageNote}</div>` : ''}
      <div class="dsh-item-foot">
        ${field('ZVIDA price', `<span style="display:flex;align-items:center;gap:8px"><span>$</span><input class="dsh-input" value="${suggested}.00" style="max-width:110px" /></span>`, `Suggested spread: $${suggested - reserve}/t`)}
        <div class="dsh-btn-row">${btn('Approve', 'success', `Listing approved — ${supplier} notified`, undefined, key, 'approve')}${btn('Reject', 'danger', 'Listing rejected', undefined, key, 'reject')}</div>
      </div>
    </div>
  </div>`;
}

function matchRow(selected: boolean, title: string, meta: string, sub: string): string {
  return `<div class="dsh-match ${selected ? 'selected' : ''}" data-toast="${title} selected">
    <span class="dsh-match-radio"></span>
    <div><div class="dsh-match-title">${title}</div><div class="dsh-match-meta">${meta}</div><div class="dsh-match-meta">${sub}</div></div>
  </div>`;
}

function smartMatch(rank: number, commodity: string, qty: number, sp: number, bp: number, spread: number, s: string, b: string, km: number): string {
  return `<div class="dsh-queue-card">
    <span class="dsh-queue-rank">#${rank}</span>
    <div class="dsh-queue-body">
      <div class="dsh-queue-title">${commodity} — ${s} to ${b} · ${km}km</div>
      <div class="dsh-queue-meta">${qty}t @ $${sp} / $${bp}</div>
    </div>
    <div class="dsh-queue-spread"><div class="v">$${spread}</div><div class="l">spread</div></div>
    ${btn('Auto-Match', 'primary sm', `Contract created: ${commodity} ${qty}t`, undefined, 'z-automatch', 'match')}
  </div>`;
}

function paymentCard(title: string, parties: string, payout: string, invoice: string, spread: string, net: string, due: string, dueCls: string): string {
  return `<div class="dsh-item" data-open="#deliveries">
    <div class="dsh-item-top">
      <span class="dsh-item-title">${title} · ${parties}</span>
      ${pill(net, 'blue')}
    </div>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-top:12px">
      <div><div style="font-size:10.5px;font-weight:650;text-transform:uppercase;letter-spacing:.05em;color:var(--dsh-text-3)">Supplier payout</div><div style="font-size:14px;font-weight:700;margin-top:2px">${payout}</div></div>
      <div><div style="font-size:10.5px;font-weight:650;text-transform:uppercase;letter-spacing:.05em;color:var(--dsh-text-3)">Offtaker invoice</div><div style="font-size:14px;font-weight:700;margin-top:2px">${invoice}</div></div>
      <div><div style="font-size:10.5px;font-weight:650;text-transform:uppercase;letter-spacing:.05em;color:var(--dsh-text-3)">Spread</div><div style="font-size:14px;font-weight:700;margin-top:2px;color:var(--dsh-ok)">${spread}</div></div>
      <div><div style="font-size:10.5px;font-weight:650;text-transform:uppercase;letter-spacing:.05em;color:var(--dsh-text-3)">Due</div><div class="${dueCls}" style="font-size:14px;font-weight:700;margin-top:2px">${due}</div></div>
    </div>
    <div class="dsh-item-foot">
      ${btn('Release Early', 'success sm', `Payment of ${payout} released`, undefined, `z-pay-${dueCls.slice(-3)}`, 'release')}
      ${btn('Hold', 'ghost sm', 'Payment held', undefined, `z-pay-${dueCls.slice(-3)}`, 'hold')}
      ${btn('View Contract', 'outline sm', 'Opening contract', '#deliveries')}
    </div>
  </div>`;
}

boot({
  key: 'zvida',
  name: 'Admin',
  roleLabel: 'ZVIDA',
  company: 'ZVIDA Brokerage',
  initials: 'Z',
  logoText: 'ZVIDAMBANO · ZVIDA',
  accent: '#2563eb',
  accentHover: '#1d4ed8',
  accentLight: '#eff6ff',
  accentRgb: '37, 99, 235',
  gradientEnd: '#60a5fa',
  pages: [P.control, P.marketplace, P.listings, P.matches, P.deliveries, P.disputes, P.payments, P.reports],
});
