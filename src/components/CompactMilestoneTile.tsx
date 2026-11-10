import React from 'react';
import { Milestone } from '../types/episode';
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText
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

  // Extract short stage number or code (e.g., "S1", "S2")
  const stageNumMatch = milestone.stageName.match(/Stage (\d+)/i);
  const stageCode = stageNumMatch ? `Stage ${stageNumMatch[1]}` : milestone.stageName;

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
          : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
      }`}
    >
      {/* Top micro row: Stage & Status indicator */}
      <div className="flex items-center justify-between gap-1 w-full mb-1">
        <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
          isDueNow
            ? 'bg-rose-200/80 text-rose-800'
            : isCompleted
            ? 'bg-emerald-200/80 text-emerald-800'
            : 'bg-slate-100 text-slate-600'
        }`}>
          {stageCode}
        </span>

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

      {/* Bottom micro row: Prep tags or report ready */}
      <div className="flex items-center space-x-1.5 mt-1 text-[10px] text-slate-500 font-medium truncate w-full">
        {isCompleted && milestone.reportAvailable ? (
          <span className="inline-flex items-center text-emerald-700 font-semibold truncate">
            <FileText className="w-2.5 h-2.5 mr-0.5 text-emerald-600" />
            Report ready
          </span>
        ) : isDueNow ? (
          <span className="text-rose-700 font-bold truncate">
            {milestone.fastingRequired ? 'Fasting needed' : milestone.fullBladderRequired ? 'Full bladder' : 'Action needed'}
          </span>
        ) : (
          <span className="text-slate-400 truncate">
            {milestone.category.replace('_', ' ')}
          </span>
        )}
      </div>
    </button>
  );
};
