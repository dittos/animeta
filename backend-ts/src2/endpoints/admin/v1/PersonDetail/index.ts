import { Type } from "@sinclair/typebox";
import { ApiException } from "src/controllers/exceptions";
import { Person } from "src/entities/person.entity";
import { db } from "src2/database";
import { createEndpoint } from "src2/schema";
import { PersonDto } from "src2/schemas/admin";
import { serializePerson } from "src2/serializers/person";

const Params = Type.Object({
  id: Type.String(),
})

const Result = PersonDto

export default createEndpoint(Params, Result, async (params) => {
  const person = await db.findOne(Person, params.id)
  if (!person) throw ApiException.notFound()
  return serializePerson(person)
})
