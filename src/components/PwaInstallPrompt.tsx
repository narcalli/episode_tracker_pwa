import React, { useEffect, useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';
import { usePwaInstall } from '../utils/pwaInstall';

const DISMISSED_KEY = 'carejourney.installBannerDismissedAt';
// How long after signing in the banner appears, and how long "Later" / close keeps it away.
const SHOW_AFTER_MS = 30_000;
const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;

const wasDismissedRecently = () => {
  try {
    const at = Number(localStorage.getItem(DISMISSED_KEY));
    return at > 0 && Date.now() - at < SNOOZE_MS;
  } catch {
    return false;
  }
};

/** Mounted only for a signed-in patient (see App.tsx), so the 30 seconds count from the moment they land on the tracker. */
export const PwaInstallPrompt: React.FC = () => {
  const { canPrompt, hint, install } = usePwaInstall();
  const [dismissed, setDismissed] = useState(wasDismissedRecently);
  const [waited, setWaited] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setWaited(true), SHOW_AFTER_MS);
    return () => clearTimeout(timer);
  }, []);

  if (!waited || dismissed || (!canPrompt && !hint)) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
      /* private mode: the banner just comes back next visit */
    }
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white shrink-0 shadow-md">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Install CareJourney App</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              {hint === 'ios'
                ? 'Tap the Share button, then "Add to Home Screen".'
                : hint === 'mac'
                  ? 'In the Safari menu bar choose File, then "Add to Dock".'
                  : 'Open it like any other app, straight from your home screen, desktop or taskbar.'}
            </p>
          </div>
        </div>
        <button onClick={dismiss} aria-label="Close" className="p-1 text-slate-400 hover:text-white rounded-lg transition">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3.5 flex items-center space-x-2">
        {canPrompt && (
          <button
            onClick={install}
            className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Install app</span>
          </button>
        )}
        <button
          onClick={dismiss}
          className="py-2 px-3 bg-white/10 hover:bg-white/20 text-slate-300 font-semibold rounded-xl text-xs transition"
        >
          {canPrompt ? 'Later' : 'Got it'}
        </button>
      </div>
    </div>
  );
};
