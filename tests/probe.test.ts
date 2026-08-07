import { it, expect, vi } from 'vitest';
import { setLiveAccount, liveConfigured } from '../src/lib/zvida-live';

it('probe env', () => {
  vi.stubEnv('VITE_SUPABASE_URL', 'https://test.supabase.co');
  vi.stubEnv('VITE_SUPABASE_ANON_KEY', 'test-anon-key');
  setLiveAccount({ id: 'x', role: 'farmer', name: 'x', isDemo: false });
  expect(import.meta.env?.VITE_SUPABASE_URL).toBeTruthy();
  expect(liveConfigured()).toBe(true);
});
