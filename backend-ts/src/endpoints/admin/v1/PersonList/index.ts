import { Person } from "src/entities/person.entity";
import { db } from "src/database";
import { PersonDto } from "src/schemas/admin";
import { serializePerson } from "src/serializers/person";

export default async function(params: {
  page?: number;
}): Promise<PersonDto[]> {
  const pageSize = 128
  const personArray = await db.find(Person, {
    order: {id: 'DESC'},
    skip: (params.page ?? 1 - 1) * pageSize,
    take: pageSize,
  })
  return Promise.all(personArray.map(it => serializePerson(it, true)))
}
