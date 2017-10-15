package net.animeta.backend.controller

import net.animeta.backend.dto.PostDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.repository.HistoryRepository
import net.animeta.backend.serializer.PostSerializer
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v2/posts/{id}")
class PostController(val historyRepository: HistoryRepository,
                     val postSerializer: PostSerializer) {
    @GetMapping
    fun get(@PathVariable id: Int): PostDTO {
        val history = historyRepository.findOne(id) ?: throw ApiException.notFound()
        return postSerializer.serialize(history, includeRecord = true, includeUser = true)
    }
}