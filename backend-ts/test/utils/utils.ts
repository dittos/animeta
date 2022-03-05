import { INestApplication, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Signing } from "src/auth/django/signing";
import { jsonSerializer } from "src/auth/serializer";
import { User } from "src/entities/user.entity";
import { AuthService } from "src/services/auth.service";
import * as request from 'supertest';
import { TestFactoryUtils } from "./factory";

@Injectable()
export class TestUtils {
  public app!: INestApplication;

  constructor(
    private configService: ConfigService,
    public factory: TestFactoryUtils,
    private authService: AuthService,
  ) {}

  generateAccessToken(user: User) {
    const secretKey = this.configService.get('ANIMETA_SECURITY_SECRET_KEY')
    return Signing.toString({ _auth_user_id: user.id }, secretKey, "django.contrib.sessions.backends.signed_cookies", jsonSerializer, true)
  }

  async changePassword(user: User, password: string) {
    await this.authService.changePassword(user, password)
  }

  getHttpClient() {
    return request(this.app.getHttpServer())
  }

  getHttpClientWithSessionKey(sessionKey: string) {
    const agent = request.agent(this.app.getHttpServer())
    agent.set('x-animeta-session-key', sessionKey)
    return agent
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