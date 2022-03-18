import { getTestUtils, TestUtils } from './utils';
import { OAuthAccessToken, OAuthRequestToken, TwitterApiService } from 'src/services/twitter_api.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { TwitterSetting } from 'src/entities/twitter_setting.entity';
import { Repository } from 'typeorm';

class TwitterApiServiceMock extends TwitterApiService {
  async getOAuthRequestToken(): Promise<OAuthRequestToken> {
    return {
      token: 'token',
      tokenSecret: 'tokenSecret',
      authorizationUrl: 'authorizationurl'
    }
  }

  async getOAuthAccessToken(token: string, tokenSecret: string, oauthVerifier: string): Promise<OAuthAccessToken> {
    expect(token).toBe('token')
    expect(tokenSecret).toBe('tokenSecret')
    expect(oauthVerifier).toBe('oauthVerifier')
    return {
      token: 'accessToken',
      tokenSecret: 'accessTokenSecret',
    }
  }
}

describe('DisconnectTwitterController', () => {
  let utils: TestUtils;
  beforeAll(async () => utils = await getTestUtils(tmb => tmb.overrideProvider(TwitterApiService).useClass(TwitterApiServiceMock)));
  afterAll(() => utils.close());

  it(`disconnect twitter`, async () => {
    const user = await utils.factory.newUser()
    const client = utils.getHttpClientForUser(user)
    await client.get('/api/v4/me/external-services/twitter/connect') // set cookie
    await client.get('/api/v4/me/external-services/twitter/connect?oauth_verifier=oauthVerifier')
    
    const res = await client.post('/api/v4/DisconnectTwitter')
    expect(res.status).toBe(200)
    expect(res.body).toEqual({ ok: true })
    
    const twitterSettingRepository = utils.app.get<Repository<TwitterSetting>>(getRepositoryToken(TwitterSetting))
    expect(await twitterSettingRepository.findOne({ where: {user} })).toBeFalsy()
  });
});
