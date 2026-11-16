import { brandVariables, type BrandColors } from './color';

// Two separate things live here:
//  1. The appearance choice: System, Light or Dark. Kept in localStorage for the first paint on this device, and on
//     the patient's account (PUT /session/preferences) so it follows them to the portal and other devices.
//  2. The hospital's colours, read from GET /api/hospital (the same branding the Patient 360 portal uses), adjusted for
//     contrast in each appearance, and applied as the --p360-* CSS variables that index.css turns into --theme-*.

export type ThemeChoice = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

export const THEMES: readonly ThemeChoice[] = ['system', 'light', 'dark'];
export const THEME_KEY = 'carejourney.theme';
// Set when a choice could not be saved to the account (offline). The next /me then saves this device's choice
// instead of taking the account's.
export const THEME_UNSYNCED_KEY = 'carejourney.theme.unsynced';
export const DARK_QUERY = '(prefers-color-scheme: dark)';

export const isTheme = (v: unknown): v is ThemeChoice => THEMES.includes(v as ThemeChoice);

export const resolveTheme = (choice: ThemeChoice, prefersDark: boolean): ResolvedTheme =>
  choice === 'dark' || (choice === 'system' && prefersDark) ? 'dark' : 'light';

export function readStoredTheme(): ThemeChoice {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return isTheme(v) ? v : 'system';
  } catch {
    return 'system';
  }
}

export function storeTheme(choice: ThemeChoice, unsynced: boolean) {
  try {
    localStorage.setItem(THEME_KEY, choice);
    if (unsynced) localStorage.setItem(THEME_UNSYNCED_KEY, '1');
    else localStorage.removeItem(THEME_UNSYNCED_KEY);
  } catch {
    /* storage blocked: the choice still applies for this visit */
  }
}

export function isUnsynced(): boolean {
  try {
    return localStorage.getItem(THEME_UNSYNCED_KEY) === '1';
  } catch {
    return false;
  }
}

const TOOLBAR = { light: '#F4F7FA', dark: '#262624' } as const;

/** Sets data-theme on <html> and matches the browser toolbar (and the installed app's title bar) to the page. */
export function applyTheme(choice: ThemeChoice): ResolvedTheme {
  const resolved = resolveTheme(choice, window.matchMedia(DARK_QUERY).matches);
  const root = document.documentElement;
  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;
  const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (meta) meta.content = TOOLBAR[resolved];
  return resolved;
}

// ─── Hospital colours ───

const HEX = /^#[0-9a-fA-F]{6}$/;
const hex = (v: unknown) => (typeof v === 'string' && HEX.test(v) ? v : null);

const BRAND_KEY = 'carejourney.brand';
const CONTACT_KEY = 'carejourney.contact';

/** How a patient reaches the care coordinator. The bot is the WhatsApp number (the API's WHATSAPP_BOT_PHONE). */
export interface Contact {
  botPhone: string | null;
  supportPhone: string | null;
  supportEmail: string | null;
}

const NO_CONTACT: Contact = { botPhone: null, supportPhone: null, supportEmail: null };
const phone = (v: unknown) => (typeof v === 'string' && /^\+?[0-9 ()-]{10,20}$/.test(v.trim()) ? v.trim() : null);
const email = (v: unknown) => (typeof v === 'string' && /^[^\s@<>"]{1,64}@[^\s@<>"]{1,200}$/.test(v.trim()) ? v.trim() : null);

export const parseContact = (raw: unknown): Contact => {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return { botPhone: phone(r.botPhone), supportPhone: phone(r.supportPhone), supportEmail: email(r.supportEmail) };
};

export const readCachedContact = (): Contact => {
  try {
    const raw = localStorage.getItem(CONTACT_KEY);
    return raw ? parseContact(JSON.parse(raw)) : NO_CONTACT;
  } catch {
    return NO_CONTACT;
  }
};

export const cacheContact = (c: Contact) => {
  try {
    localStorage.setItem(CONTACT_KEY, JSON.stringify(c));
  } catch {
    /* it just loads from the API next time */
  }
};

/** "+91 97415 91777" for an Indian number, otherwise the number as given. */
export const formatPhone = (p: string): string => {
  const d = p.replace(/\D/g, '');
  const local = d.length === 12 && d.startsWith('91') ? d.slice(2) : d.length === 10 ? d : null;
  return local ? `+91 ${local.slice(0, 5)} ${local.slice(5)}` : p;
};

const LOGOS_KEY = 'carejourney.logos';

export interface Logos {
  /** For light backgrounds. */
  dark: string | null;
  /** For coloured backgrounds (white). */
  light: string | null;
}

// A logo only ever loads from the API's own logo route, whatever the API or the cache hands us.
const LOGO_PATH = /^\/api\/hospital\/logo\/(default|light)\?v=[0-9a-f]{12}$/;
const logo = (v: unknown) => (typeof v === 'string' && LOGO_PATH.test(v) ? v : null);

export const parseLogos = (raw: unknown): Logos => {
  const r = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {};
  return { dark: logo(r.logoUrl), light: logo(r.logoLightUrl) };
};

export const readCachedLogos = (): Logos => {
  try {
    const raw = localStorage.getItem(LOGOS_KEY);
    const l = raw ? JSON.parse(raw) : {};
    return { dark: logo(l?.dark), light: logo(l?.light) };
  } catch {
    return { dark: null, light: null };
  }
};

export const cacheLogos = (l: Logos) => {
  try {
    localStorage.setItem(LOGOS_KEY, JSON.stringify(l));
  } catch {
    /* it just loads from the API next time */
  }
};

/** Only six-digit hex colours get through, so nothing but a colour can ever reach a CSS variable. */
export function parseBrand(raw: unknown): BrandColors | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  return {
    primaryColor: hex(r.primaryColor),
    primaryColorDark: hex(r.primaryColorDark),
    secondaryColor: hex(r.secondaryColor),
    accentColor: hex(r.accentColor),
  };
}

export const readCachedBrand = (): BrandColors | null => {
  try {
    const raw = localStorage.getItem(BRAND_KEY);
    return raw ? parseBrand(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
};

export const cacheBrand = (b: BrandColors) => {
  try {
    localStorage.setItem(BRAND_KEY, JSON.stringify(b));
  } catch {
    /* the colours just load from the API next time */
  }
};

/** The .env colours, used only when the hospital has not set its own. */
const envBrand = (): BrandColors => {
  const env = (import.meta as any).env || {};
  return { primaryColor: hex(env.VITE_THEME_PRIMARY), primaryColorDark: null, secondaryColor: null, accentColor: hex(env.VITE_THEME_ACCENT) };
};

/** Applies the hospital's colours, adjusted for contrast, as the --p360-* variables index.css reads. */
export function applyBrand(brand: BrandColors | null) {
  const b = brand?.primaryColor ? brand : envBrand();
  const root = document.documentElement.style;
  for (const [name, value] of Object.entries(brandVariables(b))) {
    if (value) root.setProperty(name, value);
    else root.removeProperty(name);
  }
  if (b.accentColor) root.setProperty('--p360-accent', b.accentColor);
  else root.removeProperty('--p360-accent');
}

export interface ThemeConfig {
  hospitalName: string;
  whatsappNumber: string;
}

export const getThemeConfig = (): ThemeConfig => {
  const env = (import.meta as any).env || {};
  return {
    hospitalName: env.VITE_HOSPITAL_NAME || 'Ovum Woman & Child Speciality Hospitals',
    whatsappNumber: env.VITE_WHATSAPP_NUMBER || '919686909236',
  };
};
