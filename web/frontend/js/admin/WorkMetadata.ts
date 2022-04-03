export interface WorkMetadata {
  periods?: string[] | null;
  website?: string | null;
  namuRef?: string | null;
  annId?: string | null;
  source?: string | null;
  studios?: string[] | null;
  durationMinutes?: number | null;
  schedules?: {[country: string]: Schedule} | null;
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
