package net.animeta.backend.repository

import net.animeta.backend.model.Record
import net.animeta.backend.model.User
import net.animeta.backend.model.Work
import org.springframework.data.repository.CrudRepository

interface RecordRepository : CrudRepository<Record, Int> {
    fun countByWork(work: Work): Int

    fun findOneByWorkAndUser(work: Work, user: User): Record?
}