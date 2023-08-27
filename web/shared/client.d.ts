export type CompanyDto = {
  id: string;
  name: string;
  works?: {
    id: string,
    title: string,
  }[];
  metadata: any;
}
type PersonWorkDto = {
  workId: string,
  workTitle: string,
  roleOrTask: string,
}
export type PersonDto = {
  id: string,
  name: string,
  metadata: any,
  staffs?: PersonWorkDto[],
  casts?: PersonWorkDto[],
}
export type SearchResultItem = {
  id: number;
  title: string;
  recordCount: number;
};
export type SourceType =
  | 'MANGA'
  | 'ORIGINAL'
  | 'LIGHT_NOVEL'
  | 'GAME'
  | 'FOUR_KOMA'
  | 'VISUAL_NOVEL'
  | 'NOVEL'
export type DatePrecision = 'YEAR_MONTH' | 'DATE' | 'DATE_TIME'
export type Schedule = {
  date?: string | null;
  datePrecision?: DatePrecision | null;
  broadcasts?: string[] | null;
}
export type WorkMetadata = {
  version: number;
  title?: string | null;
  periods?: string[] | null;
  studios?: string[] | null;
  source?: SourceType | null;
  website?: string | null;
  namuRef?: string | null;
  annId?: string | null;
  durationMinutes?: number | null;
  schedules?: {[country: string]: Schedule} | null;
}
export type TitleMappingDto = {
  id: string,
  title: string,
  record_count: number,
}
export type AdminWorkDto = {
  id: string,
  title: string,
  image_filename: string | null,
  image_path: string | null,
  image_center_y: number,
  raw_metadata: string,
  metadata: WorkMetadata | null,
  title_mappings: TitleMappingDto[],
  index: {
    record_count: number,
  } | null,
  staffs: {
    task: string,
    name: string,
    personId: string,
    metadata: any | null,
  }[],
  casts: {
    role: string,
    name: string,
    personId: string,
    metadata: any | null,
  }[],
}
export type UserSerializerOptions = {
  categories?: boolean;
  stats?: boolean;
  twitter?: boolean;
};
export type CategoryDto = {
  id: string;
  name: string;
}
export type UserDto = {
  id: string;
  name: string;
  dateJoined: number; // TODO: Date
  categories: CategoryDto[] | null;
  recordCount: number | null;
  historyCount: number | null;
  isTwitterConnected: boolean | null;
}
export type AuthResult = {
  sessionKey: string;
  expiryMs: number | null;
};
type UnratedRecord = {
  id: string;
  title: string;
}
type RatingSummary = {
  rating: number;
  recordCount: number;
}
type Params = {
  oldPassword: string;
  newPassword: string;
};
type Result = {
  ok: boolean;
};
export type StatusType = 'WATCHING' | 'FINISHED' | 'INTERESTED' | 'SUSPENDED';


