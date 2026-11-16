import React, { useState } from 'react';
import { AlertCircle, HeartPulse } from 'lucide-react';
import { getThemeConfig } from '../../utils/theme';
import { useTheme } from '../../context/ThemeContext';
import { PwaInstallPrompt } from '../PwaInstallPrompt';

/** The frame every sign-in screen sits in: the hospital's gradient header and a white card. */
export const AuthShell: React.FC<{ children: React.ReactNode; offerInstall?: boolean }> = ({ children, offerInstall = false }) => {
  const theme = getThemeConfig();
  const { logos } = useTheme();
  const [logoBroken, setLogoBroken] = useState(false);
  // The header is a coloured block, so the hospital's white logo goes on it; with only the normal logo, it is turned white.
  const logoSrc = logos.light ?? logos.dark;
  return (
    <div className="min-h-screen bg-canvas text-slate-900 font-sans antialiased flex flex-col">
      <header
        className="px-5 pt-10 pb-14 text-white"
        style={{ background: 'linear-gradient(135deg, var(--theme-gradient-start, #00695C) 0%, var(--theme-gradient-end, #00897B) 100%)' }}
      >
        <div className="max-w-md mx-auto">
          {logoSrc && !logoBroken ? (
            <img
              src={logoSrc}
              alt={theme.hospitalName}
              className={`h-12 w-auto max-w-full ${logos.light ? '' : 'brightness-0 invert'}`}
              onError={() => setLogoBroken(true)}
            />
          ) : (
            <span className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <HeartPulse className="w-5 h-5" />
            </span>
          )}
          <div className="mt-4">
            <div className="text-lg font-black tracking-tight leading-tight">Ovum Treatment Tracker</div>
            <div className="text-[11px] text-white/85 font-medium">{theme.hospitalName}</div>
          </div>
        </div>
      </header>
      <main className="flex-1 px-4 -mt-8 pb-10">
        <div className="max-w-md mx-auto bg-surface rounded-2xl shadow-lg border border-slate-200 p-5 sm:p-6">{children}</div>
      </main>
      {offerInstall && <PwaInstallPrompt delayMs={0} />}
    </div>
  );
};

export const ErrorNote: React.FC<{ text: string }> = ({ text }) => (
  <p role="alert" className="mt-4 flex items-start space-x-2 rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-3 text-sm text-rose-800">
    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
    <span>{text}</span>
  </p>
);

export const primaryButton =
  'w-full min-h-12 rounded-xl bg-theme-primary hover:bg-theme-dark disabled:opacity-50 disabled:hover:bg-theme-primary text-theme-on text-sm font-bold transition';
export const secondaryButton =
  'w-full min-h-12 rounded-xl bg-surface border border-slate-300 hover:bg-slate-50 disabled:opacity-50 text-slate-800 text-sm font-semibold transition';
