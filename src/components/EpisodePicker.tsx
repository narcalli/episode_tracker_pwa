import React from 'react';
import { useEpisode } from '../context/EpisodeContext';

/** A patient can have more than one episode (a new pregnancy, a repeat): pick which one's milestones are shown. Hidden when there is one. */
export const EpisodePicker: React.FC = () => {
  const { episodes, selectedEpisodeId, selectEpisode } = useEpisode();
  if (episodes.length < 2) return null;

  return (
    <div className="mb-3">
      <label htmlFor="episode-picker" className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
        Episode ({episodes.length})
      </label>
      <select
        id="episode-picker"
        value={selectedEpisodeId ?? ''}
        onChange={(e) => selectEpisode(e.target.value)}
        className="w-full min-h-11 rounded-xl border border-slate-300 bg-surface px-3 text-sm font-semibold text-slate-800 outline-none focus:border-theme-primary focus:ring-2 focus:ring-theme-primary/20"
      >
        {episodes.map((e, i) => (
          <option key={e.id} value={e.id}>
            {`${i + 1}. ${e.label}${e.startedOn ? ` · started ${e.startedOn}` : ''}${e.edd ? ` · due ${e.edd}` : ''}`}
          </option>
        ))}
      </select>
    </div>
  );
};
