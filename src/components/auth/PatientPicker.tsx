import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AuthShell, ErrorNote } from './AuthShell';

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');

const relationLabel = (r: string) => r.charAt(0).toUpperCase() + r.slice(1).toLowerCase().replace(/_/g, ' ');

/** One mobile number, several patients (a mother and her children, say): pick whose journey to open. */
export const PatientPicker: React.FC = () => {
  const { me, choosePatient, logout } = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choose(id: string) {
    setBusy(id);
    setError(null);
    try {
      await choosePatient(id);
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setBusy(null);
    }
  }

  const patients = me?.patients ?? [];

  return (
    <AuthShell>
      <button type="button" className="mb-5 inline-flex min-h-10 items-center text-sm font-semibold text-theme-primary" onClick={() => void logout()}>
        <ChevronLeft className="w-4 h-4" /> Use a different number
      </button>
      <h1 className="text-2xl font-extrabold leading-tight">Whose journey?</h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500">
        {patients.length === 0 ? 'No patient is linked to this number. Please contact the hospital.' : `${patients.length} people are linked to +91 ${me?.mobile.replace(/^\+91/, '')}.`}
      </p>
      <ul className="mt-6 space-y-3">
        {patients.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              className="flex w-full items-center space-x-4 rounded-xl border border-slate-200 p-4 text-left hover:border-theme-primary disabled:opacity-60"
              disabled={busy !== null}
              onClick={() => void choose(p.id)}
            >
              <span className="w-11 h-11 rounded-full bg-theme-light text-theme-dark font-bold flex items-center justify-center shrink-0" aria-hidden="true">
                {initials(p.fullName)}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-bold truncate">{p.fullName}</span>
                <span className="block text-xs text-slate-500">
                  {relationLabel(p.relation)} · ID {p.patientCode}
                </span>
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
            </button>
          </li>
        ))}
      </ul>
      {error && <ErrorNote text={error} />}
    </AuthShell>
  );
};
