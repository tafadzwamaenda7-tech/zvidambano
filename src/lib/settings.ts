/* Settings ⇄ Supabase bridge for the Account settings pages.

   Same live/demo split as zvida-live:
   • DEMO accounts (@zvida.zw personas) keep settings in localStorage and
     never touch live tables.
   • REAL accounts read/write their own `users` row via RLS: payout, company
     and profile details live in users.profile.settings plus full_name/phone;
     farmers' farm details live in the `farms` table (one row per owner).

   Password changes go through supabase.auth.updateUser (the auth service, not
   a business table). Demo personas share seeded credentials, so their
   "password" is never actually changed — the UI just reports success. */

import { supabase } from './supabase';
import { liveConfigured, getLiveAccount } from './zvida-live';

export interface SaveResult {
  ok: boolean;
  error?: string;
}

export interface AccountSettings {
  name: string;
  phone: string;
  email: string;
  payment: string;
  tax: string;
  company: string;
  registration: string;
  address: string;
  language: string;
  currency: string;
  notifyEmail: string;
  notifySms: string;
}

export interface FarmData {
  name: string;
  location: string;
  size: string;
}

const DEMO_KEY = 'zvida_settings';
const DEMO_FARM_KEY = 'zvida_settings_farm';

const EMPTY: AccountSettings = {
  name: '',
  phone: '',
  email: '',
  payment: '',
  tax: '',
  company: '',
  registration: '',
  address: '',
  language: 'English',
  currency: 'USD ($)',
  notifyEmail: 'on',
  notifySms: 'on',
};

function myId(): string {
  return getLiveAccount()?.id || '';
}

function readDemo(key: string): Record<string, string> {
  try {
    return JSON.parse(localStorage.getItem(key) || '{}') || {};
  } catch {
    return {};
  }
}

function writeDemo(key: string, patch: Record<string, string>): void {
  try {
    localStorage.setItem(key, JSON.stringify({ ...readDemo(key), ...patch }));
  } catch {
    /* ignore quota/private-mode errors */
  }
}

/** Read the persisted account settings. Demo accounts get the local fallback;
    real accounts read their own users row via RLS. */
export async function loadSettings(): Promise<AccountSettings> {
  if (!liveConfigured()) return { ...EMPTY, ...readDemo(DEMO_KEY) };
  try {
    const { data } = await supabase
      .from('users')
      .select('full_name, phone, email, profile')
      .eq('id', myId())
      .maybeSingle();
    const row = data as { full_name?: string; phone?: string; email?: string; profile?: { settings?: Record<string, string> } } | null;
    const s = row?.profile?.settings || {};
    return {
      name: row?.full_name || '',
      phone: row?.phone || '',
      email: row?.email || '',
      payment: s.payment || '',
      tax: s.tax || '',
      company: s.company || '',
      registration: s.registration || '',
      address: s.address || '',
      language: s.language || 'English',
      currency: s.currency || 'USD ($)',
      notifyEmail: s.notifyEmail || 'on',
      notifySms: s.notifySms || 'on',
    };
  } catch {
    return { ...EMPTY };
  }
}

/** Persist payout / company details into users.profile.settings. */
export async function saveSettings(patch: Partial<AccountSettings>): Promise<SaveResult> {
  if (!liveConfigured()) {
    writeDemo(DEMO_KEY, pick(patch, ['payment', 'tax', 'company', 'registration', 'address', 'language', 'currency', 'notifyEmail', 'notifySms']));
    return { ok: true };
  }
  try {
    const { data } = await supabase.from('users').select('profile').eq('id', myId()).maybeSingle();
    const profile = ((data as { profile?: Record<string, unknown> } | null)?.profile as Record<string, unknown>) || {};
    const settings = { ...((profile.settings as Record<string, string>) || {}), ...pick(patch, ['payment', 'tax', 'company', 'registration', 'address', 'language', 'currency', 'notifyEmail', 'notifySms']) };
    const { error } = await supabase.from('users').update({ profile: { ...profile, settings } }).eq('id', myId());
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not save settings' };
  }
}

/** Persist the profile's display name + phone onto the users row. */
export async function saveProfile(patch: { name: string; phone: string }): Promise<SaveResult> {
  if (!liveConfigured()) {
    writeDemo(DEMO_KEY, pick(patch, ['name', 'phone']));
    return { ok: true };
  }
  try {
    const { error } = await supabase
      .from('users')
      .update({ full_name: patch.name.trim(), phone: patch.phone.trim() })
      .eq('id', myId());
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not save profile' };
  }
}

/** Load the farmer's farm row (empty strings when none exists yet). */
export async function loadFarm(): Promise<FarmData> {
  if (!liveConfigured()) {
    return { name: readDemo(DEMO_FARM_KEY).name || '', location: readDemo(DEMO_FARM_KEY).location || '', size: readDemo(DEMO_FARM_KEY).size || '' };
  }
  try {
    const { data } = await supabase
      .from('farms')
      .select('name, location, size_hectares')
      .eq('owner_id', myId())
      .maybeSingle();
    const row = data as { name?: string; location?: string; size_hectares?: number | null } | null;
    return {
      name: row?.name || '',
      location: row?.location || '',
      size: row?.size_hectares ? String(row.size_hectares) : '',
    };
  } catch {
    return { name: '', location: '', size: '' };
  }
}

/** Upsert the farmer's farm row (one per owner). */
export async function saveFarm(data: FarmData): Promise<SaveResult> {
  if (!liveConfigured()) {
    writeDemo(DEMO_FARM_KEY, pick(data, ['name', 'location', 'size']));
    return { ok: true };
  }
  try {
    const size = parseFloat(data.size);
    const row = {
      name: data.name.trim(),
      location: data.location.trim(),
      size_hectares: Number.isNaN(size) || size <= 0 ? null : size,
    };
    const { data: existing } = await supabase.from('farms').select('id').eq('owner_id', myId()).maybeSingle();
    if (existing?.id) {
      const { error } = await supabase.from('farms').update(row).eq('id', existing.id).eq('owner_id', myId());
      if (error) return { ok: false, error: error.message };
    } else {
      const { error } = await supabase.from('farms').insert({ ...row, owner_id: myId() } as any);
      if (error) return { ok: false, error: error.message };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not save farm' };
  }
}

/** Update the signed-in user's password via the auth service. */
export async function changePassword(newPassword: string): Promise<SaveResult> {
  if (!liveConfigured()) return { ok: true };
  try {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch {
    return { ok: false, error: 'Could not update password' };
  }
}

/** Read a form control's trimmed value by its data-val key. */
export function formValue(form: HTMLElement, key: string): string {
  const el = form.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(`[data-val="${key}"]`);
  return (el?.value || '').trim();
}

/** Read a checked radio's value inside a form (by the input's name). */
export function radioValue(form: HTMLElement, name: string): string {
  const el = form.querySelector<HTMLInputElement>(`[name="${name}"]:checked`);
  return el ? el.value : '';
}

function pick(obj: object, keys: string[]): Record<string, string> {
  const out: Record<string, string> = {};
  keys.forEach((k) => {
    const v = (obj as Record<string, unknown>)[k];
    out[k] = typeof v === 'string' ? v : String(v ?? '');
  });
  return out;
}
