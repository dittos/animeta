import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  GraphQLTimestamp: any;
};

export type Category = Node & {
  __typename?: 'Category';
  id: Scalars['ID'];
  user: Maybe<User>;
  name: Maybe<Scalars['String']>;
};

export type Post = Node & {
  __typename?: 'Post';
  id: Scalars['ID'];
  record: Maybe<Record>;
  statusType: Maybe<StatusType>;
  status: Maybe<Scalars['String']>;
  comment: Maybe<Scalars['String']>;
  containsSpoiler: Maybe<Scalars['Boolean']>;
  user: Maybe<User>;
  updatedAt: Maybe<Scalars['GraphQLTimestamp']>;
  rating: Maybe<Scalars['Float']>;
  work: Maybe<Work>;
  episode: Maybe<Episode>;
};

export type PostConnection = {
  __typename?: 'PostConnection';
  nodes: Array<Post>;
  hasMore: Scalars['Boolean'];
};

export type Record = Node & {
  __typename?: 'Record';
  id: Scalars['ID'];
  title: Maybe<Scalars['String']>;
  statusType: Maybe<StatusType>;
  status: Maybe<Scalars['String']>;
  user: Maybe<User>;
  work: Maybe<Work>;
  category: Maybe<Category>;
  updatedAt: Maybe<Scalars['GraphQLTimestamp']>;
  rating: Maybe<Scalars['Float']>;
  hasNewerEpisode: Maybe<Scalars['Boolean']>;
};

export type RecordConnection = {
  __typename?: 'RecordConnection';
  nodes: Array<Record>;
};

export type User = Node & {
  __typename?: 'User';
  id: Scalars['ID'];
  name: Maybe<Scalars['String']>;
  joinedAt: Maybe<Scalars['GraphQLTimestamp']>;
  isTwitterConnected: Maybe<Scalars['Boolean']>;
  categories: Maybe<Array<Maybe<Category>>>;
  recordCount: Maybe<Scalars['Int']>;
  postCount: Maybe<Scalars['Int']>;
  posts: PostConnection;
  records: RecordConnection;
  recordFilters: RecordFilters;
};


export type UserPostsArgs = {
  beforeId: InputMaybe<Scalars['ID']>;
  count: InputMaybe<Scalars['Int']>;
};


export type UserRecordsArgs = {
  statusType: InputMaybe<StatusType>;
  categoryId: InputMaybe<Scalars['ID']>;
  orderBy: InputMaybe<RecordOrder>;
  first: InputMaybe<Scalars['Int']>;
};


export type UserRecordFiltersArgs = {
  statusType: InputMaybe<StatusType>;
  categoryId: InputMaybe<Scalars['ID']>;
};

export enum RecordOrder {
  Date = 'DATE',
  Title = 'TITLE',
  Rating = 'RATING'
}

export type RecordFilters = {
  __typename?: 'RecordFilters';
  statusType: RecordFilter;
  categoryId: RecordFilter;
};

export type RecordFilter = {
  __typename?: 'RecordFilter';
  allCount: Scalars['Int'];
  items: Array<RecordFilterItem>;
};

export type RecordFilterItem = {
  __typename?: 'RecordFilterItem';
  key: Scalars['String'];
  count: Scalars['Int'];
};

export type Work = Node & {
  __typename?: 'Work';
  id: Scalars['ID'];
  title: Maybe<Scalars['String']>;
  imageUrl: Maybe<Scalars['String']>;
  record: Maybe<Record>;
  recordCount: Maybe<Scalars['Int']>;
  metadata: Maybe<WorkMetadata>;
  episodes: Maybe<Array<Episode>>;
  episode: Maybe<Episode>;
  posts: PostConnection;
};


export type WorkEpisodeArgs = {
  episode: Scalars['Int'];
};


export type WorkPostsArgs = {
  beforeId: InputMaybe<Scalars['ID']>;
  count: InputMaybe<Scalars['Int']>;
  episode: InputMaybe<Scalars['Int']>;
};

export type Episode = {
  __typename?: 'Episode';
  number: Scalars['Int'];
  postCount: Maybe<Scalars['Int']>;
  userCount: Maybe<Scalars['Int']>;
  suspendedUserCount: Maybe<Scalars['Int']>;
};

export type WorkMetadata = {
  __typename?: 'WorkMetadata';
  periods: Maybe<Array<Scalars['String']>>;
  studioNames: Maybe<Array<Scalars['String']>>;
  source: Maybe<SourceType>;
  websiteUrl: Maybe<Scalars['String']>;
  namuwikiUrl: Maybe<Scalars['String']>;
  annUrl: Maybe<Scalars['String']>;
  durationMinutes: Maybe<Scalars['Int']>;
  schedules: Maybe<Array<WorkSchedule>>;
};

