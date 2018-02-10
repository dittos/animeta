package net.animeta.backend.controller.v2

import net.animeta.backend.dto.UserDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.User
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.UserSerializer
import net.animeta.backend.service.AuthService
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v2/me")
class CurrentUserController(private val userSerializer: UserSerializer,
                            private val authService: AuthService) {
    @GetMapping
    fun get(@CurrentUser(required = false) currentUser: User?,
            @RequestParam("include_stats", defaultValue = "false") includeStats: Boolean): UserDTO {
        if (currentUser == null) {
            throw ApiException("Not logged in", HttpStatus.FORBIDDEN)
        }
        return userSerializer.serialize(currentUser, currentUser, includeStats = includeStats)
    }

    data class ChangePasswordResponse(val ok: Boolean)

    @PostMapping("/password")
    fun changePassword(@CurrentUser(required = false) currentUser: User?,
                       @RequestParam("old_password") oldPassword: CharArray,
                       @RequestParam("new_password1") newPassword1: CharArray,
                       @RequestParam("new_password2") newPassword2: CharArray): ChangePasswordResponse {
        if (currentUser == null) {
            throw ApiException("Not logged in", HttpStatus.FORBIDDEN)
        }
        if (!authService.checkPassword(currentUser, oldPassword)) {
            throw ApiException("Old password is wrong", HttpStatus.FORBIDDEN)
        }
        if (!newPassword1.contentEquals(newPassword2)) {
            throw ApiException("New password confirmation failed", HttpStatus.BAD_REQUEST)
        }
        authService.changePassword(currentUser, newPassword1)
        return ChangePasswordResponse(true)
    }
}