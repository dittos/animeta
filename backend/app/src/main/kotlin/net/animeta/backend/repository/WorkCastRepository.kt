package net.animeta.backend.repository

import net.animeta.backend.model.Person
import net.animeta.backend.model.Work
import net.animeta.backend.model.WorkCast
import org.springframework.data.repository.CrudRepository

interface WorkCastRepository : CrudRepository<WorkCast, Int> {
    fun findByWork(work: Work): List<WorkCast>
    fun findByActorInAndWorkIn(person: List<Person>, works: List<Work>): List<WorkCast>
    fun findByActor(person: Person): List<WorkCast>
}