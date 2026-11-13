import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Milestone, MilestoneStatus } from '../types/episode';
import { api, type EpisodeItem, type PatientEpisode } from '../lib/api';

/** 'empty': signed in, but nothing set up for this patient yet. 'error': the hospital's server could not give it. */
export type EpisodeLoad = 'loading' | 'ready' | 'empty' | 'error';

interface EpisodeContextType {
  load: EpisodeLoad;
  reload: () => Promise<void>;
  /** Every episode the patient has, current one first, in the words the picker shows. */
  episodes: EpisodeOption[];
  selectedEpisodeId: string | null;
  selectEpisode: (id: string) => void;
  /** The open episode's expected delivery date, formatted; null when the hospital has not set one. */
  edd: string | null;
  allMilestones: Milestone[];
  stats: { total: number; completed: number; dueNow: number; upcoming: number; windowClosed: number; progressPercent: number };
  filterStatus: 'all' | MilestoneStatus;
  setFilterStatus: (filter: 'all' | MilestoneStatus) => void;
  filteredMilestones: Milestone[];
  selectedMilestone: Milestone | null;
  setSelectedMilestone: (m: Milestone | null) => void;
}

export interface EpisodeOption {
  id: string;
  /** "Current" for the open episode, otherwise "Completed". */
  label: string;
  startedOn: string | null;
  edd: string | null;
}

const EpisodeContext = createContext<EpisodeContextType | undefined>(undefined);

/** YYYY-MM-DD as the patient reads it (the API sends calendar days, so no time zone moves them). */
const formatDay = (d: string | null): string | null =>
  d ? new Date(`${d}T00:00:00Z`).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }) : null;

const STATUS: Record<EpisodeItem['state'], MilestoneStatus> = { DONE: 'completed', DUE: 'due_now', BOOKED: 'upcoming', UPCOMING: 'upcoming', MISSED: 'window_closed' };

const toMilestone = (i: EpisodeItem): Milestone => ({
  id: i.id,
  name: i.title,
  status: STATUS[i.state],
  booked: i.state === 'BOOKED',
  windowStart: formatDay(i.opensOn),
  windowEnd: formatDay(i.dueBy),
  completedDate: formatDay(i.completedOn),
});

/** Opening the app again after this long fetches fresh milestones. */
const STALE_MS = 60_000;

export const EpisodeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [load, setLoad] = useState<EpisodeLoad>('loading');
  const [allEpisodes, setAllEpisodes] = useState<PatientEpisode[]>([]);
  const [selectedEpisodeId, setSelectedEpisodeId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | MilestoneStatus>('all');
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const fetchedAt = useRef(0);

  const reload = useCallback(async () => {
    try {
      const { episodes } = await api.get<{ episodes: PatientEpisode[] }>('/patient/episodes');
      fetchedAt.current = Date.now();
      // The API puts the open episode first. Keep the one being looked at if it is still there.
      setAllEpisodes(episodes);
      setSelectedEpisodeId((was) => (was && episodes.some((e) => e.id === was) ? was : (episodes[0]?.id ?? null)));
      setLoad(episodes.length > 0 ? 'ready' : 'empty');
    } catch {
      // Keep what is on screen if there is something; only a first load shows the error.
      setLoad((was) => (was === 'ready' ? was : 'error'));
    }
  }, []);

  useEffect(() => {
    void reload();
    const onVisible = () => {
      if (document.visibilityState === 'visible' && Date.now() - fetchedAt.current > STALE_MS) void reload();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [reload]);

  const episode = useMemo(() => allEpisodes.find((e) => e.id === selectedEpisodeId) ?? allEpisodes[0] ?? null, [allEpisodes, selectedEpisodeId]);

  const episodes = useMemo<EpisodeOption[]>(
    () => allEpisodes.map((e) => ({ id: e.id, label: e.status === 'ACTIVE' ? 'Current' : 'Completed', startedOn: formatDay(e.startedAt), edd: formatDay(e.expectedDeliveryDate) })),
    [allEpisodes],
  );

  const selectEpisode = useCallback((id: string) => {
    setSelectedEpisodeId(id);
    setSelectedMilestone(null);
  }, []);

  const allMilestones = useMemo(() => (episode?.items ?? []).map(toMilestone), [episode]);

  const stats = useMemo(() => {
    const count = (s: MilestoneStatus) => allMilestones.filter((m) => m.status === s).length;
    const total = allMilestones.length;
    const completed = count('completed');
    return { total, completed, dueNow: count('due_now'), upcoming: count('upcoming'), windowClosed: count('window_closed'), progressPercent: total > 0 ? Math.round((completed / total) * 100) : 0 };
  }, [allMilestones]);

  const filteredMilestones = useMemo(() => allMilestones.filter((m) => filterStatus === 'all' || m.status === filterStatus), [allMilestones, filterStatus]);

  return (
    <EpisodeContext.Provider
      value={{ load, reload, episodes, selectedEpisodeId: episode?.id ?? null, selectEpisode, edd: formatDay(episode?.expectedDeliveryDate ?? null), allMilestones, stats, filterStatus, setFilterStatus, filteredMilestones, selectedMilestone, setSelectedMilestone }}
    >
      {children}
    </EpisodeContext.Provider>
  );
};

export const useEpisode = () => {
  const context = useContext(EpisodeContext);
  if (!context) throw new Error('useEpisode must be used within an EpisodeProvider');
  return context;
};
