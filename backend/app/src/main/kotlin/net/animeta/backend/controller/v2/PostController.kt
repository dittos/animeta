package net.animeta.backend.controller.v2

import net.animeta.backend.dto.PostDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.repository.HistoryRepository
import net.animeta.backend.repository.RecordRepository
import net.animeta.backend.serializer.PostSerializer
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v2/posts/{id}")
class PostController(val historyRepository: HistoryRepository,
                     val recordRepository: RecordRepository,
                     val postSerializer: PostSerializer) {
    @GetMapping
    fun get(@PathVariable id: Int,
            @RequestParam(required = false) options: PostSerializer.Options?): PostDTO {
        val history = historyRepository.findById(id).orElseThrow { ApiException.notFound() }
        return postSerializer.serialize(history, options ?: PostSerializer.legacyOptions(includeRecord = true, includeUser = true))
    }
}
