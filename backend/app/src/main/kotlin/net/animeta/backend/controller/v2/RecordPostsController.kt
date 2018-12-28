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
@RequestMapping("/v2/records/{id}/posts")
class RecordPostsController(val recordRepository: RecordRepository,
                            val historyRepository: HistoryRepository,
                            val postSerializer: PostSerializer) {
    data class GetResponse(val posts: List<PostDTO>)

    @GetMapping
    fun get(@PathVariable id: Int,
            @RequestParam(required = false) options: PostSerializer.Options?): GetResponse {
        val record = recordRepository.findById(id).orElseThrow { ApiException.notFound() }
        val posts = record.histories
        return GetResponse(posts.map { postSerializer.serialize(it, options ?: PostSerializer.legacyOptions()) })
    }
}
