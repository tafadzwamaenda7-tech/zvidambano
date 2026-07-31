type SearchResult = { id: number; type: string; title: string; subtitle: string; status?: string };

const typeIcons: Record<string, string> = {
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  commodity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>',
  listing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
  contract: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  delivery: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
  dispute: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  notification: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
  message: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  document: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>',
  price: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>',
  farm: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>',
  input_order: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
  financing: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>',
  equipment: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>'
};

class ZvidaSearch {
  container: HTMLElement;
  input!: HTMLInputElement;
  dropdown!: HTMLElement;
  resultsEl!: HTMLElement;
  footerText!: HTMLElement;
  footerCount!: HTMLElement;
  apiBase = '/api/search';
  isOpen = false;
  query = '';
  results: SearchResult[] = [];
  debounceTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(container: string | HTMLElement) {
    const el = typeof container === 'string' ? document.querySelector<HTMLElement>(container) : container;
    if (!el) throw new Error('Search container not found');
    this.container = el;
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="zs-wrap">
        <div class="zs-input-wrap">
          <svg class="zs-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" class="zs-input" placeholder="Search commodities, contracts, users..." autocomplete="off" spellcheck="false" />
          <kbd class="zs-kbd">ESC</kbd>
        </div>
        <div class="zs-dropdown" hidden>
          <div class="zs-filters">
            <button class="zs-filter active" data-type="">All</button>
            <button class="zs-filter" data-type="users">Users</button>
            <button class="zs-filter" data-type="commodities">Commodities</button>
            <button class="zs-filter" data-type="listings">Listings</button>
            <button class="zs-filter" data-type="contracts">Contracts</button>
            <button class="zs-filter" data-type="deliveries">Deliveries</button>
            <button class="zs-filter" data-type="disputes">Disputes</button>
          </div>
          <div class="zs-results"></div>
          <div class="zs-footer">
            <span class="zs-footer-text">Type 2+ characters to search</span>
            <span class="zs-footer-count"></span>
          </div>
        </div>
      </div>
    `;
    this.input = this.container.querySelector('.zs-input') as HTMLInputElement;
    this.dropdown = this.container.querySelector('.zs-dropdown') as HTMLElement;
    this.resultsEl = this.container.querySelector('.zs-results') as HTMLElement;
    this.footerText = this.container.querySelector('.zs-footer-text') as HTMLElement;
    this.footerCount = this.container.querySelector('.zs-footer-count') as HTMLElement;
  }

  bindEvents() {
    this.input.addEventListener('input', () => {
      this.query = this.input.value.trim();
      if (this.debounceTimer) clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => this.search(), 200);
    });

    this.input.addEventListener('focus', () => {
      if (this.query.length >= 2) this.showDropdown();
    });

    document.addEventListener('click', (e: MouseEvent) => {
      if (!this.container.contains(e.target as Node)) this.hideDropdown();
    });

    this.container.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.key === 'Escape') { this.hideDropdown(); this.input.blur(); }
    });

    this.container.querySelectorAll('.zs-filter').forEach((btn: Element) => {
      btn.addEventListener('click', () => {
        this.container.querySelectorAll('.zs-filter').forEach((b: Element) => b.classList.remove('active'));
        btn.classList.add('active');
        this.search();
      });
    });
  }

  async search() {
    if (this.query.length < 2) {
      this.resultsEl.innerHTML = '';
      this.footerText.textContent = 'Type 2+ characters to search';
      this.footerCount.textContent = '';
      this.hideDropdown();
      return;
    }

    const activeFilter = this.container.querySelector('.zs-filter.active') as HTMLElement | null;
    const type = activeFilter?.dataset.type || '';
    const url = `${this.apiBase}?q=${encodeURIComponent(this.query)}&limit=20${type ? '&type=' + type : ''}`;

    this.footerText.textContent = 'Searching...';
    this.footerCount.textContent = '';
    this.showDropdown();

    try {
      const res = await fetch(url);
      const data = await res.json();
      this.results = data.results;
      this.renderResults(data);
    } catch {
      this.footerText.textContent = 'Search failed. Try again.';
      this.footerCount.textContent = '';
    }
  }

  renderResults(data: { results: SearchResult[]; total: number }) {
    if (data.results.length === 0) {
      this.resultsEl.innerHTML = `
        <div class="zs-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <span>No results for "${this.escapeHtml(this.query)}"</span>
        </div>
      `;
      this.footerText.textContent = '';
      this.footerCount.textContent = '';
      return;
    }

    this.resultsEl.innerHTML = data.results.map((r) => `
      <div class="zs-result" data-type="${r.type}" data-id="${r.id}">
        <div class="zs-result-icon ${r.type}">${typeIcons[r.type] || ''}</div>
        <div class="zs-result-body">
          <div class="zs-result-title">${this.highlight(this.escapeHtml(r.title))}</div>
          <div class="zs-result-subtitle">${this.escapeHtml(r.subtitle)}</div>
        </div>
        ${r.status ? `<span class="zs-result-badge ${r.status.toLowerCase()}">${this.escapeHtml(r.status)}</span>` : ''}
      </div>
    `).join('');

    this.footerText.textContent = '';
    this.footerCount.textContent = `${data.total} result${data.total !== 1 ? 's' : ''}`;
  }

  highlight(text: string): string {
    if (!this.query) return text;
    const regex = new RegExp(`(${this.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  escapeHtml(str: string): string {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  showDropdown() { this.dropdown.hidden = false; this.isOpen = true; }
  hideDropdown() { this.dropdown.hidden = true; this.isOpen = false; }
}

export default ZvidaSearch;
