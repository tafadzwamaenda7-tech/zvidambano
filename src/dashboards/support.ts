import { boot, ICON, svg, pill, btn, hero, kpis, actions, sec, panel, split, banner, field, input, select, textarea, table, listRow, ledger, tabs, feed, itemCard, wf, jsBtn, JS, toast, chips, profile, avatar, uploadBtn, bars, takePendingUpload, submitBtn, onValidSubmit, pwCheck, disclose, isLiveMode, liveUserName, asyncFills, restoreSubmit, formRules, accountHeader, prefsPanel, mfaPanel } from './core';
import { loadSettings, saveSettings, saveProfile, changePassword, formValue, radioValue } from '../lib/settings';
import { resolveDashboardSession } from '../lib/session';
import type { PillTone } from './core';

formRules({
  sName: { req: true, min: 2, max: 80, msg: 'Enter your full name.' },
  sPhone: { min: 7, max: 40, msg: 'Enter a valid phone number.' },
  spPw: { req: true, min: 8, max: 72, msg: 'Use at least 8 characters.' },
  spPw2: { req: true, msg: 'Re-enter your new password.' },
});

wf('s-tk-1001', {
  assign: { to: 'ASSIGNED', tone: 'blue', toast: 'Ticket #1001 assigned to you', foot: pill('Assigned to you', 'blue') },
  resolve: { to: 'RESOLVED', tone: 'green', toast: 'Ticket #1001 resolved', foot: pill('Resolved', 'green') },
});
wf('s-tk-1002', {
  assign: { to: 'ASSIGNED', tone: 'blue', toast: 'Ticket #1002 assigned to you', foot: pill('Assigned to you', 'blue') },
});
wf('s-tk-1003', {
  claim: { to: 'IN PROGRESS', tone: 'amber', toast: 'Ticket #1003 claimed', foot: pill('In progress', 'amber') },
});
wf('s-tk-1004', {
  claim: { to: 'IN PROGRESS', tone: 'amber', toast: 'Ticket #1004 claimed', foot: pill('In progress', 'amber') },
});
wf('s-tk-1005', {
  claim: { to: 'IN PROGRESS', tone: 'amber', toast: 'Ticket #1005 claimed', foot: pill('In progress', 'amber') },
});
wf('s-tk-1006', {
  claim: { to: 'IN PROGRESS', tone: 'amber', toast: 'Ticket #1006 claimed', foot: pill('In progress', 'amber') },
});

JS.replyTicket = () => {
  const img = takePendingUpload('attach-file');
  toast(img ? 'Reply sent with attachment — the user will be notified' : 'Reply sent — the user will be notified');
};
JS.openResolution = () => {
  toast('Resolution panel opened — track the outcome below');
};

