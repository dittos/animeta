import { Injectable, NestMiddleware } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Request, Response, NextFunction } from 'express';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { Signing } from './django/signing';

const jsonSerializer = {
  serialize(data: any): Buffer {
    return Buffer.from(JSON.stringify(data))
  },
  deserialize(data: Buffer): any {
    return JSON.parse(data.toString())
  },
}

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private sessionCookieAge = 1000 * 60 * 60 * 24 * 90
  private secretKey: string

  constructor(
    private configService: ConfigService,
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {
    this.secretKey = configService.get('ANIMETA_SECURITY_SECRET_KEY')
  }

  async use(req: Request, res: Response, next: NextFunction) {
    const user = await this.extractUser(req)
    if (user) {
      (req as any).user = user
    }
    next()
  }

  private async extractUser(req: Request): Promise<User | null> {
    const header = req.header('x-animeta-session-key')
    if (!header) {
      return null
    }
    try {
      const session = Signing.loadString(header, this.secretKey, "django.contrib.sessions.backends.signed_cookies", jsonSerializer, this.sessionCookieAge)
      // TODO: handle _session_expiry
      // TODO: handle _auth_user_hash
      const userId: string | undefined | null = session?.['_auth_user_id']
      if (userId) {
        // TODO: do not always load user
        return this.userRepository.findOne(userId)
      }
      return null
    } catch (e) {
      return null
    }
  }
}
