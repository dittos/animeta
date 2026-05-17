export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  GraphQLTimestamp: { input: string; output: string; }
};

export type Category = Node & {
  __typename?: 'Category';
  id: Scalars['ID']['output'];
  databaseId: Scalars['String']['output'];
  user: Maybe<User>;
  name: Scalars['String']['output'];
};

export type Post = Node & {
  __typename?: 'Post';
  id: Scalars['ID']['output'];
  databaseId: Scalars['String']['output'];
  record: Maybe<Record>;
  statusType: Maybe<StatusType>;
  status: Maybe<Scalars['String']['output']>;
  comment: Maybe<Scalars['String']['output']>;
  containsSpoiler: Maybe<Scalars['Boolean']['output']>;
  user: Maybe<User>;
  updatedAt: Maybe<Scalars['GraphQLTimestamp']['output']>;
  rating: Maybe<Scalars['Float']['output']>;
  work: Maybe<Work>;
  episode: Maybe<Episode>;
};

export type PostConnection = {
  __typename?: 'PostConnection';
  nodes: Array<Post>;
  hasMore: Scalars['Boolean']['output'];
};

export type Record = Node & {
  __typename?: 'Record';
  id: Scalars['ID']['output'];
  databaseId: Scalars['String']['output'];
  title: Maybe<Scalars['String']['output']>;
  statusType: Maybe<StatusType>;
  status: Maybe<Scalars['String']['output']>;
  user: Maybe<User>;
  work: Maybe<Work>;
  category: Maybe<Category>;
  updatedAt: Maybe<Scalars['GraphQLTimestamp']['output']>;
  rating: Maybe<Scalars['Float']['output']>;
  hasNewerEpisode: Maybe<Scalars['Boolean']['output']>;
  posts: PostConnection;
};


export type RecordPostsArgs = {
  beforeId: InputMaybe<Scalars['ID']['input']>;
  count: InputMaybe<Scalars['Int']['input']>;
};

export type RecordConnection = {
  __typename?: 'RecordConnection';
  nodes: Array<Record>;
};

export type User = Node & {
  __typename?: 'User';
  id: Scalars['ID']['output'];
  databaseId: Scalars['String']['output'];
  name: Maybe<Scalars['String']['output']>;
  joinedAt: Maybe<Scalars['GraphQLTimestamp']['output']>;
  isTwitterConnected: Maybe<Scalars['Boolean']['output']>;
  isCurrentUser: Scalars['Boolean']['output'];
  categories: Array<Category>;
  recordCount: Maybe<Scalars['Int']['output']>;
  postCount: Maybe<Scalars['Int']['output']>;
  posts: PostConnection;
  records: RecordConnection;
  recordFilters: RecordFilters;
};


export type UserPostsArgs = {
  beforeId: InputMaybe<Scalars['ID']['input']>;
  count: InputMaybe<Scalars['Int']['input']>;
};


export type UserRecordsArgs = {
  statusType: InputMaybe<StatusType>;
  categoryId: InputMaybe<Scalars['ID']['input']>;
  orderBy: InputMaybe<RecordOrder>;
  first: InputMaybe<Scalars['Int']['input']>;
};


export type UserRecordFiltersArgs = {
  statusType: InputMaybe<StatusType>;
  categoryId: InputMaybe<Scalars['ID']['input']>;
};

export enum RecordOrder {
  Date = 'DATE',
  Title = 'TITLE',
  Rating = 'RATING'
}

export type RecordFilters = {
  __typename?: 'RecordFilters';
  totalCount: Scalars['Int']['output'];
  filteredCount: Scalars['Int']['output'];
  statusType: RecordFilter;
  categoryId: RecordFilter;
};

export type RecordFilter = {
  __typename?: 'RecordFilter';
  allCount: Scalars['Int']['output'];
  items: Array<RecordFilterItem>;
};

export type RecordFilterItem = {
  __typename?: 'RecordFilterItem';
  key: Scalars['String']['output'];
  count: Scalars['Int']['output'];
};

