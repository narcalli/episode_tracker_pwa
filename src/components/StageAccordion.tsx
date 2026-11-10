import React, { useState } from 'react';
import { Stage, Milestone } from '../types/episode';
import { MilestoneCard } from './MilestoneCard';
import { 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  CheckCircle2, 
  Sparkles
} from 'lucide-react';

interface StageAccordionProps {
  stage: Stage;
  milestones: Milestone[];
  defaultOpen?: boolean;
  onOpenReport?: (milestone: Milestone) => void;
}

export const StageAccordion: React.FC<StageAccordionProps> = ({ 
  stage, 
  milestones, 
  defaultOpen = true,
  onOpenReport 
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const completedCount = milestones.filter(m => m.status === 'completed').length;
  const dueNowCount = milestones.filter(m => m.status === 'due_now').length;
  const totalCount = milestones.length;
  const isFullyCompleted = totalCount > 0 && completedCount === totalCount;
  const hasDueNow = dueNowCount > 0;

  return (
    <div className={`bg-white rounded-2xl border transition-all mb-4 overflow-hidden ${
      hasDueNow 
        ? 'border-rose-300 ring-2 ring-rose-500/10 shadow-sm' 
        : isFullyCompleted 
        ? 'border-emerald-200/90 shadow-2xs' 
        : 'border-slate-200/90 shadow-2xs'
    }`}>
      {/* Header Bar */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-3 hover:bg-slate-50/70 transition"
      >
        <div className="flex items-start sm:items-center space-x-3.5 flex-1">
          {/* Stage Number / Status Icon */}
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
            isFullyCompleted 
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
              : hasDueNow 
              ? 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse' 
              : 'bg-slate-100 text-slate-700 border border-slate-200'
          }`}>
            {isFullyCompleted ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : hasDueNow ? (
              <span>{stage.stageNumber}</span>
            ) : (
              <span>{stage.stageNumber}</span>
            )}
          </div>

          {/* Title & Dates */}
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 tracking-tight">
                {stage.title}
              </h3>
              {hasDueNow && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500 text-white shadow-2xs">
                  <Sparkles className="w-3 h-3" />
                  <span>Active Window</span>
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center text-xs text-slate-500 gap-x-2 mt-0.5">
              <span className="font-semibold text-slate-700">{stage.weekRange}</span>
              <span>•</span>
              <span className="flex items-center text-slate-500">
                <Calendar className="w-3 h-3 mr-1 text-slate-400" />
                {stage.startDate} – {stage.endDate}
              </span>
            </div>
          </div>
        </div>

        {/* Progress & Chevron */}
        <div className="flex items-center space-x-3 shrink-0">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-slate-800">
              {completedCount} of {totalCount} done
            </div>
            <div className="w-24 bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
              <div 
                className={`h-full rounded-full ${isFullyCompleted ? 'bg-emerald-500' : hasDueNow ? 'bg-rose-500' : 'bg-teal-500'}`}
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
          </div>

          <div className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </button>

      {/* Stage Description & Milestones Grid */}
      {isOpen && (
        <div className="p-4 sm:p-5 pt-0 border-t border-slate-100 bg-slate-50/40">
          <p className="text-xs text-slate-600 mb-4 bg-white/80 p-3 rounded-xl border border-slate-200/60 leading-relaxed">
            {stage.description}
          </p>

          {milestones.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400 italic">
              No milestones match the current filter in this stage.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {milestones.map(milestone => (
                <MilestoneCard 
                  key={milestone.id} 
                  milestone={milestone} 
                  onOpenReport={onOpenReport}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
