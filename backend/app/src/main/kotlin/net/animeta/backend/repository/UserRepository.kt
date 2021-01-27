package net.animeta.backend.repository

import net.animeta.backend.model.User
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import java.sql.Timestamp
import java.util.stream.Stream

interface UserRepository : CrudRepository<User, Int> {
    fun findByUsername(username: String): User?
}
