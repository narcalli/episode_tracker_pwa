import React from 'react';
import { Milestone } from '../types/episode';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle
} from 'lucide-react';

interface CompactMilestoneTileProps {
  milestone: Milestone;
  onClick: () => void;
}

export const CompactMilestoneTile: React.FC<CompactMilestoneTileProps> = ({ 
  milestone, 
  onClick 
}) => {
  const isCompleted = milestone.status === 'completed';
  const isDueNow = milestone.status === 'due_now';
  const isWindowClosed = milestone.status === 'window_closed';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`text-left w-full p-2.5 sm:p-3 rounded-xl border transition-all duration-150 flex flex-col justify-between active:scale-[0.98] relative overflow-hidden select-none ${
        isDueNow
          ? 'bg-rose-50/90 border-rose-300 ring-1 ring-rose-400/40 shadow-xs'
          : isCompleted
          ? 'bg-emerald-50/70 border-emerald-300/80 hover:border-emerald-400'
          : isWindowClosed
          ? 'bg-slate-100/90 border-slate-200 text-slate-500'
          : 'bg-surface border-slate-200/90 hover:border-slate-300 shadow-2xs'
      }`}
    >
      {/* Top micro row: status indicator */}
      <div className="flex items-center justify-end gap-1 w-full mb-1">

        {/* Status Icon */}
        <div className="shrink-0">
          {isCompleted ? (
            <span className="flex items-center text-[10px] font-bold text-emerald-700">
              <CheckCircle2 className="w-3.5 h-3.5 mr-0.5 text-emerald-600" />
            </span>
          ) : isDueNow ? (
            <span className="flex items-center text-[10px] font-bold text-rose-700">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse mr-1" />
              <span>Due</span>
            </span>
          ) : isWindowClosed ? (
            <AlertCircle className="w-3 h-3 text-slate-400" />
          ) : (
            <Clock className="w-3 h-3 text-sky-500" />
          )}
        </div>
      </div>

      {/* Middle: Milestone Name */}
      <h4 className={`text-xs sm:text-[13px] font-bold leading-snug line-clamp-2 my-0.5 ${
        isDueNow 
          ? 'text-rose-950 font-extrabold' 
          : isCompleted 
          ? 'text-emerald-950' 
          : 'text-slate-800'
      }`}>
        {milestone.name}
      </h4>

      {/* Bottom micro row: where it stands */}
      <div className="flex items-center space-x-1.5 mt-1 text-[10px] text-slate-500 font-medium truncate w-full">
        {isCompleted ? (
          <span className="text-emerald-700 font-semibold truncate">{milestone.completedDate ? `Done ${milestone.completedDate}` : 'Done'}</span>
        ) : isDueNow ? (
          <span className="text-rose-700 font-bold truncate">{milestone.windowEnd ? `Due by ${milestone.windowEnd}` : 'Due now'}</span>
        ) : isWindowClosed ? (
          <span className="text-slate-400 truncate">Window closed</span>
        ) : milestone.booked ? (
          <span className="text-sky-700 font-semibold truncate">Booked</span>
        ) : (
          <span className="text-slate-400 truncate">{milestone.windowStart ? `Opens ${milestone.windowStart}` : 'Coming up'}</span>
        )}
      </div>
    </button>
  );
};
