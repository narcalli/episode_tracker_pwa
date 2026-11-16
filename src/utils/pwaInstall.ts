import { useEffect, useState } from 'react';

// Chrome and Edge fire `beforeinstallprompt` once, early in the page load. The tracker only mounts after sign-in, so a
// listener added there would miss it. This module registers the listener when it is first imported (at startup) and
// keeps the event for whoever needs it later.
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferred: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();
const notify = () => listeners.forEach((fn) => fn());

// "Already installed" has to be known when the patient opens the site in a normal browser tab, not just inside the app.
// Inside the installed app it is certain. Otherwise: Chrome can tell us (getInstalledRelatedApps, which needs
// related_applications in the manifest) and we remember it in localStorage, which a browser tab and the installed app
// on the same origin share. A browser that cannot tell us (Safari) only has what we remembered.
const INSTALLED_KEY = 'carejourney.appInstalled';
const readFlag = () => {
  try {
    return localStorage.getItem(INSTALLED_KEY) === '1';
  } catch {
    return false;
  }
};
const writeFlag = (on: boolean) => {
  try {
    if (on) localStorage.setItem(INSTALLED_KEY, '1');
    else localStorage.removeItem(INSTALLED_KEY);
  } catch {
    /* private mode */
  }
};

/** Running as an installed app (its own window), not in a browser tab. iPhone says so with navigator.standalone. */
export const isStandalone = () =>
  typeof window !== 'undefined' &&
  (['standalone', 'minimal-ui', 'fullscreen', 'window-controls-overlay'].some((m) => window.matchMedia(`(display-mode: ${m})`).matches) ||
    (navigator as any).standalone === true);

let installed = typeof window !== 'undefined' && (isStandalone() || readFlag());
const setInstalled = (on: boolean) => {
  if (installed === on) return;
  installed = on;
  writeFlag(on);
  notify();
};

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferred = e as InstallPromptEvent;
    notify();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    setInstalled(true);
    notify();
  });

  if (isStandalone()) {
    writeFlag(true);
  } else if (typeof (navigator as any).getInstalledRelatedApps === 'function') {
    // Also clears the remembered flag if the patient uninstalled the app since.
    (navigator as any)
      .getInstalledRelatedApps()
      .then((apps: unknown[]) => setInstalled(apps.length > 0))
      .catch(() => {});
  }
}

/** Safari on iPhone, iPad or Mac has no install event: people add it from the Share menu. */
const safariHint = (): 'ios' | 'mac' | null => {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent;
  const iPadOnMac = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1;
  if (/iPhone|iPad|iPod/.test(ua) || iPadOnMac) return /CriOS|FxiOS|EdgiOS/.test(ua) ? null : 'ios';
  // Safari 17+ on Mac can "Add to Dock". Chrome and Edge carry "Chrome" or "Edg" in the user agent, Safari does not.
  if (/Macintosh/.test(ua) && /Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR|Firefox/.test(ua)) return 'mac';
  return null;
};

export interface PwaInstall {
  /** Chrome / Edge / Android: the browser's own install dialog can be opened. */
  canPrompt: boolean;
  /** Safari: no dialog, show the steps instead. */
  hint: 'ios' | 'mac' | null;
  install: () => Promise<void>;
}

export const usePwaInstall = (): PwaInstall => {
  const [, rerender] = useState(0);
  useEffect(() => {
    const fn = () => rerender((n) => n + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);

  return {
    canPrompt: !installed && deferred !== null,
    hint: installed ? null : safariHint(),
    install: async () => {
      if (!deferred) return;
      const event = deferred;
      await event.prompt();
      await event.userChoice;
      // The event can be used once. Accepted or not, Chrome fires a new one if it wants to offer the install again.
      deferred = null;
      notify();
    }
  };
};
