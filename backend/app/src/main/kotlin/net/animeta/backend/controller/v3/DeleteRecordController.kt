package net.animeta.backend.controller.v3

import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.User
import net.animeta.backend.repository.RecordRepository
import net.animeta.backend.security.CurrentUser
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController

@RestController
class DeleteRecordController(
    private val recordRepository: RecordRepository
) {
    data class Params(
        val id: Int
    )
    data class Result(
        val ok: Boolean
    )

    @PostMapping("/v3/DeleteRecord")
    @Transactional
    fun handle(@RequestBody params: Params, @CurrentUser currentUser: User): Result {
        val record = recordRepository.findById(params.id).orElseThrow { ApiException.notFound() }
        if (currentUser.id != record.user.id) {
            throw ApiException.permissionDenied()
        }
        recordRepository.delete(record)
        return Result(true)
    }
}