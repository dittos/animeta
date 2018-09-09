package net.animeta.backend.repository

import net.animeta.backend.model.Work
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository
import java.sql.Timestamp
import java.util.stream.Stream

interface WorkRepository : CrudRepository<Work, Int> {
    // Returns Work ID instead of Work (HHH-1615)

    @Query("""
        SELECT NEW kotlin.Pair(h.work.id, COUNT(DISTINCT h.user) AS factor)
        FROM History h
        WHERE h.updatedAt BETWEEN ?1 AND ?2
        GROUP BY h.work.id
        HAVING COUNT(DISTINCT h.user) > 1
        ORDER BY factor DESC
    """)
    fun iterateAllByPopularityWithinRange(minUpdatedAt: Timestamp, maxUpdatedAt: Timestamp): Stream<Pair<Int, Long>>

    @Query("""
        SELECT NEW kotlin.Pair(r.work.id, COUNT(*) AS factor)
        FROM Record r
        GROUP BY r.work.id
        HAVING COUNT(*) > 1
        ORDER BY factor DESC
    """)
    fun iterateAllByAllTimePopularity(): Stream<Pair<Int, Long>>

    @Query(value = "SELECT * FROM work_work WHERE jsonb_exists(metadata, 'ann_id')  ", nativeQuery = true)
    fun findAllWithAnnId(): List<Work>
}
