import React, { useState } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

interface PwaInstallPromptProps {
  deferredPrompt: any;
  onInstall: () => void;
}

export const PwaInstallPrompt: React.FC<PwaInstallPromptProps> = ({ deferredPrompt, onInstall }) => {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 bg-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-slate-700 animate-in slide-in-from-bottom duration-300">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white shrink-0 shadow-md">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-white">Install CareJourney App</h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Add to your home screen for quick offline access and timely appointment alerts.
            </p>
          </div>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="p-1 text-slate-400 hover:text-white rounded-lg transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3.5 flex items-center space-x-2">
        <button
          onClick={onInstall}
          className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Add to Home Screen</span>
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="py-2 px-3 bg-white/10 hover:bg-white/20 text-slate-300 font-semibold rounded-xl text-xs transition"
        >
          Later
        </button>
      </div>
    </div>
  );
};
