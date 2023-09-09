import { ApiException } from "src2/exceptions";
import { authenticate, createSession } from "src2/services/auth";

export type AuthResult = {
  sessionKey: string;
  expiryMs: number | null;
};

export default async function (params: {
  username: string;
  password: string;
  persistent: boolean;
}): Promise<AuthResult> {
  const user = await authenticate(params.username, params.password)
  if (!user || !user.is_active)
    throw new ApiException('없는 아이디거나 암호가 틀렸습니다.', 401)
  const session = createSession(user, params.persistent)
  return {
    sessionKey: session.sessionKey,
    expiryMs: session.expiry?.total({unit: 'millisecond'}) ?? null,
  }
}
