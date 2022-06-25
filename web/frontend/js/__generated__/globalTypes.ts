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
  name?: Maybe<Scalars['String']>;
  user?: Maybe<User>;
};

export type CuratedList = {
  __typename?: 'CuratedList';
  id?: Maybe<Scalars['ID']>;
  name?: Maybe<Scalars['String']>;
  works?: Maybe<CuratedListWorkConnection>;
};

export type CuratedListWorkConnection = {
  __typename?: 'CuratedListWorkConnection';
  edges?: Maybe<Array<Maybe<CuratedListWorkEdge>>>;
  totalCount?: Maybe<Scalars['Int']>;
};

export type CuratedListWorkEdge = {
  __typename?: 'CuratedListWorkEdge';
  node?: Maybe<Work>;
};

export const enum DatePrecision {
  Date = 'DATE',
  DateTime = 'DATE_TIME',
  YearMonth = 'YEAR_MONTH'
};

export type Episode = {
  __typename?: 'Episode';
  number: Scalars['Int'];
  postCount?: Maybe<Scalars['Int']>;
  suspendedUserCount?: Maybe<Scalars['Int']>;
  userCount?: Maybe<Scalars['Int']>;
};

export type Node = {
  id: Scalars['ID'];
};

export type Post = Node & {
  __typename?: 'Post';
  comment?: Maybe<Scalars['String']>;
  containsSpoiler?: Maybe<Scalars['Boolean']>;
  id: Scalars['ID'];
  record?: Maybe<Record>;
  status?: Maybe<Scalars['String']>;
  statusType?: Maybe<StatusType>;
  updatedAt?: Maybe<Scalars['GraphQLTimestamp']>;
  user?: Maybe<User>;
};

export type PostConnection = {
  __typename?: 'PostConnection';
  hasMore: Scalars['Boolean'];
  nodes: Array<Post>;
};

export type Query = {
  __typename?: 'Query';
  curatedList?: Maybe<CuratedList>;
  curatedLists?: Maybe<Array<Maybe<CuratedList>>>;
  currentUser?: Maybe<User>;
  searchWorks?: Maybe<SearchWorksResult>;
  timeline?: Maybe<Array<Maybe<Post>>>;
  userByName?: Maybe<User>;
  weeklyWorksChart: Array<WorksChartItem>;
  work?: Maybe<Work>;
  workByTitle?: Maybe<Work>;
};


export type QueryCuratedListArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type QuerySearchWorksArgs = {
  query: Scalars['String'];
};


export type QueryTimelineArgs = {
  beforeId?: InputMaybe<Scalars['ID']>;
  count?: InputMaybe<Scalars['Int']>;
};


export type QueryUserByNameArgs = {
  name?: InputMaybe<Scalars['String']>;
};


export type QueryWeeklyWorksChartArgs = {
  limit: Scalars['Int'];
};


export type QueryWorkArgs = {
  id: Scalars['ID'];
};


export type QueryWorkByTitleArgs = {
  title: Scalars['String'];
};

export type Record = Node & {
  __typename?: 'Record';
  id: Scalars['ID'];
  status?: Maybe<Scalars['String']>;
  statusType?: Maybe<StatusType>;
  title?: Maybe<Scalars['String']>;
};

export type SearchWorksResult = {
  __typename?: 'SearchWorksResult';
  edges: Array<SearchWorksResultEdge>;
};

export type SearchWorksResultEdge = {
  __typename?: 'SearchWorksResultEdge';
  node: Work;
  recordCount?: Maybe<Scalars['Int']>;
};

export const enum SourceType {
  FourKoma = 'FOUR_KOMA',
  Game = 'GAME',
  LightNovel = 'LIGHT_NOVEL',
  Manga = 'MANGA',
  Novel = 'NOVEL',
  Original = 'ORIGINAL',
  VisualNovel = 'VISUAL_NOVEL'
};

export const enum StatusType {
  Finished = 'FINISHED',
  Interested = 'INTERESTED',
  Suspended = 'SUSPENDED',
  Watching = 'WATCHING'
};

export type User = Node & {
  __typename?: 'User';
  categories?: Maybe<Array<Maybe<Category>>>;
  id: Scalars['ID'];
  isTwitterConnected?: Maybe<Scalars['Boolean']>;
  joinedAt?: Maybe<Scalars['GraphQLTimestamp']>;
  name?: Maybe<Scalars['String']>;
  postCount?: Maybe<Scalars['Int']>;
  recordCount?: Maybe<Scalars['Int']>;
};

export type Work = Node & {
  __typename?: 'Work';
  episode?: Maybe<Episode>;
  episodes?: Maybe<Array<Episode>>;
  id: Scalars['ID'];
  imageUrl?: Maybe<Scalars['String']>;
  metadata?: Maybe<WorkMetadata>;
  posts: PostConnection;
  record?: Maybe<Record>;
  recordCount?: Maybe<Scalars['Int']>;
  title?: Maybe<Scalars['String']>;
};


export type WorkEpisodeArgs = {
  episode: Scalars['Int'];
};


export type WorkPostsArgs = {
  beforeId?: InputMaybe<Scalars['ID']>;
  count?: InputMaybe<Scalars['Int']>;
  episode?: InputMaybe<Scalars['Int']>;
};

export type WorkMetadata = {
  __typename?: 'WorkMetadata';
  annUrl?: Maybe<Scalars['String']>;
  durationMinutes?: Maybe<Scalars['Int']>;
  namuwikiUrl?: Maybe<Scalars['String']>;
  periods?: Maybe<Array<Scalars['String']>>;
  schedules?: Maybe<Array<WorkSchedule>>;
  source?: Maybe<SourceType>;
  studioNames?: Maybe<Array<Scalars['String']>>;
  websiteUrl?: Maybe<Scalars['String']>;
};

export type WorkSchedule = {
  __typename?: 'WorkSchedule';
  broadcasts?: Maybe<Array<Scalars['String']>>;
  country: Scalars['String'];
  date?: Maybe<Scalars['GraphQLTimestamp']>;
  datePrecision?: Maybe<DatePrecision>;
};

export type WorksChartItem = {
  __typename?: 'WorksChartItem';
  diff?: Maybe<Scalars['Int']>;
  rank: Scalars['Int'];
  sign?: Maybe<Scalars['Int']>;
  work: Work;
};
