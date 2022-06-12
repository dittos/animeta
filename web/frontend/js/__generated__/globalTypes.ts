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

export type Category = {
  __typename?: 'Category';
  id?: Maybe<Scalars['ID']>;
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

export type Post = {
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

export type Query = {
  __typename?: 'Query';
  curatedList?: Maybe<CuratedList>;
  curatedLists?: Maybe<Array<Maybe<CuratedList>>>;
  currentUser?: Maybe<User>;
  searchWorks?: Maybe<SearchWorksResult>;
  timeline?: Maybe<Array<Maybe<Post>>>;
  userByName?: Maybe<User>;
  weeklyWorksChart: Array<WorksChartItem>;
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

export type Record = {
  __typename?: 'Record';
  id?: Maybe<Scalars['ID']>;
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

export enum StatusType {
  Finished = 'FINISHED',
  Interested = 'INTERESTED',
  Suspended = 'SUSPENDED',
  Watching = 'WATCHING'
}

export type User = {
  __typename?: 'User';
  categories?: Maybe<Array<Maybe<Category>>>;
  id?: Maybe<Scalars['ID']>;
  isTwitterConnected?: Maybe<Scalars['Boolean']>;
  joinedAt?: Maybe<Scalars['GraphQLTimestamp']>;
  name?: Maybe<Scalars['String']>;
  postCount?: Maybe<Scalars['Int']>;
  recordCount?: Maybe<Scalars['Int']>;
};

export type Work = {
  __typename?: 'Work';
  id?: Maybe<Scalars['ID']>;
  imageUrl?: Maybe<Scalars['String']>;
  record?: Maybe<Record>;
  recordCount?: Maybe<Scalars['Int']>;
  title?: Maybe<Scalars['String']>;
};

export type WorksChartItem = {
  __typename?: 'WorksChartItem';
  diff?: Maybe<Scalars['Int']>;
  rank: Scalars['Int'];
  sign?: Maybe<Scalars['Int']>;
  work: Work;
};
