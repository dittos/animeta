package net.animeta.backend.service

import django.Hashers
import net.animeta.backend.model.User
import net.animeta.backend.repository.UserRepository
import org.springframework.stereotype.Service

@Service
class AuthService(private val userRepository: UserRepository) {
    fun checkPassword(user: User, password: CharArray): Boolean {
        when (Hashers.checkPassword(password, user.password)!!) {
            Hashers.CheckPasswordResult.INCORRECT -> return false
            Hashers.CheckPasswordResult.CORRECT -> return true
            Hashers.CheckPasswordResult.CORRECT_BUT_MUST_UPDATE -> {
                changePassword(user, password)
                return true
            }
        }
    }

    fun changePassword(user: User, newPassword: CharArray) {
        user.password = Hashers.makePassword(newPassword, null)
        userRepository.save(user)
    }

    fun authenticate(username: String, password: CharArray): User? {
        val user = userRepository.findByUsername(username)
        if (user != null && checkPassword(user, password)) {
            return user
        }
        return null
    }
}