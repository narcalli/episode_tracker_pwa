import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ApiError } from '../../lib/api';
import { AuthShell, ErrorNote, primaryButton, secondaryButton } from './AuthShell';

const OTP_LENGTH = 4;
const RATE_LIMITED = 'Too many sign-in attempts from this network. Wait a minute and try again.';

const minutes = (seconds: number) => {
  const m = Math.ceil(seconds / 60);
  return `${m} minute${m === 1 ? '' : 's'}`;
};

/** The API's error codes as words a patient reads (same wording as the portal's sign-in page). */
function sendError(e: unknown): string {
  if (!(e instanceof ApiError)) return 'Something went wrong. Please try again.';
  if (e.code === 'VALIDATION') return 'Enter a valid 10-digit mobile number.';
  if (e.code === 'NOT_REGISTERED') {
    const phone = typeof e.body.supportPhone === 'string' ? e.body.supportPhone : '';
    return `This mobile number isn't registered with us. Check the number, or contact the hospital${phone ? ` on ${phone}` : ''}.`;
  }
  if (e.code === 'TOO_SOON') return `Please wait ${e.body.retryAfterSeconds} seconds before asking for another code.`;
  if (e.code === 'LOCKED') return `Too many wrong codes. Try again in ${minutes(Number(e.body.retryAfterSeconds))}.`;
  if (e.code === 'NETWORK') return 'You seem to be offline. Check your connection and try again.';
  if (e.code === 'RATE_LIMITED') return RATE_LIMITED;
  return 'Something went wrong. Please try again.';
}

function verifyError(e: unknown): string {
  if (!(e instanceof ApiError)) return 'Something went wrong. Please try again.';
  if (e.code === 'OTP_INVALID') {
    const left = Number(e.body.attemptsLeft);
    return `That code is not right. ${left} ${left === 1 ? 'try' : 'tries'} left.`;
  }
  if (e.code === 'OTP_EXPIRED' || e.code === 'EXPIRED') return 'This code has expired. Ask for a new one.';
  if (e.code === 'LOCKED') return `Too many wrong codes. Try again in ${minutes(Number(e.body.retryAfterSeconds))}.`;
  if (e.code === 'NOT_A_PATIENT') return 'This app is for patients. Staff, please sign in to the portal.';
  if (e.code === 'NETWORK') return 'You seem to be offline. Check your connection and try again.';
  if (e.code === 'RATE_LIMITED') return RATE_LIMITED;
  return 'Something went wrong. Please try again.';
}

/**
 * Mobile number, then a one-time code on WhatsApp: the way in for a patient without a working invite link. Coming from a
 * tracker invite link that was used or ran out, the number it was sent to is filled in and can't be changed.
 */
