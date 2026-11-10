import React, { useState } from 'react';
import { useEpisode } from '../context/EpisodeContext';
import { MilestoneStatus } from '../types/episode';
import { 
  SlidersHorizontal, 
  X, 
  Check, 
  RotateCcw,
  CheckCircle2,
  Clock
} from 'lucide-react';

export const FloatingFilter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    filterStatus, 
    setFilterStatus, 
    selectedStageId, 
    setSelectedStageId, 
    stages,
    stats,
    setSelectedCategory
  } = useEpisode();

  const activeFiltersCount = 
    (filterStatus !== 'all' ? 1 : 0) + 
    (selectedStageId !== 'all' ? 1 : 0);

  const handleReset = () => {
    setFilterStatus('all');
    setSelectedStageId('all');
    setSelectedCategory('all');
  };

  const statusOptions: { id: 'all' | MilestoneStatus; label: string; count: number; badgeColor: string }[] = [
    { id: 'all', label: 'All Milestones', count: stats.total, badgeColor: 'bg-slate-100 text-slate-700' },
    { id: 'due_now', label: 'Due Now', count: stats.dueNow, badgeColor: 'bg-rose-100 text-rose-800 font-bold' },
    { id: 'completed', label: 'Completed', count: stats.completed, badgeColor: 'bg-emerald-100 text-emerald-800 font-bold' },
    { id: 'upcoming', label: 'Next / What Lies Ahead', count: stats.upcoming, badgeColor: 'bg-sky-100 text-sky-800' },
  ];

  return (
    <>
      {/* Floating Trigger Button on Bottom-Left */}
      <aside aria-label="Milestone Filters" className="fixed bottom-5 left-5 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg shadow-slate-950/20 hover:scale-105 active:scale-95 transition-all duration-200"
          title="Filter Milestones"
        >
          <SlidersHorizontal className="w-6 h-6 text-emerald-400" />
          <span className="sr-only">Filter Milestones</span>
          
          {/* Active Filter Count Badge */}
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[11px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-xs">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </aside>

      {/* Filter Bottom Sheet / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom duration-200 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <SlidersHorizontal className="w-5 h-5 text-teal-600" />
                <h3 className="font-bold text-base text-slate-900">Filter Milestones</h3>
              </div>
              <div className="flex items-center space-x-2">
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleReset}
                    className="flex items-center space-x-1 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg transition"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Filter Content */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-5">
              {/* Status Section */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Status (Due / Completed / Next)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map(opt => {
                    const isSelected = filterStatus === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFilterStatus(opt.id)}
                        className={`text-left p-2.5 rounded-xl border text-xs font-medium transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5 truncate">
                          {opt.id === 'due_now' && <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />}
                          {opt.id === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                          {opt.id === 'upcoming' && <Clock className="w-3.5 h-3.5 text-sky-400 shrink-0" />}
                          <span className="truncate">{opt.label}</span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded shrink-0 ml-1 ${
                          isSelected ? 'bg-slate-800 text-slate-200' : opt.badgeColor
                        }`}>
                          {opt.count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Stage Section */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Gestational Stage
                </label>
                <div className="space-y-1.5">
                  <button
                    type="button"
                    onClick={() => setSelectedStageId('all')}
                    className={`w-full text-left p-2.5 rounded-xl border text-xs font-medium transition flex items-center justify-between ${
                      selectedStageId === 'all'
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800'
                    }`}
                  >
                    <span>All Stages (Full Stream)</span>
                    {selectedStageId === 'all' && <Check className="w-4 h-4 text-emerald-400" />}
                  </button>

                  {stages.map(stage => {
                    const isSelected = selectedStageId === stage.id;
                    const stageMilestonesCount = stage.milestones.length;
                    return (
                      <button
                        key={stage.id}
                        type="button"
                        onClick={() => setSelectedStageId(stage.id)}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs font-medium transition flex items-center justify-between ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center space-x-2 truncate">
                          <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                            isSelected ? 'bg-slate-800 text-emerald-400' : 'bg-slate-200 text-slate-700'
                          }`}>
                            {stage.stageNumber}
                          </span>
                          <span className="truncate font-semibold">{stage.title.split(' - ')[1] || stage.title}</span>
                          <span className="text-[11px] text-slate-400">({stage.weekRange})</span>
                        </div>
                        <span className={`text-[10px] px-1.5 py-0.2 rounded shrink-0 ${
                          isSelected ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {stageMilestonesCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {activeFiltersCount > 0 ? `${activeFiltersCount} filter(s) active` : 'Showing all 26 milestones'}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Apply & View
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
