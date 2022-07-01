import type {
  GraphQLResolveInfo,
  GraphQLScalarType,
  GraphQLScalarTypeConfig,
} from 'graphql';
import type { History as HistoryModel } from 'src/entities/history.entity';
import type { User as UserModel } from 'src/entities/user.entity';
import type { Record as RecordModel } from 'src/entities/record.entity';
import type { Work as WorkModel } from 'src/entities/work.entity';
import type { Episode as EpisodeModel } from 'src/entities/episode.entity';
import type { MercuriusContext } from 'mercurius';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K];
};
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>;
};
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>;
};
export type ResolverFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) =>
  | Promise<import('mercurius-codegen').DeepPartial<TResult>>
  | import('mercurius-codegen').DeepPartial<TResult>;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type RequireFields<T, K extends keyof T> = Omit<T, K> & {
  [P in K]-?: NonNullable<T[P]>;
};
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: string;
  String: string;
  Boolean: boolean;
  Int: number;
  Float: number;
  GraphQLTimestamp: any;
  _FieldSet: any;
};

export type Query = {
  __typename?: 'Query';
  currentUser?: Maybe<User>;
  userByName?: Maybe<User>;
  timeline?: Maybe<Array<Maybe<Post>>>;
  curatedLists?: Maybe<Array<Maybe<CuratedList>>>;
  curatedList?: Maybe<CuratedList>;
  searchWorks?: Maybe<SearchWorksResult>;
  weeklyWorksChart: Array<WorksChartItem>;
  work?: Maybe<Work>;
  workByTitle?: Maybe<Work>;
  post?: Maybe<Post>;
};

export type QueryuserByNameArgs = {
  name?: InputMaybe<Scalars['String']>;
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

export type StatusType = 'FINISHED' | 'WATCHING' | 'SUSPENDED' | 'INTERESTED';

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
  posts: PostConnection;
};

