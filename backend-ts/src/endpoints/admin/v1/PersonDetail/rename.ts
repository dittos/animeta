import { ApiException } from "src/exceptions";
import { Person } from "src/entities/person.entity";
import { db } from "src/database";
import { PersonDto } from "src/schemas/admin";
import { serializePerson } from "src/serializers/person";
import { renamePerson } from "src/services/admin/person";

export default async function(params: {
  id: string;
  name: string;
}): Promise<PersonDto> {
  return db.transaction(async () => {
    const person = await db.findOne(Person, params.id)
    if (!person) throw ApiException.notFound()
    await renamePerson(person, params.name)
    return serializePerson(person)
  })
}
