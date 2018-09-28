package net.animeta.backend.repository

import net.animeta.backend.model.Person
import net.animeta.backend.model.WorkCast
import org.springframework.data.repository.CrudRepository

interface WorkCastRepository : CrudRepository<WorkCast, Int> {
    fun findByActor(person: Person): List<WorkCast>
}