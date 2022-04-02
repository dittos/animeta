import { Person } from "src/entities/person.entity";
import { db } from "src2/database";

export default async function(params: {
  id: string;
  name: string;
}[]): Promise<boolean> {
  return db.transaction(async () => {
    const personMap = new Map((await db.findByIds(Person, params.map(it => it.id))).map(it => [it.id.toString(), it]))
    for (const p of params) {
      const person = personMap.get(p.id)
      if (!person) continue
      if (p.name) {
        person.name = p.name
      }
    }
    await db.save(Array.from(personMap.values()))
    return true
  })
}
