package net.animeta.backend.controller.v3

import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.User
import net.animeta.backend.repository.UserRepository
import net.animeta.backend.service.AuthService
import org.springframework.dao.DataIntegrityViolationException
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import java.time.Instant

@RestController
class CreateAccountController(
    private val userRepository: UserRepository,
    private val authService: AuthService
) {
    data class Params(
        val username: String,
        val password1: CharArray,
        val password2: CharArray
    ) {
        override fun equals(other: Any?): Boolean {
            if (this === other) return true
            if (javaClass != other?.javaClass) return false

            other as Params

            if (username != other.username) return false
            if (!password1.contentEquals(other.password1)) return false
            if (!password2.contentEquals(other.password2)) return false

            return true
        }

        override fun hashCode(): Int {
            var result = username.hashCode()
            result = 31 * result + password1.contentHashCode()
            result = 31 * result + password2.contentHashCode()
            return result
        }
    }

    data class Result(
        val authResult: AuthenticateController.Result
    )

    @PostMapping("/v3/CreateAccount")
    fun create(@RequestBody params: Params): Result {
        val existingUser = userRepository.findByUsername(params.username)
        if (existingUser != null) {
            throw usernameAlreadyExistError()
        }
        if (
            params.username.isEmpty() ||
            params.username.length > 30 ||
            !params.username.matches("^[A-Za-z0-9_]+$".toRegex()) ||
            params.password1.isEmpty() ||
            params.password2.isEmpty() ||
            !params.password1.contentEquals(params.password2)
        ) {
            throw ApiException("회원가입 실패", HttpStatus.BAD_REQUEST)
        }
        val user = User(username = params.username, date_joined = Instant.now())
        authService.setPassword(user, params.password1)
        try {
            userRepository.save(user)
        } catch (e: DataIntegrityViolationException) {
            throw usernameAlreadyExistError()
        }
        val session = authService.createSession(user, persistent = false)
        return Result(
            authResult = AuthenticateController.Result(
                sessionKey = session.sessionKey,
                expiryMs = session.expiry?.toMillis()
            )
        )
    }

    private fun usernameAlreadyExistError() =
        ApiException("이미 사용 중인 아이디입니다. 다른 아이디로 가입하세요.", HttpStatus.BAD_REQUEST)
}
