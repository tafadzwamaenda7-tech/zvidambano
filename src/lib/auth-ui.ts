/**
 * Auth UI — wires the login + signup + forgot-password flows on login.html
 * to the real Supabase Auth backend, with inline validation, a multi-step
 * signup wizard and role-based redirects.
 */

import { login, register, sendMagicLink, getAuthState, mfaRequired, signInWithTotp, signInWithOAuth, type OAuthProvider, type SignupMetadata } from './auth';
import { getRemember, setRemember } from './supabase';
import { canAccessDashboard, requestPasswordReset, resendEmailVerification, type UserRole } from './auth-utils';
import {
  EMAIL_RE,
  PHONE_RE,
  passwordScore,
  passwordChecks,
  isPasswordStrongEnough,
  strengthLabel,
  passwordContainsPersonalInfo,
  validateDocument,
  isPasswordBreached,
} from './auth-validation';
import { loginError, signupError, resetError, resendError } from './auth-errors';
import { logAuthEvent } from './auth-audit';

type SignupRole = 'farmer' | 'offtaker' | 'driver' | 'supplier';

type RoleFieldType = 'text' | 'number' | 'select' | 'multiselect' | 'gps';

interface RoleField {
  name: string;
  label: string;
  placeholder?: string;
  optional?: boolean;
  required?: boolean;
  type?: RoleFieldType;
  options?: string[];
}

interface RoleConfig {
  title: string;
  note: string;
  fields: RoleField[];
}

const ROLE_DETAILS: Record<SignupRole, RoleConfig> = {
  farmer: {
    title: 'Farm details',
    note: 'ZVIDA sells your harvest at the best available price and handles payment and delivery — your identity stays private.',
    fields: [
      { name: 'farmName', label: 'Farm name', placeholder: 'e.g. Green Acres Farm', type: 'text', required: true },
      { name: 'farmGps', label: 'GPS location', placeholder: '-17.883, 31.033', type: 'gps', required: true },
      { name: 'farmAcreage', label: 'Acreage (hectares)', placeholder: 'e.g. 20', type: 'number', required: true },
      { name: 'farmCrops', label: 'Crops grown', type: 'multiselect', options: ['Maize', 'Soya', 'Wheat', 'Sorghum', 'Sugar Beans', 'Groundnuts'], required: true },
    ],
  },
  offtaker: {
    title: 'Company details',
    note: 'ZVIDA sources your grain at the right grade and price — payment and delivery handled for you, start to finish. Your identity stays private.',
    fields: [
      { name: 'companyName', label: 'Company name', placeholder: 'e.g. Miller Corporation', type: 'text', required: true },
      { name: 'companyGps', label: 'GPS location', placeholder: '-17.825, 31.033', type: 'gps', required: true },
      { name: 'companyCapacity', label: 'Processing capacity (t/month)', placeholder: 'e.g. 500', type: 'number', required: true },
      { name: 'companyCommodities', label: 'Commodities purchased', type: 'multiselect', options: ['Maize', 'Soya', 'Wheat', 'Sorghum', 'Sugar Beans'], required: true },
    ],
  },
  driver: {
    title: 'Driver details',
    note: 'ZVIDA arranges every delivery and payment — you just transport the load. Your identity stays private.',
    fields: [
      { name: 'licence', label: 'Driver licence number', placeholder: 'e.g. DL-2024-0042', type: 'text', required: true },
      { name: 'truckReg', label: 'Truck registration', placeholder: 'e.g. ABC-123', type: 'text', required: true },
      { name: 'trailerReg', label: 'Trailer registration', placeholder: 'e.g. XYZ-789', type: 'text', optional: true },
      { name: 'capacity', label: 'Truck capacity (tons)', placeholder: 'e.g. 35', type: 'number', required: true },
    ],
  },
  supplier: {
    title: 'Business details',
    note: 'ZVIDA takes your products to market and handles pricing, payment and delivery — your identity stays private.',
    fields: [
      { name: 'storeName', label: 'Company name', placeholder: 'e.g. Vendor Supplies Ltd', type: 'text', required: true },
      { name: 'storeGps', label: 'GPS location', placeholder: '-17.883, 31.033', type: 'gps', required: true },
      { name: 'storeCategories', label: 'Product categories', type: 'multiselect', options: ['Fertilizer', 'Seeds', 'Chemicals', 'Pesticides', 'Machinery', 'Equipment'], required: true },
    ],
  },
};

function fmtSize(bytes: number): string {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${Math.round(bytes / 1024)} KB`;
}

const DEFAULT_BG = 'grain-field-PPBX8RZ-1-1637x2048.jpg';
const DEFAULT_CAPTION_TITLE = 'Grow. Trade. Trust.';
const DEFAULT_CAPTION_SUB = 'The verified way to buy and sell grain — grade-adjusted pricing and complete privacy, handled end to end by ZVIDA.';

const ROLE_BACKDROP: Record<SignupRole, { img: string; title: string; sub: string }> = {
  farmer: {
    img: 'download (1).jpg',
    title: 'Sell your harvest with confidence',
    sub: 'Get grade-adjusted pricing, guaranteed offtake and fast payment — with ZVIDA handling everything end to end.',
  },
  offtaker: {
    img: 'Screenshot 2026-07-30 081521.png',
    title: 'Source verified grain at scale',
    sub: 'Buy your grain at the right grade and price, with payment and delivery handled for you — start to finish by ZVIDA.',
  },
  driver: {
    img: 'Screenshot 2026-07-30 081858.png',
    title: 'Keep the harvest moving',
    sub: 'Transport ZVIDA\u2019s loads with clear schedules, live trip updates and on-time pay for every delivery.',
  },
  supplier: {
    img: 'download (1).jpg',
    title: 'Stock the farm gate',
    sub: 'Supply seeds, fertilizer and inputs through ZVIDA — and grow your supply business.',
  },
};

let backdropInit = false;

function setBackdrop(role: SignupRole | null): void {
  const img = document.querySelector<HTMLElement>('[data-bg-img]');
  const title = document.querySelector<HTMLElement>('[data-caption-title]');
  const sub = document.querySelector<HTMLElement>('[data-caption-sub]');
  const bg = role ? ROLE_BACKDROP[role] : null;
  const url = (bg ? bg.img : DEFAULT_BG).replace(/'/g, "\\'");
  if (img) {
    const next = `url('${url}')`;
    if (!backdropInit) {
      backdropInit = true;
      img.style.backgroundImage = next;
    } else if (img.style.backgroundImage !== next) {
      img.classList.add('swapping');
      window.setTimeout(() => {
        img.style.backgroundImage = next;
        img.classList.remove('swapping');
      }, 320);
    }
  }
  if (title) title.textContent = bg ? bg.title : DEFAULT_CAPTION_TITLE;
  if (sub) sub.textContent = bg ? bg.sub : DEFAULT_CAPTION_SUB;
}

interface MsgBox {
  ok(value: string): void;
  err(value: string): void;
  hint(value: string): void;
  clear(): void;
}

function msgFor(el: HTMLElement, name: string): MsgBox {
  const box = el.querySelector<HTMLElement>(`[data-msg-for="${name}"]`);
  return {
    ok: (v) => {
      if (box) { box.textContent = v; box.className = 'auth-msg ok'; }
    },
    err: (v) => {
      if (box) { box.textContent = v; box.className = 'auth-msg err'; }
    },
    hint: (v) => {
      if (box) { box.textContent = v; box.className = 'auth-msg hint'; }
    },
    clear: () => {
      if (box) { box.textContent = ''; box.className = 'auth-msg'; }
    },
  };
}

function markInput(el: HTMLElement, name: string, state: 'ok' | 'err' | 'clear'): void {
  const input = el.querySelector<HTMLElement>(`[name="${name}"]`) || el.querySelector<HTMLElement>(`#${name}`);
  if (!input) return;
  input.classList.remove('has-error', 'has-ok');
  if (state === 'err') input.classList.add('has-error');
  if (state === 'ok') input.classList.add('has-ok');
}

