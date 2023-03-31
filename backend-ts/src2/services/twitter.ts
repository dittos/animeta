import { TwitterSetting } from "src/entities/twitter_setting.entity";
import { User } from "src/entities/user.entity";
import { db } from "src2/database";
import * as api from "./twitterApi";

export type OAuthRequestToken = {
  token: string;
  tokenSecret: string;
  authorizationUrl: string;
}

export async function getOAuthRequestToken(): Promise<OAuthRequestToken> {
  return api.getOAuthRequestToken()
}

export async function finishOAuthAuthorization(user: User, token: string, tokenSecret: string, oauthVerifier: string): Promise<void> {
  const accessToken = await api.getOAuthAccessToken(token, tokenSecret, oauthVerifier)
  await db.save(TwitterSetting, {
    user,
    key: accessToken.token,
    secret: accessToken.tokenSecret,
  })
}

export async function removeOAuthAuthorization(user: User) {
  const setting = await db.findOne(TwitterSetting, { where: {user} })
  if (setting) await db.remove(setting)
}

export async function updateStatus(user: User, body: string): Promise<boolean> {
  const setting = await db.findOne(TwitterSetting, { where: {user} })
  if (!setting) return false
  try {
    await api.updateStatus({
      token: setting.key,
      tokenSecret: setting.secret,
    }, body)
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}
