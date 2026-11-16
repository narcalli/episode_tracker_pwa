import React from 'react';

/** The WhatsApp mark as a stroke icon in currentColor (the same one the Patient 360 portal uses). */
export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
    <path d="M3.5 20.5 5 16A8.5 8.5 0 1 1 8 19z" />
    <path d="M9 8.5c0 3.3 2.7 6.5 6.5 6.5l1-1.5-2-1-1 .8a4 4 0 0 1-2-2l.8-1-1-2z" />
  </svg>
);
