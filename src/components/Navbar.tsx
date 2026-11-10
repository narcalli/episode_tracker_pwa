import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Heart, 
  Download, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Settings, 
  Calendar,
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  onOpenPatient360: () => void;
  deferredPrompt: any;
  onInstallPwa: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenPatient360, 
  deferredPrompt, 
  onInstallPwa 
}) => {
  const { patient, isSyncing, refreshFromPatient360 } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Patient Context */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-teal-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-teal-600/20">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-slate-900 text-base sm:text-lg tracking-tight">CareJourney</span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
                  <Sparkles className="w-3 h-3 mr-1 text-teal-600" />
                  Maternity PWA
                </span>
              </div>
              <div className="flex items-center text-xs text-slate-500 space-x-2">
                <span className="font-medium text-slate-700">{patient.name}</span>
                <span>•</span>
                <span className="text-teal-700 font-semibold">{patient.packageType.split(' - ')[0]}</span>
                <span>•</span>
                <span className="text-slate-500">{patient.mrn}</span>
              </div>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Online / Offline Status */}
            <div 
              className={`hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                isOnline ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
              title={isOnline ? 'Connected to Patient 360' : 'Offline mode active'}
            >
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{isOnline ? 'Online' : 'Offline Mode'}</span>
            </div>

            {/* Sync Button */}
            <button
              onClick={() => refreshFromPatient360()}
              disabled={isSyncing}
              className="p-2 text-slate-500 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors relative"
              title="Sync with Patient 360 backend"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-teal-600' : ''}`} />
            </button>

            {/* Install PWA Button (if prompt ready) */}
            {deferredPrompt && (
              <button
                onClick={onInstallPwa}
                className="hidden sm:inline-flex items-center space-x-1 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            )}

            {/* Gestational Badge */}
            <div className="hidden lg:flex items-center space-x-1.5 bg-rose-50 text-rose-700 px-3 py-1 rounded-lg border border-rose-200 text-xs font-semibold">
              <Calendar className="w-3.5 h-3.5 text-rose-500" />
              <span>Week {patient.currentWeek} • Day {patient.currentDay}</span>
            </div>

            {/* Patient 360 / Settings Drawer Toggle */}
            <button
              onClick={onOpenPatient360}
              className="flex items-center space-x-1.5 px-2.5 sm:px-3 py-1.5 text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-lg text-xs font-medium transition"
            >
              <Settings className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Patient 360</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
