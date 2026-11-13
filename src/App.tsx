import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { EpisodeProvider, useEpisode } from './context/EpisodeContext';
import { CompactMast } from './components/CompactMast';
import { EpisodePicker } from './components/EpisodePicker';
import { CompactMilestoneTile } from './components/CompactMilestoneTile';
import { MilestoneModal } from './components/MilestoneModal';
import { FloatingFilter } from './components/FloatingFilter';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { LoginScreen } from './components/auth/LoginScreen';
import { PatientPicker } from './components/auth/PatientPicker';
import { ConsentScreen } from './components/auth/ConsentScreen';
import { LoadingScreen, OfflineScreen } from './components/auth/StatusScreens';
import { PwaInstallPrompt } from './components/PwaInstallPrompt';
import { getThemeConfig, applyThemeToDocument } from './utils/theme';
import { SlidersHorizontal } from 'lucide-react';

const EpisodeTrackerMain: React.FC = () => {
  const { load, reload, filteredMilestones, filterStatus, selectedMilestone, setSelectedMilestone } = useEpisode();
  const { logout } = useAuth();
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

  const isFiltered = filterStatus !== 'all';

  return (
    <div className="min-h-screen bg-slate-100/60 pb-24 text-slate-900 font-sans antialiased">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 pt-3 sm:pt-4">
        {/* Main Mast: Patient Name, Progress Bar, and ETD only */}
        <CompactMast />

        {load === 'ready' && <EpisodePicker />}

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

        {load === 'loading' && (
          <p role="status" className="py-16 text-center text-slate-500 text-xs">Loading your milestones…</p>
        )}

        {load === 'error' && (
          <div role="alert" className="py-12 text-center text-xs text-slate-600">
            <p>We couldn&apos;t load your milestones. Please try again.</p>
            <button type="button" onClick={() => void reload()} className="mt-3 px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold">
              Try again
            </button>
          </div>
        )}

        {load === 'empty' && (
          <p className="py-16 text-center text-slate-500 text-xs">
            Your care journey isn&apos;t set up yet. Please contact the care desk if you expected to see it here.
          </p>
        )}

        {load === 'ready' && (
          <>
            <section aria-label="Care Milestone Grid" className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-2.5">
              {filteredMilestones.map(milestone => (
                <CompactMilestoneTile
                  key={milestone.id}
                  milestone={milestone}
                  onClick={() => setSelectedMilestone(milestone)}
                />
              ))}
            </section>

            {filteredMilestones.length === 0 && (
              <div className="py-16 text-center text-slate-500 text-xs">
                No milestones match your current filter selection.
              </div>
            )}
          </>
        )}

        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => void logout()}
            className="text-[11px] font-semibold text-slate-400 hover:text-slate-600 transition"
          >
            Sign out
          </button>
        </div>
      </div>

      {/* Floating Bottom Navigation Widgets */}
      <FloatingFilter />
      <FloatingWhatsApp />

      {/* Milestone details */}
      <MilestoneModal milestone={selectedMilestone} onClose={() => setSelectedMilestone(null)} />

      <PwaInstallPrompt 
        deferredPrompt={deferredPrompt}
        onInstall={handleInstallPwa}
      />
    </div>
  );
};

/** Signed-in patients see the tracker; everyone else sees the step they are on (sign in, pick patient, consent). */
const AuthGate: React.FC = () => {
  const { phase } = useAuth();
  switch (phase) {
    case 'loading':
      return <LoadingScreen />;
    case 'offline':
      return <OfflineScreen />;
    case 'signed_out':
      return <LoginScreen />;
    case 'choose':
      return <PatientPicker />;
    case 'consent':
      return <ConsentScreen />;
    case 'ready':
      return (
        <EpisodeProvider>
          <EpisodeTrackerMain />
        </EpisodeProvider>
      );
  }
};

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
