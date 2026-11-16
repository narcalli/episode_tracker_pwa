import React, { createContext, useCallback, useContext, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { api } from '../lib/api';
import {
  applyBrand,
  applyTheme,
  cacheContact,
  cacheLogos,
  cacheBrand,
  DARK_QUERY,
  isTheme,
  isUnsynced,
  parseContact,
  parseLogos,
  readCachedLogos,
  type Contact,
  type Logos,
  parseBrand,
  readCachedContact,
  readCachedBrand,
  readStoredTheme,
  storeTheme,
  type ResolvedTheme,
  type ThemeChoice
} from '../utils/theme';

interface ThemeState {
  choice: ThemeChoice;
  resolved: ResolvedTheme;
  /** How to reach the care coordinator, from the same /hospital call that carries the colours. */
  contact: Contact;
  /** The hospital's logo files (paths on the API), for the sign-in header. */
  logos: Logos;
  setChoice: (choice: ThemeChoice) => void;
  /** Called with the account's saved appearance after /me: adopts it, or saves this device's choice if that is newer. */
  syncFromAccount: (accountTheme: unknown) => void;
}

const ThemeContext = createContext<ThemeState | null>(null);

/** Saves to the account; a failure (offline) leaves the choice to be saved on the next /me. */
function saveToAccount(choice: ThemeChoice) {
  api
    .put('/session/preferences', { theme: choice })
    .then(() => storeTheme(choice, false))
    .catch(() => storeTheme(choice, true));
}

/** Light, dark or follow the device, and the hospital's colours. Wraps the whole app, so the sign-in screens match too. */
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [choice, setChoiceState] = useState<ThemeChoice>(readStoredTheme);
  const [resolved, setResolved] = useState<ResolvedTheme>('light');
  const [contact, setContact] = useState<Contact>(readCachedContact);
  const [logos, setLogos] = useState<Logos>(readCachedLogos);
  const choiceRef = useRef(choice);
  choiceRef.current = choice;

  // Before paint. The inline script in index.html already set data-theme; this keeps it and the toolbar in step.
  useLayoutEffect(() => setResolved(applyTheme(choice)), [choice]);

  // "System" follows the device live, e.g. when the phone goes dark at sunset.
  useEffect(() => {
    if (choice !== 'system') return;
    const mq = window.matchMedia(DARK_QUERY);
    const onChange = () => setResolved(applyTheme('system'));
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [choice]);

  // The hospital's colours: the last ones seen first (no flash on a repeat visit), then the API's.
  useLayoutEffect(() => {
    applyBrand(readCachedBrand());
  }, []);
  useEffect(() => {
    api
      .get<unknown>('/hospital')
      .then((raw) => {
        const c = parseContact(raw);
        setContact(c);
        cacheContact(c);
        const l = parseLogos(raw);
        setLogos(l);
        cacheLogos(l);
        const brand = parseBrand(raw);
        if (!brand) return;
        applyBrand(brand);
        cacheBrand(brand);
      })
      .catch(() => undefined);
  }, []);

  const setChoice = useCallback((next: ThemeChoice) => {
    storeTheme(next, true);
    setChoiceState(next);
    saveToAccount(next);
  }, []);

  const syncFromAccount = useCallback((accountTheme: unknown) => {
    if (!isTheme(accountTheme)) return;
    if (isUnsynced()) saveToAccount(choiceRef.current);
    else if (accountTheme !== choiceRef.current) {
      storeTheme(accountTheme, false);
      setChoiceState(accountTheme);
    }
  }, []);

  const value = useMemo(() => ({ choice, resolved, contact, logos, setChoice, syncFromAccount }), [choice, resolved, contact, logos, setChoice, syncFromAccount]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeState => {
  const t = useContext(ThemeContext);
  if (!t) throw new Error('useTheme outside ThemeProvider');
  return t;
};
