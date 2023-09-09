import { ApiException } from "src2/exceptions";
import { Person } from "src/entities/person.entity";
import { db } from "src2/database";
import { PersonDto } from "src2/schemas/admin";
import { serializePerson } from "src2/serializers/person";
import { renamePerson } from "src2/services/admin/person";

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