const P = {
  inbox: {
    id: 'inbox',
    label: 'Inbox',
    icon: ICON.support,
    title: 'Support Inbox',
    sub: 'Help Desk — resolve tickets within SLA',
    render: () => `
      ${hero({
        kick: 'Support Desk · Today',
        status: { label: 'SLA on track', tone: 'ok' },
        title: 'Support Inbox',
        sub: '4 open tickets require attention. Resolve within 24h to stay inside SLA — the fastest desk in the industry.',
        actions: `${btn('Open Tickets', 'onlight', 'Opening full ticket list', '#tickets')}${btn('Users', 'onlight', 'Opening user directory', '#users')}`,
        bg: 'dash/hero-office.jpg',
        stats: [
          { l: 'Open tickets', v: '4' },
          { l: 'Avg first reply', v: '18m' },
          { l: 'SLA compliance', v: '98%' },
        ],
      })}
      ${actions([
        { label: 'New Ticket', icon: ICON.plus, toast: 'Opening ticket composer', href: '#tickets' },
        { label: 'Ticket Queue', icon: ICON.listings, badge: 4, toast: 'Opening ticket queue', href: '#tickets' },
        { label: 'User Directory', icon: ICON.users, toast: 'Opening user directory', href: '#users' },
        { label: 'Disputes', icon: ICON.disputes, badge: 2, toast: 'Opening dispute queue', href: '#disputes' },
      ])}
      ${kpis([
        { label: 'Open Tickets', value: 4, icon: ICON.listings, delta: '1 high priority', up: false, spark: [6, 5, 7, 4, 5, 4, 4], foot: 'Within SLA', open: '#tickets' },
        { label: 'Avg First Reply', value: '18m', icon: ICON.clock, delta: 'Faster than SLA', up: true, spark: [40, 30, 25, 22, 20, 19, 18], foot: 'Target 30m', open: '#inbox' },
        { label: 'SLA Compliance', value: 98, icon: ICON.shield, delta: 'Last 30 days', up: true, spark: [94, 95, 96, 95, 97, 98, 98], foot: '% within SLA', open: '#reports' },
        { label: 'CSAT Score', value: '4.8', icon: ICON.quality, delta: '4.7 last month', up: true, spark: [40, 42, 44, 46, 45, 47, 48], foot: 'Out of 5.0', open: '#reports' },
      ])}
      ${split(`
        ${sec('Priority Feed', 'All tickets', 'Opening all tickets', undefined, '#tickets')}
        ${feed([
          {
            icon: ICON.listings,
            tone: 'danger',
            time: '08:42 AM',
            title: 'Ticket #1001 — Payment not received',
            desc: 'James (Farmer) · Contract #882 · Payment due Aug 2 · flagged as URGENT.',
            actions: `${btn('Assign to Me', 'primary sm', 'Ticket assigned', undefined, 's-tk-1001', 'assign')}${btn('Resolve', 'success sm', 'Ticket resolved', undefined, 's-tk-1001', 'resolve')}`,
            open: '#tickets',
          },
          {
            icon: ICON.messages,
            tone: 'warn',
            time: '09:10 AM',
            title: 'Ticket #1002 — Truck delayed on route',
            desc: 'Sarah Moyo (Driver) · Truck DEF-456 · Stuck at tollgate, needs guidance.',
            actions: btn('Assign to Me', 'primary sm', 'Ticket assigned', undefined, 's-tk-1002', 'assign'),
            open: '#tickets',
          },
          {
            icon: ICON.shop,
            tone: 'default',
            time: '09:35 AM',
            title: 'Ticket #1003 — Order not delivered',
            desc: 'Peter (Offtaker) · Order #C-2207 · Input store order stuck in transit.',
            actions: btn('Claim Ticket', 'outline sm', 'Ticket claimed', undefined, 's-tk-1003', 'claim'),
            open: '#tickets',
          },
          {
            icon: ICON.disputes,
            tone: 'danger',
            time: '10:05 AM',
            title: 'Dispute #D-104 — Quality rejected',
            desc: 'Miller Corp rejected Load #882 · Moisture above 14% · Escalated to mediation.',
            open: '#disputes',
          },
        ])}
        ${sec('Quick Reply')}
        ${panel({
          title: 'Send a reply',
          icon: ICON.send,
          body: `
            ${field('Ticket', select(['#1001 — James (Farmer)', '#1002 — Sarah Moyo (Driver)', '#1003 — Peter (Offtaker)', '#1004 — Grace (Vendor)', '#1005 — Tendai (Offtaker)', '#1006 — Chipo (Farmer)']))}
            ${field('Message', textarea(3, 'Type your reply…'))}
            <div class="dsh-btn-row">
              ${uploadBtn('Attach file', 'ghost sm', '*/*', { bucket: 'documents', key: 'attach-file' })}
              ${jsBtn('Send Reply', 'primary', 'replyTicket', '', 'Reply sent — the user will be notified')}
            </div>`,
        })}
      `, `
        ${panel({
          title: 'Today’s Stats',
          icon: ICON.spark,
          body: `
            ${ledger([
              { label: 'Tickets opened', value: '12' },
              { label: 'Tickets resolved', value: '8' },
              { label: 'Escalated', value: '2' },
              { label: 'Avg resolution', value: '3.2h' },
            ])}
            ${banner('ok', 'You are <b>2 replies ahead</b> of target today.')}`,
        })}
        ${panel({
          title: 'New Sign-ups',
          icon: ICON.users,
          link: 'View all',
          linkToast: 'Opening user directory',
          linkHref: '#users',
          body: `
            ${listRow(ICON.users, 'Chipo Moyo', 'Farmer · Ruwa · Just joined', 'NEW', 'plain', false, '#users')}
            ${listRow(ICON.users, 'Tendai Ncube', 'Offtaker · Bulawayo · Just joined', 'NEW', 'plain', false, '#users')}
            ${listRow(ICON.users, 'Grace Tembo', 'Vendor · Harare · Just joined', 'NEW', 'plain', false, '#users')}`,
        })}
        ${panel({
          title: 'SLA Health',
          icon: ICON.shield,
          body: bars([
            { label: 'First reply < 30m', pct: 92 },
            { label: 'Resolve < 24h', pct: 96 },
            { label: 'CSAT > 4.5', pct: 90 },
          ]),
        })}
      `)}
    `,
  },
  tickets: {
    id: 'tickets',
    label: 'Tickets',
    icon: ICON.listings,
    title: 'Tickets',
    sub: 'Full support queue',
    render: () => `
      ${sec('Ticket Queue', 'Export', 'Exporting ticket report', undefined, '#reports')}
      ${chips(['All', 'Open', 'Assigned', 'In Progress', 'Resolved', 'Escalated'], 0, 'tickets')}
      ${panel({
        body: table(['Ticket', 'From', 'Subject', 'Priority', 'Status', 'Age'], [
          ['#1001', 'James (Farmer)', 'Payment not received', pill('Urgent', 'red'), pill('Open', 'red'), '2h'],
          ['#1002', 'Sarah (Driver)', 'Truck delayed on route', pill('High', 'amber'), pill('Open', 'red'), '3h'],
          ['#1003', 'Peter (Offtaker)', 'Order not delivered', pill('High', 'amber'), pill('Open', 'red'), '5h'],
          ['#1004', 'Grace (Vendor)', 'Listing approval stuck', pill('Medium', 'blue'), pill('Open', 'red'), '1d'],
          ['#1005', 'Tendai (Offtaker)', 'Quality certificate missing', pill('Medium', 'blue'), pill('Assigned', 'blue'), '6h'],
          ['#1006', 'Chipo (Farmer)', 'How do I list produce?', pill('Low', 'gray'), pill('In Progress', 'amber'), '4h'],
        ], [5], ['#tickets', '#tickets', '#tickets', '#tickets', '#tickets', '#tickets']),
        flush: true,
      })}
      ${split(`
        ${sec('Open Ticket Detail')}
        ${itemCard({
          key: 'tk-1001',
          title: '#1001 · Payment not received',
          badge: 'URGENT',
          badgeTone: 'red',
          thumb: 'grain',
          meta: `James (Farmer) · Contract #882 · Payment of <b>$4,200</b> due Aug 2, 2026.`,
          foot: `${btn('Assign to Me', 'primary sm', 'Ticket #1001 assigned to you', undefined, 's-tk-1001', 'assign')}${btn('Mark Resolved', 'success sm', 'Ticket #1001 resolved', undefined, 's-tk-1001', 'resolve')}`,
        })}
        ${field('Resolution note', textarea(3, 'Describe the resolution…'))}
        <div class="dsh-btn-row">
          ${jsBtn('Send Reply & Close', 'primary', 'replyTicket', '', 'Reply sent — the user will be notified')}
          ${btn('Escalate', 'ghost sm', 'Ticket escalated to ZVIDA admin')}
        </div>
      `, `
        ${sec('Status Guide')}
        ${panel({
          body: `
            ${listRow(ICON.check, 'Open', 'Awaiting first reply', pill('Red', 'red'))}
            ${listRow(ICON.clock, 'Assigned', 'Owned by an agent', pill('Blue', 'blue'))}
            ${listRow(ICON.spark, 'In Progress', 'Being worked on', pill('Amber', 'amber'))}
            ${listRow(ICON.shield, 'Resolved', 'Closed after reply', pill('Green', 'green'))}`,
        })}
        ${banner('info', 'Tickets marked <b>urgent</b> are surfaced to the ZVIDA Control Tower automatically.')}
      `)}
    `,
  },
  users: {
    id: 'users',
    label: 'Users',
    icon: ICON.users,
    title: 'User Directory',
    sub: 'Every party on the exchange',
    render: () => `
      ${kpis([
        { label: 'Total Users', value: 46, icon: ICON.users, delta: '12 this month', up: true, spark: [10, 14, 18, 22, 28, 36, 46], foot: 'Across all roles', open: '#users' },
        { label: 'Farmers', value: 22, icon: ICON.farm, delta: '48% of platform', up: true, spark: [8, 10, 12, 15, 18, 20, 22], foot: 'Active suppliers', open: '#users' },
        { label: 'Verified Partners', value: 9, icon: ICON.shield, delta: 'Brokers & vendors', up: true, spark: [4, 5, 6, 7, 7, 8, 9], foot: 'KYC completed', open: '#users' },
        { label: 'Support Tickets', value: 4, icon: ICON.listings, delta: '2 escalated', up: false, spark: [5, 4, 6, 3, 4, 3, 4], foot: 'Open today', open: '#tickets' },
      ])}
      ${sec('All Users', 'Add user', 'Opening add user form')}
      ${panel({
        body: table(['User', 'Role', 'Location', 'Status', 'Member since'], [
          [`${avatar('J', 28)} James Moyo`, 'Farmer', 'Ruwa', pill('Active', 'green'), 'Jan 2024'],
          [`${avatar('S', 28)} Sarah Moyo`, 'Driver', 'Harare', pill('Active', 'green'), 'Mar 2024'],
          [`${avatar('P', 28)} Peter Dube`, 'Offtaker', 'Harare', pill('Active', 'green'), 'Feb 2024'],
          [`${avatar('G', 28)} Grace Tembo`, 'Vendor', 'Harare', pill('Active', 'green'), 'Jun 2025'],
          [`${avatar('T', 28)} Tendai Ncube`, 'Offtaker', 'Bulawayo', pill('Pending KYC', 'amber'), 'Jul 2026'],
          [`${avatar('C', 28)} Chipo Moyo`, 'Farmer', 'Ruwa', pill('New', 'blue'), 'Today'],
        ], [0], ['#users', '#users', '#users', '#users', '#users', '#users']),
        flush: true,
      })}
      ${split(`
        ${sec('Recent Activity')}
        ${panel({
          body: `
            ${listRow(ICON.users, 'Chipo Moyo signed up', 'Farmer · Ruwa · Just now', '', 'plain', false, '#users')}
            ${listRow(ICON.users, 'Tendai Ncube signed up', 'Offtaker · Bulawayo · 2h ago', '', 'plain', false, '#users')}
            ${listRow(ICON.quality, 'Grace Tembo verified', 'Vendor KYC completed · 5h ago', '', 'plain', false, '#users')}
            ${listRow(ICON.disputes, 'Peter Dube opened dispute', 'Load #882 quality · 3h ago', '', 'plain', false, '#disputes')}`,
        })}
      `, `
        ${panel({
          title: 'Role Breakdown',
          icon: ICON.users,
          body: bars([
            { label: 'Farmers', pct: 48 },
            { label: 'Offtakers', pct: 22 },
            { label: 'Vendors', pct: 11 },
            { label: 'Drivers', pct: 13 },
            { label: 'Brokers', pct: 6 },
          ]),
        })}
        ${panel({
          title: 'Profile preview',
          icon: ICON.farm,
          body: profile([
            { k: 'Name', v: 'James Moyo' },
            { k: 'Role', v: 'Farmer' },
            { k: 'Location', v: 'Farm 42, Ruwa' },
            { k: 'GPS', v: '-17.883, 31.033' },
            { k: 'Status', v: `${pill('Active', 'green')}` },
          ]),
        })}
      `)}
    `,
  },
  disputes: {
    id: 'disputes',
    label: 'Disputes',
    icon: ICON.disputes,
    title: 'Disputes',
    sub: 'Mediation queue',
    render: () => `
      ${banner('warn', '<b>2 disputes</b> in mediation. Resolution panels are open — both parties are awaiting a decision.', 'View guidance', 'Opening dispute playbook')}
      ${kpis([
        { label: 'Open Disputes', value: 2, icon: ICON.disputes, delta: '1 escalated', up: false, spark: [1, 2, 2, 3, 2, 2, 2], foot: 'Needs decision', open: '#disputes' },
        { label: 'Resolved (30d)', value: 9, icon: ICON.check, delta: 'Avg 2.1 days', up: true, spark: [4, 5, 6, 7, 8, 8, 9], foot: 'Both parties notified', open: '#reports' },
      ])}
      ${sec('In Mediation')}
      ${panel({
        body: table(['Ref', 'Parties', 'Issue', 'Age', 'Status'], [
          ['D-104', 'James vs Miller Corp', 'Moisture above 14% on Load #882', pill('Escalated', 'red'), '2d'],
          ['D-103', 'Peter vs Sarah', 'Delivery window missed by 4h', pill('Reviewing', 'amber'), '1d'],
        ], [4], ['#disputes', '#disputes']),
        flush: true,
      })}
      ${split(`
        ${sec('Dispute Detail — D-104')}
        ${panel({
          title: 'Quality rejection on Load #882',
          icon: ICON.disputes,
          body: `
            ${feed([
              {
                icon: ICON.disputes,
                tone: 'danger',
                time: 'Jul 30',
                title: 'Miller Corp rejected Load #882',
                desc: 'Reported moisture at 14.8% — above the 14% contract limit.',
                open: '#disputes',
              },
              {
                icon: ICON.messages,
                tone: 'default',
                time: 'Jul 31',
                title: 'James disputes the reading',
                desc: 'Weighbridge certificate shows 13.9% at origin. Evidence attached.',
                open: '#disputes',
              },
            ])}
            ${banner('info', 'Both weighbridge readings are on file. Recommend independent re-sampling at destination.')}
            <div class="dsh-btn-row">
              ${jsBtn('Open Resolution Panel', 'primary', 'openResolution', '', 'Resolution panel opened — track the outcome below')}
              ${btn('Mediate', 'ghost sm', 'Mediation session scheduled')}
            </div>`,
        })}
      `, `
        ${sec('Mediation Playbook')}
        ${panel({
          body: `
            ${listRow(ICON.check, '1 · Verify evidence', 'Both weighbridge certificates')}
            ${listRow(ICON.spark, '2 · Escalate if needed', 'Surfaced to Control Tower')}
            ${listRow(ICON.shield, '3 · Decide & notify', 'Notify both parties')}`,
        })}
        ${banner('ok', 'Resolved disputes are surfaced to the farmer’s <b>Performance</b> page as rating input.')}
      `)}
    `,
  },
  reports: {
    id: 'reports',
    label: 'Reports',
    icon: ICON.reports,
    title: 'Reports',
    sub: 'Desk performance',
    render: () => `
      ${kpis([
        { label: 'Tickets This Month', value: 148, icon: ICON.listings, delta: '+14% vs last', up: true, spark: [20, 26, 24, 30, 34, 32, 40], foot: 'All channels', open: '#reports' },
        { label: 'Avg Resolution Time', value: '3.2h', icon: ICON.clock, delta: 'Target 24h', up: true, spark: [40, 38, 34, 30, 28, 24, 22], foot: 'Per ticket', open: '#reports' },
        { label: 'SLA Compliance', value: 98, icon: ICON.shield, delta: 'Above 95% target', up: true, spark: [90, 92, 94, 95, 97, 97, 98], foot: '% within SLA', open: '#reports' },
        { label: 'CSAT', value: '4.8', icon: ICON.quality, delta: '127 responses', up: true, spark: [42, 43, 45, 46, 47, 47, 48], foot: 'Out of 5.0', open: '#reports' },
      ])}
      ${split(`
        ${sec('Ticket Volume')}
        ${panel({
          body: bars([
            { label: 'Payments', pct: 32 },
            { label: 'Delivery & tracking', pct: 26 },
            { label: 'Listings & approvals', pct: 18 },
            { label: 'Quality & disputes', pct: 14 },
            { label: 'Account & access', pct: 10 },
          ]),
        })}
        ${sec('Channel Mix')}
        ${panel({
          body: table(['Channel', 'Tickets', 'CSAT'], [
            ['In-app chat', '86', '4.9'],
            ['Email', '34', '4.6'],
            ['Phone', '22', '4.8'],
            ['WhatsApp', '6', '4.7'],
          ], [1]),
          flush: true,
        })}
      `, `
        ${sec('Monthly Snapshot')}
        ${panel({
          body: `
            ${ledger([
              { label: 'Tickets opened', value: '148' },
              { label: 'Tickets resolved', value: '139' },
              { label: 'Escalated to ZVIDA', value: '7' },
              { label: 'Median reply', value: '18m' },
            ])}
            ${banner('ok', '98% SLA compliance — keep it up.')}`,
        })}
        ${sec('Download')}
        ${panel({
          body: `
            ${listRow(ICON.file, 'Tickets_Jul2026.csv', 'All support tickets', 'DL', 'plain', false, '#reports')}
            ${listRow(ICON.file, 'CSAT_Jul2026.csv', 'Satisfaction responses', 'DL', 'plain', false, '#reports')}
            ${listRow(ICON.file, 'Escalations_Jul2026.csv', 'Escalated cases', 'DL', 'plain', false, '#reports')}`,
        })}
      `)}
    `,
  },
  settings: {
    id: 'settings',
    label: 'Settings',
    icon: ICON.settings,
    title: 'Settings',
    sub: 'Profile, desk & security',
    render: () => {
      const live = isLiveMode();
      const name = live ? (liveUserName() || 'Support') : 'Rudo Mutasa';
      const email = live ? 'On file with ZVIDA' : 'support@zvidambano.co.zw';
      const initials = name.split(' ').map((p) => p.charAt(0)).join('').slice(0, 2).toUpperCase() || 'S';
      return `
      ${accountHeader({
        initials,
        name,
        role: 'Support Agent · ZVIDAMBANO Traders',
        email,
        meta: live ? 'Account on file with ZVIDA' : 'Member since 2024',
        verified: true,
        live,
        stats: live ? [] : [
          { label: 'Tickets this week', value: '32' },
          { label: 'SLA compliance', value: '98%' },
          { label: 'Shift', value: 'Mon–Fri' },
        ],
      })}
      ${split(`
        ${sec('Profile')}
        ${panel({
          title: 'Personal',
          icon: ICON.users,
          body: `
            <div data-form>
            ${profile([{ k: 'Email', v: email }, { k: 'Team', v: `${pill('Support Desk', 'green')}` }])}
            <div data-async="support-profile-fill">
              ${field('Full name', input(name, undefined, { val: 'sName' }))}
              ${field('Phone', input('', 'e.g. +263 77 000 8800', { val: 'sPhone' }))}
            </div>
            <div class="dsh-btn-row">${submitBtn('Save Profile', 'primary', 'sp-profile')}</div>
            </div>`,
        })}
        ${sec('Desk')}
        ${panel({
          title: 'ZVIDA Support Desk',
          icon: ICON.support,
          body: live
            ? banner('info', 'Your desk assignments and availability are managed by the team lead.')
            : profile([
                { k: 'Desk', v: 'ZVIDA Support Desk' },
                { k: 'Shift', v: 'Mon – Fri, 08:00 – 17:00' },
                { k: 'Ticket routing', v: 'General queries' },
              ]),
        })}
        <div data-async="support-prefs-fill"></div>
      `, `
        ${sec('Security')}
        ${panel({
          title: 'Change password',
          icon: ICON.shield,
          body: `
            <div data-form>
            ${field('New password', input(undefined, 'Min 8 characters', { val: 'spPw', type: 'password' }))}
            ${pwCheck()}
            ${field('Confirm new password', input(undefined, 'Repeat your new password', { val: 'spPw2', type: 'password' }))}
            <div class="dsh-btn-row">${submitBtn('Update Password', 'primary', 'sp-security')}</div>
            ${disclose({
              title: 'Password rules',
              summary: 'Why we ask for a strong password',
              body: 'ZVIDA protects member data and support tools. A strong password (8+ characters, a number, an uppercase letter and a symbol) keeps the desk safe.',
            })}
            </div>`,
        })}
        ${panel({
          title: 'Two-factor authentication',
          icon: ICON.shield,
          body: mfaPanel(),
        })}
        ${panel({
          title: 'Documents',
          icon: ICON.file,
          body: live
            ? banner('info', 'Your employment documents and desk credentials are managed by the team lead.')
            : `${listRow(ICON.file, 'Employment contract', 'Signed 2024', btn('View', 'ghost sm', 'Document preview is for demo accounts', '#reports'), 'plain')}
            ${listRow(ICON.reports, 'SLA & metrics', 'Updated Jul 2026', btn('View', 'ghost sm', 'Document preview is for demo accounts', '#reports'), 'plain')}`,
        })}
      `)}
    `;
    },
  },
};

