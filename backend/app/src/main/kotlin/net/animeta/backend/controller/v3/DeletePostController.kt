package net.animeta.backend.controller.v3

import net.animeta.backend.dto.RecordDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.User
import net.animeta.backend.repository.HistoryRepository
import net.animeta.backend.repository.RecordRepository
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.RecordSerializer
import org.springframework.http.HttpStatus
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class DeletePostController(
    private val recordRepository: RecordRepository,
    private val historyRepository: HistoryRepository,
    private val recordSerializer: RecordSerializer
) {
    data class Params(
        val id: Int,
        val recordOptions: RecordSerializer.Options?
    )
    data class Result(
        val record: RecordDTO?
    )

    @PostMapping("/v3/DeletePost")
    @Transactional
    fun handle(@RequestBody params: Params, @CurrentUser currentUser: User): Result {
        val history = historyRepository.findById(params.id).orElseThrow { ApiException.notFound() }
        if (currentUser.id != history.user.id) {
            throw ApiException.permissionDenied()
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
        return Result(
            record = params.recordOptions?.let { recordSerializer.serialize(record, params.recordOptions) }
        )
    }
}