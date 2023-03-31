import { OAuth } from 'oauth';

export type OAuthRequestToken = {
  token: string;
  tokenSecret: string;
  authorizationUrl: string;
}

export type OAuthAccessToken = {
  token: string;
  tokenSecret: string;
}

const appId = process.env.TWITTER_APP_ID
const appSecret = process.env.TWITTER_APP_SECRET
if (!appId) throw new Error('TWITTER_APP_ID is not set')
if (!appSecret) throw new Error('TWITTER_APP_SECRET is not set')
const oauth = new OAuth(
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

export async function getOAuthRequestToken(): Promise<OAuthRequestToken> {
  return new Promise((resolve, reject) => {
    oauth.getOAuthRequestToken((err, token, tokenSecret, ) => {
      if (err) return reject(err)
      resolve({
        token,
        tokenSecret,
        authorizationUrl: `https://api.twitter.com/oauth/authorize?oauth_token=${encodeURIComponent(token)}`,
      })
    })
  })
}

export async function getOAuthAccessToken(token: string, tokenSecret: string, oauthVerifier: string): Promise<OAuthAccessToken> {
  return new Promise((resolve, reject) => {
    oauth.getOAuthAccessToken(token, tokenSecret, oauthVerifier, (err, token, tokenSecret, ) => {
      if (err) return reject(err)
      resolve({
        token,
        tokenSecret,
      })
    })
  })
}

export async function updateStatus(accessToken: OAuthAccessToken, body: string) {
  await new Promise((resolve, reject) => {
    oauth.post(
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
