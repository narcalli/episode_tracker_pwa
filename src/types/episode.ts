export type MilestoneStatus = 'completed' | 'due_now' | 'upcoming' | 'window_closed';

export type MilestoneCategory = 
  | 'ultrasound'     // USG scans
  | 'blood_test'     // CBC, TSH, Double Marker, etc.
  | 'counselling'    // Diet, Lactation, Physiotherapy
  | 'clinical_exam'  // Urine routine, VDRL, RBS
  | 'procedure';     // IV injection

export interface Milestone {
  id: string;
  name: string;
  shortCode?: string;
  category: MilestoneCategory;
  status: MilestoneStatus;
  stageId: string;
  stageName: string;
  windowStart: string;
  windowEnd: string;
  completedDate?: string;
  
  // Patient Guidance & Clinical Context
  description: string;
  whyItMatters: string;
  instructions?: string[];
  fastingRequired?: boolean;
  fullBladderRequired?: boolean;
  approxDurationMinutes?: number;
  
  // Results & Clinical Data
  reportAvailable?: boolean;
  reportSummary?: string;
  doctorNotes?: string;
  careProvider?: string;
  facility?: string;
}

export interface Stage {
  id: string;
  stageNumber: number;
  title: string;
  weekRange: string;
  startDate: string;
  endDate: string;
  description: string;
  milestones: Milestone[];
}

export interface PatientProfile {
  id: string;
  name: string;
  mrn: string;
  phone: string;
  email: string;
  age: number;
  edd: string; // Estimated Due Date
  currentWeek: number;
  currentDay: number;
  episodeName: string;
  packageType: string;
  careCenter: string;
  assignedDoctor: string;
  careCoordinator: string;
  authToken?: string;
}

export interface EpisodeSummary {
  totalMilestones: number;
  completedMilestones: number;
  dueNowMilestones: number;
  upcomingMilestones: number;
  windowClosedMilestones: number;
  progressPercentage: number;
}
