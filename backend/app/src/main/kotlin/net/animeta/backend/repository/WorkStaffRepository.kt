package net.animeta.backend.repository

import net.animeta.backend.model.Person
import net.animeta.backend.model.User
import net.animeta.backend.model.WorkStaff
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
    fun batchFindRelatedByUser(workIds: Collection<Int>, user: User): List<RelatedRow>

    interface TransliterationCheckItem {
        val id: Int
        val name: String
        val count: Int
    }

    @Query("""
        select
            p.id AS id, p.name AS name, count(*) AS count
        from
            work_staff ws
            join search_workperiodindex wpi on ws.work_id = wpi.work_id
            join person p on p.id = ws.person_id
        where
            p.id in (
                select distinct
                    p.id
                from
                    work_staff ws
                    join search_workperiodindex wpi on ws.work_id = wpi.work_id
                    join person p on p.id = ws.person_id
                where
                    wpi.period = :period
                    and wpi.is_first_period
                    and lower(ws.task) in :tasks
            )
            and lower(ws.task) in :tasks
            and wpi.period < :period
        group by p.id, p.name
        having count(*) >= 1
    """, nativeQuery = true)
    fun transliterationCheck(period: String, tasks: List<String>): List<TransliterationCheckItem>
}
