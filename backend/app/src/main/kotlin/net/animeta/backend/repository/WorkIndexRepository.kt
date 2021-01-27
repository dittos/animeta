package net.animeta.backend.repository

import net.animeta.backend.model.WorkIndex
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface WorkIndexRepository : JpaRepository<WorkIndex, Int> {
    @Query("""
        SELECT DISTINCT wi
        FROM WorkIndex wi, WorkTitleIndex wti
        WHERE wi.workId = wti.work.id
        AND wti.key LIKE ?1
        AND (wi.verified = true OR wi.record_count >= ?2)
        AND wi.blacklisted = false
        ORDER BY wi.verified DESC, wi.record_count DESC
    """)
    fun search(pattern: String, minRecordCount: Int, pageable: Pageable): List<WorkIndex>

    fun findOneByWorkId(workId: Int): WorkIndex?
}
