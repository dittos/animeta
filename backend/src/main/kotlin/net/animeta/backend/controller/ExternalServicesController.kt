package net.animeta.backend.controller

import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.TwitterSetting
import net.animeta.backend.model.User
import net.animeta.backend.repository.TwitterSettingRepository
import net.animeta.backend.security.CurrentUser
import org.slf4j.LoggerFactory
import org.springframework.social.oauth1.AuthorizedRequestToken
import org.springframework.social.oauth1.OAuth1Parameters
import org.springframework.social.oauth1.OAuthToken
import org.springframework.social.twitter.connect.TwitterServiceProvider
import org.springframework.util.LinkedMultiValueMap
import org.springframework.web.bind.annotation.*
import javax.servlet.http.Cookie
import javax.servlet.http.HttpServletResponse

private const val twitterTokenValueCookie = "twittertoken.value"
private const val twitterTokenSecretCookie = "twittertoken.secret"

@RestController
@RequestMapping("/v2/me/external-services")
class ExternalServicesController(private val twitterSettingRepository: TwitterSettingRepository,
                                 private val twitterServiceProvider: TwitterServiceProvider) {
    data class DeleteTwitterResponse(val ok: Boolean)

    private val logger = LoggerFactory.getLogger(this::class.java)

    @DeleteMapping("/twitter")
    fun deleteTwitter(@CurrentUser currentUser: User): DeleteTwitterResponse {
        val twitterSetting = currentUser.twitterSettings.firstOrNull() ?: throw ApiException.notFound()
        twitterSettingRepository.delete(twitterSetting)
        return DeleteTwitterResponse(ok = true)
    }

    @GetMapping("/twitter/connect", produces = arrayOf("text/html"))
    fun connectTwitter(@CookieValue(twitterTokenValueCookie, required = false) tokenValue: String?,
                       @CookieValue(twitterTokenSecretCookie, required = false) tokenSecret: String?,
                       @RequestParam("oauth_verifier", required = false) oauthVerifier: String?,
                       @CurrentUser(required = false) currentUser: User?,
                       response: HttpServletResponse): String {
        if (currentUser == null) {
            return jsCallbackResponse(false)
        }

        try {
            val oauth = twitterServiceProvider.oAuthOperations
            if (oauthVerifier == null || tokenValue == null || tokenSecret == null) {
                // TODO: callback url
                val requestToken = oauth.fetchRequestToken("https://animeta.net/newapi/v2/me/external-services/twitter/connect", LinkedMultiValueMap())
                val redirectUrl = oauth.buildAuthorizeUrl(requestToken.value, OAuth1Parameters.NONE)
                response.addCookie(Cookie(twitterTokenValueCookie, requestToken.value))
                response.addCookie(Cookie(twitterTokenSecretCookie, requestToken.secret))
                response.sendRedirect(redirectUrl)
                return "Redirecting..."
            } else {
                val authorizedRequestToken = AuthorizedRequestToken(OAuthToken(tokenValue, tokenSecret), oauthVerifier)
                val accessToken = oauth.exchangeForAccessToken(authorizedRequestToken, OAuth1Parameters.NONE)
                val setting = currentUser.twitterSettings.firstOrNull() ?:
                        TwitterSetting(user = currentUser, key = "", secret = "")
                setting.key = accessToken.value
                setting.secret = accessToken.secret
                twitterSettingRepository.save(setting)
                // Remove cookies
                response.addCookie(Cookie(twitterTokenValueCookie, ""))
                response.addCookie(Cookie(twitterTokenSecretCookie, ""))
                return jsCallbackResponse(true)
            }
        } catch (e: Exception) {
            logger.error(e.message, e)
            return jsCallbackResponse(false)
        }
    }

    private fun jsCallbackResponse(ok: Boolean): String {
        return """
            <script>
                opener.onTwitterConnect(${if (ok) "true" else "false"});
                window.close()
            </script>
        """
    }
}