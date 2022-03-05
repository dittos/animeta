import { Temporal } from "@js-temporal/polyfill";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { checkPassword, CheckPasswordResult, makePassword } from "src/auth/django/hashers";
import { Signing } from "src/auth/django/signing";
import { jsonSerializer } from "src/auth/serializer";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class AuthService {
  static PERSISTENT_SESSION_EXPIRY = Temporal.Duration.from({ days: 30 })
  private secretKey: string

  constructor(
    private configService: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    const secretKey = configService.get('ANIMETA_SECURITY_SECRET_KEY')
    if (!secretKey) throw new Error('ANIMETA_SECURITY_SECRET_KEY is not set')
    this.secretKey = secretKey
  }

  async checkPassword(user: User, password: string): Promise<boolean> {
    switch (await checkPassword(password, user.password)) {
      case CheckPasswordResult.INCORRECT:
        return false
      case CheckPasswordResult.CORRECT:
        return true
      case CheckPasswordResult.CORRECT_BUT_MUST_UPDATE:
        await this.changePassword(user, password)
        return true
    }
  }

  async changePassword(user: User, newPassword: string) {
    user.password = await makePassword(newPassword, null)
    await this.userRepository.save(user)
  }

  async authenticate(username: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({ username })
    if (user && await this.checkPassword(user, password)) {
      return user
    }
    return null
  }

  createSession(user: User, persistent: boolean): {
    sessionKey: string;
    expiry: Temporal.Duration | null;
  } {
    const session = {_auth_user_id: user.id.toString()}
    // TODO: set _session_expiry
    // TODO: set _auth_user_hash
    const sessionKey = Signing.toString(session, this.secretKey, "django.contrib.sessions.backends.signed_cookies", jsonSerializer, true)
    return {
      sessionKey,
      expiry: persistent ? AuthService.PERSISTENT_SESSION_EXPIRY : null,
    }
  }
}
