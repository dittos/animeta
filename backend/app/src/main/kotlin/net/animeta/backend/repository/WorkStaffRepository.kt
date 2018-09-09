package net.animeta.backend.repository

import net.animeta.backend.model.Work
import net.animeta.backend.model.WorkStaff
import org.springframework.data.repository.CrudRepository

interface WorkStaffRepository : CrudRepository<WorkStaff, Int> {
    fun findByWork(work: Work): List<WorkStaff>
}