import { Static, TSchema, Type } from "@sinclair/typebox";
import { WorkMetadata } from "src/entities/work_metadata";

const Nullable = <T extends TSchema>(T: T) => Type.Union([Type.Null(), T])

export const CompanyDto = Type.Object({
  id: Type.String(),
  name: Type.String(),
  works: Type.Optional(Type.Array(Type.Object({
    id: Type.String(),
    title: Type.String(),
  })))
})
export type CompanyDto = Static<typeof CompanyDto>

const PersonWorkDto = Type.Object({
  workId: Type.String(),
  workTitle: Type.String(),
  roleOrTask: Type.String(),
})

export const PersonDto = Type.Object({
  id: Type.String(),
  name: Type.String(),
  metadata: Type.Any(),
  staffs: Type.Optional(Type.Array(PersonWorkDto)),
  casts: Type.Optional(Type.Array(PersonWorkDto)),
})
export type PersonDto = Static<typeof PersonDto>

export const TitleMappingDto = Type.Object({
  id: Type.String(),
  title: Type.String(),
  record_count: Type.Number(),
})
export type TitleMappingDto = Static<typeof TitleMappingDto>

export const AdminWorkDto = Type.Object({
  id: Type.String(),
  title: Type.String(),
  image_filename: Nullable(Type.String()),
  image_path: Nullable(Type.String()),
  image_center_y: Type.Number(),
  raw_metadata: Type.String(),
  metadata: Nullable(WorkMetadata),
  title_mappings: Type.Array(TitleMappingDto),
  index: Nullable(Type.Object({
    record_count: Type.Number(),
  })),
  staffs: Type.Array(Type.Object({
    task: Type.String(),
    name: Type.String(),
    personId: Type.String(),
    metadata: Nullable(Type.Any()),
  })),
  casts: Type.Array(Type.Object({
    role: Type.String(),
    name: Type.String(),
    personId: Type.String(),
    metadata: Nullable(Type.Any()),
  })),
})
export type AdminWorkDto = Static<typeof AdminWorkDto>