function redirectToDashboard(role: string | null): void {
  if (!role) {
    showAuthError('No dashboard is available for this account.');
    return;
  }
  const dest = canAccessDashboard(role as UserRole);
  if (dest) {
    window.location.href = dest;
  } else {
    showAuthError('No dashboard is available for this account.');
  }
}

function setBusy(btn: HTMLButtonElement | null, busy: boolean, idleText?: string, busyText?: string): void {
  if (!btn) return;
  if (busy) {
    btn.disabled = true;
    btn.textContent = busyText || btn.dataset.busy || 'Please wait…';
  } else {
    btn.disabled = false;
    btn.textContent = idleText || btn.dataset.idle || 'Submit';
  }
}

interface ErrorAction { label: string; run: () => void }

function showAuthError(message: string, action?: ErrorAction): void {
  const box = document.getElementById('auth-error');
  if (!box) return;
  const span = box.querySelector('span');
  if (span) span.textContent = message;
  let actBtn = box.querySelector<HTMLButtonElement>('[data-error-action]');
  if (action) {
    if (!actBtn) {
      actBtn = document.createElement('button');
      actBtn.type = 'button';
      actBtn.dataset.errorAction = '';
      box.appendChild(actBtn);
    }
    actBtn.textContent = action.label;
    actBtn.onclick = () => { hideAuthError(); action.run(); };
  } else if (actBtn) {
    actBtn.remove();
  }
  box.hidden = !message;
}

function hideAuthError(): void {
  showAuthError('');
}

/* ---------- Login rate limiting (client-side cooldown) ---------- */

const LOGIN_COOLDOWN_KEY = 'zvida_login_cooldown';
const LOGIN_MAX_FAILURES = 5;
const LOGIN_BASE_LOCK_MS = 30_000;
const LOGIN_MAX_ESCALATION = 4;

interface LoginCooldown { count: number; lockUntil: number }

function getLoginCooldown(): LoginCooldown {
  try {
    const raw = sessionStorage.getItem(LOGIN_COOLDOWN_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<LoginCooldown>;
      if (typeof p.count === 'number' && typeof p.lockUntil === 'number') {
        return { count: p.count, lockUntil: p.lockUntil };
      }
    }
  } catch { /* corrupted storage — start fresh */ }
  return { count: 0, lockUntil: 0 };
}

function saveLoginCooldown(c: LoginCooldown): void {
  try { sessionStorage.setItem(LOGIN_COOLDOWN_KEY, JSON.stringify(c)); } catch { /* storage unavailable */ }
}

/** Seconds until the cooldown lifts (0 when not locked). */
function loginLockedSeconds(): number {
  const c = getLoginCooldown();
  const ms = c.lockUntil - Date.now();
  return ms > 0 ? Math.ceil(ms / 1000) : 0;
}

function registerLoginFailure(): void {
  const c = getLoginCooldown();
  if (c.lockUntil > Date.now()) return; // already locked out
  c.count += 1;
  if (c.count >= LOGIN_MAX_FAILURES) {
    const exponent = Math.min(c.count - LOGIN_MAX_FAILURES, LOGIN_MAX_ESCALATION);
    c.lockUntil = Date.now() + LOGIN_BASE_LOCK_MS * Math.pow(2, exponent);
    c.count = 0;
  }
  saveLoginCooldown(c);
}

function resetLoginCooldown(): void {
  saveLoginCooldown({ count: 0, lockUntil: 0 });
}

function startLoginCountdown(): void {
  const tick = (): void => {
    const secs = loginLockedSeconds();
    if (secs <= 0) { hideAuthError(); return; }
    showAuthError(`Too many failed attempts. Try again in ${secs} second${secs === 1 ? '' : 's'}.`);
    window.setTimeout(tick, 1000);
  };
  tick();
}

/* ---------- Caps lock detection ---------- */

function initCapsLockDetection(): void {
  document.querySelectorAll<HTMLElement>('[data-capslock]').forEach((input) => {
    const capsEl = input.closest('.auth-field')?.querySelector<HTMLElement>('[data-caps]');
    if (!capsEl) return;
    const setCaps = (on: boolean): void => { capsEl.hidden = !on; };

    // Never trust getModifierState('CapsLock') — browsers report it
    // incorrectly (both true-when-off and stale). Instead infer the real
    // state from the letter the key WOULD insert and whether Shift is held:
    //   caps + no shift -> uppercase,  caps + shift -> lowercase.
    const capsOn = (e: KeyboardEvent): boolean | null => {
      if (e.key.length !== 1 || !/[a-zA-Z]/.test(e.key)) return null;
      const isUpper = e.key >= 'A' && e.key <= 'Z';
      const isLower = e.key >= 'a' && e.key <= 'z';
      if (isUpper && !e.shiftKey) return true;
      if (isLower && e.shiftKey) return true;
      return false;
    };

    input.addEventListener('keydown', (e) => {
      const on = capsOn(e);
      if (on !== null) setCaps(on);
    });
    input.addEventListener('keyup', (e) => {
      const on = capsOn(e);
      if (on !== null) setCaps(on);
    });
    input.addEventListener('blur', () => setCaps(false));
  });
}

/* ---------- Password generator ---------- */

