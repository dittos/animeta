import { getUserByName } from "src/services/user";

export default async function (params: {slug: string}): Promise<{type: 'USER' | null}> {
  const user = await getUserByName(params.slug)
  if (user) {
    return {type: 'USER'}
  }
  return {type: null}
}
