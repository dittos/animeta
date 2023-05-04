import type { GraphQLResolveInfo, GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';
import type { History as HistoryModel } from 'src/entities/history.entity';
import type { User as UserModel } from 'src/entities/user.entity';
import type { Record as RecordModel } from 'src/entities/record.entity';
import type { Work as WorkModel } from 'src/entities/work.entity';
import type { Episode as EpisodeModel } from 'src/entities/episode.entity';
import type { Category as CategoryModel } from 'src/entities/category.entity';
import type { Period as PeriodModel } from 'src/utils/period';
import type { CuratedListMetadata as CuratedListMetadataModel } from 'src2/services/curatedList';
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

export type Category = Node & {
  __typename?: 'Category';
  id: Scalars['ID'];
  user?: Maybe<User>;
  name: Scalars['String'];
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
  rating?: Maybe<Scalars['Float']>;
  work?: Maybe<Work>;
  episode?: Maybe<Episode>;
};

export type PostConnection = {
  __typename?: 'PostConnection';
  nodes: Array<Post>;
  hasMore: Scalars['Boolean'];
};

export type Record = Node & {
  __typename?: 'Record';
  id: Scalars['ID'];
  title?: Maybe<Scalars['String']>;
  statusType?: Maybe<StatusType>;
  status?: Maybe<Scalars['String']>;
  user?: Maybe<User>;
  work?: Maybe<Work>;
  category?: Maybe<Category>;
  updatedAt?: Maybe<Scalars['GraphQLTimestamp']>;
  rating?: Maybe<Scalars['Float']>;
  hasNewerEpisode?: Maybe<Scalars['Boolean']>;
};

export type RecordConnection = {
  __typename?: 'RecordConnection';
  nodes: Array<Record>;
};

export type User = Node & {
  __typename?: 'User';
  id: Scalars['ID'];
  name?: Maybe<Scalars['String']>;
  joinedAt?: Maybe<Scalars['GraphQLTimestamp']>;
  isTwitterConnected?: Maybe<Scalars['Boolean']>;
  isCurrentUser: Scalars['Boolean'];
  categories: Array<Category>;
  recordCount?: Maybe<Scalars['Int']>;
  postCount?: Maybe<Scalars['Int']>;
  posts: PostConnection;
  records: RecordConnection;
  recordFilters: RecordFilters;
};


export type UserpostsArgs = {
  beforeId?: InputMaybe<Scalars['ID']>;
  count?: InputMaybe<Scalars['Int']>;
};


export type UserrecordsArgs = {
  statusType?: InputMaybe<StatusType>;
  categoryId?: InputMaybe<Scalars['ID']>;
  orderBy?: InputMaybe<RecordOrder>;
  first?: InputMaybe<Scalars['Int']>;
};


export type UserrecordFiltersArgs = {
  statusType?: InputMaybe<StatusType>;
  categoryId?: InputMaybe<Scalars['ID']>;
};

export type RecordOrder =
  | 'DATE'
  | 'TITLE'
  | 'RATING';

export type RecordFilters = {
  __typename?: 'RecordFilters';
  totalCount: Scalars['Int'];
  filteredCount: Scalars['Int'];
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

export type Node = {
  id: Scalars['ID'];
};

export type StatusType =
  | 'FINISHED'
  | 'WATCHING'
  | 'SUSPENDED'
  | 'INTERESTED';

export type Mutation = {
  __typename?: 'Mutation';
  _empty?: Maybe<Scalars['Boolean']>;
  createRecord: CreateRecordResult;
};


export type MutationcreateRecordArgs = {
  input: CreateRecordInput;
};

export type CreateRecordInput = {
  title: Scalars['String'];
  categoryId?: InputMaybe<Scalars['ID']>;
  status: Scalars['String'];
  statusType: StatusType;
  comment: Scalars['String'];
  publishTwitter?: InputMaybe<Scalars['Boolean']>;
  rating?: InputMaybe<Scalars['Float']>;
};

export type CreateRecordResult = {
  __typename?: 'CreateRecordResult';
  record: Record;
  post?: Maybe<Post>;
};

export type Query = {
  __typename?: 'Query';
  currentUser?: Maybe<User>;
  user?: Maybe<User>;
  userByName?: Maybe<User>;
  timeline?: Maybe<Array<Maybe<Post>>>;
  work?: Maybe<Work>;
  workByTitle?: Maybe<Work>;
  post?: Maybe<Post>;
  curatedLists: Array<CuratedList>;
  curatedList?: Maybe<CuratedList>;
  searchWorks?: Maybe<SearchWorksResult>;
  tablePeriod?: Maybe<TablePeriod>;
  currentTablePeriod: TablePeriod;
  tablePeriods: Array<TablePeriod>;
  weeklyWorksChart: Array<WorksChartItem>;
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


export type QueryworkArgs = {
  id: Scalars['ID'];
};


export type QueryworkByTitleArgs = {
  title: Scalars['String'];
};


export type QuerypostArgs = {
  id: Scalars['ID'];
};


export type QuerycuratedListArgs = {
  id: Scalars['ID'];
};


export type QuerysearchWorksArgs = {
  query: Scalars['String'];
};


export type QuerytablePeriodArgs = {
  period: Scalars['String'];
};


export type QueryweeklyWorksChartArgs = {
  limit: Scalars['Int'];
};

export type CuratedList = {
  __typename?: 'CuratedList';
  id: Scalars['ID'];
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

export type SearchWorksResult = {
  __typename?: 'SearchWorksResult';
  edges: Array<SearchWorksResultEdge>;
};

export type SearchWorksResultEdge = {
  __typename?: 'SearchWorksResultEdge';
  node: Work;
  recordCount?: Maybe<Scalars['Int']>;
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

export type WorksChartItem = {
  __typename?: 'WorksChartItem';
  rank: Scalars['Int'];
  work: Work;
  diff?: Maybe<Scalars['Int']>;
  sign?: Maybe<Scalars['Int']>;
};



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
  Category: ResolverTypeWrapper<CategoryModel>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  String: ResolverTypeWrapper<Scalars['String']>;
  Post: ResolverTypeWrapper<HistoryModel>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Float: ResolverTypeWrapper<Scalars['Float']>;
  PostConnection: ResolverTypeWrapper<Omit<PostConnection, 'nodes'> & { nodes: Array<ResolversTypes['Post']> }>;
  Record: ResolverTypeWrapper<RecordModel>;
  RecordConnection: ResolverTypeWrapper<Omit<RecordConnection, 'nodes'> & { nodes: Array<ResolversTypes['Record']> }>;
  User: ResolverTypeWrapper<UserModel>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  RecordOrder: RecordOrder;
  RecordFilters: ResolverTypeWrapper<RecordFilters>;
  RecordFilter: ResolverTypeWrapper<RecordFilter>;
  RecordFilterItem: ResolverTypeWrapper<RecordFilterItem>;
  Work: ResolverTypeWrapper<WorkModel>;
  Episode: ResolverTypeWrapper<EpisodeModel>;
  WorkMetadata: ResolverTypeWrapper<WorkMetadata>;
  SourceType: SourceType;
  WorkSchedule: ResolverTypeWrapper<WorkSchedule>;
  DatePrecision: DatePrecision;
  GraphQLTimestamp: ResolverTypeWrapper<Scalars['GraphQLTimestamp']>;
  Node: ResolversTypes['Category'] | ResolversTypes['Post'] | ResolversTypes['Record'] | ResolversTypes['User'] | ResolversTypes['Work'];
  StatusType: StatusType;
  Mutation: ResolverTypeWrapper<{}>;
  CreateRecordInput: CreateRecordInput;
  CreateRecordResult: ResolverTypeWrapper<Omit<CreateRecordResult, 'record' | 'post'> & { record: ResolversTypes['Record'], post?: Maybe<ResolversTypes['Post']> }>;
  Query: ResolverTypeWrapper<{}>;
  CuratedList: ResolverTypeWrapper<CuratedListMetadataModel>;
  CuratedListWorkConnection: ResolverTypeWrapper<Omit<CuratedListWorkConnection, 'edges'> & { edges?: Maybe<Array<Maybe<ResolversTypes['CuratedListWorkEdge']>>> }>;
  CuratedListWorkEdge: ResolverTypeWrapper<Omit<CuratedListWorkEdge, 'node'> & { node?: Maybe<ResolversTypes['Work']> }>;
  SearchWorksResult: ResolverTypeWrapper<Omit<SearchWorksResult, 'edges'> & { edges: Array<ResolversTypes['SearchWorksResultEdge']> }>;
  SearchWorksResultEdge: ResolverTypeWrapper<Omit<SearchWorksResultEdge, 'node'> & { node: ResolversTypes['Work'] }>;
  TablePeriod: ResolverTypeWrapper<PeriodModel>;
  TablePeriodItem: ResolverTypeWrapper<Omit<TablePeriodItem, 'work' | 'record' | 'recommendations'> & { work: ResolversTypes['Work'], record?: Maybe<ResolversTypes['Record']>, recommendations?: Maybe<Array<ResolversTypes['Recommendation']>> }>;
  Recommendation: ResolversTypes['RecommendationByCredit'];
  RecommendationByCredit: ResolverTypeWrapper<RecommendationByCredit>;
  Credit: ResolverTypeWrapper<Credit>;
  WorkCredit: ResolverTypeWrapper<WorkCredit>;
  CreditType: CreditType;
  WorksChartItem: ResolverTypeWrapper<Omit<WorksChartItem, 'work'> & { work: ResolversTypes['Work'] }>;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Category: CategoryModel;
  ID: Scalars['ID'];
  String: Scalars['String'];
  Post: HistoryModel;
  Boolean: Scalars['Boolean'];
  Float: Scalars['Float'];
  PostConnection: Omit<PostConnection, 'nodes'> & { nodes: Array<ResolversParentTypes['Post']> };
  Record: RecordModel;
  RecordConnection: Omit<RecordConnection, 'nodes'> & { nodes: Array<ResolversParentTypes['Record']> };
  User: UserModel;
  Int: Scalars['Int'];
  RecordFilters: RecordFilters;
  RecordFilter: RecordFilter;
  RecordFilterItem: RecordFilterItem;
  Work: WorkModel;
  Episode: EpisodeModel;
  WorkMetadata: WorkMetadata;
  WorkSchedule: WorkSchedule;
  GraphQLTimestamp: Scalars['GraphQLTimestamp'];
  Node: ResolversParentTypes['Category'] | ResolversParentTypes['Post'] | ResolversParentTypes['Record'] | ResolversParentTypes['User'] | ResolversParentTypes['Work'];
  Mutation: {};
  CreateRecordInput: CreateRecordInput;
  CreateRecordResult: Omit<CreateRecordResult, 'record' | 'post'> & { record: ResolversParentTypes['Record'], post?: Maybe<ResolversParentTypes['Post']> };
  Query: {};
  CuratedList: CuratedListMetadataModel;
  CuratedListWorkConnection: Omit<CuratedListWorkConnection, 'edges'> & { edges?: Maybe<Array<Maybe<ResolversParentTypes['CuratedListWorkEdge']>>> };
  CuratedListWorkEdge: Omit<CuratedListWorkEdge, 'node'> & { node?: Maybe<ResolversParentTypes['Work']> };
  SearchWorksResult: Omit<SearchWorksResult, 'edges'> & { edges: Array<ResolversParentTypes['SearchWorksResultEdge']> };
  SearchWorksResultEdge: Omit<SearchWorksResultEdge, 'node'> & { node: ResolversParentTypes['Work'] };
  TablePeriod: PeriodModel;
  TablePeriodItem: Omit<TablePeriodItem, 'work' | 'record' | 'recommendations'> & { work: ResolversParentTypes['Work'], record?: Maybe<ResolversParentTypes['Record']>, recommendations?: Maybe<Array<ResolversParentTypes['Recommendation']>> };
  Recommendation: ResolversParentTypes['RecommendationByCredit'];
  RecommendationByCredit: RecommendationByCredit;
  Credit: Credit;
  WorkCredit: WorkCredit;
  WorksChartItem: Omit<WorksChartItem, 'work'> & { work: ResolversParentTypes['Work'] };
};

export type CategoryResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['Category'] = ResolversParentTypes['Category']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  name?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
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
  rating?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  work?: Resolver<Maybe<ResolversTypes['Work']>, ParentType, ContextType>;
  episode?: Resolver<Maybe<ResolversTypes['Episode']>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PostConnectionResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['PostConnection'] = ResolversParentTypes['PostConnection']> = {
  nodes?: Resolver<Array<ResolversTypes['Post']>, ParentType, ContextType>;
  hasMore?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RecordResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['Record'] = ResolversParentTypes['Record']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  statusType?: Resolver<Maybe<ResolversTypes['StatusType']>, ParentType, ContextType>;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  work?: Resolver<Maybe<ResolversTypes['Work']>, ParentType, ContextType>;
  category?: Resolver<Maybe<ResolversTypes['Category']>, ParentType, ContextType>;
  updatedAt?: Resolver<Maybe<ResolversTypes['GraphQLTimestamp']>, ParentType, ContextType>;
  rating?: Resolver<Maybe<ResolversTypes['Float']>, ParentType, ContextType>;
  hasNewerEpisode?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RecordConnectionResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['RecordConnection'] = ResolversParentTypes['RecordConnection']> = {
  nodes?: Resolver<Array<ResolversTypes['Record']>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type UserResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  joinedAt?: Resolver<Maybe<ResolversTypes['GraphQLTimestamp']>, ParentType, ContextType>;
  isTwitterConnected?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  isCurrentUser?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  categories?: Resolver<Array<ResolversTypes['Category']>, ParentType, ContextType>;
  recordCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  postCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  posts?: Resolver<ResolversTypes['PostConnection'], ParentType, ContextType, Partial<UserpostsArgs>>;
  records?: Resolver<ResolversTypes['RecordConnection'], ParentType, ContextType, Partial<UserrecordsArgs>>;
  recordFilters?: Resolver<ResolversTypes['RecordFilters'], ParentType, ContextType, Partial<UserrecordFiltersArgs>>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RecordFiltersResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['RecordFilters'] = ResolversParentTypes['RecordFilters']> = {
  totalCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  filteredCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  statusType?: Resolver<ResolversTypes['RecordFilter'], ParentType, ContextType>;
  categoryId?: Resolver<ResolversTypes['RecordFilter'], ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RecordFilterResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['RecordFilter'] = ResolversParentTypes['RecordFilter']> = {
  allCount?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  items?: Resolver<Array<ResolversTypes['RecordFilterItem']>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RecordFilterItemResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['RecordFilterItem'] = ResolversParentTypes['RecordFilterItem']> = {
  key?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  count?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
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

export interface GraphQLTimestampScalarConfig extends GraphQLScalarTypeConfig<ResolversTypes['GraphQLTimestamp'], any> {
  name: 'GraphQLTimestamp';
}

export type NodeResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node']> = {
  resolveType: TypeResolveFn<'Category' | 'Post' | 'Record' | 'User' | 'Work', ParentType, ContextType>;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export type MutationResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['Mutation'] = ResolversParentTypes['Mutation']> = {
  _empty?: Resolver<Maybe<ResolversTypes['Boolean']>, ParentType, ContextType>;
  createRecord?: Resolver<ResolversTypes['CreateRecordResult'], ParentType, ContextType, RequireFields<MutationcreateRecordArgs, 'input'>>;
};

export type CreateRecordResultResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['CreateRecordResult'] = ResolversParentTypes['CreateRecordResult']> = {
  record?: Resolver<ResolversTypes['Record'], ParentType, ContextType>;
  post?: Resolver<Maybe<ResolversTypes['Post']>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type QueryResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query']> = {
  currentUser?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryuserArgs, 'id'>>;
  userByName?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType, RequireFields<QueryuserByNameArgs, 'name'>>;
  timeline?: Resolver<Maybe<Array<Maybe<ResolversTypes['Post']>>>, ParentType, ContextType, Partial<QuerytimelineArgs>>;
  work?: Resolver<Maybe<ResolversTypes['Work']>, ParentType, ContextType, RequireFields<QueryworkArgs, 'id'>>;
  workByTitle?: Resolver<Maybe<ResolversTypes['Work']>, ParentType, ContextType, RequireFields<QueryworkByTitleArgs, 'title'>>;
  post?: Resolver<Maybe<ResolversTypes['Post']>, ParentType, ContextType, RequireFields<QuerypostArgs, 'id'>>;
  curatedLists?: Resolver<Array<ResolversTypes['CuratedList']>, ParentType, ContextType>;
  curatedList?: Resolver<Maybe<ResolversTypes['CuratedList']>, ParentType, ContextType, RequireFields<QuerycuratedListArgs, 'id'>>;
  searchWorks?: Resolver<Maybe<ResolversTypes['SearchWorksResult']>, ParentType, ContextType, RequireFields<QuerysearchWorksArgs, 'query'>>;
  tablePeriod?: Resolver<Maybe<ResolversTypes['TablePeriod']>, ParentType, ContextType, RequireFields<QuerytablePeriodArgs, 'period'>>;
  currentTablePeriod?: Resolver<ResolversTypes['TablePeriod'], ParentType, ContextType>;
  tablePeriods?: Resolver<Array<ResolversTypes['TablePeriod']>, ParentType, ContextType>;
  weeklyWorksChart?: Resolver<Array<ResolversTypes['WorksChartItem']>, ParentType, ContextType, RequireFields<QueryweeklyWorksChartArgs, 'limit'>>;
};

export type CuratedListResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['CuratedList'] = ResolversParentTypes['CuratedList']> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
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

export type SearchWorksResultResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['SearchWorksResult'] = ResolversParentTypes['SearchWorksResult']> = {
  edges?: Resolver<Array<ResolversTypes['SearchWorksResultEdge']>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SearchWorksResultEdgeResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['SearchWorksResultEdge'] = ResolversParentTypes['SearchWorksResultEdge']> = {
  node?: Resolver<ResolversTypes['Work'], ParentType, ContextType>;
  recordCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
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

export type WorksChartItemResolvers<ContextType = MercuriusContext, ParentType extends ResolversParentTypes['WorksChartItem'] = ResolversParentTypes['WorksChartItem']> = {
  rank?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  work?: Resolver<ResolversTypes['Work'], ParentType, ContextType>;
  diff?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  sign?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type Resolvers<ContextType = MercuriusContext> = {
  Category?: CategoryResolvers<ContextType>;
  Post?: PostResolvers<ContextType>;
  PostConnection?: PostConnectionResolvers<ContextType>;
  Record?: RecordResolvers<ContextType>;
  RecordConnection?: RecordConnectionResolvers<ContextType>;
  User?: UserResolvers<ContextType>;
  RecordFilters?: RecordFiltersResolvers<ContextType>;
  RecordFilter?: RecordFilterResolvers<ContextType>;
  RecordFilterItem?: RecordFilterItemResolvers<ContextType>;
  Work?: WorkResolvers<ContextType>;
  Episode?: EpisodeResolvers<ContextType>;
  WorkMetadata?: WorkMetadataResolvers<ContextType>;
  WorkSchedule?: WorkScheduleResolvers<ContextType>;
  GraphQLTimestamp?: GraphQLScalarType;
  Node?: NodeResolvers<ContextType>;
  Mutation?: MutationResolvers<ContextType>;
  CreateRecordResult?: CreateRecordResultResolvers<ContextType>;
  Query?: QueryResolvers<ContextType>;
  CuratedList?: CuratedListResolvers<ContextType>;
  CuratedListWorkConnection?: CuratedListWorkConnectionResolvers<ContextType>;
  CuratedListWorkEdge?: CuratedListWorkEdgeResolvers<ContextType>;
  SearchWorksResult?: SearchWorksResultResolvers<ContextType>;
  SearchWorksResultEdge?: SearchWorksResultEdgeResolvers<ContextType>;
  TablePeriod?: TablePeriodResolvers<ContextType>;
  TablePeriodItem?: TablePeriodItemResolvers<ContextType>;
  Recommendation?: RecommendationResolvers<ContextType>;
  RecommendationByCredit?: RecommendationByCreditResolvers<ContextType>;
  Credit?: CreditResolvers<ContextType>;
  WorkCredit?: WorkCreditResolvers<ContextType>;
  WorksChartItem?: WorksChartItemResolvers<ContextType>;
};

