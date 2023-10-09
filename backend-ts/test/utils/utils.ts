import { FastifyInstance } from "fastify";
import { Signing } from "src/auth/django/signing";
import { jsonSerializer } from "src/auth/serializer";
import { User } from "src/entities/user.entity";
import { TestFactoryUtils } from "./factory";
import { TestClient } from "./testClient";

export class TestUtils {
  public readonly factory = new TestFactoryUtils()

  constructor(
    public app: FastifyInstance,
    // public factory: TestFactoryUtils,
  ) {}

  generateAccessToken(user: User) {
    const secretKey = process.env.ANIMETA_SECURITY_SECRET_KEY as string
    return Signing.toString({ _auth_user_id: user.id }, secretKey, "django.contrib.sessions.backends.signed_cookies", jsonSerializer, true)
  }

  getHttpClient() {
    return new TestClient(this.app)
  }

  getHttpClientWithSessionKey(sessionKey: string) {
    return new TestClient(this.app, {
      headers: {
        'x-animeta-session-key': sessionKey,
      }
    })
  }

  getHttpClientForUser(user: User) {
    return this.getHttpClientWithSessionKey(this.generateAccessToken(user))
  }

  async close(): Promise<void> {
    if (this.app) {
      await this.app.close()
    }
  }
}