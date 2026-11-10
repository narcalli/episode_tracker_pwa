import React from 'react';
import { useEpisode } from '../context/EpisodeContext';
import { MilestoneStatus, MilestoneCategory } from '../types/episode';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  Clock, 
  Layers, 
  ListOrdered
} from 'lucide-react';

interface MilestoneFilterProps {
  viewMode: 'stage_grouped' | 'stream';
  setViewMode: (mode: 'stage_grouped' | 'stream') => void;
}

export const MilestoneFilter: React.FC<MilestoneFilterProps> = ({ viewMode, setViewMode }) => {
  const { 
    filterStatus, 
    setFilterStatus, 
    selectedCategory, 
    setSelectedCategory, 
    searchQuery, 
    setSearchQuery,
    stats
  } = useEpisode();

  const statusOptions: { id: 'all' | MilestoneStatus; label: string; count: number; badgeColor: string }[] = [
    { id: 'all', label: 'All Milestones', count: stats.total, badgeColor: 'bg-slate-200 text-slate-700' },
    { id: 'due_now', label: 'Due Now', count: stats.dueNow, badgeColor: 'bg-rose-100 text-rose-700 font-bold' },
    { id: 'completed', label: 'Completed', count: stats.completed, badgeColor: 'bg-emerald-100 text-emerald-800 font-bold' },
    { id: 'upcoming', label: 'What Lies Ahead', count: stats.upcoming, badgeColor: 'bg-sky-100 text-sky-800' },
  ];

  const categoryOptions: { id: 'all' | MilestoneCategory; label: string }[] = [
    { id: 'all', label: 'All Types' },
    { id: 'ultrasound', label: 'Ultrasounds (USG)' },
    { id: 'blood_test', label: 'Blood Panels' },
    { id: 'counselling', label: 'Counselling & Sessions' },
    { id: 'clinical_exam', label: 'Clinical Exams' },
    { id: 'procedure', label: 'Procedures & IV' },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 mb-6 shadow-xs space-y-4">
      {/* Top Row: Status Tabs & View Toggle */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Status Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {statusOptions.map(opt => {
            const isActive = filterStatus === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setFilterStatus(opt.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                {opt.id === 'due_now' && (
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
                {opt.id === 'completed' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                )}
                {opt.id === 'upcoming' && (
                  <Clock className="w-3.5 h-3.5 text-sky-500" />
                )}
                <span>{opt.label}</span>
                <span className={`px-1.5 py-0.5 rounded-md text-[10px] ${isActive ? 'bg-slate-800 text-white' : opt.badgeColor}`}>
                  {opt.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle */}
        <div className="hidden sm:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl shrink-0 self-end lg:self-auto">
          <button
            onClick={() => setViewMode('stage_grouped')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'stage_grouped'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            <span>By Stages</span>
          </button>
          <button
            onClick={() => setViewMode('stream')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              viewMode === 'stream'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5 text-teal-600" />
            <span>Full Stream</span>
          </button>
        </div>
      </div>

      {/* Bottom Row: Search Bar & Category Filter Chips */}
      <div className="pt-3 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search milestone (e.g. NT Scan, TSH, Anomaly, Diet)..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              ×
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none text-xs">
          <span className="text-slate-400 flex items-center mr-1">
            <Filter className="w-3.5 h-3.5 mr-1" />
            <span className="hidden sm:inline">Type:</span>
          </span>
          {categoryOptions.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition ${
                selectedCategory === cat.id
                  ? 'bg-teal-50 text-teal-800 border border-teal-300 font-semibold'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
