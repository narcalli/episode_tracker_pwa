export type MilestoneStatus = 'completed' | 'due_now' | 'upcoming' | 'window_closed';

/** A milestone as the screens show it (made from the API's EpisodeItem by the episode context). Dates are already formatted. */
export interface Milestone {
  id: string;
  name: string;
  status: MilestoneStatus;
  /** An appointment is booked (status stays 'upcoming'). */
  booked: boolean;
  windowStart: string | null;
  windowEnd: string | null;
  completedDate: string | null;
}

/** The patient whose journey is open: from the sign-in session. */
export interface PatientProfile {
  id: string;
  name: string;
  /** The patient code the hospital knows them by. */
  mrn: string;
  phone: string;
}
