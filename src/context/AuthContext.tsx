import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { PatientProfile } from '../types/episode';
import { useTheme } from './ThemeContext';
import { api, ApiError, setSignedOutHandler, type Me, type OtpSent, type SignInOutcome } from '../lib/api';

/**
 * Where the visitor is in signing in. The portal's session cookie decides it: someone already signed in to Patient 360
 * goes straight to 'ready' (or to the step still missing: which patient, or consent); nobody else sees 'signed_out'.
 */
export type AuthPhase = 'loading' | 'signed_out' | 'choose' | 'consent' | 'ready' | 'offline';

/**
 * A tracker invite link that could not sign the person in because it was used or ran out: the number it was sent to
 * (10 digits, without +91), which the sign-in screen fills in and keeps fixed.
 */
export interface InviteFallback {
  mobile: string;
  reason: 'used' | 'expired';
}

/** The invite code in the address (?i=…), removed from it at once so it is not bookmarked, shared or sent again. */
function takeInviteCode(): string | null {
  const url = new URL(window.location.href);
  const code = url.searchParams.get('i');
  if (code === null) return null;
  url.searchParams.delete('i');
  window.history.replaceState(window.history.state, '', `${url.pathname}${url.search}${url.hash}`);
  return code.trim() || null;
}

const nationalNumber = (e164: string) => e164.replace(/^\+91/, '').replace(/\D/g, '').slice(-10);

interface AuthContextType {
  phase: AuthPhase;
  me: Me | null;
  /** Set when the visitor came from a tracker invite link that no longer signs in. */
  invite: InviteFallback | null;
  /** The patient whose records are open (empty until signed in and chosen). */
  patient: PatientProfile;
  sendCode: (mobile: string) => Promise<OtpSent>;
  verifyCode: (mobile: string, code: string) => Promise<void>;
  choosePatient: (patientId: string) => Promise<void>;
  /** Re-reads /me and moves to the step it says (after consent, or to retry when offline). */
  reload: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const phaseOf = (me: Me): AuthPhase => (me.activePatientId === null ? 'choose' : me.consentRequired ? 'consent' : 'ready');

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [phase, setPhase] = useState<AuthPhase>('loading');
  const [me, setMe] = useState<Me | null>(null);
  const [invite, setInvite] = useState<InviteFallback | null>(null);
  const { syncFromAccount } = useTheme();
  // The invite link being redeemed, if any. Every look at the session waits for it, so the sign-in screen never opens
  // before the link has signed the person in or said which number it was for (React runs the first effect twice in
  // development, and a tab switch can also start a look at the session meanwhile).
  const inviteRedeem = useRef<Promise<void> | null>(null);

  const reload = useCallback(async () => {
    try {
      if (inviteRedeem.current) await inviteRedeem.current;
      const m = await api.get<Me>('/me');
      setMe(m);
      syncFromAccount(m.theme);
      setPhase(phaseOf(m));
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        setMe(null);
        setPhase('signed_out');
      } else {
        // The network or the API is down: say so, never show the sign-in form to someone who may be signed in.
        setPhase((p) => (p === 'loading' ? 'offline' : p));
      }
    }
  }, [syncFromAccount]);

  // The first look at the session: this is the auto sign-in for anyone already signed in to the portal. Coming from a
  // tracker invite link (WhatsApp, after the onboarding call), the link signs the patient in first; a link that was used
  // or ran out leaves the sign-in screen with its number filled in.
  useEffect(() => {
    // Taken from the address once, synchronously, so a second run of this effect finds no code and just waits for it.
    const code = takeInviteCode();
    if (code) {
      inviteRedeem.current = api
        .post('/auth/invite/redeem', { code })
        .then(() => undefined)
        .catch((e: unknown) => {
          const mobile = e instanceof ApiError && typeof e.body.mobile === 'string' ? nationalNumber(e.body.mobile) : '';
          if (mobile.length === 10 && e instanceof ApiError && (e.code === 'INVITE_USED' || e.code === 'INVITE_EXPIRED')) {
            setInvite({ mobile, reason: e.code === 'INVITE_USED' ? 'used' : 'expired' });
          }
        });
    }
    void reload();
  }, [reload]);

  // A session that ends mid-visit (expired, or signed out in the portal) sends the person back to sign in.
  useEffect(() => {
    setSignedOutHandler(() => {
      setMe(null);
      setPhase('signed_out');
    });
    return () => setSignedOutHandler(null);
  }, []);

  // Coming back to the app (switching tabs or reopening the installed app) re-checks the session, so a sign-in or
  // sign-out done in the portal meanwhile shows here too.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') void reload();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [reload]);

  const sendCode = useCallback((mobile: string) => api.post<OtpSent>('/auth/otp/send', { mobile }), []);

  const verifyCode = useCallback(
    async (mobile: string, code: string) => {
      let outcome = await api.post<SignInOutcome>('/auth/otp/verify', { mobile, code });
      // A number that is both a patient's and a staff member's: this app is for patients.
      if (outcome.next === 'choose') outcome = await api.post<SignInOutcome>('/auth/choose', { ticket: outcome.ticket, as: 'patient' });
      if (outcome.next !== 'done') throw new ApiError(0, 'NOT_A_PATIENT');
      await reload();
    },
    [reload],
  );

  const choosePatient = useCallback(
    async (patientId: string) => {
      await api.put('/me/active-patient', { patientId });
      await reload();
    },
    [reload],
  );

  const logout = useCallback(async () => {
    await api.post('/auth/logout').catch(() => undefined);
    setMe(null);
    setPhase('signed_out');
  }, []);

  const patient = useMemo<PatientProfile>(() => {
    const active = me?.patients.find((p) => p.id === me.activePatientId);
    if (!me || !active) return { id: '', name: '', mrn: '', phone: '' };
    return { id: active.id, name: active.fullName, mrn: active.patientCode, phone: me.mobile };
  }, [me]);

  return (
    <AuthContext.Provider value={{ phase, me, invite, patient, sendCode, verifyCode, choosePatient, reload, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