function generatePassword(length = 16): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghijkmnpqrstuvwxyz';
  const digits = '23456789';
  const symbols = '!@#$%^&*()-_=+';
  const all = upper + lower + digits + symbols;
  const rand = new Uint32Array(length);
  crypto.getRandomValues(rand);
  let pw = upper[rand[0] % upper.length] + lower[rand[1] % lower.length] + digits[rand[2] % digits.length] + symbols[rand[3] % symbols.length];
  for (let i = 4; i < length; i++) pw += all[rand[i] % all.length];
  return pw;
}

function initPasswordGenerator(): void {
  document.querySelectorAll<HTMLElement>('[data-generate-for]').forEach((el) => {
    el.addEventListener('click', () => {
      const id = el.dataset.generateFor || '';
      const input = document.getElementById(id) as HTMLInputElement | null;
      if (!input) return;
      const pw = generatePassword();
      input.value = pw;
      input.type = 'password';
      const form = input.closest('form') as HTMLFormElement | null;
      if (form) {
        updatePasswordMeter(form, pw);
        const confirm = form.elements.namedItem('confirm') as HTMLInputElement | null;
        if (confirm) confirm.value = pw;
        markInput(form, 'password', 'ok');
        msgFor(form, 'password').clear();
      }
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
  });
}

/* ---------- Signup field blur validation ---------- */

const SIGNUP_FIELD_RULES: Record<string, { label: string; type: 'text' | 'select' | 'date' | 'tel' | 'email' | 'password' }> = {
  firstName: { label: 'First name', type: 'text' },
  surname: { label: 'Surname', type: 'text' },
  dob: { label: 'Date of birth', type: 'date' },
  gender: { label: 'Gender', type: 'select' },
  idType: { label: 'ID type', type: 'select' },
  idNumber: { label: 'ID number', type: 'text' },
  address1: { label: 'Address line 1', type: 'text' },
  city: { label: 'City', type: 'text' },
  province: { label: 'Province', type: 'select' },
  phone: { label: 'Mobile number', type: 'tel' },
  email: { label: 'Email', type: 'email' },
  password: { label: 'Password', type: 'password' },
  confirm: { label: 'Confirm password', type: 'password' },
};

function requireField(form: HTMLFormElement, name: string, label: string): boolean {
  const el = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
  const v = (el?.value || '').trim();
  if (!v) {
    markInput(form, name, 'err');
    msgFor(form, name).err(`${label} is required.`);
    return false;
  }
  markInput(form, name, 'ok');
  msgFor(form, name).ok('');
  return true;
}

function validateSignupField(form: HTMLFormElement, name: string): void {
  const rule = SIGNUP_FIELD_RULES[name];
  if (!rule) return;
  const el = form.elements.namedItem(name) as HTMLInputElement | null;
  const v = (el?.value ?? '').trim();
  let err = '';
  if (!v) {
    err = `${rule.label} is required.`;
  } else if (rule.type === 'email' && !EMAIL_RE.test(v)) {
    err = 'Enter a valid email address.';
  } else if (rule.type === 'tel' && !PHONE_RE.test(v)) {
    err = 'Use a valid ZW number, e.g. +263 77 000 0000.';
  } else if (rule.type === 'date') {
    const d = new Date(v);
    if (isNaN(d.getTime()) || d >= new Date()) err = 'Enter a valid date in the past.';
  } else if (rule.type === 'password' && name === 'password' && !isPasswordStrongEnough(v)) {
    err = 'Password is too weak.';
  } else if (name === 'confirm') {
    const pw = (form.elements.namedItem('password') as HTMLInputElement | null)?.value || '';
    if (v !== pw) err = 'Passwords do not match.';
  }

  if (err) {
    markInput(form, name, 'err');
    msgFor(form, name).err(err);
  } else {
    markInput(form, name, 'ok');
    msgFor(form, name).clear();
  }
}

/* ---------- Signup draft (sessionStorage) ---------- */

const SIGNUP_DRAFT_KEY = 'zvida_signup_draft';

interface SignupDraft {
  role: SignupRole;
  step: number;
  values: Record<string, string | string[]>;
}

function collectDraft(form: HTMLFormElement, role: SignupRole, step: number): SignupDraft {
  const values: Record<string, string | string[]> = {};
  const seen = new Set<string>();
  for (const raw of Array.from(form.elements)) {
    const el = raw as HTMLInputElement | HTMLSelectElement;
    const name = el.name;
    if (!name || seen.has(name)) continue;
    seen.add(name);
    if (name === 'password' || name === 'confirm') continue; // never persist secrets
    if (el instanceof HTMLInputElement && (el.type === 'file' || el.type === 'submit')) continue;
    const all = form.querySelectorAll<HTMLInputElement>(`[name="${name}"]`);
    if (all.length > 1 && all[0].type === 'checkbox') {
      values[name] = Array.from(all).filter((c) => c.checked).map((c) => c.value);
    } else if (el.type === 'checkbox') {
      values[name] = (el as HTMLInputElement).checked ? '1' : '';
    } else {
      values[name] = (el as HTMLInputElement).value;
    }
  }
  return { role, step, values };
}

function saveDraft(draft: SignupDraft): void {
  try {
    sessionStorage.setItem(SIGNUP_DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* storage may be unavailable in private mode */
  }
}

function loadDraft(): SignupDraft | null {
  try {
    const raw = sessionStorage.getItem(SIGNUP_DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<SignupDraft>;
    if (!parsed || !parsed.role || !parsed.values) return null;
    return { role: parsed.role, step: parsed.step ?? 1, values: parsed.values };
  } catch {
    return null;
  }
}

function clearDraft(): void {
  try {
    sessionStorage.removeItem(SIGNUP_DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

function applyDraftValues(form: HTMLFormElement, values: Record<string, string | string[]>): void {
  Object.entries(values).forEach(([name, value]) => {
    if (name === 'password' || name === 'confirm') return;
    const all = form.querySelectorAll<HTMLInputElement>(`[name="${name}"]`);
    if (all.length > 1 && all[0].type === 'checkbox') {
      const selected = Array.isArray(value) ? value : [];
      all.forEach((c) => { c.checked = selected.includes(c.value); });
    } else if (all.length === 1 && all[0].type === 'checkbox') {
      all[0].checked = value === '1';
    } else {
      const el = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | null;
      if (el && !(el instanceof HTMLInputElement && el.type === 'file')) {
        el.value = typeof value === 'string' ? value : (value[0] ?? '');
      }
    }
  });
}

let signupReset: (() => void) | null = null;
let loginReset: (() => void) | null = null;

function switchPanel(target: string): void {
  setBackdrop(null);
  if (target === 'signup') signupReset?.();
  if (target === 'login') loginReset?.();
  const tabbar = document.querySelector<HTMLElement>('[data-auth-tabbar]');
  if (tabbar) tabbar.hidden = target === 'verify' || target === 'mfa';
  document.querySelectorAll<HTMLElement>('[data-auth-tab]').forEach((t) => {
    const active = t.dataset.authTab === target;
    t.classList.toggle('active', active);
    t.setAttribute('aria-selected', String(active));
  });
  document.querySelectorAll<HTMLElement>('[data-auth-panel]').forEach((panel) => {
    const show = panel.dataset.authPanel === target;
    panel.hidden = !show;
    panel.setAttribute('aria-hidden', String(!show));
  });
  const targetPanel = document.querySelector<HTMLElement>(`[data-auth-panel="${target}"]`);
  const title = document.getElementById('auth-title');
  const sub = document.getElementById('auth-subtitle');
  if (title && targetPanel) title.textContent = targetPanel.dataset.title || 'Welcome back';
  if (sub && targetPanel) sub.textContent = targetPanel.dataset.sub || '';
  hideAuthError();
}

/* ---------- Login form ---------- */

function updatePasswordMeter(form: HTMLFormElement, pw: string): void {
  const meter = form.querySelector<HTMLElement>('[data-pw-meter]');
  const label = form.querySelector<HTMLElement>('[data-pw-label]');
  if (!meter) return;

  const score = passwordScore(pw);
  const bars = meter.querySelectorAll<HTMLElement>('span');
  const config = strengthLabel(score);

  bars.forEach((bar, i) => {
    const on = score > 0 && i < Math.max(1, Math.round((score / 5) * bars.length));
    bar.classList.toggle('on', on);
    bar.style.setProperty('--pw-col', on ? config.color : '');
  });
  if (label) {
    label.textContent = pw.length === 0
      ? 'Use at least 8 characters with a mix of cases, numbers and symbols.'
      : config.text;
    label.style.setProperty('--pw-label', config.color);
  }

  const reqs = passwordChecks(pw);
  form.querySelectorAll<HTMLElement>('[data-req]').forEach((req) => {
    const key = req.dataset.req;
    if (key && key in reqs) req.classList.toggle('met', reqs[key as keyof typeof reqs]);
  });
}

/* ---------- Login form ---------- */

function initLoginForm(): void {
  const form = document.getElementById('login-form') as HTMLFormElement | null;
  if (!form) return;

  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');

  const validateField = (name: string): boolean => {
    if (name === 'email') {
      const email = (form.elements.namedItem('email') as HTMLInputElement | null)?.value.trim() || '';
      if (!email) { markInput(form, 'email', 'err'); msgFor(form, 'email').err('Email is required.'); return false; }
      if (!EMAIL_RE.test(email)) { markInput(form, 'email', 'err'); msgFor(form, 'email').err('Enter a valid email address.'); return false; }
      markInput(form, 'email', 'ok'); msgFor(form, 'email').ok('');
      return true;
    }
    if (name === 'password') {
      const password = (form.elements.namedItem('password') as HTMLInputElement | null)?.value || '';
      if (!password) { markInput(form, 'password', 'err'); msgFor(form, 'password').err('Password is required.'); return false; }
      markInput(form, 'password', 'ok'); msgFor(form, 'password').ok('');
      return true;
    }
    return true;
  };

  ['email', 'password'].forEach((name) => {
    const field = form.elements.namedItem(name);
    if (field instanceof HTMLElement) {
      field.addEventListener('blur', () => { validateField(name); });
      field.addEventListener('input', () => {
        markInput(form, name, 'clear');
        msgFor(form, name).clear();
        hideAuthError();
      });
    }
  });

  const rememberInput = form.elements.namedItem('remember') as HTMLInputElement | null;
  if (rememberInput) rememberInput.checked = getRemember();

  const pwField = form.parentElement?.querySelector<HTMLElement>('.login-pw-field') ?? null;
  const loginOptions = form.parentElement?.querySelector<HTMLElement>('.login-options') ?? null;
  const magicToggle = document.querySelector<HTMLButtonElement>('[data-magic-toggle]');
  const magicBack = form.parentElement?.querySelectorAll<HTMLButtonElement>('[data-magic-back]') ?? null;
  const magicSuccess = document.getElementById('magic-success');
  const successEmail = document.getElementById('magic-success-email');
  const divider = form.parentElement?.querySelector<HTMLElement>('.auth-divider') ?? null;
  const pwToggleBtn = form.querySelector<HTMLButtonElement>('[data-toggle-for="password"]');

  let magicMode = false;
  const setMagicMode = (on: boolean): void => {
    magicMode = on;
    if (form) form.hidden = false;
    if (pwField) pwField.hidden = on;
    if (loginOptions) loginOptions.hidden = on;
    if (submit) submit.hidden = on;
    if (pwToggleBtn) pwToggleBtn.hidden = on;
    if (magicToggle) magicToggle.hidden = on;
    if (divider) divider.hidden = on;
    if (magicSuccess) magicSuccess.hidden = true;
    if (magicBack) magicBack.forEach((b) => { b.hidden = !on; });
    hideAuthError();
    msgFor(form, 'email').clear();
    if (on) {
      const emailEl = form.elements.namedItem('email') as HTMLInputElement | null;
      emailEl?.focus();
    }
  };

  magicToggle?.addEventListener('click', () => setMagicMode(true));
  magicBack?.forEach((b) => b.addEventListener('click', () => setMagicMode(false)));
  loginReset = () => setMagicMode(false);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAuthError();

    if (magicMode) {
      if (!validateField('email')) return;
      const email = (form.elements.namedItem('email') as HTMLInputElement | null)?.value.trim() || '';
      setBusy(submit, true, 'Sign In', 'Sending…');
      try {
        const result = await sendMagicLink(email);
        if (result.ok) {
          if (successEmail) successEmail.textContent = email;
          if (form) form.hidden = true;
          if (magicToggle) magicToggle.hidden = true;
          if (divider) divider.hidden = true;
          if (magicBack) magicBack.forEach((b) => { b.hidden = true; });
          if (magicSuccess) magicSuccess.hidden = false;
          return;
        }
        showAuthError(result.error || 'Could not send the sign-in link. Please try again.');
      } catch {
        showAuthError('Could not send the sign-in link. Please try again.');
      } finally {
        setBusy(submit, false, 'Sign In', 'Sending…');
      }
      return;
    }

    const locked = loginLockedSeconds();
    if (locked > 0) {
      startLoginCountdown();
      return;
    }
    if (rememberInput) setRemember(rememberInput.checked);
    if (!validateField('email') || !validateField('password')) return;

    const email = (form.elements.namedItem('email') as HTMLInputElement | null)?.value.trim() || '';
    const password = (form.elements.namedItem('password') as HTMLInputElement | null)?.value || '';

    setBusy(submit, true);
    try {
      const ok = await login(email, password);
      if (ok) {
        resetLoginCooldown();
        if (await mfaRequired()) {
          const codeEl = document.getElementById('mfa-code') as HTMLInputElement | null;
          if (codeEl) codeEl.value = '';
          switchPanel('mfa');
          return;
        }
        redirectToDashboard(getAuthState().role);
        return;
      }
      registerLoginFailure();
      const info = loginError(getAuthState().error || 'Login failed. Please check your details.');
      showAuthError(
        info.message,
        info.action === 'create-account' ? { label: 'Create an account', run: () => switchPanel('signup') } : undefined,
      );
    } catch (err) {
      registerLoginFailure();
      showAuthError(loginError(err instanceof Error ? err.message : 'Login failed. Please try again.').message);
    } finally {
      setBusy(submit, false);
    }
  });
}

/* ---------- Two-factor authentication (TOTP challenge) ---------- */

function initMfaPanel(): void {
  const form = document.getElementById('mfa-form') as HTMLFormElement | null;

  const clearCode = (): void => {
    const el = document.getElementById('mfa-code') as HTMLInputElement | null;
    if (el) { el.value = ''; el.focus(); }
  };

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      hideAuthError();
      const code = (form.elements.namedItem('code') as HTMLInputElement | null)?.value.trim() || '';
      const codeEl = form.querySelector<HTMLElement>('[name="code"]');
      if (!/^\d{6}$/.test(code)) {
        markInput(form, 'code', 'err');
        msgFor(form, 'mfa').err('Enter the 6-digit code from your authenticator app.');
        return;
      }
      markInput(form, 'code', 'ok');
      msgFor(form, 'mfa').clear();
      const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
      setBusy(submit, true, 'Verify & Sign In', 'Verifying…');
      try {
        const result = await signInWithTotp(code);
        if (result.ok) {
          resetLoginCooldown();
          redirectToDashboard(getAuthState().role);
          return;
        }
        markInput(form, 'code', 'err');
        msgFor(form, 'mfa').err(result.error || 'That code was not accepted. Try again.');
        codeEl?.focus();
      } catch {
        msgFor(form, 'mfa').err('Could not verify the code. Please try again.');
      } finally {
        setBusy(submit, false);
      }
    });

    const codeInput = form.elements.namedItem('code') as HTMLInputElement | null;
    codeInput?.addEventListener('input', () => {
      const v = codeInput.value.replace(/\D/g, '');
      if (codeInput.value !== v) codeInput.value = v;
      markInput(form, 'code', 'clear');
      msgFor(form, 'mfa').clear();
      hideAuthError();
    });
    codeInput?.addEventListener('blur', () => {
      const v = codeInput.value.trim();
      if (v && !/^\d{6}$/.test(v)) {
        markInput(form, 'code', 'err');
        msgFor(form, 'mfa').err('Codes are 6 digits long.');
      }
    });
  }

  document.querySelectorAll<HTMLElement>('[data-action="mfa-back"]').forEach((el) => {
    el.addEventListener('click', async () => {
      const { logout } = await import('./auth');
      try { await logout(); } catch { /* ignore — still leave the panel */ }
      switchPanel('login');
    });
  });

  window.addEventListener('zvida:mfa-required', () => {
    clearCode();
    switchPanel('mfa');
  });
}

/* ---------- Social sign-in (OAuth) ---------- */

function initOAuth(): void {
  document.querySelectorAll<HTMLElement>('[data-oauth-provider]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      hideAuthError();
      const provider = btn.dataset.oauthProvider as OAuthProvider;
      setBusy(btn as HTMLButtonElement, true);
      try {
        const result = await signInWithOAuth(provider);
        if (!result.ok) {
          const msg = result.error || '';
          showAuthError(
            /configur|not enabled|unsupported|disabled/i.test(msg)
              ? 'Social sign-in is not configured on this account yet — use email and password.'
              : msg || 'Could not start ' + provider + ' sign-in.',
          );
        }
      } catch {
        showAuthError('Could not start social sign-in. Please try again.');
      } finally {
        setBusy(btn as HTMLButtonElement, false);
      }
    });
  });
}

