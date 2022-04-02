export type SourceType =
  | 'MANGA'
  | 'ORIGINAL'
  | 'LIGHT_NOVEL'
  | 'GAME'
  | 'FOUR_KOMA'
  | 'VISUAL_NOVEL'
  | 'NOVEL'

export const LATEST_WORK_METADATA_VERSION = 2

export type WorkMetadata = {
  version: number;
  title?: string | null;
  periods?: string[] | null;
  studios?: string[] | null;
  source?: SourceType | null;
  website?: string | null;
  namuRef?: string | null;
  annId?: string | null;
  durationMinutes?: number | null;
  schedules?: {[country: string]: Schedule} | null;
}

export type Schedule = {
  date?: string | null;
  datePrecision?: DatePrecision | null;
  broadcasts?: string[] | null;
}

export type DatePrecision = 'YEAR_MONTH' | 'DATE' | 'DATE_TIME'