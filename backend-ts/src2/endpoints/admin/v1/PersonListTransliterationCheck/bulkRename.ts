import { Type } from "@sinclair/typebox";
import { Person } from "src/entities/person.entity";
import { db } from "src2/database";
import { createEndpoint } from "src2/schema";

const Params = Type.Array(Type.Object({
  id: Type.String(),
  name: Type.String(),
}))

const Result = Type.Boolean()

export default createEndpoint(Params, Result, async (params) => db.transaction(async () => {
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
}))
