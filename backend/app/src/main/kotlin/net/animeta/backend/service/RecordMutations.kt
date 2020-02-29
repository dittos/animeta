package net.animeta.backend.service

import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.Category
import net.animeta.backend.model.History
import net.animeta.backend.model.Record
import net.animeta.backend.model.StatusType
import net.animeta.backend.model.User
import net.animeta.backend.model.Work
import net.animeta.backend.repository.HistoryRepository
import net.animeta.backend.repository.RecordRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import java.sql.Timestamp
import java.time.Instant

@Service
class RecordMutations(
    private val recordRepository: RecordRepository,
    private val historyRepository: HistoryRepository
) {
    @Autowired
    private lateinit var workMutations: WorkMutations

    @Autowired
    private lateinit var historyMutations: HistoryMutations

    fun create(
        user: User,
        title: String,
        status: String,
        statusType: StatusType,
        comment: String,
        containsSpoiler: Boolean,
        rating: Int?,
        category: Category?
    ): CreateResult {
        if (title.isBlank()) {
            throw ApiException("작품 제목을 입력하세요.", HttpStatus.BAD_REQUEST)
        }
        if (rating != null && rating !in 1..5) {
            throw ApiException("별점은 1부터 5까지 입력할 수 있습니다.", HttpStatus.BAD_REQUEST)
        }
        val work = workMutations.getOrCreate(title)
        val existingRecord = recordRepository.findOneByWorkIdAndUser(work.id!!, user)
        if (existingRecord != null) {
            throw ApiException("이미 같은 작품이 \"${existingRecord.title}\"로 등록되어 있습니다.", HttpStatus.UNPROCESSABLE_ENTITY)
        }
        val record = Record(
            user = user,
            workId = work.id!!,
            title = title,
            category = category,
            status = status,
            status_type = statusType,
            updated_at = Timestamp.from(Instant.now()),
            rating = rating
        )
        recordRepository.save(record)
        val history = historyMutations.create(
            record, status, statusType, comment, containsSpoiler, rating
        )
        return CreateResult(record, history)
    }

    fun updateTitle(record: Record, title: String) {
        val work = workMutations.getOrCreate(title)
        record.workId = work.id!!
        record.title = title
        recordRepository.save(record)
        historyMutations.didUpdateRecordTitle(record)
    }

    fun updateCategory(record: Record, category: Category?) {
        record.category = category
        recordRepository.save(record)
    }

    fun updateRating(record: Record, rating: Int?) {
        if (rating != null && rating !in 1..5) {
            throw ApiException("별점은 1부터 5까지 입력할 수 있습니다.", HttpStatus.BAD_REQUEST)
        }
        record.rating = rating
        recordRepository.save(record)
    }

    fun delete(record: Record) {
        recordRepository.delete(record)
        // history는 cascade에 의해 삭제
    }

    fun didCreateHistory(history: History) {
        val record = history.record
        record.status_type = history.status_type
        record.status = history.status
        record.updated_at = history.updatedAt
        recordRepository.save(record)
    }

    fun didDeleteHistory(history: History) {
        val record = history.record
        val latestHistory = historyRepository.findFirstByRecordOrderByIdDesc(record)!!
        record.status = latestHistory.status
        record.status_type = latestHistory.status_type
        recordRepository.save(record)
    }

    fun didDeleteCategory(category: Category) {
        recordRepository.unsetCategory(category)
    }

    fun willDeleteWork(work: Work) {
        if (recordRepository.countByWorkId(work.id!!) != 0) {
            throw ApiException("Record exists", HttpStatus.FORBIDDEN)
        }
    }

    // TODO: willMergeWork?
    fun didMergeWork(work: Work, other: Work, usersWithConflict: List<User>) {
        historyMutations.didMergeWork(work, other, usersWithConflict)
        for (u in usersWithConflict) {
            recordRepository.deleteByUserAndWorkId(u, other.id!!)
        }
        recordRepository.replaceWorkId(other.id!!, work.id!!)
    }

    data class CreateResult(
        val record: Record,
        val history: History
    )
}
