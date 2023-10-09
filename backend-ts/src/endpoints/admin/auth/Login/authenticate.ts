import { ApiException } from "src/exceptions";
import { authenticate, createSession } from "src/services/auth";

export default async function (params: {
  username: string;
  password: string;
}): Promise<{
  sessionKey: string;
  expiryMs: number | null;
}> {
  const user = await authenticate(params.username, params.password)
  if (!user || !user.is_active)
    throw new ApiException('없는 아이디거나 암호가 틀렸습니다.', 401)
  const session = createSession(user, false)
  return {
    sessionKey: session.sessionKey,
    expiryMs: session.expiry?.total({unit: 'millisecond'}) ?? null,
  }
}
