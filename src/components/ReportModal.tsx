import React from 'react';
import { Milestone } from '../types/episode';
import { useAuth } from '../context/AuthContext';
import { 
  X, 
  Printer, 
  Download, 
  ShieldCheck, 
  Building2, 
  CheckCircle2 
} from 'lucide-react';

interface ReportModalProps {
  milestone: Milestone | null;
  onClose: () => void;
}

export const ReportModal: React.FC<ReportModalProps> = ({ milestone, onClose }) => {
  const { patient } = useAuth();

  if (!milestone) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-300 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header Bar */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-teal-400" />
            <span className="font-bold text-sm tracking-tight">MNC Diagnostics & Fetal Imaging Suite</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition"
              title="Print Report"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Diagnostic Sheet Content */}
        <div className="p-6 sm:p-8 space-y-6 text-slate-900 max-h-[80vh] overflow-y-auto font-sans">
          {/* Clinic Header */}
          <div className="border-b-2 border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">MNC HEALTHCARE NETWORK</h2>
              <p className="text-xs text-slate-500">MNC Center, Bhattarahalli, Bengaluru • NABL Accredited Laboratory</p>
            </div>
            <div className="text-left sm:text-right text-xs text-slate-600">
              <div><strong>Report ID:</strong> RPT-{milestone.id}-9928</div>
              <div><strong>Date:</strong> {milestone.completedDate || '28 Feb 2026'}</div>
            </div>
          </div>

          {/* Patient Demographic Box */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Patient Name</span>
              <span className="font-bold text-slate-900 text-sm">{patient.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">MRN / ID</span>
              <span className="font-bold text-slate-900">{patient.mrn}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Age / Gender</span>
              <span className="font-bold text-slate-900">{patient.age} Y / Female</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Attending Consultant</span>
              <span className="font-bold text-slate-900">{patient.assignedDoctor.split(' (')[0]}</span>
            </div>
          </div>

          {/* Test Name Header */}
          <div className="bg-teal-50 border border-teal-200 p-3 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-teal-800 uppercase tracking-wider block">Investigation</span>
              <span className="font-extrabold text-teal-950 text-base">{milestone.name}</span>
            </div>
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Normal</span>
            </span>
          </div>

          {/* Clinical Findings / Values */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Findings & Parameters</h4>
            <div className="bg-white border border-slate-200 rounded-xl p-4 font-mono text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
              {milestone.reportSummary || 'Investigation completed with all parameters conforming to first/second trimester target ranges.'}
            </div>
          </div>

          {/* Impression / Notes */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm">
            <h4 className="font-bold text-slate-900 mb-1">Clinical Impression & Guidance:</h4>
            <p className="text-slate-700 leading-relaxed">
              {milestone.doctorNotes || 'No anomalies detected on current investigation. Maintain prescribed antenatal regimen.'}
            </p>
          </div>

          {/* Digital Signatures */}
          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Digitally authenticated through MNC Patient 360 LIS/RIS</span>
            </div>
            <div className="text-right">
              <div className="font-bold text-slate-800">{milestone.careProvider || 'Dr. S. Kulkarni (MD, Radiodiagnosis)'}</div>
              <div className="text-[11px] text-slate-400">Consultant Radiologist / Pathologist</div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-end space-x-2">
          <button
            onClick={handlePrint}
            className="inline-flex items-center space-x-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download PDF / Print</span>
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
