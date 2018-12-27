package net.animeta.backend.controller.v2

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
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v2/posts/{id}")
class PostController(val historyRepository: HistoryRepository,
                     val recordRepository: RecordRepository,
                     val postSerializer: PostSerializer,
                     val recordSerializer: RecordSerializer) {
    @GetMapping
    fun get(@PathVariable id: Int,
            @RequestParam(required = false) options: PostSerializer.Options?): PostDTO {
        val history = historyRepository.findById(id).orElseThrow { ApiException.notFound() }
        return postSerializer.serialize(history, options ?: PostSerializer.legacyOptions(includeRecord = true, includeUser = true))
    }

    data class DeleteResponse(val record: RecordDTO)

    @DeleteMapping
    @Transactional
    @Deprecated("v3")
    fun delete(@PathVariable id: Int, @CurrentUser currentUser: User): DeleteResponse {
        val history = historyRepository.findById(id).orElseThrow { ApiException.notFound() }
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
        return DeleteResponse(recordSerializer.serialize(record, RecordSerializer.legacyOptions(includeUser = true)))
    }
}
