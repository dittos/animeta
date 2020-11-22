package net.animeta.backend.service

import django.Hashers
import django.Signing
import net.animeta.backend.model.User
import net.animeta.backend.repository.UserRepository
import net.animeta.backend.security.DjangoAuthSession
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.time.Duration
import javax.servlet.http.Cookie
import javax.servlet.http.HttpServletResponse

@Service
class AuthService(private val userRepository: UserRepository,
                  @Value("\${animeta.security.secret-key}") private val secretKey: String,
                  @Value("\${animeta.security.session-cookie-domain:#{null}}") private val sessionCookieDomain: String?) {
    companion object {
        val PERSISTENT_SESSION_EXPIRY = Duration.ofDays(90)!!
    }

    data class Session(
        val sessionKey: String,
        val expiry: Duration?
    )

    fun checkPassword(user: User, password: CharArray): Boolean {
        when (Hashers.checkPassword(password, user.password)!!) {
            Hashers.CheckPasswordResult.INCORRECT -> return false
            Hashers.CheckPasswordResult.CORRECT -> return true
            Hashers.CheckPasswordResult.CORRECT_BUT_MUST_UPDATE -> {
                changePassword(user, password)
                return true
            }
        }
    }

    fun setPassword(user: User, newPassword: CharArray) {
        user.password = Hashers.makePassword(newPassword, null)
    }

    fun changePassword(user: User, newPassword: CharArray) {
        setPassword(user, newPassword)
        userRepository.save(user)
    }

    fun authenticate(username: String, password: CharArray): User? {
        val user = userRepository.findByUsername(username)
        if (user != null && checkPassword(user, password)) {
            return user
        }
        return null
    }

    fun createSession(user: User, persistent: Boolean): Session {
        val session = DjangoAuthSession(userId = user.id.toString())
        // TODO: set _session_expiry
        // TODO: set _auth_user_hash
        val sessionKey = Signing.toString(session, secretKey, "django.contrib.sessions.backends.signed_cookies", DjangoAuthSession, true)
        return Session(
            sessionKey = sessionKey,
            expiry = if (persistent) PERSISTENT_SESSION_EXPIRY else null
        )
    }

    fun login(user: User, servletResponse: HttpServletResponse, persistent: Boolean): String {
        val session = createSession(user, persistent)
        val cookie = Cookie("sessionid", session.sessionKey)
        if (sessionCookieDomain != null) {
            cookie.domain = sessionCookieDomain
        }
        cookie.path = "/"
        // A negative value means that the cookie is not stored persistently and will be deleted when the Web browser exits.
        cookie.maxAge = session.expiry?.seconds?.toInt() ?: -1
        cookie.isHttpOnly = true
        servletResponse.addCookie(cookie)
        return session.sessionKey
    }

    fun logout(servletResponse: HttpServletResponse) {
        val cookie = Cookie("sessionid", "")
        if (sessionCookieDomain != null) {
            cookie.domain = sessionCookieDomain
        }
        cookie.path = "/"
        cookie.maxAge = 0 // delete
        cookie.isHttpOnly = true
        servletResponse.addCookie(cookie)
    }
}