export interface Client<TOptions = any> {
  call(path: "/api/admin/v1/clearCache", params: {}, options?: TOptions): Promise<boolean>
  call(path: "/api/admin/v1/getCompanies", params: {}, options?: TOptions): Promise<CompanyDto[]>
  call(path: "/api/admin/v1/CompanyDetail/", params: {id: string}, options?: TOptions): Promise<CompanyDto>
  call(path: "/api/admin/v1/CompanyDetail/rename", params: {
  id: string;
  name: string;
}, options?: TOptions): Promise<CompanyDto>
  call(path: "/api/admin/v1/CompanyList/", params: {}, options?: TOptions): Promise<CompanyDto[]>
  call(path: "/api/admin/v1/CompanyMergeForm/merge", params: {
  id: string;
  otherCompanyId: string;
}, options?: TOptions): Promise<CompanyDto>
  call(path: "/api/admin/v1/PersonDetail/", params: {id: string}, options?: TOptions): Promise<PersonDto>
  call(path: "/api/admin/v1/PersonDetail/rename", params: {
  id: string;
  name: string;
}, options?: TOptions): Promise<PersonDto>
  call(path: "/api/admin/v1/PersonList/", params: {
  page?: number;
}, options?: TOptions): Promise<PersonDto[]>
  call(path: "/api/admin/v1/PersonListTransliterationCheck/bulkRename", params: {
  id: string;
  name: string;
}[], options?: TOptions): Promise<boolean>
  call(path: "/api/admin/v1/PersonListTransliterationCheck/", params: {period: string}, options?: TOptions): Promise<{
  personId: string;
  name: string;
  recommendedTransliteration: string | null;
  count: number;
}[]>
  call(path: "/api/admin/v1/TitleAutosuggest/search", params: {query: string}, options?: TOptions): Promise<SearchResultItem[]>
  call(path: "/api/admin/v1/WorkAddForm/createWork", params: {
  title: string,
  namuRef: string | null,
  period: string | null,
}, options?: TOptions): Promise<AdminWorkDto>
  call(path: "/api/admin/v1/WorkDetail/addTitleMapping", params: {
  workId: string;
  title: string;
}, options?: TOptions): Promise<AdminWorkDto>
  call(path: "/api/admin/v1/WorkDetail/crawlImage", params: {
  workId: string;
  options: {
    source: 'ann';
    annId: string;
  } | {
    source: 'url';
    url: string;
  };
}, options?: TOptions): Promise<AdminWorkDto>
  call(path: "/api/admin/v1/WorkDetail/deleteTitleMapping", params: {
  workId: string;
  titleMappingId: string;
}, options?: TOptions): Promise<boolean>
  call(path: "/api/admin/v1/WorkDetail/editMetadata", params: {
  workId: string;
  rawMetadata: string;
}, options?: TOptions): Promise<AdminWorkDto>
  call(path: "/api/admin/v1/WorkDetail/importAnnMetadata", params: {
  workId: string;
  annId: string;
}, options?: TOptions): Promise<AdminWorkDto>
  call(path: "/api/admin/v1/WorkDetail/", params: {
  id: string;
}, options?: TOptions): Promise<AdminWorkDto>
  call(path: "/api/admin/v1/WorkDetail/setPrimaryTitle", params: {
  workId: string;
  primaryTitleMappingId: string;
}, options?: TOptions): Promise<AdminWorkDto>
  call(path: "/api/admin/v1/WorkDetail/update", params: {
  workId: string;
  blacklisted?: boolean;
  imageCenterY?: number;
}, options?: TOptions): Promise<AdminWorkDto>
  call(path: "/api/admin/v1/WorkList/delete", params: {workId: string}, options?: TOptions): Promise<boolean>
  call(path: "/api/admin/v1/WorkList/", params: {
  orphans?: boolean;
  offset?: number;
}, options?: TOptions): Promise<{
  id: string;
  title: string;
  record_count: number;
}[]>
  call(path: "/api/admin/v1/WorkMergeForm/merge", params: {
  workId: string;
  otherWorkId: string;
  forceMerge: boolean;
}, options?: TOptions): Promise<AdminWorkDto>
  call(path: "/api/v5/getCurrentUser", params: {
  options?: UserSerializerOptions,
}, options?: TOptions): Promise<UserDto>
  call(path: "/api/v5/resolveSlug", params: {slug: string}, options?: TOptions): Promise<{type: 'USER' | null}>
  call(path: "/api/v5/LoginForm/authenticate", params: {
  username: string;
  password: string;
  persistent: boolean;
}, options?: TOptions): Promise<AuthResult>
  call(path: "/api/v5/ManageRating/getUnratedRecords", params: {
  cursor: string | null,
}, options?: TOptions): Promise<{
  data: UnratedRecord[];
  nextCursor: string | null;
}>
  call(path: "/api/v5/ManageRating/", params: {}, options?: TOptions): Promise<{
  ratingSummaries: RatingSummary[];
  unratedRecordCount: number;
}>
  call(path: "/api/v5/Settings/changePassword", params: Params, options?: TOptions): Promise<Result>
  call(path: "/api/v5/Settings/createBackup", params: {}, options?: TOptions): Promise<{
  downloadUrl: string;
}>
  call(path: "/api/v5/Settings/disconnectTwitter", params: {}, options?: TOptions): Promise<{ok: boolean}>
  call(path: "/api/v5/Signup/createAccount", params: {
  username: string;
  password1: string;
  password2: string;
}, options?: TOptions): Promise<{
  authResult: AuthResult;
}>
  call(path: "/api/v5/Typeahead/search", params: {query: string}, options?: TOptions): Promise<SearchResultItem[]>
  call(path: "/api/v5/Typeahead/suggest", params: {query: string}, options?: TOptions): Promise<SearchResultItem[]>
  call(path: "/api/v5/UserFeed/", params: {
  username: string;
}, options?: TOptions): Promise<{
  user: UserDto,
  entries: {
    id: string,
    title: string,
    statusType: StatusType,
    status: string,
    comment: string,
    updatedAt: number, // TODO: Date
  }[]
}>
}