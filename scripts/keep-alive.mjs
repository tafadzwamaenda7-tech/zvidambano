/**
 * Supabase keep-alive.
 *
 * Free-tier Supabase projects are paused after 7 days without network
 * activity. This script sends one tiny read query against the database so the
 * project stays awake. It is dependency-free (uses the built-in fetch) and can
 * run from anywhere:
 *
 *   - Locally:   npm run keep-alive          (reads .env)
 *   - CI cron:   see .github/workflows/keep-alive.yml
 *   - Windows:   schedule it with Task Scheduler (only while the PC is on)
 *
 * Env vars (any of these pairs work; service key is used when present):
 *   SUPABASE_URL | VITE_SUPABASE_URL
 *   SUPABASE_ANON_KEY | VITE_SUPABASE_ANON_KEY
 *   SUPABASE_SERVICE_KEY   (optional, preferred)
 *
 * Optional: KEEPALIVE_TABLE (default: users).
 *
 * Note: this never calls process.exit() — on Windows that can abort the
 * process while the fetch connection is still open. It sets process.exitCode
 * and lets Node drain naturally.
 */

const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_KEY || '';
const anonKey =
  process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '';
const table = process.env.KEEPALIVE_TABLE || 'users';

const key = serviceKey || anonKey;

async function main() {
  if (!url) return { ok: false, msg: '[keep-alive] Missing SUPABASE_URL / VITE_SUPABASE_URL' };
  if (!key) return { ok: false, msg: '[keep-alive] Missing SUPABASE_SERVICE_KEY / SUPABASE_ANON_KEY / VITE_SUPABASE_ANON_KEY' };

  // A real SELECT so the request is a genuine database round-trip. PostgREST
  // treats it as activity, which is exactly what resets Supabase's idle timer.
  const endpoint = `${url}/rest/v1/${encodeURIComponent(table)}?select=id&limit=1`;

  try {
    const res = await fetch(endpoint, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    });

    if (res.status === 200) {
      return { ok: true, msg: `[keep-alive] OK ${new Date().toISOString()} — ${table} responded (project awake)` };
    }

    const body = await res.text();
    if (res.status === 422 || /paused/i.test(body)) {
      return { ok: false, msg: `[keep-alive] PROJECT PAUSED (${res.status}): ${body.slice(0, 200)} — resume it in the Supabase dashboard` };
    }

    // If the anon key is blocked from this table by RLS, fall back to any other
    // table so the request still counts as project activity.
    if (!serviceKey) {
      for (const fallback of ['market_orders', 'profiles', 'users']) {
        if (fallback === table) continue;
        const fb = await fetch(
          `${url}/rest/v1/${fallback}?select=id&limit=1`,
          { headers: { apikey: key, Authorization: `Bearer ${key}` } }
        );
        if (fb.status === 200) {
          return { ok: true, msg: `[keep-alive] OK ${new Date().toISOString()} — ${fallback} responded (project awake; primary table ${table} blocked: ${res.status})` };
        }
      }
    }

    return { ok: false, msg: `[keep-alive] FAILED (${res.status}): ${body.slice(0, 200)}` };
  } catch (err) {
    return { ok: false, msg: `[keep-alive] NETWORK ERROR: ${err.message}` };
  }
}

const result = await main();
console[result.ok ? 'log' : 'error'](result.msg);
process.exitCode = result.ok ? 0 : 1;
