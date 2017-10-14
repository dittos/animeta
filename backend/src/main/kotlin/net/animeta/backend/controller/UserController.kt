package net.animeta.backend.controller

import net.animeta.backend.dto.UserDTO
import net.animeta.backend.model.User
import net.animeta.backend.repository.UserRepository
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.UserSerializer
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v3/users/{name}")
class UserController(val userRepository: UserRepository, val userSerializer: UserSerializer) {
    @GetMapping
    fun get(@PathVariable name: String, @CurrentUser currentUser: User?): ResponseEntity<UserDTO> {
        val user = userRepository.findByUsername(name)
        if (user == null) {
            return ResponseEntity.notFound().build()
        }
        return ResponseEntity.ok(userSerializer.serialize(user, currentUser))
    }
}