export enum SourceType {
  Manga = 'MANGA',
  Original = 'ORIGINAL',
  LightNovel = 'LIGHT_NOVEL',
  Game = 'GAME',
  FourKoma = 'FOUR_KOMA',
  VisualNovel = 'VISUAL_NOVEL',
  Novel = 'NOVEL'
}

export type WorkSchedule = {
  __typename?: 'WorkSchedule';
  country: Scalars['String'];
  date: Maybe<Scalars['GraphQLTimestamp']>;
  datePrecision: Maybe<DatePrecision>;
  broadcasts: Maybe<Array<Scalars['String']>>;
};

export enum DatePrecision {
  YearMonth = 'YEAR_MONTH',
  Date = 'DATE',
  DateTime = 'DATE_TIME'
}

export type Mutation = {
  __typename?: 'Mutation';
  _empty: Maybe<Scalars['Boolean']>;
  createRecord: CreateRecordResult;
};


export type MutationCreateRecordArgs = {
  input: CreateRecordInput;
};

export type CreateRecordInput = {
  title: Scalars['String'];
  categoryId: InputMaybe<Scalars['ID']>;
  status: Scalars['String'];
  statusType: StatusType;
  comment: Scalars['String'];
  publishTwitter: InputMaybe<Scalars['Boolean']>;
  rating: InputMaybe<Scalars['Float']>;
};

export type CreateRecordResult = {
  __typename?: 'CreateRecordResult';
  record: Record;
  post: Maybe<Post>;
};

export type Node = {
  id: Scalars['ID'];
};

export enum StatusType {
  Finished = 'FINISHED',
  Watching = 'WATCHING',
  Suspended = 'SUSPENDED',
  Interested = 'INTERESTED'
}

export type Query = {
  __typename?: 'Query';
  currentUser: Maybe<User>;
  user: Maybe<User>;
  userByName: Maybe<User>;
  timeline: Maybe<Array<Maybe<Post>>>;
  work: Maybe<Work>;
  workByTitle: Maybe<Work>;
  post: Maybe<Post>;
  curatedLists: Array<CuratedList>;
  curatedList: Maybe<CuratedList>;
  searchWorks: Maybe<SearchWorksResult>;
  tablePeriod: Maybe<TablePeriod>;
  currentTablePeriod: TablePeriod;
  tablePeriods: Array<TablePeriod>;
  weeklyWorksChart: Array<WorksChartItem>;
};


export type QueryUserArgs = {
  id: Scalars['ID'];
};


export type QueryUserByNameArgs = {
  name: Scalars['String'];
};


export type QueryTimelineArgs = {
  beforeId: InputMaybe<Scalars['ID']>;
  count: InputMaybe<Scalars['Int']>;
};


export type QueryWorkArgs = {
  id: Scalars['ID'];
};


export type QueryWorkByTitleArgs = {
  title: Scalars['String'];
};


export type QueryPostArgs = {
  id: Scalars['ID'];
};


export type QueryCuratedListArgs = {
  id: Scalars['ID'];
};


export type QuerySearchWorksArgs = {
  query: Scalars['String'];
};


export type QueryTablePeriodArgs = {
  period: Scalars['String'];
};


export type QueryWeeklyWorksChartArgs = {
  limit: Scalars['Int'];
};

export type CuratedList = {
  __typename?: 'CuratedList';
  id: Scalars['ID'];
  name: Maybe<Scalars['String']>;
  works: Maybe<CuratedListWorkConnection>;
};

export type CuratedListWorkConnection = {
  __typename?: 'CuratedListWorkConnection';
  edges: Maybe<Array<Maybe<CuratedListWorkEdge>>>;
  totalCount: Maybe<Scalars['Int']>;
};

export type CuratedListWorkEdge = {
  __typename?: 'CuratedListWorkEdge';
  node: Maybe<Work>;
};

export type SearchWorksResult = {
  __typename?: 'SearchWorksResult';
  edges: Array<SearchWorksResultEdge>;
};

export type SearchWorksResultEdge = {
  __typename?: 'SearchWorksResultEdge';
  node: Work;
  recordCount: Maybe<Scalars['Int']>;
};

export type TablePeriod = {
  __typename?: 'TablePeriod';
  period: Scalars['String'];
  year: Scalars['Int'];
  month: Scalars['Int'];
  isCurrent: Scalars['Boolean'];
  isRecommendationEnabled: Scalars['Boolean'];
  items: Array<TablePeriodItem>;
};


export type TablePeriodItemsArgs = {
  onlyAdded?: InputMaybe<Scalars['Boolean']>;
  username: InputMaybe<Scalars['String']>;
  withRecommendations?: InputMaybe<Scalars['Boolean']>;
};

export type TablePeriodItem = {
  __typename?: 'TablePeriodItem';
  title: Scalars['String'];
  work: Work;
  record: Maybe<Record>;
  recommendations: Maybe<Array<Recommendation>>;
  recommendationScore: Maybe<Scalars['Int']>;
};

