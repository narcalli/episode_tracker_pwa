import React from 'react';
import { Loader2, WifiOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthShell, primaryButton } from './AuthShell';

/** Shown while the first /me call runs, so a person already signed in never sees the sign-in form flash. */
export const LoadingScreen: React.FC = () => (
  <AuthShell>
    <p role="status" className="flex items-center justify-center space-x-2 py-8 text-sm text-slate-500">
      <Loader2 className="w-4 h-4 animate-spin" />
      <span>Opening your journey…</span>
    </p>
  </AuthShell>
);

/** The first call could not reach the API. Retrying is safe; the sign-in form would be wrong for someone already signed in. */
export const OfflineScreen: React.FC = () => {
  const { reload } = useAuth();
  return (
    <AuthShell>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
        <WifiOff className="w-6 h-6" />
      </span>
      <h1 className="mt-4 text-2xl font-extrabold leading-tight">You seem to be offline</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">We couldn&apos;t reach the hospital&apos;s server. Check your connection and try again.</p>
      <button className={`${primaryButton} mt-6`} onClick={() => void reload()}>
        Try again
      </button>
    </AuthShell>
  );
};
