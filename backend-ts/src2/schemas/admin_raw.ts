import { WorkMetadata } from "src/entities/work_metadata_raw";

export type CompanyDto = {
  id: string,
  name: string,
  works?: {
    id: string,
    title: string,
  }[],
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
