package net.animeta.backend.controller.v2

import net.animeta.backend.model.User
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.service.TwitterService
import org.slf4j.LoggerFactory
import org.springframework.web.bind.annotation.CookieValue
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import javax.servlet.http.Cookie
import javax.servlet.http.HttpServletResponse

private const val twitterTokenValueCookie = "twittertoken.value"
private const val twitterTokenSecretCookie = "twittertoken.secret"

@RestController
@RequestMapping("/v2/me/external-services")
class ExternalServicesController(
    private val twitterService: TwitterService
) {
    private val logger = LoggerFactory.getLogger(this::class.java)

    @GetMapping("/twitter/connect", produces = ["text/html"])
    fun connectTwitter(@CookieValue(twitterTokenValueCookie, required = false) tokenValue: String?,
                       @CookieValue(twitterTokenSecretCookie, required = false) tokenSecret: String?,
                       @RequestParam("oauth_verifier", required = false) oauthVerifier: String?,
                       @CurrentUser(required = false) currentUser: User?,
                       response: HttpServletResponse): String {
        if (currentUser == null) {
            return jsCallbackResponse(false)
        }

        try {
            if (oauthVerifier == null || tokenValue == null || tokenSecret == null) {
                // TODO: callback url
                val requestToken = twitterService.getOAuthRequestToken("https://animeta.net/api/v2/me/external-services/twitter/connect")
                val redirectUrl = requestToken.authorizationUrl
                response.addCookie(Cookie(twitterTokenValueCookie, requestToken.token))
                response.addCookie(Cookie(twitterTokenSecretCookie, requestToken.tokenSecret))
                response.sendRedirect(redirectUrl)
                return "Redirecting..."
            } else {
                twitterService.finishOAuthAuthorization(currentUser, tokenValue, tokenSecret, oauthVerifier)
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