/* ---------- Signup wizard ---------- */

function renderRoleDetails(container: HTMLElement, form: HTMLFormElement, role: SignupRole): void {
  const cfg = ROLE_DETAILS[role];
  const note = form.querySelector<HTMLElement>('[data-role-note]');
  if (note) note.textContent = cfg.note;

  const grid = document.createElement('div');
  grid.className = 'auth-grid';
  cfg.fields.forEach((f) => {
    const wrap = document.createElement('div');
    wrap.className = 'auth-field';
    const req = f.optional ? '' : ' *';
    const label = `<label for="su-${f.name}">${f.label}${f.optional ? ' <span class="auth-msg hint" style="display:inline;margin:0">(optional)</span>' : ''}${req}</label>`;
    if (f.type === 'multiselect') {
      const chips = (f.options || [])
        .map((o) => `<label class="auth-chip"><input type="checkbox" name="${f.name}" value="${o}"><span>${o}</span></label>`)
        .join('');
      wrap.innerHTML = label + `<div class="auth-chips">${chips}</div><div class="auth-msg" data-msg-for="${f.name}"></div>`;
    } else if (f.type === 'gps') {
      wrap.innerHTML = label +
        `<div class="auth-gps"><input type="text" id="su-${f.name}" name="${f.name}" class="auth-input" placeholder="${f.placeholder || ''}" autocomplete="off" /><button type="button" class="login-back auth-gps-btn" data-gps-for="${f.name}">Get location</button></div>` +
        `<div class="auth-msg" data-msg-for="${f.name}"></div>`;
    } else {
      const t = f.type === 'number' ? 'number' : 'text';
      wrap.innerHTML = label +
        `<input type="${t}" id="su-${f.name}" name="${f.name}" class="auth-input" placeholder="${f.placeholder || ''}" />` +
        `<div class="auth-msg" data-msg-for="${f.name}"></div>`;
    }
    grid.appendChild(wrap);
  });
  container.innerHTML = '';
  container.appendChild(grid);

  container.querySelectorAll<HTMLElement>('[data-gps-for]').forEach((el) => {
    el.addEventListener('click', () => {
      const btn = el as HTMLButtonElement;
      const name = btn.dataset.gpsFor || '';
      const input = container.querySelector<HTMLInputElement>(`[name="${name}"]`);
      if (!input) return;
      if (!('geolocation' in navigator)) {
        msgFor(container, name).err('Geolocation is not available in this browser.');
        return;
      }
      btn.disabled = true;
      btn.textContent = 'Locating…';
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          input.value = `${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`;
          markInput(container, name, 'ok');
          msgFor(container, name).ok('');
          btn.disabled = false;
          btn.textContent = 'Get location';
        },
        () => {
          msgFor(container, name).err('Could not get your location. Enter it manually.');
          btn.disabled = false;
          btn.textContent = 'Get location';
        },
        { enableHighAccuracy: true, timeout: 12000 },
      );
    });
  });

  grid.querySelectorAll<HTMLElement>('input:not([type="checkbox"]):not([type="file"]), select').forEach((el) => {
    el.addEventListener('blur', () => {
      const n = el.getAttribute('name') || '';
      const f = cfg.fields.find((x) => x.name === n);
      if (!f || !f.required) return;
      requireField(form, n, f.label);
    });
  });
}

