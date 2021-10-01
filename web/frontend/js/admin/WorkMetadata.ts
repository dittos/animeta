export interface WorkMetadata {
  periods?: string[];
  website?: string;
  namuRef?: string;
  annId?: string;
  source?: string;
  studios?: string[];
  durationMinutes?: number;
  schedules?: {[country: string]: Schedule};
  _comment?: string;
}

export type DatePrecision = 'YEAR_MONTH' | 'DATE' | 'DATE_TIME';

export interface Schedule {
  date?: string | null;
  datePrecision?: DatePrecision | null;
  broadcasts?: string[] | null;
}

export function isEmptySchedule(schedule: Schedule): boolean {
  return !schedule.date && !schedule.datePrecision && (!schedule.broadcasts || schedule.broadcasts.length === 0);
}