export type Work = Node & {
  __typename?: 'Work';
  id: Scalars['ID']['output'];
  databaseId: Scalars['String']['output'];
  title: Maybe<Scalars['String']['output']>;
  imageUrl: Maybe<Scalars['String']['output']>;
  record: Maybe<Record>;
  recordCount: Maybe<Scalars['Int']['output']>;
  metadata: Maybe<WorkMetadata>;
  episodes: Maybe<Array<Episode>>;
  episode: Maybe<Episode>;
  posts: PostConnection;
};


export type WorkEpisodeArgs = {
  episode: Scalars['Int']['input'];
};


export type WorkPostsArgs = {
  beforeId: InputMaybe<Scalars['ID']['input']>;
  count: InputMaybe<Scalars['Int']['input']>;
  episode: InputMaybe<Scalars['Int']['input']>;
};

export type Episode = {
  __typename?: 'Episode';
  number: Scalars['Int']['output'];
  postCount: Maybe<Scalars['Int']['output']>;
  userCount: Maybe<Scalars['Int']['output']>;
  suspendedUserCount: Maybe<Scalars['Int']['output']>;
};

export type WorkMetadata = {
  __typename?: 'WorkMetadata';
  periods: Maybe<Array<Scalars['String']['output']>>;
  studioNames: Maybe<Array<Scalars['String']['output']>>;
  source: Maybe<SourceType>;
  websiteUrl: Maybe<Scalars['String']['output']>;
  namuwikiUrl: Maybe<Scalars['String']['output']>;
  translatedJaWikipediaUrl: Maybe<Scalars['String']['output']>;
  annUrl: Maybe<Scalars['String']['output']>;
  durationMinutes: Maybe<Scalars['Int']['output']>;
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
  country: Scalars['String']['output'];
  date: Maybe<Scalars['GraphQLTimestamp']['output']>;
  datePrecision: Maybe<DatePrecision>;
  broadcasts: Maybe<Array<Scalars['String']['output']>>;
};

export enum DatePrecision {
  YearMonth = 'YEAR_MONTH',
  Date = 'DATE',
  DateTime = 'DATE_TIME'
}

export type Node = {
  id: Scalars['ID']['output'];
};

export enum StatusType {
  Finished = 'FINISHED',
  Watching = 'WATCHING',
  Suspended = 'SUSPENDED',
  Interested = 'INTERESTED'
}

export type Mutation = {
  __typename?: 'Mutation';
  _empty: Maybe<Scalars['Boolean']['output']>;
  createCategory: CreateCategoryResult;
  createPost: CreatePostResult;
  createRecord: CreateRecordResult;
  deleteCategory: DeleteCategoryResult;
  deletePost: DeletePostResult;
  renameCategory: RenameCategoryResult;
  updateCategoryOrder: UpdateCategoryOrderResult;
  updateRecordCategoryId: UpdateRecordCategoryIdResult;
  updateRecordRating: UpdateRecordRatingResult;
  updateRecordTitle: UpdateRecordTitleResult;
  deleteRecord: DeleteRecordResult;
};


export type MutationCreateCategoryArgs = {
  input: CreateCategoryInput;
};


export type MutationCreatePostArgs = {
  input: CreatePostInput;
};


export type MutationCreateRecordArgs = {
  input: CreateRecordInput;
};


export type MutationDeleteCategoryArgs = {
  input: DeleteCategoryInput;
};


export type MutationDeletePostArgs = {
  input: DeletePostInput;
};


export type MutationRenameCategoryArgs = {
  input: RenameCategoryInput;
};


export type MutationUpdateCategoryOrderArgs = {
  input: UpdateCategoryOrderInput;
};


export type MutationUpdateRecordCategoryIdArgs = {
  input: UpdateRecordCategoryIdInput;
};


export type MutationUpdateRecordRatingArgs = {
  input: UpdateRecordRatingInput;
};


export type MutationUpdateRecordTitleArgs = {
  input: UpdateRecordTitleInput;
};


export type MutationDeleteRecordArgs = {
  input: DeleteRecordInput;
};

