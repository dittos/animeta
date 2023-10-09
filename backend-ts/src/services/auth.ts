import { Temporal } from "@js-temporal/polyfill";
import { checkPassword as _checkPassword, CheckPasswordResult, makePassword } from "src/auth/django/hashers";
import { Signing } from "src/auth/django/signing";
import { jsonSerializer } from "src/auth/serializer";
import { User } from "src/entities/user.entity";
import { db } from "src/database";

const PERSISTENT_SESSION_EXPIRY = Temporal.Duration.from({ days: 30 })

const secretKey = process.env.ANIMETA_SECURITY_SECRET_KEY ?? ''
if (!secretKey) throw new Error('ANIMETA_SECURITY_SECRET_KEY is not set')

export async function checkPassword(user: User, password: string): Promise<boolean> {
  switch (await _checkPassword(password, user.password)) {
    case CheckPasswordResult.INCORRECT:
      return false
    case CheckPasswordResult.CORRECT:
      return true
    case CheckPasswordResult.CORRECT_BUT_MUST_UPDATE:
      await changePassword(user, password)
      return true
  }
}

export async function setPassword(user: User, newPassword: string) {
  user.password = await makePassword(newPassword, null)
}

export async function changePassword(user: User, newPassword: string) {
  await setPassword(user, newPassword)
  await db.save(user)
}

export async function authenticate(username: string, password: string): Promise<User | null> {
  const user = await db.findOne(User, { username })
  if (user && await checkPassword(user, password)) {
    return user
  }
  return null
}

export function createSession(user: User, persistent: boolean): {
  sessionKey: string;
  expiry: Temporal.Duration | null;
} {
  const session = {_auth_user_id: user.id.toString()}
  // TODO: set _session_expiry
  // TODO: set _auth_user_hash
  const sessionKey = Signing.toString(session, secretKey, "django.contrib.sessions.backends.signed_cookies", jsonSerializer, true)
  return {
    sessionKey,
    expiry: persistent ? PERSISTENT_SESSION_EXPIRY : null,
  }
}
