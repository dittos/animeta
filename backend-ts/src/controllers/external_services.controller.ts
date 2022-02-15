import { Controller, Get, Query, Req, Res } from "@nestjs/common";
import { Request, Response } from "express";
import { CurrentUser } from "src/auth/decorators";
import { User } from "src/entities/user.entity";
import { TwitterService } from "src/services/twitter.service";

const twitterTokenValueCookie = "twittertoken.value"
const twitterTokenSecretCookie = "twittertoken.secret"

@Controller('/api/v4/me/external-services')
export class ExternalServicesController {
  constructor(
    private twitterService: TwitterService,
  ) {}

  @Get('twitter/connect')
  async connectTwitter(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Query('oauth_verifier') oauthVerifier: string | null,
    @CurrentUser({ required: false }) currentUser: User | null,
  ): Promise<string> {
    if (!currentUser)
      return this.jsCallbackResponse(false)
    
    try {
      const tokenValue = request.cookies[twitterTokenValueCookie] ?? null
      const tokenSecret = request.cookies[twitterTokenSecretCookie] ?? null
      if (!oauthVerifier || !tokenValue || !tokenSecret) {
        const requestToken = await this.twitterService.getOAuthRequestToken()
        const redirectUrl = requestToken.authorizationUrl
        response.cookie(twitterTokenValueCookie, requestToken.token)
        response.cookie(twitterTokenSecretCookie, requestToken.tokenSecret)
        response.status(302).location(redirectUrl)
        return "Redirecting..."
      } else {
        await this.twitterService.finishOAuthAuthorization(currentUser, tokenValue, tokenSecret, oauthVerifier)
        // Remove cookies
        response.clearCookie(twitterTokenValueCookie)
        response.clearCookie(twitterTokenSecretCookie)
        return this.jsCallbackResponse(true)
      }
    } catch (e) {
      console.error(e)
      return this.jsCallbackResponse(false)
    }
  }

  private jsCallbackResponse(ok: boolean): string {
    return `
      <script>
          opener.onTwitterConnect(${ok ? "true" : "false"});
          window.close()
      </script>
    `
  }
}