export type Recommendation = RecommendationByCredit;

export type RecommendationByCredit = {
  __typename?: 'RecommendationByCredit';
  credit: Maybe<Credit>;
  related: Maybe<Array<WorkCredit>>;
  score: Maybe<Scalars['Int']>;
};

export type Credit = {
  __typename?: 'Credit';
  type: Maybe<CreditType>;
  name: Maybe<Scalars['String']>;
  personId: Scalars['ID'];
};

export type WorkCredit = {
  __typename?: 'WorkCredit';
  workId: Scalars['ID'];
  workTitle: Scalars['String'];
  type: Maybe<CreditType>;
};

export enum CreditType {
  OriginalWork = 'ORIGINAL_WORK',
  ChiefDirector = 'CHIEF_DIRECTOR',
  SeriesDirector = 'SERIES_DIRECTOR',
  Director = 'DIRECTOR',
  SeriesComposition = 'SERIES_COMPOSITION',
  CharacterDesign = 'CHARACTER_DESIGN',
  Music = 'MUSIC'
}

export type WorksChartItem = {
  __typename?: 'WorksChartItem';
  rank: Scalars['Int'];
  work: Work;
  diff: Maybe<Scalars['Int']>;
  sign: Maybe<Scalars['Int']>;
};

export type WorkDtoFragment = { __typename?: 'Work', id: string, title: string | null, imageUrl: string | null, recordCount: number | null, record: { __typename?: 'Record', id: string } | null, metadata: { __typename?: 'WorkMetadata', periods: Array<string> | null, studioNames: Array<string> | null, source: SourceType | null, websiteUrl: string | null, namuwikiUrl: string | null, annUrl: string | null, durationMinutes: number | null, schedules: Array<{ __typename?: 'WorkSchedule', country: string, date: any | null, datePrecision: DatePrecision | null, broadcasts: Array<string> | null }> | null } | null };

export type UserDtoFragment = { __typename?: 'User', id: string, name: string | null, joinedAt: any | null };

export type PostDtoFragment = { __typename?: 'Post', id: string, statusType: StatusType | null, status: string | null, comment: string | null, containsSpoiler: boolean | null, updatedAt: any | null, rating: number | null, record: { __typename?: 'Record', id: string } | null, user: { __typename?: 'User', id: string, name: string | null, joinedAt: any | null } | null };

export type EpisodeDtoFragment = { __typename?: 'Episode', number: number, postCount: number | null, userCount: number | null, suspendedUserCount: number | null };

export type RecordDtoFragment = { __typename?: 'Record', id: string, title: string | null, statusType: StatusType | null, status: string | null, rating: number | null, updatedAt: any | null, user: { __typename?: 'User', id: string } | null, work: { __typename?: 'Work', id: string } | null, category: { __typename?: 'Category', id: string } | null };

export const WorkDtoFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkDTO"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Work"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"imageUrl"}},{"kind":"Field","name":{"kind":"Name","value":"recordCount"}},{"kind":"Field","name":{"kind":"Name","value":"record"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"metadata"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"periods"}},{"kind":"Field","name":{"kind":"Name","value":"studioNames"}},{"kind":"Field","name":{"kind":"Name","value":"source"}},{"kind":"Field","name":{"kind":"Name","value":"websiteUrl"}},{"kind":"Field","name":{"kind":"Name","value":"namuwikiUrl"}},{"kind":"Field","name":{"kind":"Name","value":"annUrl"}},{"kind":"Field","name":{"kind":"Name","value":"durationMinutes"}},{"kind":"Field","name":{"kind":"Name","value":"schedules"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"country"}},{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"datePrecision"}},{"kind":"Field","name":{"kind":"Name","value":"broadcasts"}}]}}]}}]}}]} as unknown as DocumentNode<WorkDtoFragment, unknown>;
export const UserDtoFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"UserDTO"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"User"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"joinedAt"}}]}}]} as unknown as DocumentNode<UserDtoFragment, unknown>;
export const PostDtoFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"PostDTO"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Post"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"record"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"statusType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"comment"}},{"kind":"Field","name":{"kind":"Name","value":"containsSpoiler"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"UserDTO"}}]}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}}]}},...UserDtoFragmentDoc.definitions]} as unknown as DocumentNode<PostDtoFragment, unknown>;
export const EpisodeDtoFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EpisodeDTO"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Episode"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"number"}},{"kind":"Field","name":{"kind":"Name","value":"postCount"}},{"kind":"Field","name":{"kind":"Name","value":"userCount"}},{"kind":"Field","name":{"kind":"Name","value":"suspendedUserCount"}}]}}]} as unknown as DocumentNode<EpisodeDtoFragment, unknown>;
export const RecordDtoFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RecordDTO"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Record"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"statusType"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"work"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]} as unknown as DocumentNode<RecordDtoFragment, unknown>;