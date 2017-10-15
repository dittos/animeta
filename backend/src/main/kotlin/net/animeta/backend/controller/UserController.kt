package net.animeta.backend.controller

import net.animeta.backend.dto.UserDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.User
import net.animeta.backend.repository.UserRepository
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.UserSerializer
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v2/users/{name}")
class UserController(val userRepository: UserRepository, val userSerializer: UserSerializer) {
    @GetMapping
    fun get(@PathVariable name: String, @CurrentUser(required = false) currentUser: User?): UserDTO {
        val user = userRepository.findByUsername(name) ?: throw ApiException.notFound()
        return userSerializer.serialize(user, currentUser)
    }
}