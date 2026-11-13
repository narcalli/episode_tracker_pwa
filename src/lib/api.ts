// Thin client for the Patient 360 API. The PWA is served from the same origin as the portal (CloudFront /api/* in
// production, the Vite proxy in dev), so the httpOnly session cookie travels by itself: no token is ever read, stored
// or sent from JavaScript, and a person already signed in to the portal is signed in here too.

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly code: string,
    readonly body: Record<string, unknown> = {},
  ) {
    super(code);
  }
}

let onSignedOut: (() => void) | null = null;

/** Called when any call other than a sign-in call or /me answers 401: the session ended mid-visit. */
export function setSignedOutHandler(handler: (() => void) | null) {
  onSignedOut = handler;
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method,
      credentials: 'same-origin',
      headers: body === undefined ? undefined : { 'content-type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body),
      cache: 'no-store',
    });
  } catch {
    throw new ApiError(0, 'NETWORK');
  }
  const data = res.status === 204 ? null : await res.json().catch(() => null);
  if (res.status === 401 && !path.startsWith('/auth/') && path !== '/me') onSignedOut?.();
  if (!res.ok) throw new ApiError(res.status, (data?.error as string) ?? 'UNKNOWN', data ?? {});
  return data as T;
}

export const api = {
  get: <T>(path: string) => request<T>('GET', path),
  post: <T>(path: string, body?: unknown) => request<T>('POST', path, body ?? {}),
  put: <T>(path: string, body: unknown) => request<T>('PUT', path, body),
};

// ─── What the API answers (patient360-api: routes/me.ts, routes/sign-in.ts, routes/consent.ts) ───

export interface LinkedPatient {
  id: string;
  patientCode: string;
  fullName: string;
  relation: string;
  birthYear: number | null;
  hasConsent: boolean;
}

export interface Me {
  mobile: string;
  patients: LinkedPatient[];
  activePatientId: string | null;
  consentRequired: boolean;
}

export interface OtpSent {
  ok: true;
  resendAfterSeconds: number;
  expiresInSeconds: number;
}

/** What comes next after a sign-in call. "done": the session cookie is set. The other steps are for staff and admins. */
export type SignInOutcome =
  | { next: 'done' }
  | { next: 'choose'; ticket: string; options: { as: 'patient' | 'staff'; label: string }[] }
  | { next: 'code' | 'enrol' | 'change'; ticket: string };

export interface Consent {
  notice: { version: string; body: string };
  accepted: boolean;
}

/** One milestone of an episode, as GET /patient/episodes describes it. */
export interface EpisodeItem {
  id: string;
  title: string;
  kind: string | null;
  state: 'DONE' | 'DUE' | 'BOOKED' | 'UPCOMING' | 'MISSED';
  /** YYYY-MM-DD, or null. */
  opensOn: string | null;
  dueBy: string | null;
  completedOn: string | null;
}

export interface PatientEpisode {
  id: string;
  type: string | null;
  status: 'ACTIVE' | 'COMPLETED';
  startedAt: string | null;
  expectedDeliveryDate: string | null;
  progress: { done: number; total: number; percent: number };
  items: EpisodeItem[];
}