asyncFills['support-profile-fill'] = async () => {
  const s = await loadSettings();
  const nm = s.name || (isLiveMode() ? liveUserName() : 'Rudo Mutasa');
  const ph = s.phone || (isLiveMode() ? '' : '+263 77 000 8800');
  return `${field('Full name', input(nm, undefined, { val: 'sName' }))}
    ${field('Phone', input(ph, 'e.g. +263 77 000 8800', { val: 'sPhone' }))}`;
};

asyncFills['support-prefs-fill'] = async () => {
  const s = await loadSettings();
  return prefsPanel({ p: 's', submit: 'sp-prefs', lang: s.language, cur: s.currency, email: s.notifyEmail !== 'off', sms: s.notifySms !== 'off' });
};

onValidSubmit('sp-profile', (form) => {
  void saveProfile({ name: formValue(form, 'sName'), phone: formValue(form, 'sPhone') }).then((r) => {
    restoreSubmit(form);
    if (r.ok) toast('Profile updated');
    else toast(r.error || 'Could not save profile', 'error');
  });
});

onValidSubmit('sp-prefs', (form) => {
  void saveSettings({
    language: formValue(form, 'sLang'),
    currency: formValue(form, 'sCur'),
    notifyEmail: radioValue(form, 'sNEmail'),
    notifySms: radioValue(form, 'sNSms'),
  }).then((r) => {
    restoreSubmit(form);
    if (r.ok) toast('Preferences saved');
    else toast(r.error || 'Could not save preferences', 'error');
  });
});

