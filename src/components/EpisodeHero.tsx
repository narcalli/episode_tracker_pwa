import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useEpisode } from '../context/EpisodeContext';
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  ChevronRight, 
  AlertCircle,
  Activity,
  UserCheck
} from 'lucide-react';

export const EpisodeHero: React.FC = () => {
  const { patient } = useAuth();
  const { stats, filterStatus, setFilterStatus } = useEpisode();

  // Format EDD nicely
  const formattedEdd = new Date(patient.edd).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden mb-6">
      {/* Top Banner Gradient */}
      <div className="bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-700 text-white p-5 sm:p-7 relative overflow-hidden">
        {/* Subtle decorative background circles */}
        <div className="absolute -right-8 -bottom-10 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute right-36 -top-12 w-32 h-32 rounded-full bg-teal-400/10 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-teal-900/60 border border-teal-500/30 text-teal-200 text-xs font-semibold mb-2">
                <Activity className="w-3.5 h-3.5 text-teal-300" />
                <span>Active Episode: {patient.episodeName}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {patient.name}’s Maternity Journey
              </h1>
              <p className="text-teal-100 text-sm mt-1 max-w-xl">
                Track your clinical milestones, upcoming ultrasound scans, lab panels, and personalized care schedule.
              </p>
            </div>

            {/* EDD & Doctor Badge */}
            <div className="flex flex-wrap md:flex-col items-start md:items-end gap-2 text-xs">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/15">
                <Calendar className="w-4 h-4 text-teal-200" />
                <span>
                  Estimated Due Date: <strong className="text-white">{formattedEdd}</strong>
                </span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/15">
                <UserCheck className="w-4 h-4 text-teal-200" />
                <span>
                  Lead Ob-Gyn: <span className="text-white font-medium">{patient.assignedDoctor.split(' (')[0]}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Episode Progress Bar */}
          <div className="mt-6 pt-5 border-t border-teal-600/50">
            <div className="flex items-center justify-between text-xs font-semibold mb-2">
              <span className="text-teal-100 flex items-center">
                Overall Protocol Progress: 
                <span className="ml-1.5 text-white font-bold">{stats.completed} of {stats.total} Milestones Finished</span>
              </span>
              <span className="text-emerald-300 font-bold text-sm">{stats.progressPercent}% Completed</span>
            </div>
            <div className="w-full bg-teal-950/60 rounded-full h-3 overflow-hidden p-0.5">
              <div 
                className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-700 ease-out shadow-xs"
                style={{ width: `${Math.max(stats.progressPercent, 4)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* The 3 Core Milestone Tracker Pillars */}
      <div className="p-4 sm:p-6 bg-slate-50/50">
        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          Milestone Horizon Overview
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* 1. What You've Completed */}
          <button
            type="button"
            onClick={() => setFilterStatus(filterStatus === 'completed' ? 'all' : 'completed')}
            className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
              filterStatus === 'completed'
                ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-500/20 shadow-xs'
                : 'bg-white border-slate-200/90 hover:border-emerald-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>COMPLETED</span>
              </span>
              <span className="text-2xl font-black text-emerald-700 tracking-tight">
                {stats.completed}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
              What You’ve Completed
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified clinical scans, blood tests, and doctor notes.
            </p>
            <div className="mt-3 flex items-center text-xs font-medium text-emerald-700 group-hover:underline">
              <span>{filterStatus === 'completed' ? 'Showing Completed' : 'Filter by Completed'}</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </div>
          </button>

          {/* 2. Due Now / Active */}
          <button
            type="button"
            onClick={() => setFilterStatus(filterStatus === 'due_now' ? 'all' : 'due_now')}
            className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
              filterStatus === 'due_now'
                ? 'bg-rose-50/90 border-rose-400 ring-2 ring-rose-500/20 shadow-xs'
                : 'bg-white border-slate-200/90 hover:border-rose-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-rose-800 bg-rose-100/80 px-2 py-0.5 rounded-md">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                <span>DUE NOW</span>
              </span>
              <span className="text-2xl font-black text-rose-600 tracking-tight">
                {stats.dueNow}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-rose-700 transition-colors">
              Due Now & In Focus
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Active window milestones requiring appointments or prep.
            </p>
            <div className="mt-3 flex items-center text-xs font-medium text-rose-700 group-hover:underline">
              <span>{filterStatus === 'due_now' ? 'Showing Due Now' : 'Filter by Due Now'}</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </div>
          </button>

          {/* 3. What Lies Ahead */}
          <button
            type="button"
            onClick={() => setFilterStatus(filterStatus === 'upcoming' ? 'all' : 'upcoming')}
            className={`text-left p-4 rounded-xl border transition-all relative overflow-hidden group ${
              filterStatus === 'upcoming'
                ? 'bg-sky-50/90 border-sky-400 ring-2 ring-sky-500/20 shadow-xs'
                : 'bg-white border-slate-200/90 hover:border-sky-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-sky-800 bg-sky-100/80 px-2 py-0.5 rounded-md">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <span>WHAT LIES AHEAD</span>
              </span>
              <span className="text-2xl font-black text-sky-700 tracking-tight">
                {stats.upcoming}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 text-sm group-hover:text-sky-700 transition-colors">
              The Road Ahead
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Future trimester milestones, scans, and labor readiness.
            </p>
            <div className="mt-3 flex items-center text-xs font-medium text-sky-700 group-hover:underline">
              <span>{filterStatus === 'upcoming' ? 'Showing Upcoming' : 'Filter Upcoming Roadmap'}</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </div>
          </button>
        </div>

        {/* Note if window closed milestones exist */}
        {stats.windowClosed > 0 && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start space-x-2.5 text-xs text-amber-800">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-bold">{stats.windowClosed} milestones have window closed status</span>. 
              {" "}This matches the historical administrative snapshot. You can request a window extension or discuss retroactive updates with your care coordinator.
            </div>
            <button
              onClick={() => setFilterStatus(filterStatus === 'window_closed' ? 'all' : 'window_closed')}
              className="text-xs font-semibold text-amber-900 underline hover:text-amber-950 shrink-0"
            >
              View Closed
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
