import { Person } from "src/entities/person.entity"
import { ValidationError } from "src/services/exceptions"
import { db } from "src/database"

export async function getOrCreatePerson(name: string, name_en?: string, annId?: number): Promise<Person> {
  if (annId) {
    const existingByAnnId = await db.findOne(Person, {where: {ann_id: annId}})
    if (existingByAnnId) return existingByAnnId
  }
  const person = new Person()
  person.name = name
  person.metadata = {name_en}
  person.ann_id = annId ?? null
  return await db.save(person)
}

export async function renamePerson(person: Person, name: string) {
  name = name.trim()
  if (name === '')
    throw new ValidationError('Empty name is not allowed')

  if (person.name === name)
    return;

  if (await db.findOne(Person, {where: {name}}))
    throw new ValidationError('Name collsion')

  person.name = name
  await db.save(person)
}
