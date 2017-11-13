package net.animeta.backend.controller

import net.animeta.backend.db.Datastore
import net.animeta.backend.db.query
import net.animeta.backend.dto.PostDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.QHistory.history
import net.animeta.backend.repository.UserRepository
import net.animeta.backend.serializer.PostSerializer
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v2/users/{name}/posts")
class UserPostsController(val userRepository: UserRepository,
                          val datastore: Datastore,
                          val postSerializer: PostSerializer) {
    @GetMapping
    fun get(@PathVariable name: String,
            @RequestParam("before_id", required = false) beforeId: Int?,
            @RequestParam(defaultValue = "32") count: Int): List<PostDTO> {
        val user = userRepository.findByUsername(name) ?: throw ApiException.notFound()
        var query = history.query.selectRelated(history.record)
                .filter(history.user.eq(user))
                .orderBy(history.id.desc())
        if (beforeId != null) {
            query = query.filter(history.id.lt(beforeId))
        }
        val limit = minOf(count, 128)
        return datastore.query(query.limit(limit))
                .map { postSerializer.serialize(it, includeRecord = true) }
    }
}