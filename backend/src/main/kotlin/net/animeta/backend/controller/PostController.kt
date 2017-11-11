package net.animeta.backend.controller

import net.animeta.backend.dto.PostDTO
import net.animeta.backend.dto.RecordDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.User
import net.animeta.backend.repository.HistoryRepository
import net.animeta.backend.repository.RecordRepository
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.PostSerializer
import net.animeta.backend.serializer.RecordSerializer
import org.springframework.http.HttpStatus
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v2/posts/{id}")
class PostController(val historyRepository: HistoryRepository,
                     val recordRepository: RecordRepository,
                     val postSerializer: PostSerializer,
                     val recordSerializer: RecordSerializer) {
    @GetMapping
    fun get(@PathVariable id: Int): PostDTO {
        val history = historyRepository.findOne(id) ?: throw ApiException.notFound()
        return postSerializer.serialize(history, includeRecord = true, includeUser = true)
    }

    data class DeleteResponse(val record: RecordDTO)

    @DeleteMapping
    @Transactional
    fun delete(@PathVariable id: Int, @CurrentUser currentUser: User): DeleteResponse {
        val history = historyRepository.findOne(id) ?: throw ApiException.notFound()
        if (currentUser.id != history.user.id) {
            throw ApiException("Permission denied.", HttpStatus.FORBIDDEN)
        }
        val record = history.record
        if (historyRepository.countByRecord(record) == 1) {
            throw ApiException("등록된 작품마다 최소 1개의 기록이 필요합니다.", HttpStatus.UNPROCESSABLE_ENTITY)
        }
        historyRepository.delete(history)
        val latestHistory = historyRepository.findFirstByRecordOrderByIdDesc(record)!!
        record.status = latestHistory.status
        record.status_type = latestHistory.status_type
        recordRepository.save(record)
        return DeleteResponse(recordSerializer.serialize(record, includeUser = true))
    }
}