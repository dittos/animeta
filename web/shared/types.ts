export * from './types_generated'

export type StatusType = 'watching' | 'finished' | 'interested' | 'suspended';

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
  imageUrl?: string;
};