export const LoginScreen: React.FC = () => {
  const { sendCode, verifyCode, invite } = useAuth();
  const locked = invite !== null;
  const [step, setStep] = useState<'mobile' | 'code'>('mobile');
  const [mobile, setMobile] = useState(invite?.mobile ?? '');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  const digits = mobile.replace(/\D/g, '');

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  useEffect(() => {
    if (step === 'code') codeRef.current?.focus();
  }, [step]);

  /**
   * `auto`: sent by itself for an invite link that no longer signs in, not by the person tapping the button. `number` is
   * passed then, because the field may not show it yet in the same render.
   */
  async function send(auto = false, number = digits) {
    setBusy(true);
    setError(null);
    try {
      const r = await sendCode(number);
      setResendIn(r.resendAfterSeconds);
      setCode('');
      setStep('code');
    } catch (e) {
      if (e instanceof ApiError && e.code === 'TOO_SOON' && (step === 'code' || auto)) {
        // A code went to this number moments ago (the link opened twice): it still works, so ask for it.
        setResendIn(Number(e.body.retryAfterSeconds));
        setStep('code');
        if (auto) return;
      }
      setError(sendError(e));
    } finally {
      setBusy(false);
    }
  }

  // Coming from an invite link that was used or ran out: the number is known, so the code goes out at once and the
  // person lands on the code step. Once only, even when React runs effects twice in development.
  // The invite may arrive after this screen opened: fill the number then, whenever it comes.
  const autoSent = useRef(false);
  useEffect(() => {
    if (!invite) return;
    setMobile(invite.mobile);
    if (autoSent.current || invite.mobile.length !== 10) return;
    autoSent.current = true;
    void send(true, invite.mobile);
  }, [invite]);

  async function verify() {
    setBusy(true);
    setError(null);
    try {
      // On success the session changes and this screen is replaced, so there is nothing more to do here.
      await verifyCode(digits, code);
    } catch (e) {
      setError(verifyError(e));
      setCode('');
      codeRef.current?.focus();
    } finally {
      setBusy(false);
    }
  }

  function changeNumber() {
    setStep('mobile');
    setCode('');
    setError(null);
  }

  if (step === 'mobile') {
    return (
      <AuthShell>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (digits.length === 10) void send();
          }}
        >
          <h1 className="text-2xl font-extrabold leading-tight">Sign in</h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            {invite
              ? `Your tracker link ${invite.reason === 'used' ? 'has already been used' : 'has expired'}. We'll send a one-time code on WhatsApp to the number it was sent to.`
              : <>Enter your registered mobile number. We&apos;ll send you a one-time code on WhatsApp.</>}
          </p>

          <label htmlFor="mobile" className="mt-6 block text-sm font-semibold">
            Mobile number
          </label>
          <div className="mt-2 flex items-center rounded-xl border border-slate-300 bg-surface focus-within:border-theme-primary focus-within:ring-2 focus-within:ring-theme-primary/20">
            <span className="border-r border-slate-200 px-4 text-base font-semibold">+91</span>
            <input
              id="mobile"
              className="min-h-[50px] flex-1 rounded-r-xl bg-transparent px-4 text-base outline-none placeholder:text-slate-400"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="98765 43210"
              maxLength={11}
              value={mobile}
              readOnly={locked}
              aria-readonly={locked}
              onChange={(e) => {
                if (!locked) setMobile(e.target.value.replace(/[^\d ]/g, ''));
              }}
              autoFocus={!locked}
            />
          </div>

          {error && <ErrorNote text={error} />}

          <button className={`${primaryButton} mt-6`} disabled={busy || digits.length !== 10}>
            {busy ? 'Sending…' : 'Send code on WhatsApp'}
          </button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (code.length === OTP_LENGTH) void verify();
        }}
      >
        {/* From an invite link the number is fixed, so there is nothing to go back to. */}
        {!locked && (
          <button type="button" className="mb-5 inline-flex min-h-10 items-center text-sm font-semibold text-theme-primary" onClick={changeNumber}>
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
        )}
        <h1 className="text-2xl font-extrabold leading-tight">Enter the code</h1>
        {invite && (
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Your tracker link {invite.reason === 'used' ? 'has already been used' : 'has expired'}, so please confirm it&apos;s you.
          </p>
        )}
        <p className="mt-2 text-sm leading-relaxed text-slate-500">We have sent a {OTP_LENGTH}-digit code on WhatsApp to:</p>
        <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 py-3">
          <span className="text-base font-bold">+91 {digits}</span>
          {!locked && (
            <button type="button" className="text-sm font-semibold text-theme-primary" onClick={changeNumber}>
              Change number
            </button>
          )}
        </div>

        <label htmlFor="code" className="mt-6 block text-sm font-semibold">
          One-time code
        </label>
        <input
          id="code"
          ref={codeRef}
          className="mt-2 w-full min-h-[50px] rounded-xl border border-slate-300 bg-surface px-4 text-center text-2xl tracking-[0.6em] outline-none focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="••••"
          maxLength={OTP_LENGTH}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
        />

        {error && <ErrorNote text={error} />}

        <button className={`${primaryButton} mt-6`} disabled={busy || code.length !== OTP_LENGTH}>
          {busy ? 'Checking…' : 'Verify and sign in'}
        </button>
        <button type="button" className={`${secondaryButton} mt-3 inline-flex items-center justify-center space-x-2`} disabled={busy || resendIn > 0} onClick={() => void send()}>
          <Clock className="w-4 h-4" />
          <span>{resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}</span>
        </button>
      </form>
    </AuthShell>
  );
};
