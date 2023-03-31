import { GraphQLResolveInfo } from "graphql"
import mercurius, { MercuriusContext } from "mercurius"
import { User } from "src/entities/user.entity"

export function isIdOnly(info: GraphQLResolveInfo): boolean {
  for (const fieldNode of info.fieldNodes) {
    if (!fieldNode.selectionSet) continue
    for (const selection of fieldNode.selectionSet.selections) {
      // stop early if fragment exists
      if (selection.kind !== 'Field') return false

      const fieldName = selection.name.value
      if (fieldName !== 'id' && fieldName[0] !== '_') return false
    }
  }
  return true
}

export function requireUser(ctx: MercuriusContext): User {
  if (!ctx.currentUser) {
    throw new mercurius.ErrorWithProps('Login required.')
  }
  return ctx.currentUser
}
