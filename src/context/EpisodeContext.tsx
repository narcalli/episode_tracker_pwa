import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { Stage, Milestone, MilestoneStatus, MilestoneCategory } from '../types/episode';
import { defaultStagesData } from '../data/maternityEpisodeData';
import { useAuth } from './AuthContext';

interface EpisodeContextType {
  stages: Stage[];
  allMilestones: Milestone[];
  completedList: Milestone[];
  dueNowList: Milestone[];
  upcomingList: Milestone[];
  windowClosedList: Milestone[];
  stats: {
    total: number;
    completed: number;
    dueNow: number;
    upcoming: number;
    windowClosed: number;
    progressPercent: number;
  };
  filterStatus: 'all' | MilestoneStatus;
  setFilterStatus: (filter: 'all' | MilestoneStatus) => void;
  selectedStageId: 'all' | string;
  setSelectedStageId: (stageId: 'all' | string) => void;
  selectedCategory: 'all' | MilestoneCategory;
  setSelectedCategory: (cat: 'all' | MilestoneCategory) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filteredMilestones: Milestone[];
  selectedMilestone: Milestone | null;
  setSelectedMilestone: (m: Milestone | null) => void;
  markMilestoneCompleted: (id: string, notes?: string) => void;
  activeStageNumber: number;
  setActiveStageNumber: (num: number) => void;
}

const EpisodeContext = createContext<EpisodeContextType | undefined>(undefined);

