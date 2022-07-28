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
