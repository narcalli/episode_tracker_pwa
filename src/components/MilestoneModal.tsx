import React from 'react';
import { Milestone } from '../types/episode';
import { X, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { whatsAppHref } from '../utils/whatsapp';
import { WhatsAppIcon } from './icons';

interface MilestoneModalProps {
  milestone: Milestone | null;
  onClose: () => void;
}

/** What the hospital's record says about one milestone. Guidance and reports are added when the hospital sends them. */
export const MilestoneModal: React.FC<MilestoneModalProps> = ({ milestone, onClose }) => {
  const { contact } = useTheme();
  const whatsapp = whatsAppHref(contact.botPhone);
  if (!milestone) return null;

  const window = milestone.windowStart && milestone.windowEnd ? `${milestone.windowStart} – ${milestone.windowEnd}` : milestone.windowEnd ? `By ${milestone.windowEnd}` : milestone.windowStart ? `From ${milestone.windowStart}` : null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-night/60 backdrop-blur-xs flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={milestone.name}>
      <div className="bg-surface rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-5 sm:p-6 bg-gradient-to-r from-night to-night-soft text-white flex items-start justify-between">
          <div>
            {window && <div className="text-xs text-white/70 mb-1.5">Window: {window}</div>}
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{milestone.name}</h2>
          </div>
          <button onClick={onClose} aria-label="Close" className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          {milestone.status === 'completed' ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold">{milestone.completedDate ? `Done on ${milestone.completedDate}` : 'Done'}</span>
              </div>
            </div>
          ) : milestone.status === 'due_now' ? (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-900">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold">Due now</span>
                <p className="text-rose-700 mt-0.5">This is due{milestone.windowEnd ? ` by ${milestone.windowEnd}` : ''}. Please contact the care desk to arrange your visit.</p>
              </div>
            </div>
          ) : milestone.status === 'window_closed' ? (
            <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 flex items-start space-x-3 text-slate-800">
              <AlertCircle className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold">Window closed</span>
                <p className="text-slate-600 mt-0.5">The recommended time for this has passed and it is not marked as done. Ask the care desk if you are unsure.</p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 flex items-start space-x-3 text-sky-900">
              <Clock className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold">{milestone.booked ? 'Appointment booked' : 'Coming up'}</span>
                {!milestone.booked && milestone.windowStart && <p className="text-sky-700 mt-0.5">This opens on {milestone.windowStart}.</p>}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          {whatsapp ? (
            <a
              href={whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-surface hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 transition"
            >
              <WhatsAppIcon className="w-4 h-4 text-[#25D366]" />
              <span>Contact Care Coordinator</span>
            </a>
          ) : (
            <span />
          )}
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
