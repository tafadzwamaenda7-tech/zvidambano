/* UI language + display currency.
   English/Shona/Ndebele chrome translations (t) and a USD-based display
   formatter (money). Settings pages persist the choice; boot() applies it.
   Keys without a translation fall back to the English source string. */

const state: { lang: string; currency: string } = { lang: 'English', currency: 'USD ($)' };

const DICT: Record<string, { sn: string; nd: string }> = {
  Today: { sn: 'Nhasi', nd: 'Namuhla' },
  Sell: { sn: 'Tengesa', nd: 'Dayisa' },
  Buy: { sn: 'Tenga', nd: 'Thenga' },
  Shop: { sn: 'Chitoro', nd: 'Isitolo' },
  Cart: { sn: 'Bhogi', nd: 'Ibhogi' },
  Checkout: { sn: 'Kubhadhara', nd: 'Ukubhadala' },
  Orders: { sn: 'Maodha', nd: 'Izilayivo' },
  Contracts: { sn: 'Zvibvumirano', nd: 'Izivumelwano' },
  Deliveries: { sn: 'Kusvitsa', nd: 'Ukulethwa' },
  Finance: { sn: 'Mari', nd: 'Imali' },
  Settings: { sn: 'Zvirongwa', nd: 'Izilungiselelo' },
  Support: { sn: 'Rutsigiro', nd: 'Usizo' },
  Documents: { sn: 'Magwaro', nd: 'Imibhalo' },
  Farm: { sn: 'Purazi', nd: 'Ipulazi' },
  Performance: { sn: 'Mabasa', nd: 'Imisebenzi' },
  Messages: { sn: 'Mameseji', nd: 'Imilayezo' },
  Quality: { sn: 'Hunhu', nd: 'Umgangatho' },
  Warehouse: { sn: 'Dura', nd: 'Isigcinala' },
  Inbox: { sn: 'Mhombo', nd: 'Ibhokisi lemilayezo' },
  Tickets: { sn: 'Matikiti', nd: 'Amathikithi' },
  Users: { sn: 'Vashandisi', nd: 'Abasebenzisi' },
  Disputes: { sn: 'Kupokana', nd: 'Izingxabano' },
  Reports: { sn: 'Mishumo', nd: 'Imibiko' },
  Inventory: { sn: 'Zviripo', nd: 'Impahla' },
  Listings: { sn: 'Zvakanyorwa', nd: 'Izimemezo' },
  Dispatch: { sn: 'Kutumira', nd: 'Ukuthumela' },
  Earnings: { sn: 'Zvibhadharo', nd: 'Iholo' },
  Weighbridge: { sn: 'Chikero', nd: 'Isikali' },
  'My Trips': { sn: 'Marwendo Angu', nd: 'Uhambo Lwami' },
  'Control Tower': { sn: 'Nzvimbo Yekudzora', nd: 'Indlu Yokulawula' },
  'Freight Ops': { sn: 'Kutakura', nd: 'Ukuthutha' },
  Matches: { sn: 'Zvakabatana', nd: 'Okufanayo' },
  Payments: { sn: 'Kubhadhara', nd: 'Ukubhadala' },
  Notifications: { sn: 'Zviziviso', nd: 'Izaziso' },
  'Mark all read': { sn: 'Maka zvese zvakaverengwa', nd: 'Maka konke ukuthi kufundiwe' },
  'View all notifications': { sn: 'Ona zviziviso zvese', nd: 'Bona zonke izaziso' },
  'Sign out': { sn: 'Budira', nd: 'Phuma' },
  Menu: { sn: 'Menu', nd: 'Imenyu' },
};

const SYMBOL: Record<string, string> = { 'USD ($)': '$', 'ZiG (ZWL)': 'Z$', 'ZAR (R)': 'R' };

const ZIG_PER_USD = 26;
const ZAR_PER_USD = 18.5;

export function setUi(lang: string, currency: string): void {
  state.lang = lang || 'English';
  state.currency = currency || 'USD ($)';
}

export function uiLang(): string {
  return state.lang;
}

export function uiCurrency(): string {
  return state.currency;
}

export function t(key: string): string {
  const row = DICT[key];
  if (!row) return key;
  return state.lang === 'Shona' ? row.sn : state.lang === 'Ndebele' ? row.nd : key;
}

export function money(usd: number): string {
  const sym = SYMBOL[state.currency] || '$';
  const rate = state.currency === 'ZiG (ZWL)' ? ZIG_PER_USD : state.currency === 'ZAR (R)' ? ZAR_PER_USD : 1;
  const v = Math.max(0, usd) * rate;
  return sym + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
