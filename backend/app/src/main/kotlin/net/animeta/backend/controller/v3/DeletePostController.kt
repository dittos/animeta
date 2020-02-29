package net.animeta.backend.controller.v3

import net.animeta.backend.dto.RecordDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.User
import net.animeta.backend.repository.HistoryRepository
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.RecordSerializer
import net.animeta.backend.service.HistoryMutations
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class DeletePostController(
    private val historyRepository: HistoryRepository,
    private val historyMutations: HistoryMutations,
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
        historyMutations.delete(history)
        return Result(
            record = params.recordOptions?.let { recordSerializer.serialize(record, params.recordOptions) }
        )
    }
}
