const ICONS = {
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
  alert: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  spinner: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2a10 10 0 0 1 10 10"/></svg>',
};

/* ---- Toast ---- */
class Toast {
  private wrap: HTMLDivElement;

  constructor() {
    this.wrap = document.createElement('div');
    this.wrap.className = 'ds-toast-wrap';
    document.body.appendChild(this.wrap);
  }

  show(type: 'success' | 'error' | 'warning' | 'info', title: string, desc?: string, ms?: number) {
    const el = document.createElement('div');
    el.className = `ds-toast ${type}`;
    el.innerHTML = `
      <div class="ds-toast-dot">${ICONS[type === 'success' ? 'check' : type === 'error' ? 'x' : 'alert']}</div>
      <div class="ds-toast-body">
        <div class="ds-toast-title">${title}</div>
        ${desc ? `<div class="ds-toast-desc">${desc}</div>` : ''}
      </div>
      <button class="ds-toast-x">${ICONS.x}</button>
    `;
    (el.querySelector('.ds-toast-x') as HTMLButtonElement).onclick = () => dismiss();
    this.wrap.appendChild(el);

    const timer = setTimeout(dismiss, ms ?? (type === 'error' ? 5000 : 3500));
    function dismiss() {
      clearTimeout(timer);
      el.classList.add('out');
      setTimeout(() => el.remove(), 250);
    }
  }

  success(t: string, d?: string) { this.show('success', t, d); }
  error(t: string, d?: string)   { this.show('error', t, d); }
  warning(t: string, d?: string) { this.show('warning', t, d); }
  info(t: string, d?: string)    { this.show('info', t, d); }
}

export const toast = new Toast();

/* ---- Form validation ---- */
interface Rule { test: (v: string) => boolean; msg: string }

export class FormValidator {
  private form: HTMLFormElement;
  private fields = new Map<string, Rule[]>();
  private submitBtn: HTMLButtonElement | null;
  private hint: HTMLDivElement | null;

  constructor(form: HTMLFormElement) {
    this.form = form;
    this.submitBtn = form.querySelector('[type="submit"]');
    this.hint = null;
    if (this.submitBtn) {
      this.submitBtn.disabled = true;
      this.hint = document.createElement('div');
      this.hint.className = 'ds-hint';
      this.hint.textContent = 'Fill all fields correctly to continue';
      this.submitBtn.parentElement!.appendChild(this.hint);
    }
  }

  field(name: string, rules: Rule[]): this {
    this.fields.set(name, rules);
    const input = this.form.querySelector(`[name="${name}"]`) as HTMLInputElement;
    if (!input) return this;
    input.addEventListener('input', () => this.check(name));
    input.addEventListener('blur', () => this.check(name));
    return this;
  }

  private check(name: string) {
    const rules = this.fields.get(name)!;
    const input = this.form.querySelector(`[name="${name}"]`) as HTMLInputElement;
    const group = input?.closest('.ds-field') as HTMLElement;
    const msg = group?.querySelector('.ds-msg') as HTMLElement;
    if (!group || !msg) return;

    const v = input.value.trim();
    if (!v) {
      group.classList.remove('valid', 'error');
      msg.textContent = '';
      msg.className = 'ds-msg';
      this.sync();
      return;
    }

    const fail = rules.find(r => !r.test(v));
    group.classList.toggle('error', !!fail);
    group.classList.toggle('valid', !fail);
    msg.className = fail ? 'ds-msg error' : 'ds-msg ok';
    msg.textContent = fail ? fail.msg : '';
    this.sync();
  }

  private sync() {
    if (!this.submitBtn || !this.hint) return;
    let ok = 0;
    this.fields.forEach((rules, name) => {
      const input = this.form.querySelector(`[name="${name}"]`) as HTMLInputElement;
      const v = input?.value.trim();
      if (v && rules.every(r => r.test(v))) ok++;
    });
    const remaining = this.fields.size - ok;
    this.submitBtn.disabled = remaining > 0;
    this.hint.textContent = remaining > 0
      ? `${remaining} field${remaining > 1 ? 's' : ''} remaining`
      : 'All fields valid';
    this.hint.style.color = remaining > 0 ? '' : 'var(--ds-green)';
  }

  reset() {
    this.fields.forEach((_, name) => {
      const input = this.form.querySelector(`[name="${name}"]`) as HTMLInputElement;
      if (input) input.value = '';
      const group = input?.closest('.ds-field') as HTMLElement;
      group?.classList.remove('valid', 'error');
      const msg = group?.querySelector('.ds-msg');
      if (msg) { msg.textContent = ''; msg.className = 'ds-msg'; }
    });
    if (this.submitBtn) this.submitBtn.disabled = true;
    if (this.hint) { this.hint.textContent = 'Fill all fields correctly to continue'; this.hint.style.color = ''; }
  }
}

/* ---- Modals ---- */
export function openModal(id: string) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
}

export function closeModal(id: string) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
}

export function initModals() {
  document.querySelectorAll<HTMLElement>('.ds-overlay').forEach(ov => {
    ov.addEventListener('click', e => { if (e.target === ov) closeModal(ov.id); });
    ov.querySelector('.ds-dialog-x')?.addEventListener('click', () => closeModal(ov.id));
  });
  document.querySelectorAll<HTMLElement>('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => { const id = btn.dataset.modal; if (id) openModal(id); });
  });
}

/* ---- Init ---- */
export function initDesignSystem() {
  initModals();
}
