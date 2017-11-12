package net.animeta.backend.controller

import net.animeta.backend.dto.RecordDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.repository.RecordRepository
import net.animeta.backend.serializer.RecordSerializer
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v2/records/{id}")
class RecordController(val recordRepository: RecordRepository,
                       val recordSerializer: RecordSerializer) {
    @GetMapping
    fun get(@PathVariable id: Int): RecordDTO {
        val record = recordRepository.findOne(id) ?: throw ApiException.notFound()
        return recordSerializer.serialize(record, includeUser = true)
    }
}