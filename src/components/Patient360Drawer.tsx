import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Key, 
  Calendar, 
  CheckCircle, 
  Layers, 
  RefreshCw,
  Copy,
  Check
} from 'lucide-react';

interface Patient360DrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Patient360Drawer: React.FC<Patient360DrawerProps> = ({ isOpen, onClose }) => {
  const { 
    patient, 
    token, 
    authSource, 
    updateEDD, 
    activeScenario, 
    setActiveScenario,
    refreshFromPatient360,
    isSyncing,
    lastSyncedAt
  } = useAuth();

  const [eddInput, setEddInput] = useState(patient.edd);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSaveEdd = (e: React.FormEvent) => {
    e.preventDefault();
    updateEDD(eddInput);
  };

  const handleCopyLink = () => {
    const ssoUrl = `${window.location.origin}/?token=${token || 'p360_token_demo'}&mrn=${encodeURIComponent(patient.mrn)}&patient_name=${encodeURIComponent(patient.name)}`;
    navigator.clipboard.writeText(ssoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-teal-500/20 border border-teal-400/30 flex items-center justify-center text-teal-400">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Patient 360 Integration</h3>
              <p className="text-[11px] text-slate-400">NeuronCX / MNC EMR Sync</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Content */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1 text-xs text-slate-700">
          {/* Auth State Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 flex items-center">
                <Key className="w-3.5 h-3.5 mr-1.5 text-teal-600" />
                Backend Auth Handshake
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                ACTIVE
              </span>
            </div>

            <div className="space-y-1 font-mono text-[11px]">
              <div className="flex justify-between text-slate-500">
                <span>Auth Provider:</span>
                <span className="text-slate-800 font-semibold">Patient 360 / NeuronCX</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Bearer Token:</span>
                <span className="text-slate-800 truncate max-w-[170px]" title={token || ''}>
                  {token || 'p360_live_sess_77291a'}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Source:</span>
                <span className="text-slate-800 font-semibold">{authSource}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Last Synced:</span>
                <span className="text-slate-800">{lastSyncedAt.toLocaleTimeString()}</span>
              </div>
            </div>

            <button
              onClick={() => refreshFromPatient360()}
              disabled={isSyncing}
              className="w-full flex items-center justify-center space-x-1.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-semibold transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-teal-600' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Force Sync with Patient 360'}</span>
            </button>
          </div>

          {/* Test SSO Deep-link */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-xs">Patient 360 SSO Launch Link</h4>
            <p className="text-[11px] text-slate-500">
              When launching this PWA from the Patient 360 dashboard, pass the auth token and patient MRN via query parameters:
            </p>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={`?token=${token || 'p360_token'}&mrn=${patient.mrn}`}
                className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-mono text-slate-700"
              />
              <button
                onClick={handleCopyLink}
                className="p-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition shrink-0"
                title="Copy launch link"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Scenario Switcher */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-slate-900 text-xs">Milestone State Simulation</h4>
              <span className="text-[10px] text-teal-700 font-semibold">Demo Scenarios</span>
            </div>
            <p className="text-[11px] text-slate-500">
              Switch clinical states to test how the patient sees Completed, Due Now, and What Lies Ahead:
            </p>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setActiveScenario('trimester_2_active')}
                className={`w-full text-left p-3 rounded-xl border transition ${
                  activeScenario === 'trimester_2_active'
                    ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500/30'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Trimester 2 (Week 12) • Recommended</span>
                  {activeScenario === 'trimester_2_active' && <CheckCircle className="w-4 h-4 text-teal-600" />}
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  ✓ Stage 1 Completed (11) • ● Stage 2 Due Now (8) • ○ Stages 3-5 Upcoming (7)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveScenario('trimester_1_active')}
                className={`w-full text-left p-3 rounded-xl border transition ${
                  activeScenario === 'trimester_1_active'
                    ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500/30'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Trimester 1 (Week 6)</span>
                  {activeScenario === 'trimester_1_active' && <CheckCircle className="w-4 h-4 text-teal-600" />}
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Early booking: Stage 1 in progress (4 completed, 7 due now)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveScenario('trimester_3_active')}
                className={`w-full text-left p-3 rounded-xl border transition ${
                  activeScenario === 'trimester_3_active'
                    ? 'bg-teal-50 border-teal-500 ring-1 ring-teal-500/30'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">Trimester 3 (Week 34)</span>
                  {activeScenario === 'trimester_3_active' && <CheckCircle className="w-4 h-4 text-teal-600" />}
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Stages 1 to 4 completed (23), Stage 5 Due Now (Lactation, RBS)
                </div>
              </button>

              <button
                type="button"
                onClick={() => setActiveScenario('snapshot_closed')}
                className={`w-full text-left p-3 rounded-xl border transition ${
                  activeScenario === 'snapshot_closed'
                    ? 'bg-amber-50 border-amber-500 ring-1 ring-amber-500/30'
                    : 'bg-white border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900">Exact Snapshot (All Windows Closed)</span>
                  {activeScenario === 'snapshot_closed' && <CheckCircle className="w-4 h-4 text-amber-600" />}
                </div>
                <div className="text-[11px] text-slate-600 mt-0.5">
                  Matches the historical screenshot with "Window closed" on all items
                </div>
              </button>
            </div>
          </div>

          {/* Change EDD Form (from snapshot) */}
          <form onSubmit={handleSaveEdd} className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="font-bold text-slate-900 text-xs flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
              Adjust Estimated Due Date (EDD)
            </h4>
            <div className="flex items-center space-x-2">
              <input
                type="date"
                value={eddInput}
                onChange={e => setEddInput(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold transition"
              >
                Save
              </button>
            </div>
            <p className="text-[10px] text-slate-400">
              Matches the "EDD 09 Nov 26 (Change)" control in the admin view.
            </p>
          </form>

          {/* Patient 360 Metadata */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5 text-[11px]">
            <div className="font-bold text-slate-900 mb-1">Assigned Clinical Team</div>
            <div><strong>Patient:</strong> {patient.name} ({patient.mrn})</div>
            <div><strong>Center:</strong> {patient.careCenter}</div>
            <div><strong>Doctor:</strong> {patient.assignedDoctor}</div>
            <div><strong>Care Coordinator:</strong> {patient.careCoordinator}</div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
