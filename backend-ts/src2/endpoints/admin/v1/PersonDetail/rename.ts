import { ApiException } from "src/controllers/exceptions";
import { Person } from "src/entities/person.entity";
import { db } from "src2/database";
import { PersonDto } from "src2/schemas/admin";
import { serializePerson } from "src2/serializers/person";

export default async function(params: {
  id: string;
  name: string;
}): Promise<PersonDto> {
  return db.transaction(async () => {
    const person = await db.findOne(Person, params.id)
    if (!person) throw ApiException.notFound()
    if (params.name) {
      person.name = params.name
    }
    await db.save(person)
    return serializePerson(person)
  })
}
