import React from 'react';
import { Milestone, MilestoneCategory } from '../types/episode';
import { useEpisode } from '../context/EpisodeContext';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  ChevronRight, 
  Droplet, 
  Baby, 
  HeartHandshake, 
  Activity, 
  Syringe, 
  Timer,
  Check
} from 'lucide-react';

interface MilestoneCardProps {
  milestone: Milestone;
  onOpenReport?: (milestone: Milestone) => void;
}

export const MilestoneCard: React.FC<MilestoneCardProps> = ({ milestone, onOpenReport }) => {
  const { setSelectedMilestone, markMilestoneCompleted } = useEpisode();

  const getCategoryIcon = (category: MilestoneCategory) => {
    switch (category) {
      case 'ultrasound':
        return <Baby className="w-4 h-4 text-purple-600" />;
      case 'blood_test':
        return <Droplet className="w-4 h-4 text-rose-600" />;
      case 'counselling':
        return <HeartHandshake className="w-4 h-4 text-emerald-600" />;
      case 'clinical_exam':
        return <Activity className="w-4 h-4 text-blue-600" />;
      case 'procedure':
        return <Syringe className="w-4 h-4 text-amber-600" />;
      default:
        return <Activity className="w-4 h-4 text-slate-600" />;
    }
  };

  const getCategoryBadge = (category: MilestoneCategory) => {
    switch (category) {
      case 'ultrasound':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'blood_test':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'counselling':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'clinical_exam':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'procedure':
        return 'bg-amber-50 text-amber-700 border-amber-200';
    }
  };

  const getStatusBadge = () => {
    switch (milestone.status) {
      case 'completed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Completed</span>
          </span>
        );
      case 'due_now':
        return (
          <span className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200 animate-pulse shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-rose-600" />
            <span>Due Now</span>
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
            <Clock className="w-3 h-3 text-sky-500" />
            <span>What Lies Ahead</span>
          </span>
        );
      case 'window_closed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            <AlertCircle className="w-3 h-3 text-slate-400" />
            <span>Window Closed</span>
          </span>
        );
    }
  };

  return (
    <div 
      className={`bg-white rounded-xl border transition-all duration-200 hover:shadow-md flex flex-col justify-between overflow-hidden relative group ${
        milestone.status === 'due_now'
          ? 'border-rose-300 ring-1 ring-rose-200/60 shadow-xs'
          : milestone.status === 'completed'
          ? 'border-emerald-200/80 bg-gradient-to-b from-white to-emerald-50/10'
          : 'border-slate-200/90 hover:border-slate-300'
      }`}
    >
      {/* Top Accent Strip */}
      <div 
        className={`h-1 w-full ${
          milestone.status === 'due_now'
            ? 'bg-rose-500'
            : milestone.status === 'completed'
            ? 'bg-emerald-500'
            : milestone.status === 'window_closed'
            ? 'bg-slate-300'
            : 'bg-sky-400'
        }`}
      />

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Header row: Category & Status */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                {getCategoryIcon(milestone.category)}
              </div>
              <span className={`text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border ${getCategoryBadge(milestone.category)}`}>
                {milestone.category.replace('_', ' ')}
              </span>
            </div>
            {getStatusBadge()}
          </div>

          {/* Title & Stage */}
          <h4 className="font-bold text-slate-900 text-base leading-snug group-hover:text-teal-700 transition-colors">
            {milestone.name}
          </h4>
          <p className="text-xs font-medium text-slate-500 mt-1 flex items-center">
            <span>{milestone.stageName}</span>
            <span className="mx-1.5">•</span>
            <span>Window: {milestone.windowStart} – {milestone.windowEnd}</span>
          </p>

          {/* Clinical Purpose Description */}
          <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
            {milestone.description}
          </p>

          {/* Key Requirement Tags */}
          <div className="flex flex-wrap items-center gap-1.5 mt-3">
            {milestone.fastingRequired && (
              <span className="inline-flex items-center text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md">
                <Timer className="w-3 h-3 mr-1 text-amber-600" />
                Fasting Required
              </span>
            )}
            {milestone.fullBladderRequired && (
              <span className="inline-flex items-center text-[10px] font-semibold bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-md">
                <Droplet className="w-3 h-3 mr-1 text-blue-600" />
                Full Bladder Required
              </span>
            )}
            {milestone.approxDurationMinutes && (
              <span className="inline-flex items-center text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                ~{milestone.approxDurationMinutes} mins
              </span>
            )}
            {milestone.completedDate && (
              <span className="inline-flex items-center text-[10px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                <Check className="w-3 h-3 mr-1 text-emerald-600" />
                Done on {milestone.completedDate}
              </span>
            )}
          </div>
        </div>

        {/* Action Row */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {milestone.status === 'completed' && milestone.reportAvailable ? (
            <button
              onClick={() => onOpenReport ? onOpenReport(milestone) : setSelectedMilestone(milestone)}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 px-3 py-1.5 rounded-lg border border-emerald-200 transition"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>View Report</span>
            </button>
          ) : milestone.status === 'due_now' ? (
            <button
              onClick={() => markMilestoneCompleted(milestone.id)}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-3 py-1.5 rounded-lg border border-teal-200 transition"
              title="Click to simulate completing this test encounter"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark Done</span>
            </button>
          ) : (
            <span className="text-[11px] text-slate-400 font-medium italic">
              {milestone.status === 'window_closed' ? 'Window ended' : 'Opens in future stage'}
            </span>
          )}

          <button
            onClick={() => setSelectedMilestone(milestone)}
            className="inline-flex items-center space-x-1 text-xs font-semibold text-slate-700 hover:text-slate-900 group-hover:text-teal-700 transition"
          >
            <span>Guidance</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
