package net.animeta.backend.repository

import net.animeta.backend.model.Person
import net.animeta.backend.model.User
import net.animeta.backend.model.WorkStaff
import net.animeta.backend.sql.Records
import net.animeta.backend.sql.WorkStaffs
import org.jetbrains.exposed.sql.JoinType
import org.jetbrains.exposed.sql.alias
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.innerJoin
import org.jetbrains.exposed.sql.select
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

interface WorkStaffRepository : CrudRepository<WorkStaff, Int> {
    fun findByPerson(person: Person): List<WorkStaff>
    fun findByWorkId(workId: Int): List<WorkStaff>

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
            JOIN Record r ON (r.workId = s2.work.id)
        WHERE
            s.work.id IN :workIds
            AND r.user = :user
            AND r.status_type IN (0, 1)
        GROUP BY s2.person.id, s2.task, s2.work.id, r.title, r.updated_at
        ORDER BY r.updated_at DESC
    """)
    fun batchFindRelatedByUser(workIds: Iterable<Int>, user: User): List<RelatedRow>
}

fun batchFindRelatedByUser2(workIds: Iterable<Int>, userId: Int): List<WorkStaffRepository.RelatedRow> {
    val s = WorkStaffs.alias("s")
    val s2 = WorkStaffs.alias("s2")
    return s
        .join(s2, JoinType.INNER, additionalConstraint = {
            s2[WorkStaffs.personId].eq(s[WorkStaffs.personId])
                .and(s2[WorkStaffs.workId].neq(s[WorkStaffs.workId]))
        })
        .innerJoin(Records, { Records.workId }, { s2[WorkStaffs.workId] })
        .slice(s2[WorkStaffs.personId], s2[WorkStaffs.task], s2[WorkStaffs.workId], Records.title)
        .select {
            s[WorkStaffs.workId].inList(workIds)
                .and(Records.userId.eq(userId))
                .and(Records.statusType.inList(listOf(0, 1)))
        }
        .groupBy(s2[WorkStaffs.personId], s2[WorkStaffs.task], s2[WorkStaffs.workId], Records.title, Records.updatedAt)
        .map {
            WorkStaffRepository.RelatedRow(
                personId = it[s2[WorkStaffs.personId]],
                staffTask = it[s2[WorkStaffs.task]],
                workId = it[s2[WorkStaffs.workId]],
                workTitle = it[Records.title]
            )
        }
}
