import React, { createContext, useContext, useState, useEffect } from 'react';
import { PatientProfile } from '../types/episode';
import { initialPatientProfile } from '../data/maternityEpisodeData';

interface AuthContextType {
  patient: PatientProfile;
  token: string | null;
  isAuthenticated: boolean;
  authSource: 'patient360_sso' | 'session_stored' | 'mock_demo';
  loginWithPatient360Token: (token: string, profileOverride?: Partial<PatientProfile>) => void;
  updateEDD: (newDate: string) => void;
  activeScenario: 'trimester_2_active' | 'trimester_1_active' | 'trimester_3_active' | 'snapshot_closed';
  setActiveScenario: (scenario: 'trimester_2_active' | 'trimester_1_active' | 'trimester_3_active' | 'snapshot_closed') => void;
  refreshFromPatient360: () => Promise<void>;
  isSyncing: boolean;
  lastSyncedAt: Date;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patient, setPatient] = useState<PatientProfile>(() => {
    const saved = localStorage.getItem('carejourney_patient_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return initialPatientProfile;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('carejourney_p360_token') || 'p360_live_sess_77291a';
  });

  const [authSource, setAuthSource] = useState<'patient360_sso' | 'session_stored' | 'mock_demo'>('mock_demo');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date>(new Date());
  const [activeScenario, setActiveScenario] = useState<'trimester_2_active' | 'trimester_1_active' | 'trimester_3_active' | 'snapshot_closed'>('trimester_2_active');

  // Check URL params on initial load for Patient 360 SSO parameters (e.g. ?token=...&mrn=...)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const p360Token = urlParams.get('token') || urlParams.get('auth_token');
    const p360Mrn = urlParams.get('mrn');
    const p360Name = urlParams.get('patient_name');

    if (p360Token) {
      setToken(p360Token);
      setAuthSource('patient360_sso');
      localStorage.setItem('carejourney_p360_token', p360Token);

      if (p360Mrn || p360Name) {
        setPatient(prev => {
          const updated = {
            ...prev,
            ...(p360Mrn ? { mrn: p360Mrn } : {}),
            ...(p360Name ? { name: p360Name } : {})
          };
          localStorage.setItem('carejourney_patient_profile', JSON.stringify(updated));
          return updated;
        });
      }
    }
  }, []);

  const loginWithPatient360Token = (newToken: string, profileOverride?: Partial<PatientProfile>) => {
    setToken(newToken);
    setAuthSource('patient360_sso');
    localStorage.setItem('carejourney_p360_token', newToken);

    if (profileOverride) {
      setPatient(prev => {
        const updated = { ...prev, ...profileOverride };
        localStorage.setItem('carejourney_patient_profile', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const updateEDD = (newDate: string) => {
    setPatient(prev => {
      const updated = { ...prev, edd: newDate };
      localStorage.setItem('carejourney_patient_profile', JSON.stringify(updated));
      return updated;
    });
  };

  const refreshFromPatient360 = async () => {
    setIsSyncing(true);
    // Simulate real handshake with Patient 360 backend
    await new Promise(resolve => setTimeout(resolve, 800));
    setLastSyncedAt(new Date());
    setIsSyncing(false);
  };

  return (
    <AuthContext.Provider
      value={{
        patient,
        token,
        isAuthenticated: !!token,
        authSource,
        loginWithPatient360Token,
        updateEDD,
        activeScenario,
        setActiveScenario,
        refreshFromPatient360,
        isSyncing,
        lastSyncedAt
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
