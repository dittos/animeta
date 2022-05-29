import { FastifyRequest } from "fastify";
import { Signing } from "src/auth/django/signing";
import { jsonSerializer } from "src/auth/serializer";
import { User } from "src/entities/user.entity";
import { db } from "src2/database";

const sessionCookieAge = 1000 * 60 * 60 * 24 * 90

const secretKey = process.env.ANIMETA_SECURITY_SECRET_KEY ?? ''
if (!secretKey) throw new Error('ANIMETA_SECURITY_SECRET_KEY is not set')

export async function getCurrentUser(req: FastifyRequest): Promise<User | null> {
  let header = req.headers['x-animeta-session-key']
  if (!header) {
    return null
  }
  if (Array.isArray(header)) {
    header = header[0]
  }
  try {
    const session = Signing.loadString(header, secretKey, "django.contrib.sessions.backends.signed_cookies", jsonSerializer, sessionCookieAge)
    // TODO: handle _session_expiry
    // TODO: handle _auth_user_hash
    const userId: string | undefined | null = session?.['_auth_user_id']
    if (userId) {
      // TODO: do not always load user
      return await db.findOne(User, userId) ?? null
    }
    return null
  } catch (e) {
    return null
  }
}
