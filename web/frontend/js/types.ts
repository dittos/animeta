export interface RecordDTO {
  id: number;
  status: string;
  status_type: 'watching' | 'finished' | 'interested' | 'suspended';
}

export interface WorkDTO {
  id: number;
  title: string;
  image_url?: string;
  record_count: number;
  record?: RecordDTO;
  metadata?: {
    title: string;
    links: {
      website?: string;
      namu?: string;
      ann?: string;
    };
    studios?: string[];
    source?: SourceType;
    schedule?: {[country: string]: WorkSchedule};
    durationMinutes?: number;
  };
  recommendations?: Recommendation[];
  recommendationScore?: number;
}

export type CreditType =
  | 'ORIGINAL_WORK'
  | 'CHIEF_DIRECTOR'
  | 'SERIES_DIRECTOR'
  | 'DIRECTOR'
  | 'SERIES_COMPOSITION'
  | 'CHARACTER_DESIGN'
  | 'MUSIC'
  ;

export type Recommendation = {
  credit: {
    type: CreditType;
    name: string;
    personId: number;
  };
  related: {
    workId: number;
    workTitle: string;
    type: CreditType;
  }[];
  score: number;
};

export type SourceType =
  | 'MANGA'
  | 'ORIGINAL'
  | 'LIGHT_NOVEL'
  | 'GAME'
  | 'FOUR_KOMA'
  | 'VISUAL_NOVEL'
  | 'NOVEL'
  ;

export type WorkSchedule = {
  date?: number;
  date_only?: boolean;
  broadcasts?: string[];
};

export interface PostDTO {
  id: number;
}