function initSignupWizard(): void {
  const form = document.getElementById('signup-form') as HTMLFormElement | null;
  if (!form) return;

  const steps = [1, 2, 3, 4, 5].map((n) => form.querySelector<HTMLElement>(`[data-wiz-step="${n}"]`));
  const detailsEl = form.querySelector<HTMLElement>('[data-role-details]');
  const titleEl = form.querySelector<HTMLElement>('[data-wiz-title]');
  const submitBtn = form.querySelector<HTMLButtonElement>('[data-step5-submit]');
  let role: SignupRole = 'farmer';

  const WIZ_TITLES: Record<number, string> = { 1: 'Choose your role', 2: 'Personal information', 3: 'Contact details', 5: 'Consent & documents' };
  const dots = () => form.querySelectorAll<HTMLElement>('[data-step-dot]');
  const lines = () => form.querySelectorAll<HTMLElement>('[data-step-line]');

  let currentStep = 1;
  let saveTimer: number | null = null;
  const scheduleSave = (): void => {
    if (saveTimer) window.clearTimeout(saveTimer);
    saveTimer = window.setTimeout(() => {
      saveDraft(collectDraft(form, role, currentStep));
    }, 250);
  };

  const goTo = (target: number): void => {
    if (target === 1) setBackdrop(null);
    steps.forEach((step, i) => {
      if (step) step.hidden = i + 1 !== target;
    });
    dots().forEach((dot, i) => {
      const n = i + 1;
      dot.classList.toggle('active', n === target);
      dot.classList.toggle('done', n < target);
    });
    lines().forEach((line, i) => {
      line.classList.toggle('done', i + 1 < target);
    });
    if (titleEl) titleEl.textContent = target === 4 ? ROLE_DETAILS[role].title : (WIZ_TITLES[target] || '');
    currentStep = target;
    hideAuthError();
    if (target === 5) refreshGate();
    scheduleSave();
    titleEl?.focus({ preventScroll: true });
  };

  signupReset = () => {
    role = 'farmer';
    form.querySelectorAll<HTMLElement>('[data-signup-role]').forEach((c) => c.classList.remove('selected'));
    goTo(1);
  };

  const requiredChips = (name: string, label: string): boolean => {
    const checked = form.querySelectorAll<HTMLInputElement>(`[name="${name}"]:checked`);
    if (!checked.length) {
      msgFor(form, name).err(`Select at least one ${label.toLowerCase()}.`);
      return false;
    }
    msgFor(form, name).clear();
    return true;
  };

  const validateStep = (n: number): boolean => {
    let ok = true;
    if (n === 1) {
      if (!role) {
        msgFor(form, 'role').err('Please choose an account type.');
        ok = false;
      } else {
        msgFor(form, 'role').clear();
      }
    } else if (n === 2) {
      ok = requireField(form, 'firstName', 'First name') && ok;
      ok = requireField(form, 'surname', 'Surname') && ok;
      ok = requireField(form, 'dob', 'Date of birth') && ok;
      ok = requireField(form, 'gender', 'Gender') && ok;
      ok = requireField(form, 'idType', 'ID type') && ok;
      ok = requireField(form, 'idNumber', 'ID number') && ok;
      const dob = (form.elements.namedItem('dob') as HTMLInputElement | null)?.value || '';
      if (dob) {
        const d = new Date(dob);
        if (isNaN(d.getTime()) || d >= new Date()) {
          markInput(form, 'dob', 'err');
          msgFor(form, 'dob').err('Enter a valid date in the past.');
          ok = false;
        }
      }
    } else if (n === 3) {
      ok = requireField(form, 'address1', 'Address line 1') && ok;
      ok = requireField(form, 'city', 'City') && ok;
      ok = requireField(form, 'province', 'Province') && ok;

      const phone = (form.elements.namedItem('phone') as HTMLInputElement | null)?.value.trim() || '';
      if (!phone) { markInput(form, 'phone', 'err'); msgFor(form, 'phone').err('Mobile number is required.'); ok = false; }
      else if (!PHONE_RE.test(phone)) { markInput(form, 'phone', 'err'); msgFor(form, 'phone').err('Use a valid ZW number, e.g. +263 77 000 0000.'); ok = false; }
      else { markInput(form, 'phone', 'ok'); msgFor(form, 'phone').ok(''); }

      const email = (form.elements.namedItem('email') as HTMLInputElement | null)?.value.trim() || '';
      if (!email) { markInput(form, 'email', 'err'); msgFor(form, 'email').err('Email is required.'); ok = false; }
      else if (!EMAIL_RE.test(email)) { markInput(form, 'email', 'err'); msgFor(form, 'email').err('Enter a valid email address.'); ok = false; }
      else { markInput(form, 'email', 'ok'); msgFor(form, 'email').ok(''); }

      const password = (form.elements.namedItem('password') as HTMLInputElement | null)?.value || '';
      const confirm = (form.elements.namedItem('confirm') as HTMLInputElement | null)?.value || '';
      if (!password) { markInput(form, 'password', 'err'); msgFor(form, 'password').err('Password is required.'); ok = false; }
      else if (!isPasswordStrongEnough(password)) { markInput(form, 'password', 'err'); msgFor(form, 'password').err('Password is too weak — aim for 8+ characters with a mix of cases, numbers and symbols.'); ok = false; }
      else {
        const fName = (form.elements.namedItem('firstName') as HTMLInputElement | null)?.value.trim() || '';
        const sName = (form.elements.namedItem('surname') as HTMLInputElement | null)?.value.trim() || '';
        if (passwordContainsPersonalInfo(password, email, [fName, sName])) {
          markInput(form, 'password', 'err');
          msgFor(form, 'password').err('Password is too similar to your name or email. Please pick something different.');
          ok = false;
        } else { markInput(form, 'password', 'ok'); msgFor(form, 'password').ok(''); }
      }

      if (!confirm) { markInput(form, 'confirm', 'err'); msgFor(form, 'confirm').err('Please confirm your password.'); ok = false; }
      else if (confirm !== password) { markInput(form, 'confirm', 'err'); msgFor(form, 'confirm').err('Passwords do not match.'); ok = false; }
      else { markInput(form, 'confirm', 'ok'); msgFor(form, 'confirm').ok(''); }
    } else if (n === 4) {
      ROLE_DETAILS[role].fields.forEach((f) => {
        if (f.required) {
          if (f.type === 'multiselect') ok = requiredChips(f.name, f.label) && ok;
          else ok = requireField(form, f.name, f.label) && ok;
        }
      });
    } else if (n === 5) {
      const consents = ['trading', 'analytics', 'terms'];
      if (!consents.every((c) => (form.querySelector<HTMLInputElement>(`[data-consent="${c}"]`))?.checked)) {
        msgFor(form, 'consent').err('Please accept all consent statements before submitting.');
        ok = false;
      } else {
        msgFor(form, 'consent').clear();
      }
      ['id', 'residence'].forEach((d) => {
        const input = form.querySelector<HTMLInputElement>(`[data-doc-input="${d}"]`);
        if (!input?.files?.length) { msgFor(form, `doc-${d}`).err('This document is required.'); ok = false; }
        else msgFor(form, `doc-${d}`).clear();
      });
    }
    return ok;
  };

  const refreshGate = (): void => {
    if (!submitBtn) return;
    const consents = ['trading', 'analytics', 'terms'];
    const consOk = consents.every((c) => (form.querySelector<HTMLInputElement>(`[data-consent="${c}"]`))?.checked);
    const docsOk = ['id', 'residence'].every((d) => (form.querySelector<HTMLInputElement>(`[data-doc-input="${d}"]`))?.files?.length);
    submitBtn.disabled = !(consOk && docsOk);
  };

  form.querySelectorAll<HTMLElement>('[data-wiz-next]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const n = Number(btn.dataset.wizNext);
      if (!validateStep(n)) return;
      if (n === 3) {
        const pw = (form.elements.namedItem('password') as HTMLInputElement | null)?.value || '';
        if (pw && isPasswordStrongEnough(pw) && await isPasswordBreached(pw)) {
          markInput(form, 'password', 'err');
          msgFor(form, 'password').err('This password has appeared in a data breach. Please choose a different one.');
          return;
        }
      }
      if (n === 3 && detailsEl) {
        renderRoleDetails(detailsEl, form, role);
        const draft = loadDraft();
        if (draft) applyDraftValues(form, draft.values);
      }
      goTo(n + 1);
    });
  });

  form.querySelectorAll<HTMLElement>('[data-wiz-back]').forEach((btn) => {
    btn.addEventListener('click', () => {
      goTo(Number(btn.dataset.wizBack) - 1);
    });
  });

  form.querySelectorAll<HTMLElement>('[data-signup-role]').forEach((card) => {
    card.addEventListener('click', () => {
      role = card.dataset.signupRole as SignupRole;
      setBackdrop(role);
      form.querySelectorAll<HTMLElement>('[data-signup-role]').forEach((c) => {
        c.classList.toggle('selected', c === card);
      });
      msgFor(form, 'role').clear();
    });
  });

  const pwInput = form.elements.namedItem('password') as HTMLInputElement | null;
  pwInput?.addEventListener('input', () => {
    updatePasswordMeter(form, pwInput.value);
    markInput(form, 'password', 'clear');
    msgFor(form, 'password').clear();
  });
  let breachTimer = 0;
  pwInput?.addEventListener('blur', () => {
    window.clearTimeout(breachTimer);
    const v = pwInput.value;
    breachTimer = window.setTimeout(() => {
      if (!v || !isPasswordStrongEnough(v)) return;
      void isPasswordBreached(v).then((blocked) => {
        if (blocked && pwInput.value === v) {
          markInput(form, 'password', 'err');
          msgFor(form, 'password').err('This password has appeared in a data breach. Please choose a different one.');
        }
      });
    }, 500);
  });

  Object.keys(SIGNUP_FIELD_RULES).forEach((name) => {
    const el = form.elements.namedItem(name);
    if (el instanceof HTMLElement) el.addEventListener('blur', () => validateSignupField(form, name));
  });

  form.addEventListener('input', scheduleSave);
  form.addEventListener('change', scheduleSave);

  form.querySelectorAll<HTMLInputElement>('[data-consent]').forEach((c) => c.addEventListener('change', refreshGate));

  form.querySelectorAll<HTMLInputElement>('[data-doc-input]').forEach((input) => {
    input.addEventListener('change', () => {
      const key = input.dataset.docInput || '';
      const state = form.querySelector<HTMLElement>(`[data-doc-state="${key}"]`);
      const msg = form.querySelector<HTMLElement>(`[data-msg-for="doc-${key}"]`);
      const file = input.files?.[0];
      const err = file ? validateDocument(file) : '';
      if (state) state.textContent = file ? `${file.name} (${fmtSize(file.size)})` : 'No file selected';
      if (msg) { msg.textContent = err; msg.className = err ? 'auth-msg err' : 'auth-msg'; }
      refreshGate();
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAuthError();
    if (!validateStep(5)) return;

    const password = (form.elements.namedItem('password') as HTMLInputElement | null)?.value || '';
    if (password && isPasswordStrongEnough(password) && await isPasswordBreached(password)) {
      showAuthError('This password has appeared in a data breach. Go back and choose a different one.');
      goTo(3);
      return;
    }

    const firstName = (form.elements.namedItem('firstName') as HTMLInputElement | null)?.value.trim() || '';
    const surname = (form.elements.namedItem('surname') as HTMLInputElement | null)?.value.trim() || '';
    const email = (form.elements.namedItem('email') as HTMLInputElement | null)?.value.trim() || '';
    const fullName = `${firstName} ${surname}`.trim();

    const meta: SignupMetadata = {};
    ['title', 'initials', 'middleName', 'dob', 'gender', 'idType', 'idNumber', 'nationality',
     'address1', 'address2', 'city', 'province', 'country', 'telephone', 'phone'].forEach((name) => {
      const v = (form.elements.namedItem(name) as HTMLInputElement | null)?.value.trim() || '';
      if (v) meta[name] = v;
    });

    ROLE_DETAILS[role].fields.forEach((f) => {
      if (f.type === 'multiselect') {
        const values = Array.from(form.querySelectorAll<HTMLInputElement>(`[name="${f.name}"]:checked`)).map((c) => c.value);
        if (values.length) meta[f.name] = values;
      } else {
        const v = (form.elements.namedItem(f.name) as HTMLInputElement | null)?.value.trim() || '';
        if (v) meta[f.name] = v;
      }
    });

    const fileDesc = (key: string): { name: string; size: number; type: string } | null => {
      const file = form.querySelector<HTMLInputElement>(`[data-doc-input="${key}"]`)?.files?.[0];
      return file ? { name: file.name, size: file.size, type: file.type } : null;
    };
    meta.documents = { id: fileDesc('id'), residence: fileDesc('residence'), extra: fileDesc('extra') };
    meta.consent = { trading: true, analytics: true, terms: true };

    setBusy(submitBtn, true);
    try {
      const result = await register(email, password, fullName, role, meta);
      if (result.ok) {
        clearDraft();
        redirectToDashboard(getAuthState().role || role);
        return;
      }
      if (result.action === 'sign-in') {
        showAuthError(result.error || 'This email is already registered.', { label: 'Sign in instead', run: () => switchPanel('login') });
        return;
      }
      if (result.needsConfirmation) {
        clearDraft();
        const verifyEmail = document.getElementById('verify-email');
        if (verifyEmail) verifyEmail.textContent = email;
        switchPanel('verify');
        return;
      }
      showAuthError(result.error || 'Sign-up failed. Please try again.');
    } catch (err) {
      showAuthError(signupError(err instanceof Error ? err.message : 'Sign-up failed. Please try again.').message);
    } finally {
      setBusy(submitBtn, false);
    }
  });

  refreshGate();

  const draft = loadDraft();
  if (draft && ROLE_DETAILS[draft.role]) {
    role = draft.role;
    form.querySelectorAll<HTMLElement>('[data-signup-role]').forEach((c) => {
      c.classList.toggle('selected', c.dataset.signupRole === role);
    });
    applyDraftValues(form, draft.values);
    goTo(Math.min(Math.max(draft.step, 1), 5));
  }
}

/* ---------- Verification screen ---------- */

function initVerifyPanel(): void {
  document.querySelectorAll<HTMLElement>('[data-action="resend"]').forEach((el) => {
    el.addEventListener('click', async () => {
      const email = document.getElementById('verify-email')?.textContent?.trim() || '';
      if (!email) return;
      const btn = el as HTMLButtonElement;
      setBusy(btn, true);
      try {
        await resendEmailVerification(email);
        await logAuthEvent({ event_type: 'verification_resend', email });
        showAuthError('Verification email resent — check your inbox.');
      } catch (err) {
        showAuthError(resendError(err instanceof Error ? err.message : 'Could not resend the email.'));
      } finally {
        setBusy(btn, false);
      }
    });
  });
}

/* ---------- Forgot password ---------- */

function initForgotForm(): void {
  const form = document.getElementById('forgot-form') as HTMLFormElement | null;
  if (!form) return;

  const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAuthError();
    const email = (form.elements.namedItem('email') as HTMLInputElement | null)?.value.trim() || '';
    if (!EMAIL_RE.test(email)) {
      markInput(form, 'email', 'err');
      msgFor(form, 'email').err('Enter a valid email address.');
      return;
    }
    markInput(form, 'email', 'ok');
    msgFor(form, 'email').clear();

    setBusy(submit, true);
    try {
      await requestPasswordReset(email);
      await logAuthEvent({ event_type: 'password_reset_sent', email });
      showAuthError('Reset link sent — check your inbox.');
    } catch (err) {
      showAuthError(resetError(err instanceof Error ? err.message : 'Could not send reset link. Please try again.'));
    } finally {
      setBusy(submit, false);
    }
  });
}

