package net.animeta.backend.controller

import net.animeta.backend.model.User
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.service.AuthService
import org.springframework.web.bind.annotation.*
import javax.servlet.http.HttpServletResponse

@RestController
@RequestMapping("/v2/auth")
class AuthController(private val authService: AuthService) {
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
        val sessionKey = authService.login(user, servletResponse, persistent = !transient)
        return AuthResult(ok = true, session_key = sessionKey)
    }

    @DeleteMapping
    fun logout(servletResponse: HttpServletResponse): AuthResult {
        authService.logout(servletResponse)
        return AuthResult(true)
    }
}