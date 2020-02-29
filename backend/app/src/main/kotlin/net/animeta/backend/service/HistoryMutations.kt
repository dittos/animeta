package net.animeta.backend.service

import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.History
import net.animeta.backend.model.Record
import net.animeta.backend.model.StatusType
import net.animeta.backend.model.User
import net.animeta.backend.model.Work
import net.animeta.backend.repository.HistoryRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import java.sql.Timestamp
import java.time.Instant

@Service
class HistoryMutations(
    private val historyRepository: HistoryRepository
) {
    @Autowired
    private lateinit var recordMutations: RecordMutations

    fun create(
        record: Record,
        status: String,
        statusType: StatusType,
        comment: String,
        containsSpoiler: Boolean,
        rating: Int?
    ): History {
        if (rating != null && rating !in 1..5) {
            throw ApiException("별점은 1부터 5까지 입력할 수 있습니다.", HttpStatus.BAD_REQUEST)
        }
        val history = History(
            user = record.user,
            workId = record.workId,
            record = record,
            status = status,
            status_type = statusType,
            comment = comment,
            contains_spoiler = containsSpoiler,
            updatedAt = Timestamp.from(Instant.now()),
            rating = rating
        )
        historyRepository.save(history)
        recordMutations.didCreateHistory(history)
        return history
    }

    fun delete(history: History) {
        if (historyRepository.countByRecord(history.record) == 1) {
            throw ApiException("등록된 작품마다 최소 1개의 기록이 필요합니다.", HttpStatus.UNPROCESSABLE_ENTITY)
        }
        historyRepository.delete(history)
        recordMutations.didDeleteHistory(history)
    }

    fun didUpdateRecordTitle(record: Record) {
        record.histories.forEach { it.workId = record.workId }
        historyRepository.saveAll(record.histories)
    }

    fun didMergeWork(work: Work, other: Work, usersWithConflict: List<User>) {
        for (u in usersWithConflict) {
            historyRepository.deleteByUserAndWorkId(u, other.id!!)
        }
        historyRepository.replaceWorkId(other.id!!, work.id!!)
    }
}
