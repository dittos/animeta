import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TwitterSetting } from "src/entities/twitter_setting.entity";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";
import { TwitterAuthService } from "./twitter_auth.service";

export type OAuthRequestToken = {
  token: string;
  tokenSecret: string;
  authorizationUrl: string;
}

@Injectable()
export class TwitterService {
  constructor(
    private twitterAuthService: TwitterAuthService,
    @InjectRepository(TwitterSetting) private twitterSettingRepository: Repository<TwitterSetting>,
  ) {
  }

  async getOAuthRequestToken(): Promise<OAuthRequestToken> {
    return this.twitterAuthService.getOAuthRequestToken()
  }

  async finishOAuthAuthorization(user: User, token: string, tokenSecret: string, oauthVerifier: string): Promise<void> {
    const accessToken = await this.twitterAuthService.getOAuthAccessToken(token, tokenSecret, oauthVerifier)
    await this.twitterSettingRepository.save({
      user,
      key: accessToken.token,
      secret: accessToken.tokenSecret,
    })
  }
}
