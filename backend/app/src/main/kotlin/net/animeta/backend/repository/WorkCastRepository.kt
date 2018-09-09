package net.animeta.backend.repository

import net.animeta.backend.model.Work
import net.animeta.backend.model.WorkCast
import net.animeta.backend.model.WorkStaff
import org.springframework.data.repository.CrudRepository

interface WorkCastRepository : CrudRepository<WorkCast, Int> {
    fun findByWork(work: Work): List<WorkCast>
}