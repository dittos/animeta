package net.animeta.backend.controller.v3

import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.User
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.service.AuthService
import org.springframework.http.HttpStatus
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class ChangePasswordController(
    private val authService: AuthService
) {
    data class Params(
        val oldPassword: CharArray,
        val newPassword: CharArray
    ) {
        override fun equals(other: Any?): Boolean {
            if (this === other) return true
            if (javaClass != other?.javaClass) return false

            other as Params

            if (!oldPassword.contentEquals(other.oldPassword)) return false
            if (!newPassword.contentEquals(other.newPassword)) return false

            return true
        }

        override fun hashCode(): Int {
            var result = oldPassword.contentHashCode()
            result = 31 * result + newPassword.contentHashCode()
            return result
        }
    }

    data class Result(
        val ok: Boolean
    )

    @PostMapping("/v3/ChangePassword")
    @Transactional
    fun handle(@RequestBody params: Params, @CurrentUser currentUser: User): Result {
        if (!authService.checkPassword(currentUser, params.oldPassword)) {
            throw ApiException("기존 암호를 확인해주세요.", HttpStatus.FORBIDDEN)
        }
        authService.changePassword(currentUser, params.newPassword)
        return Result(true)
    }
}