/* ---------- Tabs & password toggles ---------- */

function initAuthTabs(): void {
  const tabs = document.querySelectorAll<HTMLElement>('[data-auth-tab]');
  if (!tabs.length) return;

  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      switchPanel(tab.dataset.authTab || '');
    });
  });

  const tabList = tabs[0]?.parentElement;
  tabList?.addEventListener('keydown', (e) => {
    const list = Array.from(tabs);
    const visible = document.querySelector<HTMLElement>('[data-auth-panel]:not([hidden])');
    const idx = list.findIndex((t) => t.dataset.authTab === visible?.dataset.authPanel);
    let next = -1;
    if (e.key === 'ArrowRight') next = (idx + 1) % list.length;
    else if (e.key === 'ArrowLeft') next = (idx - 1 + list.length) % list.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = list.length - 1;
    if (next >= 0) {
      e.preventDefault();
      const target = list[next].dataset.authTab || '';
      switchPanel(target);
      list[next].focus();
    }
  });

  document.querySelectorAll<HTMLElement>('[data-action="forgot"]').forEach((el) => {
    el.addEventListener('click', () => {
      switchPanel('forgot');
      tabs.forEach((t) => {
        const active = t.dataset.authTab === 'login';
        t.classList.toggle('active', active);
        t.setAttribute('aria-selected', String(active));
      });
    });
  });

  document.querySelectorAll<HTMLElement>('[data-action="back-to-login"]').forEach((el) => {
    el.addEventListener('click', () => switchPanel('login'));
  });
}

function initPasswordToggles(): void {
  document.querySelectorAll<HTMLElement>('[data-toggle-for]').forEach((toggle) => {
    toggle.addEventListener('click', () => {
      const input = document.getElementById(toggle.dataset.toggleFor || '') as HTMLInputElement | null;
      if (!input) return;
      const show = input.type === 'password';
      input.type = show ? 'text' : 'password';
      toggle.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });
  });
}

export function initAuthUI(): void {
  initLoginForm();
  initSignupWizard();
  initVerifyPanel();
  initForgotForm();
  initAuthTabs();
  initPasswordToggles();
  initCapsLockDetection();
  initPasswordGenerator();
  initMfaPanel();
  initOAuth();
}

export async function signOutAndRedirect(): Promise<void> {
  const { logout } = await import('./auth');
  const { getLiveAccount } = await import('./zvida-live');
  const { broadcastLogout } = await import('./realtime');
  void broadcastLogout(getLiveAccount()?.id || '');
  try {
    await logout();
  } catch {
    /* ignore — still redirect */
  }
  window.location.href = '/login.html';
}
