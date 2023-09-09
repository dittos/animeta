import { ApiException } from "src2/exceptions";
import { Person } from "src/entities/person.entity";
import { db } from "src2/database";
import { PersonDto } from "src2/schemas/admin";
import { serializePerson } from "src2/serializers/person";

export default async function(params: {id: string}): Promise<PersonDto> {
  const person = await db.findOne(Person, params.id)
  if (!person) throw ApiException.notFound()
  return serializePerson(person)
}
