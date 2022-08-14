import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import type { History as HistoryModel } from 'src/entities/history.entity';
import type { User as UserModel } from 'src/entities/user.entity';
import type { Record as RecordModel } from 'src/entities/record.entity';
import type { Work as WorkModel } from 'src/entities/work.entity';
import type { Episode as EpisodeModel } from 'src/entities/episode.entity';
import type { Period as PeriodModel } from 'src/utils/period';
import type { MercuriusContext } from 'mercurius';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type ResolverFn<TResult, TParent, TContext, TArgs> = (parent: TParent, args: TArgs, context: TContext, info: GraphQLResolveInfo) => Promise<import("mercurius-codegen").DeepPartial<TResult>> | import("mercurius-codegen").DeepPartial<TResult>
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & { [P in K]-?: NonNullable<T[P]> };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  _FieldSet: any;
  GraphQLTimestamp: any;
};

export type Query = {
  __typename?: 'Query';
  currentUser?: Maybe<User>;
  user?: Maybe<User>;
  userByName?: Maybe<User>;
  timeline?: Maybe<Array<Maybe<Post>>>;
  curatedLists?: Maybe<Array<Maybe<CuratedList>>>;
  curatedList?: Maybe<CuratedList>;
  searchWorks?: Maybe<SearchWorksResult>;
  weeklyWorksChart: Array<WorksChartItem>;
  work?: Maybe<Work>;
  workByTitle?: Maybe<Work>;
  post?: Maybe<Post>;
  tablePeriod: Array<TablePeriodItem>;
  tablePeriod2?: Maybe<TablePeriod>;
  currentTablePeriod: TablePeriod;
  tablePeriods: Array<TablePeriod>;
};


export type QueryuserArgs = {
  id: Scalars['ID'];
};


export type QueryuserByNameArgs = {
  name: Scalars['String'];
};


export type QuerytimelineArgs = {
  beforeId?: InputMaybe<Scalars['ID']>;
  count?: InputMaybe<Scalars['Int']>;
};


export type QuerycuratedListArgs = {
  id?: InputMaybe<Scalars['ID']>;
};


export type QuerysearchWorksArgs = {
  query: Scalars['String'];
};


export type QueryweeklyWorksChartArgs = {
  limit: Scalars['Int'];
};


export type QueryworkArgs = {
  id: Scalars['ID'];
};


export type QueryworkByTitleArgs = {
  title: Scalars['String'];
};


export type QuerypostArgs = {
  id: Scalars['ID'];
};


export type QuerytablePeriodArgs = {
  period: Scalars['String'];
  onlyAdded?: InputMaybe<Scalars['Boolean']>;
  username?: InputMaybe<Scalars['String']>;
  withRecommendations?: InputMaybe<Scalars['Boolean']>;
};


export type QuerytablePeriod2Args = {
  period: Scalars['String'];
};

export type Node = {
  id: Scalars['ID'];
};

export type User = Node & {
  __typename?: 'User';
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  joinedAt?: Maybe<Scalars['GraphQLTimestamp']>;
  isTwitterConnected?: Maybe<Scalars['Boolean']>;
  categories?: Maybe<Array<Maybe<Category>>>;
  recordCount?: Maybe<Scalars['Int']>;
  postCount?: Maybe<Scalars['Int']>;
  posts: PostConnection;
};


export type UserpostsArgs = {
  beforeId?: InputMaybe<Scalars['ID']>;
  count?: InputMaybe<Scalars['Int']>;
};

export type Category = Node & {
  __typename?: 'Category';
  id: Scalars['ID'];
  user?: Maybe<User>;
  name?: Maybe<Scalars['String']>;
};

export type Post = Node & {
  __typename?: 'Post';
  id: Scalars['ID'];
  record?: Maybe<Record>;
  statusType?: Maybe<StatusType>;
  status?: Maybe<Scalars['String']>;
  comment?: Maybe<Scalars['String']>;
  containsSpoiler?: Maybe<Scalars['Boolean']>;
  user?: Maybe<User>;
  updatedAt?: Maybe<Scalars['GraphQLTimestamp']>;
  work?: Maybe<Work>;
  episode?: Maybe<Episode>;
};

