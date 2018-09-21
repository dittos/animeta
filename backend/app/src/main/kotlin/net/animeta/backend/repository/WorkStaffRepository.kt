package net.animeta.backend.repository

import net.animeta.backend.model.Person
import net.animeta.backend.model.User
import net.animeta.backend.model.Work
import net.animeta.backend.model.WorkStaff
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

interface WorkStaffRepository : CrudRepository<WorkStaff, Int> {
    fun findByWork(work: Work): List<WorkStaff>
    fun findByPersonInAndWorkIn(person: List<Person>, works: List<Work>): List<WorkStaff>
    fun findByPerson(person: Person): List<WorkStaff>

    data class RelatedRow(
        val personId: Int,
        val staffTask: String,
        val workId: Int,
        val workTitle: String
    )

    @Query("""
        SELECT NEW net.animeta.backend.repository.WorkStaffRepository${'$'}RelatedRow(
            s2.person.id AS personId,
            s2.task AS staffTask,
            s2.work.id AS workId,
            r.title AS workTitle
        )
        FROM
            WorkStaff s
            JOIN WorkStaff s2 ON (s2.person = s.person AND s2.work != s.work)
            JOIN Record r ON (r.work = s2.work)
        WHERE
            s.work.id IN :workIds
            AND r.user = :user
            AND r.status_type IN (0, 1)
        ORDER BY r.updated_at DESC
    """)
    fun batchFindRelatedByUser(workIds: Iterable<Int>, user: User): List<RelatedRow>
}