export type CreateCategoryInput = {
  name: Scalars['String']['input'];
};

export type CreateCategoryResult = {
  __typename?: 'CreateCategoryResult';
  category: Category;
};

export type CreatePostInput = {
  recordId: Scalars['ID']['input'];
  status: Scalars['String']['input'];
  statusType: StatusType;
  comment: Scalars['String']['input'];
  containsSpoiler: InputMaybe<Scalars['Boolean']['input']>;
  publishTwitter: InputMaybe<Scalars['Boolean']['input']>;
  rating: InputMaybe<Scalars['Float']['input']>;
};

export type CreatePostResult = {
  __typename?: 'CreatePostResult';
  post: Post;
};

export type CreateRecordInput = {
  title: Scalars['String']['input'];
  categoryId: InputMaybe<Scalars['ID']['input']>;
  status: Scalars['String']['input'];
  statusType: StatusType;
  comment: Scalars['String']['input'];
  publishTwitter: InputMaybe<Scalars['Boolean']['input']>;
  rating: InputMaybe<Scalars['Float']['input']>;
};

export type CreateRecordResult = {
  __typename?: 'CreateRecordResult';
  record: Record;
  post: Maybe<Post>;
};

export type DeleteCategoryInput = {
  categoryId: Scalars['ID']['input'];
};

export type DeleteCategoryResult = {
  __typename?: 'DeleteCategoryResult';
  deleted: Scalars['Boolean']['output'];
  user: Maybe<User>;
};

export type DeletePostInput = {
  postId: Scalars['ID']['input'];
};

export type DeletePostResult = {
  __typename?: 'DeletePostResult';
  deleted: Scalars['Boolean']['output'];
  record: Maybe<Record>;
};

export type RenameCategoryInput = {
  categoryId: Scalars['ID']['input'];
  name: Scalars['String']['input'];
};

export type RenameCategoryResult = {
  __typename?: 'RenameCategoryResult';
  category: Category;
};

export type UpdateCategoryOrderInput = {
  categoryIds: Array<Scalars['ID']['input']>;
};

export type UpdateCategoryOrderResult = {
  __typename?: 'UpdateCategoryOrderResult';
  categories: Array<Category>;
};

export type UpdateRecordCategoryIdInput = {
  recordId: Scalars['ID']['input'];
  categoryId: InputMaybe<Scalars['ID']['input']>;
};

export type UpdateRecordCategoryIdResult = {
  __typename?: 'UpdateRecordCategoryIdResult';
  record: Record;
};

export type UpdateRecordRatingInput = {
  recordId: Scalars['ID']['input'];
  rating: InputMaybe<Scalars['Float']['input']>;
};

export type UpdateRecordRatingResult = {
  __typename?: 'UpdateRecordRatingResult';
  record: Record;
};

export type UpdateRecordTitleInput = {
  recordId: Scalars['ID']['input'];
  title: Scalars['String']['input'];
};

export type UpdateRecordTitleResult = {
  __typename?: 'UpdateRecordTitleResult';
  record: Record;
};

export type DeleteRecordInput = {
  recordId: Scalars['ID']['input'];
};

export type DeleteRecordResult = {
  __typename?: 'DeleteRecordResult';
  deleted: Scalars['Boolean']['output'];
  user: Maybe<User>;
};

export type Query = {
  __typename?: 'Query';
  currentUser: Maybe<User>;
  user: Maybe<User>;
  userByName: Maybe<User>;
  timeline: Maybe<Array<Maybe<Post>>>;
  work: Maybe<Work>;
  workByTitle: Maybe<Work>;
  post: Maybe<Post>;
  record: Maybe<Record>;
  tablePeriod: Maybe<TablePeriod>;
  currentTablePeriod: TablePeriod;
  tablePeriods: Array<TablePeriod>;
  tablePeriodNotice: Maybe<TablePeriodNotice>;
  curatedLists: Array<CuratedList>;
  curatedList: Maybe<CuratedList>;
  weeklyWorksChart: Array<WorksChartItem>;
  searchWorks: Maybe<SearchWorksResult>;
};


