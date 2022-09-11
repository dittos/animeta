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
  name: Maybe<Scalars['String']>;
  user: Maybe<User>;
};

export type Credit = {
  __typename?: 'Credit';
  name: Maybe<Scalars['String']>;
  personId: Scalars['ID'];
  type: Maybe<CreditType>;
};

export const enum CreditType {
  CharacterDesign = 'CHARACTER_DESIGN',
  ChiefDirector = 'CHIEF_DIRECTOR',
  Director = 'DIRECTOR',
  Music = 'MUSIC',
  OriginalWork = 'ORIGINAL_WORK',
  SeriesComposition = 'SERIES_COMPOSITION',
  SeriesDirector = 'SERIES_DIRECTOR'
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

export const enum DatePrecision {
  Date = 'DATE',
  DateTime = 'DATE_TIME',
  YearMonth = 'YEAR_MONTH'
};

export type Episode = {
  __typename?: 'Episode';
  number: Scalars['Int'];
  postCount: Maybe<Scalars['Int']>;
  suspendedUserCount: Maybe<Scalars['Int']>;
  userCount: Maybe<Scalars['Int']>;
};

export type Node = {
  id: Scalars['ID'];
};

export type Post = Node & {
  __typename?: 'Post';
  comment: Maybe<Scalars['String']>;
  containsSpoiler: Maybe<Scalars['Boolean']>;
  episode: Maybe<Episode>;
  id: Scalars['ID'];
  record: Maybe<Record>;
  status: Maybe<Scalars['String']>;
  statusType: Maybe<StatusType>;
  updatedAt: Maybe<Scalars['GraphQLTimestamp']>;
  user: Maybe<User>;
  work: Maybe<Work>;
};

export type PostConnection = {
  __typename?: 'PostConnection';
  hasMore: Scalars['Boolean'];
  nodes: Array<Post>;
};

export type Query = {
  __typename?: 'Query';
  curatedList: Maybe<CuratedList>;
  curatedLists: Array<CuratedList>;
  currentTablePeriod: TablePeriod;
  currentUser: Maybe<User>;
  post: Maybe<Post>;
  searchWorks: Maybe<SearchWorksResult>;
  tablePeriod: Maybe<TablePeriod>;
  tablePeriods: Array<TablePeriod>;
  timeline: Maybe<Array<Maybe<Post>>>;
  user: Maybe<User>;
  userByName: Maybe<User>;
  weeklyWorksChart: Array<WorksChartItem>;
  work: Maybe<Work>;
  workByTitle: Maybe<Work>;
};


export type QueryCuratedListArgs = {
  id: Scalars['ID'];
};


export type QueryPostArgs = {
  id: Scalars['ID'];
};


export type QuerySearchWorksArgs = {
  query: Scalars['String'];
};


export type QueryTablePeriodArgs = {
  period: Scalars['String'];
};


export type QueryTimelineArgs = {
  beforeId: InputMaybe<Scalars['ID']>;
  count: InputMaybe<Scalars['Int']>;
};


export type QueryUserArgs = {
  id: Scalars['ID'];
};


export type QueryUserByNameArgs = {
  name: Scalars['String'];
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

export type Recommendation = RecommendationByCredit;

export type RecommendationByCredit = {
  __typename?: 'RecommendationByCredit';
  credit: Maybe<Credit>;
  related: Maybe<Array<WorkCredit>>;
  score: Maybe<Scalars['Int']>;
};

export type Record = Node & {
  __typename?: 'Record';
  id: Scalars['ID'];
  status: Maybe<Scalars['String']>;
  statusType: Maybe<StatusType>;
  title: Maybe<Scalars['String']>;
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

export type TablePeriod = {
  __typename?: 'TablePeriod';
  isCurrent: Scalars['Boolean'];
  isRecommendationEnabled: Scalars['Boolean'];
  items: Array<TablePeriodItem>;
  month: Scalars['Int'];
  period: Scalars['String'];
  year: Scalars['Int'];
};


export type TablePeriodItemsArgs = {
  onlyAdded?: InputMaybe<Scalars['Boolean']>;
  username: InputMaybe<Scalars['String']>;
  withRecommendations?: InputMaybe<Scalars['Boolean']>;
};

export type TablePeriodItem = {
  __typename?: 'TablePeriodItem';
  recommendationScore: Maybe<Scalars['Int']>;
  recommendations: Maybe<Array<Recommendation>>;
  record: Maybe<Record>;
  title: Scalars['String'];
  work: Work;
};

export type User = Node & {
  __typename?: 'User';
  categories: Maybe<Array<Maybe<Category>>>;
  id: Scalars['ID'];
  isTwitterConnected: Maybe<Scalars['Boolean']>;
  joinedAt: Maybe<Scalars['GraphQLTimestamp']>;
  name: Maybe<Scalars['String']>;
  postCount: Maybe<Scalars['Int']>;
  posts: PostConnection;
  recordCount: Maybe<Scalars['Int']>;
};


export type UserPostsArgs = {
  beforeId: InputMaybe<Scalars['ID']>;
  count: InputMaybe<Scalars['Int']>;
};

export type Work = Node & {
  __typename?: 'Work';
  episode: Maybe<Episode>;
  episodes: Maybe<Array<Episode>>;
  id: Scalars['ID'];
  imageUrl: Maybe<Scalars['String']>;
  metadata: Maybe<WorkMetadata>;
  posts: PostConnection;
  record: Maybe<Record>;
  recordCount: Maybe<Scalars['Int']>;
  title: Maybe<Scalars['String']>;
};


export type WorkEpisodeArgs = {
  episode: Scalars['Int'];
};


export type WorkPostsArgs = {
  beforeId: InputMaybe<Scalars['ID']>;
  count: InputMaybe<Scalars['Int']>;
  episode: InputMaybe<Scalars['Int']>;
};

export type WorkCredit = {
  __typename?: 'WorkCredit';
  type: Maybe<CreditType>;
  workId: Scalars['ID'];
  workTitle: Scalars['String'];
};

export type WorkMetadata = {
  __typename?: 'WorkMetadata';
  annUrl: Maybe<Scalars['String']>;
  durationMinutes: Maybe<Scalars['Int']>;
  namuwikiUrl: Maybe<Scalars['String']>;
  periods: Maybe<Array<Scalars['String']>>;
  schedules: Maybe<Array<WorkSchedule>>;
  source: Maybe<SourceType>;
  studioNames: Maybe<Array<Scalars['String']>>;
  websiteUrl: Maybe<Scalars['String']>;
};

export type WorkSchedule = {
  __typename?: 'WorkSchedule';
  broadcasts: Maybe<Array<Scalars['String']>>;
  country: Scalars['String'];
  date: Maybe<Scalars['GraphQLTimestamp']>;
  datePrecision: Maybe<DatePrecision>;
};

export type WorksChartItem = {
  __typename?: 'WorksChartItem';
  diff: Maybe<Scalars['Int']>;
  rank: Scalars['Int'];
  sign: Maybe<Scalars['Int']>;
  work: Work;
};