export const EpisodeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { activeScenario } = useAuth();

  // Generate stage data based on activeScenario
  const [stages, setStages] = useState<Stage[]>(() => {
    return defaultStagesData;
  });

  const [filterStatus, setFilterStatus] = useState<'all' | MilestoneStatus>('all');
  const [selectedStageId, setSelectedStageId] = useState<'all' | string>('all');
  const [selectedCategory, setSelectedCategory] = useState<'all' | MilestoneCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [activeStageNumber, setActiveStageNumber] = useState<number>(2);

  // When scenario changes, adjust milestone statuses accordingly
  useEffect(() => {
    if (activeScenario === 'snapshot_closed') {
      // Replicate the exact snapshot where all are marked "Window closed"
      setStages(prev =>
        prev.map(stage => ({
          ...stage,
          milestones: stage.milestones.map(m => ({
            ...m,
            status: 'window_closed' as MilestoneStatus
          }))
        }))
      );
      setActiveStageNumber(1);
    } else if (activeScenario === 'trimester_1_active') {
      setStages(prev =>
        prev.map(stage => {
          if (stage.stageNumber === 1) {
            return {
              ...stage,
              milestones: stage.milestones.map((m, idx) => ({
                ...m,
                status: idx < 4 ? 'completed' : 'due_now'
              }))
            };
          } else {
            return {
              ...stage,
              milestones: stage.milestones.map(m => ({
                ...m,
                status: 'upcoming' as MilestoneStatus
              }))
            };
          }
        })
      );
      setActiveStageNumber(1);
    } else if (activeScenario === 'trimester_2_active') {
      // Stage 1 completed, Stage 2 due now, Stage 3-5 upcoming
      setStages(prev =>
        prev.map(stage => {
          if (stage.stageNumber === 1) {
            return {
              ...stage,
              milestones: stage.milestones.map(m => ({
                ...m,
                status: 'completed' as MilestoneStatus,
                completedDate: m.completedDate || '28 Feb 2026',
                reportAvailable: true
              }))
            };
          } else if (stage.stageNumber === 2) {
            return {
              ...stage,
              milestones: stage.milestones.map(m => ({
                ...m,
                status: 'due_now' as MilestoneStatus
              }))
            };
          } else {
            return {
              ...stage,
              milestones: stage.milestones.map(m => ({
                ...m,
                status: 'upcoming' as MilestoneStatus
              }))
            };
          }
        })
      );
      setActiveStageNumber(2);
    } else if (activeScenario === 'trimester_3_active') {
      setStages(prev =>
        prev.map(stage => {
          if (stage.stageNumber < 5) {
            return {
              ...stage,
              milestones: stage.milestones.map(m => ({
                ...m,
                status: 'completed' as MilestoneStatus,
                reportAvailable: true
              }))
            };
          } else {
            return {
              ...stage,
              milestones: stage.milestones.map(m => ({
                ...m,
                status: 'due_now' as MilestoneStatus
              }))
            };
          }
        })
      );
      setActiveStageNumber(5);
    }
  }, [activeScenario]);

  const allMilestones = useMemo(() => {
    return stages.flatMap(s => s.milestones);
  }, [stages]);

  const completedList = useMemo(() => {
    return allMilestones.filter(m => m.status === 'completed');
  }, [allMilestones]);

  const dueNowList = useMemo(() => {
    return allMilestones.filter(m => m.status === 'due_now');
  }, [allMilestones]);

  const upcomingList = useMemo(() => {
    return allMilestones.filter(m => m.status === 'upcoming');
  }, [allMilestones]);

  const windowClosedList = useMemo(() => {
    return allMilestones.filter(m => m.status === 'window_closed');
  }, [allMilestones]);

  const stats = useMemo(() => {
    const total = allMilestones.length;
    const completed = completedList.length;
    const dueNow = dueNowList.length;
    const upcoming = upcomingList.length;
    const windowClosed = windowClosedList.length;
    const progressPercent = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      dueNow,
      upcoming,
      windowClosed,
      progressPercent
    };
  }, [allMilestones, completedList, dueNowList, upcomingList, windowClosedList]);

  const markMilestoneCompleted = (id: string, notes?: string) => {
    const todayStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    setStages(prev =>
      prev.map(stage => ({
        ...stage,
        milestones: stage.milestones.map(m => {
          if (m.id === id) {
            return {
              ...m,
              status: 'completed' as MilestoneStatus,
              completedDate: todayStr,
              reportAvailable: true,
              reportSummary: notes || 'Encounter concluded. Test report verified and uploaded by attending care team.',
              doctorNotes: notes || m.doctorNotes || 'Parameters reviewed and within standard physiological limits.'
            };
          }
          return m;
        })
      }))
    );

    // Also update selectedMilestone if open
    setSelectedMilestone(prev => {
      if (prev && prev.id === id) {
        return {
          ...prev,
          status: 'completed',
          completedDate: todayStr,
          reportAvailable: true
        };
      }
      return prev;
    });
  };

  const filteredMilestones = useMemo(() => {
    return allMilestones.filter(m => {
      // Status filter
      if (filterStatus !== 'all' && m.status !== filterStatus) {
        return false;
      }
      // Stage filter
      if (selectedStageId !== 'all' && m.stageId !== selectedStageId) {
        return false;
      }
      // Category filter
      if (selectedCategory !== 'all' && m.category !== selectedCategory) {
        return false;
      }
      // Search query
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = m.name.toLowerCase().includes(q);
        const matchesStage = m.stageName.toLowerCase().includes(q);
        const matchesDesc = m.description.toLowerCase().includes(q);
        return matchesName || matchesStage || matchesDesc;
      }
      return true;
    });
  }, [allMilestones, filterStatus, selectedStageId, selectedCategory, searchQuery]);

  return (
    <EpisodeContext.Provider
      value={{
        stages,
        allMilestones,
        completedList,
        dueNowList,
        upcomingList,
        windowClosedList,
        stats,
        filterStatus,
        setFilterStatus,
        selectedStageId,
        setSelectedStageId,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        filteredMilestones,
        selectedMilestone,
        setSelectedMilestone,
        markMilestoneCompleted,
        activeStageNumber,
        setActiveStageNumber
      }}
    >
      {children}
    </EpisodeContext.Provider>
  );
};

export const useEpisode = () => {
  const context = useContext(EpisodeContext);
  if (!context) {
    throw new Error('useEpisode must be used within an EpisodeProvider');
  }
  return context;
};
