package net.animeta.backend.controller

import django.Signing
import net.animeta.backend.model.User
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.security.DjangoAuthSession
import net.animeta.backend.service.AuthService
import org.springframework.beans.factory.annotation.Value
import org.springframework.web.bind.annotation.*
import java.time.Duration
import javax.servlet.http.Cookie
import javax.servlet.http.HttpServletResponse

@RestController
@RequestMapping("/v2/auth")
class AuthController(private val authService: AuthService,
                     @Value("\${animeta.security.secret-key}") val secretKey: String) {
    data class AuthResult(val ok: Boolean, val session_key: String? = null)

    @GetMapping
    fun get(@CurrentUser(required = false) currentUser: User?): AuthResult {
        return AuthResult(currentUser != null)
    }

    @PostMapping
    fun login(@RequestParam username: String, @RequestParam password: CharArray,
              @RequestParam(defaultValue = "true") transient: Boolean,
              servletResponse: HttpServletResponse): AuthResult {
        val user = authService.authenticate(username, password)
        if (user == null || !user.active) {
            return AuthResult(false)
        }
        val session = DjangoAuthSession(userId = user.id.toString())
        // TODO: set _session_expiry
        // TODO: set _auth_user_hash
        val sessionKey = Signing.toString(session, secretKey, "django.contrib.sessions.backends.signed_cookies", DjangoAuthSession, true)
        val cookie = Cookie("sessionid", sessionKey)
        // TODO: configurable domain
        cookie.path = "/"
        if (transient) {
            // A negative value means that the cookie is not stored persistently and will be deleted when the Web browser exits.
            cookie.maxAge = -1
        } else {
            cookie.maxAge = Duration.ofDays(14).seconds.toInt()
        }
        cookie.isHttpOnly = true
        servletResponse.addCookie(cookie)
        return AuthResult(ok = true, session_key = sessionKey)
    }

    @DeleteMapping
    fun logout(servletResponse: HttpServletResponse): AuthResult {
        val cookie = Cookie("sessionid", "")
        // TODO: configurable domain
        cookie.path = "/"
        cookie.maxAge = 0 // delete
        cookie.isHttpOnly = true
        servletResponse.addCookie(cookie)
        return AuthResult(true)
    }
}