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

describe('ExternalServicesController', () => {
  let utils: TestUtils;
  beforeAll(async () => utils = await getTestUtils(tmb => tmb.overrideProvider(TwitterApiService).useClass(TwitterApiServiceMock)));
  afterAll(() => utils.close());

  it(`get without session`, async () => {
    const res = await utils.getHttpClient().get('/api/v4/me/external-services/twitter/connect')
    expect(res.status).toBe(200)
    expect(res.text).toContain('false')
  });

  it(`get`, async () => {
    const user = await utils.factory.newUser();
    const client = utils.getHttpClientForUser(user);

    {
      const res = await client.get('/api/v4/me/external-services/twitter/connect')
      expect(res.status).toBe(302)
      expect(res.headers['location']).toBe('authorizationurl')
    }
    {
      const res = await client.get('/api/v4/me/external-services/twitter/connect?oauth_verifier=oauthVerifier')
      expect(res.status).toBe(200)
      expect(res.text).toContain('true')
    }

    const twitterSettingRepository = utils.app.get<Repository<TwitterSetting>>(getRepositoryToken(TwitterSetting))
    const twitterSetting = await twitterSettingRepository.findOneOrFail({ where: {user} })
    expect(twitterSetting.key).toBe('accessToken')
    expect(twitterSetting.secret).toBe('accessTokenSecret')
  });
});
