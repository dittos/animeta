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


export interface Client {
  call(path: "/api/admin/v1/createWork", params: {title: string}): Promise<AdminWorkDto>
  call(path: "/api/admin/v1/getCompanies", params: {}): Promise<CompanyDto[]>
  call(path: "/api/admin/v1/CompanyDetail/", params: {id: string}): Promise<CompanyDto>
  call(path: "/api/admin/v1/CompanyDetail/rename", params: {
  id: string;
  name: string;
}): Promise<CompanyDto>
  call(path: "/api/admin/v1/CompanyList/", params: {}): Promise<CompanyDto[]>
  call(path: "/api/admin/v1/CompanyMergeForm/merge", params: {
  id: string;
  otherCompanyId: string;
}): Promise<CompanyDto>
  call(path: "/api/admin/v1/PersonDetail/", params: {id: string}): Promise<PersonDto>
  call(path: "/api/admin/v1/PersonDetail/rename", params: {
  id: string;
  name: string;
}): Promise<PersonDto>
  call(path: "/api/admin/v1/PersonList/", params: {
  page?: number;
}): Promise<PersonDto[]>
  call(path: "/api/admin/v1/PersonListTransliterationCheck/bulkRename", params: {
  id: string;
  name: string;
}[]): Promise<boolean>
  call(path: "/api/admin/v1/PersonListTransliterationCheck/", params: {period: string}): Promise<{
  personId: string;
  name: string;
  count: number;
}[]>
  call(path: "/api/admin/v1/WorkDetail/addTitleMapping", params: {
  workId: string;
  title: string;
}): Promise<AdminWorkDto>
  call(path: "/api/admin/v1/WorkDetail/crawlImage", params: {
  workId: string;
  options: {
    source: 'ann';
    annId: string;
  } | {
    source: 'url';
    url: string;
  };
}): Promise<AdminWorkDto>
  call(path: "/api/admin/v1/WorkDetail/deleteTitleMapping", params: {titleMappingId: string}): Promise<boolean>
  call(path: "/api/admin/v1/WorkDetail/editMetadata", params: {
  workId: string;
  rawMetadata: string;
}): Promise<AdminWorkDto>
  call(path: "/api/admin/v1/WorkDetail/importAnnMetadata", params: {
  workId: string;
  annId: string;
}): Promise<AdminWorkDto>
  call(path: "/api/admin/v1/WorkDetail/", params: {
  id: string;
}): Promise<AdminWorkDto>
  call(path: "/api/admin/v1/WorkDetail/setPrimaryTitle", params: {
  workId: string;
  primaryTitleMappingId: string;
}): Promise<AdminWorkDto>
  call(path: "/api/admin/v1/WorkDetail/update", params: {
  workId: string;
  blacklisted?: boolean;
  imageCenterY?: number;
}): Promise<AdminWorkDto>
  call(path: "/api/admin/v1/WorkList/delete", params: {workId: string}): Promise<boolean>
  call(path: "/api/admin/v1/WorkList/", params: {
  orphans?: boolean;
  offset?: number;
}): Promise<{
  id: string;
  title: string;
  record_count: number;
}[]>
  call(path: "/api/admin/v1/WorkMergeForm/merge", params: {
  workId: string;
  otherWorkId: string;
  forceMerge: boolean;
}): Promise<AdminWorkDto>
}