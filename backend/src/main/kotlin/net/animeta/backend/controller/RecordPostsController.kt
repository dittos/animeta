package net.animeta.backend.controller

import net.animeta.backend.dto.PostDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.repository.RecordRepository
import net.animeta.backend.serializer.PostSerializer
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v2/records/{id}/posts")
class RecordPostsController(val recordRepository: RecordRepository,
                            val postSerializer: PostSerializer) {
    data class GetResponse(val posts: List<PostDTO>)

    @GetMapping
    fun get(@PathVariable id: Int): GetResponse {
        val record = recordRepository.findOne(id) ?: throw ApiException.notFound()
        val posts = record.histories
        return GetResponse(posts.map { postSerializer.serialize(it) })
    }
}