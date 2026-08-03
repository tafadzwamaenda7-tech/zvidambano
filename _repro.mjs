import { JSDOM } from 'jsdom';
import { createServer } from 'vite';

const mode = process.argv[2] || 'farmer';
const isDemo = process.argv.includes('--real') ? false : true;

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

const errors = [];
window.addEventListener('error', (e) => errors.push('window.onerror: ' + (e.error?.stack || e.message)));
window.addEventListener('unhandledrejection', (e) => errors.push('unhandledrejection: ' + (e.reason?.stack || e.reason)));
process.on('uncaughtException', (e) => errors.push('uncaughtException: ' + e.stack));

const server = await createServer({ server: { middlewareMode: true }, appType: 'custom', logLevel: 'error' });

const supabaseMod = await server.ssrLoadModule('/src/lib/supabase.ts');
const supabase = supabaseMod.supabase;

const email = isDemo ? 'james@zvida.zw' : 'james@example.com';
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
supabase.from = () => ({
  select: () => ({
    eq: () => ({
      maybeSingle: async () => ({ data: { role: mode, full_name: 'James Test', phone: null, is_demo: isDemo }, error: null }),
    }),
  }),
});
supabase.channel = () => ({ on: () => ({ subscribe: () => ({}) }), subscribe: () => ({}) });
supabase.removeChannel = () => {};

try {
  const mod = await server.ssrLoadModule('/src/dashboards/' + mode + '.ts');
  await new Promise((r) => setTimeout(r, 2000));
  const root = document.getElementById('dsh-root');
  const html = root?.innerHTML ?? '(no #dsh-root)';
  console.log('=== root innerHTML length:', html.length);
  console.log(html.slice(0, 400).replace(/\s+/g, ' '));
  const badge = document.querySelector('.dsh-live-badge');
  console.log('=== live badge:', badge?.textContent);
  console.log('=== body children:', document.body.children.length);
} catch (e) {
  errors.push('loadModule threw: ' + (e?.stack || e));
}

await new Promise((r) => setTimeout(r, 300));
console.log('=== captured errors ===');
console.log(errors.length ? errors.join('\n---\n') : '(none)');

await server.close();
process.exit(errors.length ? 1 : 0);