export type EpisodepostsArgs = {
  beforeId?: InputMaybe<Scalars['ID']>;
  count?: InputMaybe<Scalars['Int']>;
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

export type DatePrecision = 'YEAR_MONTH' | 'DATE' | 'DATE_TIME';

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

export type ResolverTypeWrapper<T> = Promise<T> | T;

export type ResolverWithResolve<TResult, TParent, TContext, TArgs> = {
  resolve: ResolverFn<TResult, TParent, TContext, TArgs>;
};
export type Resolver<TResult, TParent = {}, TContext = {}, TArgs = {}> =
  | ResolverFn<TResult, TParent, TContext, TArgs>
  | ResolverWithResolve<TResult, TParent, TContext, TArgs>;

export type SubscriptionSubscribeFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => AsyncIterable<TResult> | Promise<AsyncIterable<TResult>>;

export type SubscriptionResolveFn<TResult, TParent, TContext, TArgs> = (
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;

export interface SubscriptionSubscriberObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs,
> {
  subscribe: SubscriptionSubscribeFn<
    { [key in TKey]: TResult },
    TParent,
    TContext,
    TArgs
  >;
  resolve?: SubscriptionResolveFn<
    TResult,
    { [key in TKey]: TResult },
    TContext,
    TArgs
  >;
}

export interface SubscriptionResolverObject<TResult, TParent, TContext, TArgs> {
  subscribe: SubscriptionSubscribeFn<any, TParent, TContext, TArgs>;
  resolve: SubscriptionResolveFn<TResult, any, TContext, TArgs>;
}

export type SubscriptionObject<
  TResult,
  TKey extends string,
  TParent,
  TContext,
  TArgs,
> =
  | SubscriptionSubscriberObject<TResult, TKey, TParent, TContext, TArgs>
  | SubscriptionResolverObject<TResult, TParent, TContext, TArgs>;

export type SubscriptionResolver<
  TResult,
  TKey extends string,
  TParent = {},
  TContext = {},
  TArgs = {},
> =
  | ((
      ...args: any[]
    ) => SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>)
  | SubscriptionObject<TResult, TKey, TParent, TContext, TArgs>;

export type TypeResolveFn<TTypes, TParent = {}, TContext = {}> = (
  parent: TParent,
  context: TContext,
  info: GraphQLResolveInfo,
) => Maybe<TTypes> | Promise<Maybe<TTypes>>;

export type IsTypeOfResolverFn<T = {}, TContext = {}> = (
  obj: T,
  context: TContext,
  info: GraphQLResolveInfo,
) => boolean | Promise<boolean>;

export type NextResolverFn<T> = () => Promise<T>;

export type DirectiveResolverFn<
  TResult = {},
  TParent = {},
  TContext = {},
  TArgs = {},
> = (
  next: NextResolverFn<TResult>,
  parent: TParent,
  args: TArgs,
  context: TContext,
  info: GraphQLResolveInfo,
) => TResult | Promise<TResult>;

/** Mapping between all available schema types and the resolvers types */
export type ResolversTypes = {
  Query: ResolverTypeWrapper<{}>;
  String: ResolverTypeWrapper<Scalars['String']>;
  ID: ResolverTypeWrapper<Scalars['ID']>;
  Int: ResolverTypeWrapper<Scalars['Int']>;
  Node:
    | ResolversTypes['User']
    | ResolversTypes['Category']
    | ResolversTypes['Post']
    | ResolversTypes['Record']
    | ResolversTypes['Work'];
  GraphQLTimestamp: ResolverTypeWrapper<Scalars['GraphQLTimestamp']>;
  User: ResolverTypeWrapper<UserModel>;
  Boolean: ResolverTypeWrapper<Scalars['Boolean']>;
  Category: ResolverTypeWrapper<
    Omit<Category, 'user'> & { user?: Maybe<ResolversTypes['User']> }
  >;
  Post: ResolverTypeWrapper<HistoryModel>;
  StatusType: StatusType;
  Record: ResolverTypeWrapper<RecordModel>;
  CuratedList: ResolverTypeWrapper<
    Omit<CuratedList, 'works'> & {
      works?: Maybe<ResolversTypes['CuratedListWorkConnection']>;
    }
  >;
  CuratedListWorkConnection: ResolverTypeWrapper<
    Omit<CuratedListWorkConnection, 'edges'> & {
      edges?: Maybe<Array<Maybe<ResolversTypes['CuratedListWorkEdge']>>>;
    }
  >;
  CuratedListWorkEdge: ResolverTypeWrapper<
    Omit<CuratedListWorkEdge, 'node'> & { node?: Maybe<ResolversTypes['Work']> }
  >;
  Work: ResolverTypeWrapper<WorkModel>;
  PostConnection: ResolverTypeWrapper<
    Omit<PostConnection, 'nodes'> & { nodes: Array<ResolversTypes['Post']> }
  >;
  Episode: ResolverTypeWrapper<EpisodeModel>;
  WorkMetadata: ResolverTypeWrapper<WorkMetadata>;
  SourceType: SourceType;
  WorkSchedule: ResolverTypeWrapper<WorkSchedule>;
  DatePrecision: DatePrecision;
  SearchWorksResult: ResolverTypeWrapper<
    Omit<SearchWorksResult, 'edges'> & {
      edges: Array<ResolversTypes['SearchWorksResultEdge']>;
    }
  >;
  SearchWorksResultEdge: ResolverTypeWrapper<
    Omit<SearchWorksResultEdge, 'node'> & { node: ResolversTypes['Work'] }
  >;
  WorksChartItem: ResolverTypeWrapper<
    Omit<WorksChartItem, 'work'> & { work: ResolversTypes['Work'] }
  >;
};

/** Mapping between all available schema types and the resolvers parents */
export type ResolversParentTypes = {
  Query: {};
  String: Scalars['String'];
  ID: Scalars['ID'];
  Int: Scalars['Int'];
  Node:
    | ResolversParentTypes['User']
    | ResolversParentTypes['Category']
    | ResolversParentTypes['Post']
    | ResolversParentTypes['Record']
    | ResolversParentTypes['Work'];
  GraphQLTimestamp: Scalars['GraphQLTimestamp'];
  User: UserModel;
  Boolean: Scalars['Boolean'];
  Category: Omit<Category, 'user'> & {
    user?: Maybe<ResolversParentTypes['User']>;
  };
  Post: HistoryModel;
  Record: RecordModel;
  CuratedList: Omit<CuratedList, 'works'> & {
    works?: Maybe<ResolversParentTypes['CuratedListWorkConnection']>;
  };
  CuratedListWorkConnection: Omit<CuratedListWorkConnection, 'edges'> & {
    edges?: Maybe<Array<Maybe<ResolversParentTypes['CuratedListWorkEdge']>>>;
  };
  CuratedListWorkEdge: Omit<CuratedListWorkEdge, 'node'> & {
    node?: Maybe<ResolversParentTypes['Work']>;
  };
  Work: WorkModel;
  PostConnection: Omit<PostConnection, 'nodes'> & {
    nodes: Array<ResolversParentTypes['Post']>;
  };
  Episode: EpisodeModel;
  WorkMetadata: WorkMetadata;
  WorkSchedule: WorkSchedule;
  SearchWorksResult: Omit<SearchWorksResult, 'edges'> & {
    edges: Array<ResolversParentTypes['SearchWorksResultEdge']>;
  };
  SearchWorksResultEdge: Omit<SearchWorksResultEdge, 'node'> & {
    node: ResolversParentTypes['Work'];
  };
  WorksChartItem: Omit<WorksChartItem, 'work'> & {
    work: ResolversParentTypes['Work'];
  };
};

export type QueryResolvers<
  ContextType = MercuriusContext,
  ParentType extends ResolversParentTypes['Query'] = ResolversParentTypes['Query'],
> = {
  currentUser?: Resolver<
    Maybe<ResolversTypes['User']>,
    ParentType,
    ContextType
  >;
  userByName?: Resolver<
    Maybe<ResolversTypes['User']>,
    ParentType,
    ContextType,
    Partial<QueryuserByNameArgs>
  >;
  timeline?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['Post']>>>,
    ParentType,
    ContextType,
    Partial<QuerytimelineArgs>
  >;
  curatedLists?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['CuratedList']>>>,
    ParentType,
    ContextType
  >;
  curatedList?: Resolver<
    Maybe<ResolversTypes['CuratedList']>,
    ParentType,
    ContextType,
    Partial<QuerycuratedListArgs>
  >;
  searchWorks?: Resolver<
    Maybe<ResolversTypes['SearchWorksResult']>,
    ParentType,
    ContextType,
    RequireFields<QuerysearchWorksArgs, 'query'>
  >;
  weeklyWorksChart?: Resolver<
    Array<ResolversTypes['WorksChartItem']>,
    ParentType,
    ContextType,
    RequireFields<QueryweeklyWorksChartArgs, 'limit'>
  >;
  work?: Resolver<
    Maybe<ResolversTypes['Work']>,
    ParentType,
    ContextType,
    RequireFields<QueryworkArgs, 'id'>
  >;
  workByTitle?: Resolver<
    Maybe<ResolversTypes['Work']>,
    ParentType,
    ContextType,
    RequireFields<QueryworkByTitleArgs, 'title'>
  >;
  post?: Resolver<
    Maybe<ResolversTypes['Post']>,
    ParentType,
    ContextType,
    RequireFields<QuerypostArgs, 'id'>
  >;
};

export type NodeResolvers<
  ContextType = MercuriusContext,
  ParentType extends ResolversParentTypes['Node'] = ResolversParentTypes['Node'],
> = {
  resolveType: TypeResolveFn<
    'User' | 'Category' | 'Post' | 'Record' | 'Work',
    ParentType,
    ContextType
  >;
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
};

export interface GraphQLTimestampScalarConfig
  extends GraphQLScalarTypeConfig<ResolversTypes['GraphQLTimestamp'], any> {
  name: 'GraphQLTimestamp';
}

export type UserResolvers<
  ContextType = MercuriusContext,
  ParentType extends ResolversParentTypes['User'] = ResolversParentTypes['User'],
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  joinedAt?: Resolver<
    Maybe<ResolversTypes['GraphQLTimestamp']>,
    ParentType,
    ContextType
  >;
  isTwitterConnected?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType
  >;
  categories?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['Category']>>>,
    ParentType,
    ContextType
  >;
  recordCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  postCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CategoryResolvers<
  ContextType = MercuriusContext,
  ParentType extends ResolversParentTypes['Category'] = ResolversParentTypes['Category'],
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PostResolvers<
  ContextType = MercuriusContext,
  ParentType extends ResolversParentTypes['Post'] = ResolversParentTypes['Post'],
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  record?: Resolver<Maybe<ResolversTypes['Record']>, ParentType, ContextType>;
  statusType?: Resolver<
    Maybe<ResolversTypes['StatusType']>,
    ParentType,
    ContextType
  >;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  comment?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  containsSpoiler?: Resolver<
    Maybe<ResolversTypes['Boolean']>,
    ParentType,
    ContextType
  >;
  user?: Resolver<Maybe<ResolversTypes['User']>, ParentType, ContextType>;
  updatedAt?: Resolver<
    Maybe<ResolversTypes['GraphQLTimestamp']>,
    ParentType,
    ContextType
  >;
  work?: Resolver<Maybe<ResolversTypes['Work']>, ParentType, ContextType>;
  episode?: Resolver<Maybe<ResolversTypes['Episode']>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type RecordResolvers<
  ContextType = MercuriusContext,
  ParentType extends ResolversParentTypes['Record'] = ResolversParentTypes['Record'],
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  statusType?: Resolver<
    Maybe<ResolversTypes['StatusType']>,
    ParentType,
    ContextType
  >;
  status?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CuratedListResolvers<
  ContextType = MercuriusContext,
  ParentType extends ResolversParentTypes['CuratedList'] = ResolversParentTypes['CuratedList'],
> = {
  id?: Resolver<Maybe<ResolversTypes['ID']>, ParentType, ContextType>;
  name?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  works?: Resolver<
    Maybe<ResolversTypes['CuratedListWorkConnection']>,
    ParentType,
    ContextType
  >;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CuratedListWorkConnectionResolvers<
  ContextType = MercuriusContext,
  ParentType extends ResolversParentTypes['CuratedListWorkConnection'] = ResolversParentTypes['CuratedListWorkConnection'],
> = {
  edges?: Resolver<
    Maybe<Array<Maybe<ResolversTypes['CuratedListWorkEdge']>>>,
    ParentType,
    ContextType
  >;
  totalCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type CuratedListWorkEdgeResolvers<
  ContextType = MercuriusContext,
  ParentType extends ResolversParentTypes['CuratedListWorkEdge'] = ResolversParentTypes['CuratedListWorkEdge'],
> = {
  node?: Resolver<Maybe<ResolversTypes['Work']>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WorkResolvers<
  ContextType = MercuriusContext,
  ParentType extends ResolversParentTypes['Work'] = ResolversParentTypes['Work'],
> = {
  id?: Resolver<ResolversTypes['ID'], ParentType, ContextType>;
  title?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  imageUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  record?: Resolver<Maybe<ResolversTypes['Record']>, ParentType, ContextType>;
  recordCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  metadata?: Resolver<
    Maybe<ResolversTypes['WorkMetadata']>,
    ParentType,
    ContextType
  >;
  episodes?: Resolver<
    Maybe<Array<ResolversTypes['Episode']>>,
    ParentType,
    ContextType
  >;
  episode?: Resolver<
    Maybe<ResolversTypes['Episode']>,
    ParentType,
    ContextType,
    RequireFields<WorkepisodeArgs, 'episode'>
  >;
  posts?: Resolver<
    ResolversTypes['PostConnection'],
    ParentType,
    ContextType,
    Partial<WorkpostsArgs>
  >;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type PostConnectionResolvers<
  ContextType = MercuriusContext,
  ParentType extends ResolversParentTypes['PostConnection'] = ResolversParentTypes['PostConnection'],
> = {
  nodes?: Resolver<Array<ResolversTypes['Post']>, ParentType, ContextType>;
  hasMore?: Resolver<ResolversTypes['Boolean'], ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type EpisodeResolvers<
  ContextType = MercuriusContext,
  ParentType extends ResolversParentTypes['Episode'] = ResolversParentTypes['Episode'],
> = {
  number?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  postCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  userCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  suspendedUserCount?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  posts?: Resolver<
    ResolversTypes['PostConnection'],
    ParentType,
    ContextType,
    Partial<EpisodepostsArgs>
  >;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WorkMetadataResolvers<
  ContextType = MercuriusContext,
  ParentType extends ResolversParentTypes['WorkMetadata'] = ResolversParentTypes['WorkMetadata'],
> = {
  periods?: Resolver<
    Maybe<Array<ResolversTypes['String']>>,
    ParentType,
    ContextType
  >;
  studioNames?: Resolver<
    Maybe<Array<ResolversTypes['String']>>,
    ParentType,
    ContextType
  >;
  source?: Resolver<
    Maybe<ResolversTypes['SourceType']>,
    ParentType,
    ContextType
  >;
  websiteUrl?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  namuwikiUrl?: Resolver<
    Maybe<ResolversTypes['String']>,
    ParentType,
    ContextType
  >;
  annUrl?: Resolver<Maybe<ResolversTypes['String']>, ParentType, ContextType>;
  durationMinutes?: Resolver<
    Maybe<ResolversTypes['Int']>,
    ParentType,
    ContextType
  >;
  schedules?: Resolver<
    Maybe<Array<ResolversTypes['WorkSchedule']>>,
    ParentType,
    ContextType
  >;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WorkScheduleResolvers<
  ContextType = MercuriusContext,
  ParentType extends ResolversParentTypes['WorkSchedule'] = ResolversParentTypes['WorkSchedule'],
> = {
  country?: Resolver<ResolversTypes['String'], ParentType, ContextType>;
  date?: Resolver<
    Maybe<ResolversTypes['GraphQLTimestamp']>,
    ParentType,
    ContextType
  >;
  datePrecision?: Resolver<
    Maybe<ResolversTypes['DatePrecision']>,
    ParentType,
    ContextType
  >;
  broadcasts?: Resolver<
    Maybe<Array<ResolversTypes['String']>>,
    ParentType,
    ContextType
  >;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SearchWorksResultResolvers<
  ContextType = MercuriusContext,
  ParentType extends ResolversParentTypes['SearchWorksResult'] = ResolversParentTypes['SearchWorksResult'],
> = {
  edges?: Resolver<
    Array<ResolversTypes['SearchWorksResultEdge']>,
    ParentType,
    ContextType
  >;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type SearchWorksResultEdgeResolvers<
  ContextType = MercuriusContext,
  ParentType extends ResolversParentTypes['SearchWorksResultEdge'] = ResolversParentTypes['SearchWorksResultEdge'],
> = {
  node?: Resolver<ResolversTypes['Work'], ParentType, ContextType>;
  recordCount?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  isTypeOf?: IsTypeOfResolverFn<ParentType, ContextType>;
};

export type WorksChartItemResolvers<
  ContextType = MercuriusContext,
  ParentType extends ResolversParentTypes['WorksChartItem'] = ResolversParentTypes['WorksChartItem'],
> = {
  rank?: Resolver<ResolversTypes['Int'], ParentType, ContextType>;
  work?: Resolver<ResolversTypes['Work'], ParentType, ContextType>;
  diff?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
  sign?: Resolver<Maybe<ResolversTypes['Int']>, ParentType, ContextType>;
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
};

export type Loader<TReturn, TObj, TParams, TContext> = (
  queries: Array<{
    obj: TObj;
    params: TParams;
  }>,
  context: TContext & {
    reply: import('fastify').FastifyReply;
  },
) => Promise<Array<import('mercurius-codegen').DeepPartial<TReturn>>>;
export type LoaderResolver<TReturn, TObj, TParams, TContext> =
  | Loader<TReturn, TObj, TParams, TContext>
  | {
      loader: Loader<TReturn, TObj, TParams, TContext>;
      opts?: {
        cache?: boolean;
      };
    };
export interface Loaders<
  TContext = import('mercurius').MercuriusContext & {
    reply: import('fastify').FastifyReply;
  },
> {
  User?: {
    id?: LoaderResolver<Scalars['ID'], User, {}, TContext>;
    name?: LoaderResolver<Maybe<Scalars['String']>, User, {}, TContext>;
    joinedAt?: LoaderResolver<
      Maybe<Scalars['GraphQLTimestamp']>,
      User,
      {},
      TContext
    >;
    isTwitterConnected?: LoaderResolver<
      Maybe<Scalars['Boolean']>,
      User,
      {},
      TContext
    >;
    categories?: LoaderResolver<
      Maybe<Array<Maybe<Category>>>,
      User,
      {},
      TContext
    >;
    recordCount?: LoaderResolver<Maybe<Scalars['Int']>, User, {}, TContext>;
    postCount?: LoaderResolver<Maybe<Scalars['Int']>, User, {}, TContext>;
  };

  Category?: {
    id?: LoaderResolver<Scalars['ID'], Category, {}, TContext>;
    user?: LoaderResolver<Maybe<User>, Category, {}, TContext>;
    name?: LoaderResolver<Maybe<Scalars['String']>, Category, {}, TContext>;
  };

  Post?: {
    id?: LoaderResolver<Scalars['ID'], Post, {}, TContext>;
    record?: LoaderResolver<Maybe<Record>, Post, {}, TContext>;
    statusType?: LoaderResolver<Maybe<StatusType>, Post, {}, TContext>;
    status?: LoaderResolver<Maybe<Scalars['String']>, Post, {}, TContext>;
    comment?: LoaderResolver<Maybe<Scalars['String']>, Post, {}, TContext>;
    containsSpoiler?: LoaderResolver<
      Maybe<Scalars['Boolean']>,
      Post,
      {},
      TContext
    >;
    user?: LoaderResolver<Maybe<User>, Post, {}, TContext>;
    updatedAt?: LoaderResolver<
      Maybe<Scalars['GraphQLTimestamp']>,
      Post,
      {},
      TContext
    >;
    work?: LoaderResolver<Maybe<Work>, Post, {}, TContext>;
    episode?: LoaderResolver<Maybe<Episode>, Post, {}, TContext>;
  };

  Record?: {
    id?: LoaderResolver<Scalars['ID'], Record, {}, TContext>;
    title?: LoaderResolver<Maybe<Scalars['String']>, Record, {}, TContext>;
    statusType?: LoaderResolver<Maybe<StatusType>, Record, {}, TContext>;
    status?: LoaderResolver<Maybe<Scalars['String']>, Record, {}, TContext>;
  };

  CuratedList?: {
    id?: LoaderResolver<Maybe<Scalars['ID']>, CuratedList, {}, TContext>;
    name?: LoaderResolver<Maybe<Scalars['String']>, CuratedList, {}, TContext>;
    works?: LoaderResolver<
      Maybe<CuratedListWorkConnection>,
      CuratedList,
      {},
      TContext
    >;
  };

  CuratedListWorkConnection?: {
    edges?: LoaderResolver<
      Maybe<Array<Maybe<CuratedListWorkEdge>>>,
      CuratedListWorkConnection,
      {},
      TContext
    >;
    totalCount?: LoaderResolver<
      Maybe<Scalars['Int']>,
      CuratedListWorkConnection,
      {},
      TContext
    >;
  };

  CuratedListWorkEdge?: {
    node?: LoaderResolver<Maybe<Work>, CuratedListWorkEdge, {}, TContext>;
  };

  Work?: {
    id?: LoaderResolver<Scalars['ID'], Work, {}, TContext>;
    title?: LoaderResolver<Maybe<Scalars['String']>, Work, {}, TContext>;
    imageUrl?: LoaderResolver<Maybe<Scalars['String']>, Work, {}, TContext>;
    record?: LoaderResolver<Maybe<Record>, Work, {}, TContext>;
    recordCount?: LoaderResolver<Maybe<Scalars['Int']>, Work, {}, TContext>;
    metadata?: LoaderResolver<Maybe<WorkMetadata>, Work, {}, TContext>;
    episodes?: LoaderResolver<Maybe<Array<Episode>>, Work, {}, TContext>;
    episode?: LoaderResolver<Maybe<Episode>, Work, WorkepisodeArgs, TContext>;
    posts?: LoaderResolver<PostConnection, Work, WorkpostsArgs, TContext>;
  };

  PostConnection?: {
    nodes?: LoaderResolver<Array<Post>, PostConnection, {}, TContext>;
    hasMore?: LoaderResolver<Scalars['Boolean'], PostConnection, {}, TContext>;
  };

  Episode?: {
    number?: LoaderResolver<Scalars['Int'], Episode, {}, TContext>;
    postCount?: LoaderResolver<Maybe<Scalars['Int']>, Episode, {}, TContext>;
    userCount?: LoaderResolver<Maybe<Scalars['Int']>, Episode, {}, TContext>;
    suspendedUserCount?: LoaderResolver<
      Maybe<Scalars['Int']>,
      Episode,
      {},
      TContext
    >;
    posts?: LoaderResolver<PostConnection, Episode, EpisodepostsArgs, TContext>;
  };

  WorkMetadata?: {
    periods?: LoaderResolver<
      Maybe<Array<Scalars['String']>>,
      WorkMetadata,
      {},
      TContext
    >;
    studioNames?: LoaderResolver<
      Maybe<Array<Scalars['String']>>,
      WorkMetadata,
      {},
      TContext
    >;
    source?: LoaderResolver<Maybe<SourceType>, WorkMetadata, {}, TContext>;
    websiteUrl?: LoaderResolver<
      Maybe<Scalars['String']>,
      WorkMetadata,
      {},
      TContext
    >;
    namuwikiUrl?: LoaderResolver<
      Maybe<Scalars['String']>,
      WorkMetadata,
      {},
      TContext
    >;
    annUrl?: LoaderResolver<
      Maybe<Scalars['String']>,
      WorkMetadata,
      {},
      TContext
    >;
    durationMinutes?: LoaderResolver<
      Maybe<Scalars['Int']>,
      WorkMetadata,
      {},
      TContext
    >;
    schedules?: LoaderResolver<
      Maybe<Array<WorkSchedule>>,
      WorkMetadata,
      {},
      TContext
    >;
  };

  WorkSchedule?: {
    country?: LoaderResolver<Scalars['String'], WorkSchedule, {}, TContext>;
    date?: LoaderResolver<
      Maybe<Scalars['GraphQLTimestamp']>,
      WorkSchedule,
      {},
      TContext
    >;
    datePrecision?: LoaderResolver<
      Maybe<DatePrecision>,
      WorkSchedule,
      {},
      TContext
    >;
    broadcasts?: LoaderResolver<
      Maybe<Array<Scalars['String']>>,
      WorkSchedule,
      {},
      TContext
    >;
  };

  SearchWorksResult?: {
    edges?: LoaderResolver<
      Array<SearchWorksResultEdge>,
      SearchWorksResult,
      {},
      TContext
    >;
  };

  SearchWorksResultEdge?: {
    node?: LoaderResolver<Work, SearchWorksResultEdge, {}, TContext>;
    recordCount?: LoaderResolver<
      Maybe<Scalars['Int']>,
      SearchWorksResultEdge,
      {},
      TContext
    >;
  };

  WorksChartItem?: {
    rank?: LoaderResolver<Scalars['Int'], WorksChartItem, {}, TContext>;
    work?: LoaderResolver<Work, WorksChartItem, {}, TContext>;
    diff?: LoaderResolver<Maybe<Scalars['Int']>, WorksChartItem, {}, TContext>;
    sign?: LoaderResolver<Maybe<Scalars['Int']>, WorksChartItem, {}, TContext>;
  };
}
