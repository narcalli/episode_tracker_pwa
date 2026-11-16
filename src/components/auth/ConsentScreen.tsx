import React, { useEffect, useState } from 'react';
import { ChevronLeft, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api, ApiError, type Consent } from '../../lib/api';
import { AuthShell, ErrorNote, primaryButton, secondaryButton } from './AuthShell';

/** Consent before any patient data is shown. Declining signs the patient out (the API does that). */
export const ConsentScreen: React.FC = () => {
  const { me, patient, reload, logout } = useAuth();
  const [consent, setConsent] = useState<Consent | null>(null);
  const [busy, setBusy] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Consent>('/consent')
      .then(setConsent)
      .catch(() => setError("We couldn't load the consent notice. Please try again later."));
  }, []);

  async function decide(decision: 'ACCEPTED' | 'DECLINED') {
    if (!consent) return;
    setBusy(true);
    setError(null);
    try {
      await api.post('/consent', { version: consent.notice.version, decision });
      if (decision === 'ACCEPTED') await reload();
      else setDeclined(true);
    } catch (e) {
      // A newer notice was published while this one was open: show the new one.
      if (e instanceof ApiError && e.code === 'NOTICE_CHANGED') setConsent(await api.get<Consent>('/consent'));
      else setError('Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  if (declined) {
    return (
      <AuthShell>
        <h1 className="text-2xl font-extrabold leading-tight">You&apos;re signed out</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-500">
          You need to agree to how we use your data to use the Ovum Treatment Tracker. You can sign in again whenever you&apos;re ready.
        </p>
        <button className={`${primaryButton} mt-8`} onClick={() => void reload()}>
          Back to sign in
        </button>
      </AuthShell>
    );
  }

  const canPick = (me?.patients.length ?? 0) > 1;

  return (
    <AuthShell>
      <button
        type="button"
        className="mb-5 inline-flex min-h-10 items-center text-sm font-semibold text-theme-primary"
        onClick={() => void logout()}
      >
        <ChevronLeft className="w-4 h-4" /> {canPick ? 'Sign out to switch patient' : 'Use a different number'}
      </button>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-theme-light text-theme-dark">
        <ShieldCheck className="w-6 h-6" />
      </span>
      <h1 className="mt-4 text-2xl font-extrabold leading-tight">Your data, your consent</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        Before you see <b className="text-slate-900">{patient.name}</b>&apos;s journey, please read how we use this data.
      </p>

      <div className="mt-5 max-h-[42vh] overflow-y-auto rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm leading-relaxed whitespace-pre-line">
        {consent ? consent.notice.body : (error ?? 'Loading…')}
      </div>
      {consent && <p className="mt-2 text-xs text-slate-500">Notice version {consent.notice.version}</p>}
      {error && consent && <ErrorNote text={error} />}

      <button className={`${primaryButton} mt-6`} disabled={!consent || busy} onClick={() => void decide('ACCEPTED')}>
        I agree
      </button>
      <button className={`${secondaryButton} mt-3`} disabled={!consent || busy} onClick={() => void decide('DECLINED')}>
        I don&apos;t agree
      </button>
    </AuthShell>
  );
};