onValidSubmit('sp-security', (form) => {
  const pws = [...form.querySelectorAll<HTMLInputElement>('input[type="password"]')];
  if (pws[1] && pws[1].value !== pws[0]?.value) {
    toast('Passwords do not match', 'error');
    restoreSubmit(form);
    return;
  }
  void changePassword(pws[0]?.value || '').then((r) => {
    restoreSubmit(form);
    if (r.ok) toast('Password updated — use it to sign in next time');
    else toast(r.error || 'Could not update password', 'error');
  });
});

void (async () => {
const session = await resolveDashboardSession('support');
if (!session) return;
boot({
  key: 'support',
  name: 'Support',
  roleLabel: 'Support',
  company: 'ZVIDA Support Desk',
  initials: 'S',
  logoText: 'ZVIDAMBANO · SUPPORT',
  accent: '#7c3aed',
  accentHover: '#6d28d9',
  accentLight: '#f5f3ff',
  accentRgb: '124, 58, 237',
  gradientEnd: '#a78bfa',
  pages: [P.inbox, P.tickets, P.users, P.disputes, P.reports, P.settings],
  keepEmpty: ['settings'],
  navGroups: [
    { label: 'Operations', pages: ['inbox', 'tickets', 'disputes'] },
    { label: 'Platform', pages: ['users', 'reports'] },
    { label: 'Account', pages: ['settings'] },
  ],
  session,
});
})();
