import React, { useState } from 'react';
import { useEpisode } from '../context/EpisodeContext';
import { MilestoneStatus } from '../types/episode';
import { useTheme } from '../context/ThemeContext';
import type { ThemeChoice } from '../utils/theme';
import {
  Settings,
  SlidersHorizontal,
  Monitor,
  Sun,
  Moon,
  X,
  RotateCcw,
  CheckCircle2,
  Clock
} from 'lucide-react';

const APPEARANCE: { value: ThemeChoice; label: string; Icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'system', label: 'System', Icon: Monitor },
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
];

/** System / Light / Dark: a radio group, so the arrow keys move the choice and Tab enters and leaves it as one stop. */
const AppearanceSwitch: React.FC = () => {
  const { choice, setChoice } = useTheme();

  const onKeyDown = (e: React.KeyboardEvent, index: number) => {
    const step = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    e.preventDefault();
    const next = (index + step + APPEARANCE.length) % APPEARANCE.length;
    setChoice(APPEARANCE[next].value);
    (e.currentTarget.parentElement?.children[next] as HTMLElement | undefined)?.focus();
  };

  return (
    <div role="radiogroup" aria-label="Appearance" className="flex rounded-full border border-slate-200 bg-slate-50 p-1">
      {APPEARANCE.map(({ value, label, Icon }, i) => {
        const on = choice === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            onClick={() => setChoice(value)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`flex-1 inline-flex min-h-9 items-center justify-center space-x-1.5 rounded-full text-xs font-semibold transition-colors ${
              on ? 'bg-surface text-slate-900 shadow-sm ring-1 ring-slate-200' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
};

/** The gear at the bottom-left: appearance (System, Light, Dark) and the milestone filter. */
export const FloatingSettings: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    filterStatus, 
    setFilterStatus, 
    stats
  } = useEpisode();

  const activeFiltersCount = filterStatus !== 'all' ? 1 : 0;

  const handleReset = () => setFilterStatus('all');

  const statusOptions: { id: 'all' | MilestoneStatus; label: string; count: number; badgeColor: string }[] = [
    { id: 'all', label: 'All Milestones', count: stats.total, badgeColor: 'bg-slate-100 text-slate-700' },
    { id: 'due_now', label: 'Due Now', count: stats.dueNow, badgeColor: 'bg-rose-100 text-rose-800 font-bold' },
    { id: 'completed', label: 'Completed', count: stats.completed, badgeColor: 'bg-emerald-100 text-emerald-800 font-bold' },
    { id: 'upcoming', label: 'Next / What Lies Ahead', count: stats.upcoming, badgeColor: 'bg-sky-100 text-sky-800' },
    { id: 'window_closed', label: 'Window closed', count: stats.windowClosed, badgeColor: 'bg-slate-200 text-slate-700' },
  ];

  return (
    <>
      {/* Floating Trigger Button on Bottom-Left */}
      <aside aria-label="Settings" className="fixed bottom-5 left-5 z-40">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="relative flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 bg-night hover:bg-night-soft text-white rounded-full shadow-lg shadow-slate-950/20 hover:scale-105 active:scale-95 transition-all duration-200"
          title="Settings"
        >
          <Settings className="w-6 h-6 text-emerald-400" />
          <span className="sr-only">Settings</span>
          
          {/* Active Filter Count Badge */}
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[11px] font-black rounded-full flex items-center justify-center border-2 border-surface shadow-xs">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </aside>

      {/* Filter Bottom Sheet / Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-night/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div 
            className="w-full max-w-md bg-surface rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in slide-in-from-bottom duration-200 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-theme-primary" />
                <h3 className="font-bold text-base text-slate-900">Settings</h3>
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
              {/* Appearance */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                  Appearance
                </span>
                <AppearanceSwitch />
                <p className="mt-2 text-[11px] text-slate-500">Light, dark, or the same as your device. Saved to your account.</p>
              </div>

              {/* Status Section */}
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center space-x-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Filter milestones</span>
                </span>
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
                            ? 'bg-slate-900 text-slate-50 border-slate-900 shadow-xs'
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

            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {activeFiltersCount > 0 ? `${activeFiltersCount} filter(s) active` : `Showing all ${stats.total} milestones`}
              </span>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2.5 bg-theme-primary hover:bg-theme-dark text-theme-on rounded-xl text-xs font-bold transition shadow-xs"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
