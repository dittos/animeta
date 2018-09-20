package net.animeta.backend.repository

import net.animeta.backend.model.Person
import net.animeta.backend.model.Work
import net.animeta.backend.model.WorkStaff
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.CrudRepository

interface WorkStaffRepository : CrudRepository<WorkStaff, Int> {
    fun findByWork(work: Work): List<WorkStaff>
    fun findByPersonInAndWorkIn(person: List<Person>, works: List<Work>): List<WorkStaff>
    fun findByPerson(person: Person): List<WorkStaff>

    @Query("""
        SELECT s.*
        FROM work_staff s
        JOIN record_record r ON (s.work_id = r.work_id)
        WHERE s.person_id = :personId
        AND r.user_id = :userId
        AND r.status_type IN (0, 1)
        ORDER BY r.updated_at DESC
    """, nativeQuery = true)
    fun findByPersonIdAndWorkInUserRecords(personId: Int, userId: Int): List<WorkStaff>
}