import { Static, Type } from "@sinclair/typebox";

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
