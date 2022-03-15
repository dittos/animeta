import { Type } from "@sinclair/typebox";
import { Person } from "src/entities/person.entity";
import { db } from "src2/database";
import { createEndpoint } from "src2/schema";
import { PersonDto } from "src2/schemas/admin";
import { serializePerson } from "src2/serializers/person";

const Params = Type.Object({
  page: Type.Number({default: 1}),
})

const Result = Type.Array(PersonDto)

export default createEndpoint(Params, Result, async (params) => {
  const pageSize = 128
  const personArray = await db.find(Person, {
    order: {id: 'DESC'},
    skip: (params.page - 1) * pageSize,
    take: pageSize,
  })
  return Promise.all(personArray.map(it => serializePerson(it, true)))
})
