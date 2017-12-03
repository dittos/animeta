package net.animeta.backend.controller.v2

import net.animeta.backend.dto.UserDTO
import net.animeta.backend.model.User
import net.animeta.backend.repository.UserRepository
import net.animeta.backend.serializer.UserSerializer
import net.animeta.backend.service.AuthService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import java.sql.Timestamp
import java.time.Instant
import javax.servlet.http.HttpServletResponse

@RestController
@RequestMapping("/v2/accounts")
class AccountsController(private val userRepository: UserRepository,
                         private val authService: AuthService,
                         private val userSerializer: UserSerializer) {
    data class CreateResponse(val ok: Boolean,
                              val user: UserDTO? = null,
                              val session_key: String? = null,
                              val errors: Map<String, String>? = null)

    @PostMapping
    fun create(@RequestParam username: String,
               @RequestParam password1: CharArray,
               @RequestParam password2: CharArray,
               servletResponse: HttpServletResponse): CreateResponse {
        val existingUser = userRepository.findByUsername(username)
        if (existingUser != null) {
            return CreateResponse(ok = false, errors = mapOf("username" to "해당 사용자명은 이미 존재합니다."))
        }
        if (username.isEmpty() ||
                username.length > 30 ||
                !username.matches("^[A-Za-z0-9_]+$".toRegex()) ||
                password1.isEmpty() ||
                password2.isEmpty() ||
                !password1.contentEquals(password2)) {
            return CreateResponse(ok = false)
        }
        val user = User(username = username, date_joined = Timestamp.from(Instant.now()))
        authService.setPassword(user, password1)
        userRepository.save(user)
        val sessionKey = authService.login(user, servletResponse, persistent = false)
        return CreateResponse(ok = true, user = userSerializer.serialize(user), session_key = sessionKey)
    }
}