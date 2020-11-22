package net.animeta.backend.controller.v3

import net.animeta.backend.exception.ApiException
import net.animeta.backend.service.AuthService
import org.springframework.http.HttpStatus
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class AuthenticateController(
    private val authService: AuthService
) {
    data class Params(
        val username: String,
        val password: CharArray,
        val persistent: Boolean
    ) {
        override fun equals(other: Any?): Boolean {
            if (this === other) return true
            if (javaClass != other?.javaClass) return false

            other as Params

            if (username != other.username) return false
            if (!password.contentEquals(other.password)) return false
            if (persistent != other.persistent) return false

            return true
        }

        override fun hashCode(): Int {
            var result = username.hashCode()
            result = 31 * result + password.contentHashCode()
            result = 31 * result + persistent.hashCode()
            return result
        }
    }

    data class Result(
        val sessionKey: String,
        val expiryMs: Long?
    )

    @PostMapping("/v3/Authenticate")
    @Transactional
    fun handle(@RequestBody params: Params): Result {
        val user = authService.authenticate(params.username, params.password)
        if (user == null || !user.active) {
            throw ApiException("없는 아이디거나 암호가 틀렸습니다.", HttpStatus.UNAUTHORIZED)
        }
        val session = authService.createSession(user, params.persistent)
        return Result(
            sessionKey = session.sessionKey,
            expiryMs = session.expiry?.toMillis()
        )
    }
}
