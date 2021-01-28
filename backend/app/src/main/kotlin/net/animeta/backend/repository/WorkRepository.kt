package net.animeta.backend.repository

import net.animeta.backend.model.Work
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query
import java.time.Instant
import java.util.stream.Stream

interface WorkRepository : JpaRepository<Work, Int> {
    fun findByFirstPeriod(firstPeriod: String): List<Work>

    // Returns Work ID instead of Work (HHH-1615)

    @Query("""
        SELECT NEW kotlin.Pair(h.workId, COUNT(DISTINCT h.user) AS factor)
        FROM History h
        WHERE h.updatedAt BETWEEN ?1 AND ?2
        GROUP BY h.workId
        HAVING COUNT(DISTINCT h.user) > 1
        ORDER BY factor DESC
    """)
    fun iterateAllByPopularityWithinRange(minUpdatedAt: Instant, maxUpdatedAt: Instant): Stream<Pair<Int, Long>>

    @Query("""
        SELECT NEW kotlin.Pair(r.workId, COUNT(*) AS factor)
        FROM Record r
        GROUP BY r.workId
        HAVING COUNT(*) >= :minCount
        ORDER BY factor DESC
    """)
    fun iterateAllByAllTimePopularity(minCount: Long): Stream<Pair<Int, Long>>

    @Query(value = "SELECT * FROM work_work WHERE jsonb_exists(metadata, ?1)  ", nativeQuery = true)
    fun findAllMetadataHasProperty(propertyName: String): List<Work>
}