export type QueryUserArgs = {
  id: Scalars['ID']['input'];
};


export type QueryUserByNameArgs = {
  name: Scalars['String']['input'];
};


export type QueryTimelineArgs = {
  beforeId: InputMaybe<Scalars['ID']['input']>;
  count: InputMaybe<Scalars['Int']['input']>;
};


export type QueryWorkArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWorkByTitleArgs = {
  title: Scalars['String']['input'];
};


export type QueryPostArgs = {
  id: Scalars['ID']['input'];
};


export type QueryRecordArgs = {
  id: Scalars['ID']['input'];
};


export type QueryTablePeriodArgs = {
  period: Scalars['String']['input'];
};


export type QueryCuratedListArgs = {
  id: Scalars['ID']['input'];
};


export type QueryWeeklyWorksChartArgs = {
  limit: Scalars['Int']['input'];
};


export type QuerySearchWorksArgs = {
  query: Scalars['String']['input'];
};

export type TablePeriod = {
  __typename?: 'TablePeriod';
  period: Scalars['String']['output'];
  year: Scalars['Int']['output'];
  month: Scalars['Int']['output'];
  isCurrent: Scalars['Boolean']['output'];
  isRecommendationEnabled: Scalars['Boolean']['output'];
  items: Array<TablePeriodItem>;
};


export type TablePeriodItemsArgs = {
  onlyAdded?: InputMaybe<Scalars['Boolean']['input']>;
  username: InputMaybe<Scalars['String']['input']>;
  withRecommendations?: InputMaybe<Scalars['Boolean']['input']>;
};

export type TablePeriodItem = {
  __typename?: 'TablePeriodItem';
  title: Scalars['String']['output'];
  work: Work;
  record: Maybe<Record>;
  recommendations: Maybe<Array<Recommendation>>;
  recommendationScore: Maybe<Scalars['Int']['output']>;
};

export type Recommendation = RecommendationByCredit;

export type RecommendationByCredit = {
  __typename?: 'RecommendationByCredit';
  credit: Maybe<Credit>;
  related: Maybe<Array<WorkCredit>>;
  score: Maybe<Scalars['Int']['output']>;
};

export type Credit = {
  __typename?: 'Credit';
  type: Maybe<CreditType>;
  name: Maybe<Scalars['String']['output']>;
  personId: Scalars['ID']['output'];
};

export type WorkCredit = {
  __typename?: 'WorkCredit';
  workId: Scalars['ID']['output'];
  workTitle: Scalars['String']['output'];
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

export type TablePeriodNotice = {
  __typename?: 'TablePeriodNotice';
  id: Scalars['String']['output'];
  content: Scalars['String']['output'];
  showUntil: Maybe<Scalars['GraphQLTimestamp']['output']>;
};

export type CuratedList = {
  __typename?: 'CuratedList';
  id: Scalars['ID']['output'];
  name: Maybe<Scalars['String']['output']>;
  works: Maybe<CuratedListWorkConnection>;
};

export type CuratedListWorkConnection = {
  __typename?: 'CuratedListWorkConnection';
  edges: Maybe<Array<Maybe<CuratedListWorkEdge>>>;
  totalCount: Maybe<Scalars['Int']['output']>;
};

export type CuratedListWorkEdge = {
  __typename?: 'CuratedListWorkEdge';
  node: Maybe<Work>;
};

export type WorksChartItem = {
  __typename?: 'WorksChartItem';
  rank: Scalars['Int']['output'];
  work: Work;
  diff: Maybe<Scalars['Int']['output']>;
  sign: Maybe<Scalars['Int']['output']>;
};

export type SearchWorksResult = {
  __typename?: 'SearchWorksResult';
  edges: Array<SearchWorksResultEdge>;
};

export type SearchWorksResultEdge = {
  __typename?: 'SearchWorksResultEdge';
  node: Work;
  recordCount: Maybe<Scalars['Int']['output']>;
};
