package net.animeta.backend.repository

import net.animeta.backend.model.Work
import net.animeta.backend.model.WorkTitleIndex
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query

interface WorkTitleIndexRepository : JpaRepository<WorkTitleIndex, Int> {
    @Modifying
    @Query("delete from WorkTitleIndex where work = ?1")
    fun deleteAllByWork(work: Work)
}
