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
