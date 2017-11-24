package net.animeta.backend.controller

import net.animeta.backend.model.User
import net.animeta.backend.security.CurrentUser
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v2/auth")
class AuthController {
    data class AuthResult(val ok: Boolean)

    @GetMapping
    fun get(@CurrentUser(required = false) currentUser: User?): AuthResult {
        return AuthResult(currentUser != null)
    }
}