export type StatusType =
  | 'FINISHED'
  | 'WATCHING'
  | 'SUSPENDED'
  | 'INTERESTED';

export type Record = Node & {
  __typename?: 'Record';
  id: Scalars['ID'];
  title?: Maybe<Scalars['String']>;
  statusType?: Maybe<StatusType>;
  status?: Maybe<Scalars['String']>;
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

export type Work = Node & {
  __typename?: 'Work';
  id: Scalars['ID'];
  title?: Maybe<Scalars['String']>;
  imageUrl?: Maybe<Scalars['String']>;
  record?: Maybe<Record>;
  recordCount?: Maybe<Scalars['Int']>;
  metadata?: Maybe<WorkMetadata>;
  episodes?: Maybe<Array<Episode>>;
  episode?: Maybe<Episode>;
  posts: PostConnection;
};


export type WorkepisodeArgs = {
  episode: Scalars['Int'];
};


export type WorkpostsArgs = {
  beforeId?: InputMaybe<Scalars['ID']>;
  count?: InputMaybe<Scalars['Int']>;
  episode?: InputMaybe<Scalars['Int']>;
};

export type PostConnection = {
  __typename?: 'PostConnection';
  nodes: Array<Post>;
  hasMore: Scalars['Boolean'];
};

export type Episode = {
  __typename?: 'Episode';
  number: Scalars['Int'];
  postCount?: Maybe<Scalars['Int']>;
  userCount?: Maybe<Scalars['Int']>;
  suspendedUserCount?: Maybe<Scalars['Int']>;
};

export type WorkMetadata = {
  __typename?: 'WorkMetadata';
  periods?: Maybe<Array<Scalars['String']>>;
  studioNames?: Maybe<Array<Scalars['String']>>;
  source?: Maybe<SourceType>;
  websiteUrl?: Maybe<Scalars['String']>;
  namuwikiUrl?: Maybe<Scalars['String']>;
  annUrl?: Maybe<Scalars['String']>;
  durationMinutes?: Maybe<Scalars['Int']>;
  schedules?: Maybe<Array<WorkSchedule>>;
};

export type SourceType =
  | 'MANGA'
  | 'ORIGINAL'
  | 'LIGHT_NOVEL'
  | 'GAME'
  | 'FOUR_KOMA'
  | 'VISUAL_NOVEL'
  | 'NOVEL';

export type WorkSchedule = {
  __typename?: 'WorkSchedule';
  country: Scalars['String'];
  date?: Maybe<Scalars['GraphQLTimestamp']>;
  datePrecision?: Maybe<DatePrecision>;
  broadcasts?: Maybe<Array<Scalars['String']>>;
};

export type DatePrecision =
  | 'YEAR_MONTH'
  | 'DATE'
  | 'DATE_TIME';

export type SearchWorksResult = {
  __typename?: 'SearchWorksResult';
  edges: Array<SearchWorksResultEdge>;
};

export type SearchWorksResultEdge = {
  __typename?: 'SearchWorksResultEdge';
  node: Work;
  recordCount?: Maybe<Scalars['Int']>;
};

export type WorksChartItem = {
  __typename?: 'WorksChartItem';
  rank: Scalars['Int'];
  work: Work;
  diff?: Maybe<Scalars['Int']>;
  sign?: Maybe<Scalars['Int']>;
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


export type TablePerioditemsArgs = {
  onlyAdded?: InputMaybe<Scalars['Boolean']>;
  username?: InputMaybe<Scalars['String']>;
  withRecommendations?: InputMaybe<Scalars['Boolean']>;
};

export type TablePeriodItem = {
  __typename?: 'TablePeriodItem';
  title: Scalars['String'];
  work: Work;
  record?: Maybe<Record>;
  recommendations?: Maybe<Array<Recommendation>>;
  recommendationScore?: Maybe<Scalars['Int']>;
};

export type Recommendation = RecommendationByCredit;

export type RecommendationByCredit = {
  __typename?: 'RecommendationByCredit';
  credit?: Maybe<Credit>;
  related?: Maybe<Array<WorkCredit>>;
  score?: Maybe<Scalars['Int']>;
};

export type Credit = {
  __typename?: 'Credit';
  type?: Maybe<CreditType>;
  name?: Maybe<Scalars['String']>;
  personId: Scalars['ID'];
};

export type WorkCredit = {
  __typename?: 'WorkCredit';
  workId: Scalars['ID'];
  workTitle: Scalars['String'];
  type?: Maybe<CreditType>;
};

export type CreditType =
  | 'ORIGINAL_WORK'
  | 'CHIEF_DIRECTOR'
  | 'SERIES_DIRECTOR'
  | 'DIRECTOR'
  | 'SERIES_COMPOSITION'
  | 'CHARACTER_DESIGN'
  | 'MUSIC';



export type ResolverTypeWrapper<T> = Promise<T> | T;


export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> = ResolverFn<TResult, TParent, TContext, TArgs> | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<TResult, TKey extends string, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<{ [key in TKey]: TResult }, TParent, TContext, TArgs>;
  resolve?: SubscriptionResolveFn<TResult, { [key in TKey]: TResult }, TContext, TArgs>;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<TResult, TKey extends string, TParent, TContext, TArgs> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<TResult, TKey extends string, TParent = {}, TContext = {}, TArgs = {}> =
  | ((...args: any[]) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (obj: T, context: TContext, info: GraphQLResolveInfo) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<TResult = {}, TParent = {}, TContext = {}, TArgs = {}> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Query: ResolverTypeWrapper<{}>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Node: ResolversTypes['User'] | ResolversTypes['Category'] | ResolversTypes['Post'] | ResolversTypes['Record'] | ResolversTypes['Work'];
  GraphQLTimestamp: ResolverTypeWrapper<Scalars['GraphQLTimestamp']>;
  User: ResolverTypeWrapper<UserModel>;
  Category: ResolverTypeWrapper<Omit<Category, 'user'> & { user?: Maybe<ResolversTypes['User']> }>;
  Post: ResolverTypeWrapper<HistoryModel>;
  StatusType: StatusType;
  Record: ResolverTypeWrapper<RecordModel>;
  CuratedList: ResolverTypeWrapper<Omit<CuratedList, 'works'> & { works?: Maybe<ResolversTypes['CuratedListWorkConnection']> }>;
  CuratedListWorkConnection: ResolverTypeWrapper<Omit<CuratedListWorkConnection, 'edges'> & { edges?: Maybe<Array<Maybe<ResolversTypes['CuratedListWorkEdge']>>> }>;
  CuratedListWorkEdge: ResolverTypeWrapper<Omit<CuratedListWorkEdge, 'node'> & { node?: Maybe<ResolversTypes['Work']> }>;
  Work: ResolverTypeWrapper<WorkModel>;
  PostConnection: ResolverTypeWrapper<Omit<PostConnection, 'nodes'> & { nodes: Array<ResolversTypes['Post']> }>;
  Episode: ResolverTypeWrapper<EpisodeModel>;
  WorkMetadata: ResolverTypeWrapper<WorkMetadata>;
  SourceType: SourceType;
  WorkSchedule: ResolverTypeWrapper<WorkSchedule>;
  DatePrecision: DatePrecision;
  SearchWorksResult: ResolverTypeWrapper<Omit<SearchWorksResult, 'edges'> & { edges: Array<ResolversTypes['SearchWorksResultEdge']> }>;
  SearchWorksResultEdge: ResolverTypeWrapper<Omit<SearchWorksResultEdge, 'node'> & { node: ResolversTypes['Work'] }>;
  WorksChartItem: ResolverTypeWrapper<Omit<WorksChartItem, 'work'> & { work: ResolversTypes['Work'] }>;
  TablePeriod: ResolverTypeWrapper<PeriodModel>;
  TablePeriodItem: ResolverTypeWrapper<Omit<TablePeriodItem, 'work' | 'record' | 'recommendations'> & { work: ResolversTypes['Work'], record?: Maybe<ResolversTypes['Record']>, recommendations?: Maybe<Array<ResolversTypes['Recommendation']>> }>;
  Recommendation: ResolversTypes['RecommendationByCredit'];
  RecommendationByCredit: ResolverTypeWrapper<RecommendationByCredit>;
  Credit: ResolverTypeWrapper<Credit>;
  WorkCredit: ResolverTypeWrapper<WorkCredit>;
  CreditType: CreditType;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Query: {};
  ID: Scalars['ID'];
  String: Scalars['String'];
  Int: Scalars['Int'];
  Boolean: Scalars['Boolean'];
  Node: ResolversParentTypes['User'] | ResolversParentTypes['Category'] | ResolversParentTypes['Post'] | ResolversParentTypes['Record'] | ResolversParentTypes['Work'];
  GraphQLTimestamp: Scalars['GraphQLTimestamp'];
  User: UserModel;
  Category: Omit<Category, 'user'> & { user?: Maybe<ResolversParentTypes['User']> };
  Post: HistoryModel;
  Record: RecordModel;
  CuratedList: Omit<CuratedList, 'works'> & { works?: Maybe<ResolversParentTypes['CuratedListWorkConnection']> };
  CuratedListWorkConnection: Omit<CuratedListWorkConnection, 'edges'> & { edges?: Maybe<Array<Maybe<ResolversParentTypes['CuratedListWorkEdge']>>> };
  CuratedListWorkEdge: Omit<CuratedListWorkEdge, 'node'> & { node?: Maybe<ResolversParentTypes['Work']> };
  Work: WorkModel;
  PostConnection: Omit<PostConnection, 'nodes'> & { nodes: Array<ResolversParentTypes['Post']> };
  Episode: EpisodeModel;
  WorkMetadata: WorkMetadata;
  WorkSchedule: WorkSchedule;
  SearchWorksResult: Omit<SearchWorksResult, 'edges'> & { edges: Array<ResolversParentTypes['SearchWorksResultEdge']> };
  SearchWorksResultEdge: Omit<SearchWorksResultEdge, 'node'> & { node: ResolversParentTypes['Work'] };
  WorksChartItem: Omit<WorksChartItem, 'work'> & { work: ResolversParentTypes['Work'] };
  TablePeriod: PeriodModel;
  TablePeriodItem: Omit<TablePeriodItem, 'work' | 'record' | 'recommendations'> & { work: ResolversParentTypes['Work'], record?: Maybe<ResolversParentTypes['Record']>, recommendations?: Maybe<Array<ResolversParentTypes['Recommendation']>> };
  Recommendation: ResolversParentTypes['RecommendationByCredit'];
  RecommendationByCredit: RecommendationByCredit;
  Credit: Credit;
  WorkCredit: WorkCredit;
};

export type QueryResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  currentUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryuserArgs, 'id'>>;
  userByName?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryuserByNameArgs, 'name'>>;
  timeline?: Resolver<Maybe<Array<Maybe<ResolversTypes['Post']>>>, ParentType, ContextType, Partial<QuerytimelineArgs>>;
  curatedLists?: Resolver<Maybe<Array<Maybe<ResolversTypes['CuratedList']>>>, ParentType, ContextType>;
  curatedList?: Resolver<Maybe<ResolversTypes['CuratedList']>, ParentType, ContextType, Partial<QuerycuratedListArgs>>;
  searchWorks?: Resolver<Maybe<ResolversTypes['SearchWorksResult']>, ParentType, ContextType, RequireFields<QuerysearchWorksArgs, 'query'>>;
  weeklyWorksChart?: Resolver<Array<ResolversTypes['WorksChartItem']>, ParentType, ContextType, RequireFields<QueryweeklyWorksChartArgs, 'limit'>>;
  work?: Resolver<Maybe<ResolversTypes['Work']>, ParentType, ContextType, RequireFields<QueryworkArgs, 'id'>>;
  workByTitle?: Resolver<Maybe<ResolversTypes['Work']>, ParentType, ContextType, RequireFields<QueryworkByTitleArgs, 'title'>>;
  post?: Resolver<Maybe<ResolversTypes['Post']>, ParentType, ContextType, RequireFields<QuerypostArgs, 'id'>>;
  tablePeriod?: Resolver<Array<ResolversTypes['TablePeriodItem']>, ParentType, ContextType, RequireFields<QuerytablePeriodArgs, 'period' | 'onlyAdded' | 'withRecommendations'>>;
  tablePeriod2?: Resolver<Maybe<ResolversTypes['TablePeriod']>, ParentType, ContextType, RequireFields<QuerytablePeriod2Args, 'period'>>;
  currentTablePeriod?: Resolver<ResolversTypes['TablePeriod'], ParentType, ContextType>;
  tablePeriods?: Resolver<Array<ResolversTypes['TablePeriod']>, ParentType, ContextType>;
};

export type NodeResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = {
  resolveType: TypeResolveFn<'User' | 'Category' | 'Post' | 'Record' | 'Work', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export interface GraphQLTimestampScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['GraphQLTimestamp'], any> {
  name: 'GraphQLTimestamp';
}

export type UserResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  joinedAt?: Resolver<Maybe<ResolversTypes['GraphQLTimestamp']>, ParentType, ContextType>;
  isTwitterConnected?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  categories?: Resolver<Maybe<Array<Maybe<ResolversTypes['Category']>>>, ParentType, ContextType>;
  recordCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  postCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  posts?: Resolver<ResolversTypes['PostConnection'], ParentType, ContextType, Partial<UserpostsArgs>>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CategoryResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['Category'] = ResolversParentTypes['Category']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PostResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['Post'] = ResolversParentTypes['Post']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  record?: Resolver<Maybe<ResolversTypes['Record']>, ParentType, ContextType>;
  statusType?: Resolver<Maybe<ResolversTypes['StatusType']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  comment?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  containsSpoiler?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['GraphQLTimestamp']>, ParentType, ContextType>;
  work?: Resolver<Maybe<ResolversTypes['Work']>, ParentType, ContextType>;
  episode?: Resolver<Maybe<ResolversTypes['Episode']>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RecordResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['Record'] = ResolversParentTypes['Record']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  statusType?: Resolver<Maybe<ResolversTypes['StatusType']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CuratedListResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['CuratedList'] = ResolversParentTypes['CuratedList']> = {
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  works?: Resolver<Maybe<ResolversTypes['CuratedListWorkConnection']>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CuratedListWorkConnectionResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['CuratedListWorkConnection'] = ResolversParentTypes['CuratedListWorkConnection']> = {
  edges?: Resolver<Maybe<Array<Maybe<ResolversTypes['CuratedListWorkEdge']>>>, ParentType, ContextType>;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CuratedListWorkEdgeResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['CuratedListWorkEdge'] = ResolversParentTypes['CuratedListWorkEdge']> = {
  node?: Resolver<Maybe<ResolversTypes['Work']>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WorkResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['Work'] = ResolversParentTypes['Work']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  record?: Resolver<Maybe<ResolversTypes['Record']>, ParentType, ContextType>;
  recordCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  metadata?: Resolver<Maybe<ResolversTypes['WorkMetadata']>, ParentType, ContextType>;
  episodes?: Resolver<Maybe<Array<ResolversTypes['Episode']>>, ParentType, ContextType>;
  episode?: Resolver<Maybe<ResolversTypes['Episode']>, ParentType, ContextType, RequireFields<WorkepisodeArgs, 'episode'>>;
  posts?: Resolver<ResolversTypes['PostConnection'], ParentType, ContextType, Partial<WorkpostsArgs>>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PostConnectionResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['PostConnection'] = ResolversParentTypes['PostConnection']> = {
  nodes?: Resolver<Array<ResolversTypes['Post']>, ParentType, ContextType>;
  hasMore?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EpisodeResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['Episode'] = ResolversParentTypes['Episode']> = {
  number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  postCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  userCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  suspendedUserCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WorkMetadataResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['WorkMetadata'] = ResolversParentTypes['WorkMetadata']> = {
  periods?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  studioNames?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  source?: Resolver<Maybe<ResolversTypes['SourceType']>, ParentType, ContextType>;
  websiteUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  namuwikiUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  annUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  durationMinutes?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  schedules?: Resolver<Maybe<Array<ResolversTypes['WorkSchedule']>>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WorkScheduleResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['WorkSchedule'] = ResolversParentTypes['WorkSchedule']> = {
  country?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  date?: Resolver<Maybe<ResolversTypes['GraphQLTimestamp']>, ParentType, ContextType>;
  datePrecision?: Resolver<Maybe<ResolversTypes['DatePrecision']>, ParentType, ContextType>;
  broadcasts?: Resolver<Maybe<Array<ResolversTypes['String']>>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SearchWorksResultResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['SearchWorksResult'] = ResolversParentTypes['SearchWorksResult']> = {
  edges?: Resolver<Array<ResolversTypes['SearchWorksResultEdge']>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SearchWorksResultEdgeResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['SearchWorksResultEdge'] = ResolversParentTypes['SearchWorksResultEdge']> = {
  node?: Resolver<ResolversTypes['Work'], ParentType, ContextType>;
  recordCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WorksChartItemResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['WorksChartItem'] = ResolversParentTypes['WorksChartItem']> = {
  rank?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  work?: Resolver<ResolversTypes['Work'], ParentType, ContextType>;
  diff?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  sign?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TablePeriodResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['TablePeriod'] = ResolversParentTypes['TablePeriod']> = {
  period?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  year?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  month?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  isCurrent?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isRecommendationEnabled?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['TablePeriodItem']>, ParentType, ContextType, RequireFields<TablePerioditemsArgs, 'onlyAdded' | 'withRecommendations'>>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type TablePeriodItemResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['TablePeriodItem'] = ResolversParentTypes['TablePeriodItem']> = {
  title?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  work?: Resolver<ResolversTypes['Work'], ParentType, ContextType>;
  record?: Resolver<Maybe<ResolversTypes['Record']>, ParentType, ContextType>;
  recommendations?: Resolver<Maybe<Array<ResolversTypes['Recommendation']>>, ParentType, ContextType>;
  recommendationScore?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RecommendationResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['Recommendation'] = ResolversParentTypes['Recommendation']> = {
  resolveType: TypeResolveFn<'RecommendationByCredit', ParentType, ContextType>;
};

export type RecommendationByCreditResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['RecommendationByCredit'] = ResolversParentTypes['RecommendationByCredit']> = {
  credit?: Resolver<Maybe<ResolversTypes['Credit']>, ParentType, ContextType>;
  related?: Resolver<Maybe<Array<ResolversTypes['WorkCredit']>>, ParentType, ContextType>;
  score?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CreditResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['Credit'] = ResolversParentTypes['Credit']> = {
  type?: Resolver<Maybe<ResolversTypes['CreditType']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  personId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WorkCreditResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['WorkCredit'] = ResolversParentTypes['WorkCredit']> = {
  workId?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  workTitle?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  type?: Resolver<Maybe<ResolversTypes['CreditType']>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = MercuriusContext> = {
  Query?: QueryResolvers<ContextType>;
  Node?: NodeResolvers<ContextType>;
  GraphQLTimestamp?: GraphQLScalarType;
  User?: UserResolvers<ContextType>;
  Category?: CategoryResolvers<ContextType>;
  Post?: PostResolvers<ContextType>;
  Record?: RecordResolvers<ContextType>;
  CuratedList?: CuratedListResolvers<ContextType>;
  CuratedListWorkConnection?: CuratedListWorkConnectionResolvers<ContextType>;
  CuratedListWorkEdge?: CuratedListWorkEdgeResolvers<ContextType>;
  Work?: WorkResolvers<ContextType>;
  PostConnection?: PostConnectionResolvers<ContextType>;
  Episode?: EpisodeResolvers<ContextType>;
  WorkMetadata?: WorkMetadataResolvers<ContextType>;
  WorkSchedule?: WorkScheduleResolvers<ContextType>;
  SearchWorksResult?: SearchWorksResultResolvers<ContextType>;
  SearchWorksResultEdge?: SearchWorksResultEdgeResolvers<ContextType>;
  WorksChartItem?: WorksChartItemResolvers<ContextType>;
  TablePeriod?: TablePeriodResolvers<ContextType>;
  TablePeriodItem?: TablePeriodItemResolvers<ContextType>;
  Recommendation?: RecommendationResolvers<ContextType>;
  RecommendationByCredit?: RecommendationByCreditResolvers<ContextType>;
  Credit?: CreditResolvers<ContextType>;
  WorkCredit?: WorkCreditResolvers<ContextType>;
};

