import { Injectable } from "@nestjs/common";
import { OAuth } from 'oauth';
import { ConfigService } from "@nestjs/config";

export type OAuthRequestToken = {
  token: string;
  tokenSecret: string;
  authorizationUrl: string;
}

export type OAuthAccessToken = {
  token: string;
  tokenSecret: string;
}

@Injectable()
export class TwitterApiService {
  private oauth: OAuth;

  constructor(
    private configService: ConfigService,
  ) {
    const appId = this.configService.get('TWITTER_APP_ID')
    const appSecret = this.configService.get('TWITTER_APP_SECRET')
    if (!appId) throw new Error('TWITTER_APP_ID is not set')
    if (!appSecret) throw new Error('TWITTER_APP_SECRET is not set')
    this.oauth = new OAuth(
      'https://api.twitter.com/oauth/request_token',
      'https://api.twitter.com/oauth/access_token',
      appId,
      appSecret,
      '1.0A',
      // TODO: callback url
      'https://animeta.net/api/v4/me/external-services/twitter/connect',
      // 'http://localhost:3000/api/v4/me/external-services/twitter/connect',
      'HMAC-SHA1'
    )
  }

  async getOAuthRequestToken(): Promise<OAuthRequestToken> {
    return new Promise((resolve, reject) => {
      this.oauth.getOAuthRequestToken((err, token, tokenSecret, ) => {
        if (err) return reject(err)
        resolve({
          token,
          tokenSecret,
          authorizationUrl: `https://api.twitter.com/oauth/authorize?oauth_token=${encodeURIComponent(token)}`,
        })
      })
    })
  }

  async getOAuthAccessToken(token: string, tokenSecret: string, oauthVerifier: string): Promise<OAuthAccessToken> {
    return new Promise((resolve, reject) => {
      this.oauth.getOAuthAccessToken(token, tokenSecret, oauthVerifier, (err, token, tokenSecret, ) => {
        if (err) return reject(err)
        resolve({
          token,
          tokenSecret,
        })
      })
    })
  }

  async updateStatus(accessToken: OAuthAccessToken, body: string) {
    await new Promise((resolve, reject) => {
      this.oauth.post(
        'https://api.twitter.com/1.1/statuses/update.json',
        accessToken.token,
        accessToken.tokenSecret,
        { status: body },
        undefined,
        (err, result) => {
          if (err) return reject(err)
          resolve(result)
        }
      )
    })
  }
}
