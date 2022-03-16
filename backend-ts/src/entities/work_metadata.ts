import { Static, TSchema, Type } from "@sinclair/typebox"

const Nullable = <T extends TSchema>(T: T) => Type.Union([Type.Null(), T])

export const SourceType = Type.Union([
  Type.Literal('MANGA'),
  Type.Literal('ORIGINAL'),
  Type.Literal('LIGHT_NOVEL'),
  Type.Literal('GAME'),
  Type.Literal('FOUR_KOMA'),
  Type.Literal('VISUAL_NOVEL'),
  Type.Literal('NOVEL'),
])
export type SourceType = Static<typeof SourceType>

export const DatePrecision = Type.Union([
  Type.Literal('YEAR_MONTH'), Type.Literal('DATE'), Type.Literal('DATE_TIME')
])
export type DatePrecision = Static<typeof DatePrecision>

export const Schedule = Type.Object({
  date: Type.Optional(Nullable(Type.String())),
  datePrecision: Type.Optional(Nullable(DatePrecision)),
  broadcasts: Type.Optional(Nullable(Type.Array(Type.String()))),
})
export type Schedule = Static<typeof Schedule>

export const LATEST_WORK_METADATA_VERSION = 2

export const WorkMetadata = Type.Object({
  version: Type.Number(),
  title: Type.Optional(Nullable(Type.String())),
  periods: Type.Optional(Nullable(Type.Array(Type.String()))),
  studios: Type.Optional(Nullable(Type.Array(Type.String()))),
  source: Type.Optional(Nullable(SourceType)),
  website: Type.Optional(Nullable(Type.String())),
  namuRef: Type.Optional(Nullable(Type.String())),
  annId: Type.Optional(Nullable(Type.String())),
  durationMinutes: Type.Optional(Nullable(Type.Number())),
  schedules: Type.Optional(Nullable(Type.Record(Type.String(), Schedule))),
})
export type WorkMetadata = Static<typeof WorkMetadata>
