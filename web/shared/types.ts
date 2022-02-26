export * from './types_generated'

export type LegacyStatusType = 'watching' | 'finished' | 'interested' | 'suspended';
export type StatusType = 'WATCHING' | 'FINISHED' | 'INTERESTED' | 'SUSPENDED';

export type UserFetchOptions = {
  categories?: boolean;
  stats?: boolean;
  twitter?: boolean;
};

export type RecordFetchOptions = {
  hasNewerEpisode?: boolean;
  user?: UserFetchOptions | null;
};

export type PostFetchOptions = {
  record?: RecordFetchOptions | null;
  user?: UserFetchOptions | null;
};

export type SearchResultItem = {
  id: number;
  title: string;
  recordCount: number;
};

export type ChartItem<T> = {
  rank: number;
  object: T;
  factor: number;
  factor_percent: number;
  diff?: number;
  sign?: number;
};

export type ChartItemWork = {
  id: number;
  title: string;
  image_url: string | null;
};
