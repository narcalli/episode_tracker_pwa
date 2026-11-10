import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useEpisode } from '../context/EpisodeContext';
import { Calendar } from 'lucide-react';

export const CompactMast: React.FC = () => {
  const { patient } = useAuth();
  const { stats } = useEpisode();

  const formattedEdd = new Date(patient.edd).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div 
      className="rounded-2xl p-4 sm:p-5 text-white shadow-sm mb-4 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, var(--theme-gradient-start, #00695C) 0%, var(--theme-gradient-end, #00897B) 100%)`
      }}
    >
      {/* Row 1: Patient Name & ETD / EDD */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-tight">
            {patient.name}
          </h1>
          <div className="text-[11px] text-emerald-100 font-medium">
            Maternity Care Episode
          </div>
        </div>

        <div className="flex items-center space-x-1.5 bg-black/15 backdrop-blur-xs px-3 py-1.5 rounded-xl border border-white/15 text-xs font-semibold">
          <Calendar className="w-3.5 h-3.5 text-emerald-200 shrink-0" />
          <span>ETD: <strong className="text-white font-bold">{formattedEdd}</strong></span>
        </div>
      </div>

      {/* Row 2: Progress Bar & Status */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs font-medium text-emerald-100">
          <span>{stats.completed} of {stats.total} Milestones Done</span>
          <span className="font-bold text-white text-xs">{stats.progressPercent}%</span>
        </div>
        <div className="w-full bg-black/25 rounded-full h-2 overflow-hidden p-0.5">
          <div 
            className="bg-white h-full rounded-full transition-all duration-500 ease-out shadow-xs"
            style={{ width: `${Math.max(stats.progressPercent, 4)}%` }}
          />
        </div>
      </div>
    </div>
  );
};
