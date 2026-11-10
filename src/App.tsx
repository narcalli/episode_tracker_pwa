import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { EpisodeProvider, useEpisode } from './context/EpisodeContext';
import { CompactMast } from './components/CompactMast';
import { CompactMilestoneTile } from './components/CompactMilestoneTile';
import { MilestoneModal } from './components/MilestoneModal';
import { ReportModal } from './components/ReportModal';
import { FloatingFilter } from './components/FloatingFilter';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Patient360Drawer } from './components/Patient360Drawer';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { Milestone } from './types/episode';
import { getThemeConfig, applyThemeToDocument } from './utils/theme';
import { SlidersHorizontal } from 'lucide-react';

const EpisodeTrackerMain: React.FC = () => {
  const { 
    filteredMilestones, 
    filterStatus, 
    selectedStageId,
    selectedMilestone, 
    setSelectedMilestone 
  } = useEpisode();

  const [selectedReportMilestone, setSelectedReportMilestone] = useState<Milestone | null>(null);
  const [isPatient360Open, setIsPatient360Open] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // Apply Ovum / custom environment theme variables to DOM root
  useEffect(() => {
    const theme = getThemeConfig();
    applyThemeToDocument(theme);
  }, []);

  // Listen for PWA beforeinstallprompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallPwa = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const isFiltered = filterStatus !== 'all' || selectedStageId !== 'all';

  return (
    <div className="min-h-screen bg-slate-100/60 pb-24 text-slate-900 font-sans antialiased">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-3 sm:pt-4">
        {/* Main Mast: Patient Name, Progress Bar, and ETD only */}
        <CompactMast />

        {/* Active Filter Notification Pill (if filtered) */}
        {isFiltered && (
          <div className="mb-3 px-3 py-1.5 bg-slate-900 text-white rounded-xl text-xs flex items-center justify-between">
            <span className="flex items-center space-x-1.5 font-medium">
              <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
              <span>Showing {filteredMilestones.length} filtered milestones</span>
            </span>
            <span className="text-[11px] text-slate-300">Tap filter icon on bottom-left to reset</span>
          </div>
        )}

        {/* Ready-Reckoner Milestone Collection (Full stream 2-column grid on mobile) */}
        <section aria-label="Care Milestone Grid" className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
          {filteredMilestones.map(milestone => (
            <CompactMilestoneTile
              key={milestone.id}
              milestone={milestone}
              onClick={() => setSelectedMilestone(milestone)}
            />
          ))}
        </section>

        {/* Empty State */}
        {filteredMilestones.length === 0 && (
          <div className="py-16 text-center text-slate-500 text-xs">
            No milestones match your current filter selection.
          </div>
        )}

        {/* Subtle Patient 360 link for testing/integration */}
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => setIsPatient360Open(true)}
            className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition"
          >
            ⚙ Patient 360 Backend Handshake & Scenarios
          </button>
        </div>
      </div>

      {/* Floating Bottom Navigation Widgets */}
      <FloatingFilter />
      <FloatingWhatsApp />

      {/* Details & Reports Dialogs */}
      <MilestoneModal 
        milestone={selectedMilestone}
        onClose={() => setSelectedMilestone(null)}
        onOpenReport={(m) => setSelectedReportMilestone(m)}
      />

      <ReportModal
        milestone={selectedReportMilestone}
        onClose={() => setSelectedReportMilestone(null)}
      />

      <Patient360Drawer 
        isOpen={isPatient360Open}
        onClose={() => setIsPatient360Open(false)}
      />

      <PwaInstallPrompt 
        deferredPrompt={deferredPrompt}
        onInstall={handleInstallPwa}
      />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <EpisodeProvider>
        <EpisodeTrackerMain />
      </EpisodeProvider>
    </AuthProvider>
  );
}
