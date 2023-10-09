import { ApiException } from "src/exceptions";
import { Person } from "src/entities/person.entity";
import { db } from "src/database";
import { PersonDto } from "src/schemas/admin";
import { serializePerson } from "src/serializers/person";

export default async function(params: {id: string}): Promise<PersonDto> {
  const person = await db.findOne(Person, params.id)
  if (!person) throw ApiException.notFound()
  return serializePerson(person)
}
