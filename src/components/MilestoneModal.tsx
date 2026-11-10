import React from 'react';
import { Milestone } from '../types/episode';
import { useEpisode } from '../context/EpisodeContext';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  MapPin, 
  User, 
  FileText, 
  Calendar, 
  Phone,
  Check,
  ShieldCheck,
  Info
} from 'lucide-react';

interface MilestoneModalProps {
  milestone: Milestone | null;
  onClose: () => void;
  onOpenReport?: (milestone: Milestone) => void;
}

export const MilestoneModal: React.FC<MilestoneModalProps> = ({ 
  milestone, 
  onClose,
  onOpenReport 
}) => {
  const { markMilestoneCompleted } = useEpisode();

  if (!milestone) return null;

  const handleDownloadCalendar = () => {
    // Generate simple .ics calendar file download
    const title = `Appointment: ${milestone.name}`;
    const desc = `${milestone.description}\nFacility: ${milestone.facility || 'MNC Bhattarahalli'}`;
    const icsContent = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nSUMMARY:${title}\nDESCRIPTION:${desc}\nSTATUS:CONFIRMED\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${milestone.id}-milestone.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-white/10 text-teal-300 border border-white/10">
                {milestone.stageName}
              </span>
              <span className="text-xs text-slate-300">
                Window: {milestone.windowStart} – {milestone.windowEnd}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              {milestone.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Status Alert Banner */}
          {milestone.status === 'completed' ? (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3 text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold">Completed on {milestone.completedDate || 'Earlier in episode'}</span>
                <p className="text-emerald-700 mt-0.5">
                  Your diagnostic report is uploaded and has been reviewed by your obstetrician.
                </p>
              </div>
            </div>
          ) : milestone.status === 'due_now' ? (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-900">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold">Due Now • Action Required</span>
                <p className="text-rose-700 mt-0.5">
                  You are currently inside the recommended gestational window ({milestone.windowStart} to {milestone.windowEnd}). Please coordinate your visit.
                </p>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-200 flex items-start space-x-3 text-sky-900">
              <Clock className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
              <div className="text-xs">
                <span className="font-bold">Scheduled for Future Stage</span>
                <p className="text-sky-700 mt-0.5">
                  This milestone will unlock during {milestone.stageName}. Review instructions below so you can plan ahead.
                </p>
              </div>
            </div>
          )}

          {/* Why It Matters */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-800 flex items-center mb-1.5">
              <ShieldCheck className="w-4 h-4 mr-1.5 text-teal-600" />
              Why This Milestone Matters for You & Baby
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {milestone.whyItMatters}
            </p>
          </div>

          {/* Test Description */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center">
              <Info className="w-3.5 h-3.5 mr-1 text-slate-400" />
              Clinical Overview
            </h4>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {milestone.description}
            </p>
          </div>

          {/* Preparation & Instructions */}
          {milestone.instructions && milestone.instructions.length > 0 && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Patient Preparation Checklist
              </h4>
              <ul className="space-y-2">
                {milestone.instructions.map((inst, idx) => (
                  <li key={idx} className="flex items-start text-xs sm:text-sm text-slate-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-2 mr-2 shrink-0" />
                    <span>{inst}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Logistics & Facility */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
              <div className="text-slate-400 font-medium flex items-center mb-1">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Facility / Clinic
              </div>
              <div className="font-semibold text-slate-800">
                {milestone.facility || 'MNC Bhattarahalli'}
              </div>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
              <div className="text-slate-400 font-medium flex items-center mb-1">
                <User className="w-3.5 h-3.5 mr-1 text-slate-500" />
                Attending Specialist
              </div>
              <div className="font-semibold text-slate-800">
                {milestone.careProvider || 'MNC Obstetric & Diagnostic Team'}
              </div>
            </div>
          </div>

          {/* Completed Report Preview (if completed) */}
          {milestone.status === 'completed' && milestone.reportSummary && (
            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-emerald-900 flex items-center">
                  <FileText className="w-4 h-4 mr-1.5 text-emerald-700" />
                  Verified Clinical Findings
                </h4>
                {onOpenReport && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenReport(milestone);
                    }}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-900 underline"
                  >
                    View Full Sheet
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-mono bg-white p-2.5 rounded-lg border border-emerald-100">
                {milestone.reportSummary}
              </p>
              {milestone.doctorNotes && (
                <div className="text-xs text-emerald-950 mt-2 font-medium">
                  <strong>Doctor Note:</strong> {milestone.doctorNotes}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownloadCalendar}
              className="inline-flex items-center space-x-1 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 transition"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Add to Calendar</span>
            </button>
            <a
              href="tel:+919686909236"
              className="inline-flex items-center space-x-1 px-3 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 transition"
            >
              <Phone className="w-3.5 h-3.5 text-slate-500" />
              <span>Contact Care Desk</span>
            </a>
          </div>

          <div className="flex items-center space-x-2">
            {milestone.status === 'due_now' && (
              <button
                onClick={() => {
                  markMilestoneCompleted(milestone.id);
                  onClose();
                }}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                <Check className="w-4 h-4" />
                <span>Mark as Done</span>
              </button>
            )}

            {milestone.status === 'completed' && onOpenReport && (
              <button
                onClick={() => {
                  onClose();
                  onOpenReport(milestone);
                }}
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
              >
                <FileText className="w-4 h-4" />
                <span>Open Diagnostic Report</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold transition"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
