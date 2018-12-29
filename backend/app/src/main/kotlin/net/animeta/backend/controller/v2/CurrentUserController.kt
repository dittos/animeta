package net.animeta.backend.controller.v2

import net.animeta.backend.dto.UserDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.User
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.UserSerializer
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v2/me")
class CurrentUserController(
    private val userSerializer: UserSerializer
) {
    @GetMapping
    fun get(@CurrentUser(required = false) currentUser: User?,
            @RequestParam(defaultValue = "{}") options: UserSerializer.Options): UserDTO {
        if (currentUser == null) {
            throw ApiException("Not logged in", HttpStatus.FORBIDDEN)
        }
        return userSerializer.serialize(currentUser, currentUser, options)
    }
}
