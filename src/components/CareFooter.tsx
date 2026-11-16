import React from 'react';
import { ExternalLink, Mail, Phone, ShieldCheck } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { formatPhone } from '../utils/theme';
import { whatsAppHref } from '../utils/whatsapp';
import { WhatsAppIcon } from './icons';

// Where the patient portal lives. Consent (view, give, withdraw) is managed there, not in this app.
const PORTAL_URL = (((import.meta as any).env || {}).VITE_PORTAL_URL || 'https://my.ovumhospitals.com').replace(/\/+$/, '');
const CONSENT_URL = `${PORTAL_URL}/patient/profile/`;

const row = 'flex items-center space-x-2 text-xs font-semibold text-slate-700 hover:text-theme-primary transition';

/** The foot of the tracker: who to contact, and where to manage consent. Sign out sits under it (App.tsx). */
export const CareFooter: React.FC = () => {
  const { contact } = useTheme();
  const whatsapp = whatsAppHref(contact.botPhone);
  const hasContact = whatsapp || contact.supportPhone || contact.supportEmail;

  return (
    <div className="mt-8 space-y-3">
      {hasContact && (
        <section aria-labelledby="care-coordinator" className="rounded-2xl border border-slate-200 bg-surface p-4">
          <h2 id="care-coordinator" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2.5">
            Care coordinator
          </h2>
          <div className="space-y-2">
            {whatsapp && (
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className={row}>
                <WhatsAppIcon className="w-4 h-4 text-[#25D366] shrink-0" />
                <span>Chat on WhatsApp{contact.botPhone ? ` · ${formatPhone(contact.botPhone)}` : ''}</span>
              </a>
            )}
            {contact.supportPhone && (
              <a href={`tel:${contact.supportPhone.replace(/[^\d+]/g, '')}`} className={row}>
                <Phone className="w-4 h-4 text-slate-500 shrink-0" />
                <span>Call {formatPhone(contact.supportPhone)}</span>
              </a>
            )}
            {contact.supportEmail && (
              <a href={`mailto:${contact.supportEmail}`} className={row}>
                <Mail className="w-4 h-4 text-slate-500 shrink-0" />
                <span>{contact.supportEmail}</span>
              </a>
            )}
          </div>
        </section>
      )}

      <a
        href={CONSENT_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between rounded-2xl border border-slate-200 bg-surface p-4 text-xs font-semibold text-slate-700 hover:text-theme-primary transition"
      >
        <span className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0" />
          <span>Manage your consent in the patient portal</span>
        </span>
        <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </a>
    </div>
  );
};
