import { api } from '../lib/api';
import { isStandalone } from './pwaInstall';

// The hospital counts how often patients open the tracker (Analytics, Tracker usage), and whether from the installed app
// or a browser tab. Only this app can tell which, because it reads its own display mode. The server takes the patient from
// the login, so all we say is "app" or "browser".
let lastSent = 0;

/** Tells the server the tracker was just opened. Never blocks or breaks the tracker: a failure is simply not counted. */
export function recordTrackerOpen() {
  // A double mount or a quick reload is one open (the server ignores a repeat within 5 seconds as well).
  if (Date.now() - lastSent < 5_000) return;
  lastSent = Date.now();
  api.post('/patient/tracker-views', { via: isStandalone() ? 'app' : 'browser' }).catch(() => undefined);
}
