package net.animeta.backend.repository

import net.animeta.backend.model.User
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import java.sql.Timestamp
import java.util.stream.Stream

interface UserRepository : CrudRepository<User, Int> {
    fun findByUsername(username: String): User?

    // Returns User ID instead of User (HHH-1615)

    @Query("""
        SELECT NEW kotlin.Pair(h.user.id, COUNT(*) AS factor)
        FROM History h
        WHERE h.updatedAt BETWEEN ?1 AND ?2
        GROUP BY h.user.id
        ORDER BY factor DESC
    """)
    fun iterateAllByActivenessWithinRange(minUpdatedAt: Timestamp, maxUpdatedAt: Timestamp): Stream<Pair<Int, Long>>

    @Query("""
        SELECT NEW kotlin.Pair(h.user.id, COUNT(*) AS factor)
        FROM History h
        GROUP BY h.user.id
        ORDER BY factor DESC
    """)
    fun iterateAllByAllTimeActiveness(): Stream<Pair<Int, Long>>
}
