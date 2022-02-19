import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { TwitterSetting } from "src/entities/twitter_setting.entity";
import { User } from "src/entities/user.entity";
import { Repository } from "typeorm";
import { TwitterApiService } from "./twitter_api.service";

export type OAuthRequestToken = {
  token: string;
  tokenSecret: string;
  authorizationUrl: string;
}

@Injectable()
export class TwitterService {
  constructor(
    private twitterApiService: TwitterApiService,
    @InjectRepository(TwitterSetting) private twitterSettingRepository: Repository<TwitterSetting>,
  ) {
  }

  async getOAuthRequestToken(): Promise<OAuthRequestToken> {
    return this.twitterApiService.getOAuthRequestToken()
  }

  async finishOAuthAuthorization(user: User, token: string, tokenSecret: string, oauthVerifier: string): Promise<void> {
    const accessToken = await this.twitterApiService.getOAuthAccessToken(token, tokenSecret, oauthVerifier)
    await this.twitterSettingRepository.save({
      user,
      key: accessToken.token,
      secret: accessToken.tokenSecret,
    })
  }

  async updateStatus(user: User, body: string): Promise<boolean> {
    const setting = await this.twitterSettingRepository.findOne({ where: {user} })
    if (!setting) return false
    try {
      await this.twitterApiService.updateStatus({
        token: setting.key,
        tokenSecret: setting.secret,
      }, body)
      return true
    } catch (e) {
      console.error(e)
      return false
    }
  }
}
