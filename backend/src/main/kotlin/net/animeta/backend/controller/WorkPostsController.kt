package net.animeta.backend.controller

import net.animeta.backend.db.Datastore
import net.animeta.backend.db.query
import net.animeta.backend.dto.PostDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.QHistory.history
import net.animeta.backend.repository.WorkRepository
import net.animeta.backend.serializer.PostSerializer
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v2/works/{id:[0-9]+}/posts")
class WorkPostsController(val workRepository: WorkRepository,
                          val datastore: Datastore,
                          val postSerializer: PostSerializer) {
    @GetMapping
    fun get(@PathVariable id: Int,
            @RequestParam("before_id", required = false) beforeId: Int?,
            @RequestParam(required = false) episode: String?,
            @RequestParam(defaultValue = "32") count: Int): List<PostDTO> {
        val work = workRepository.findOne(id) ?: throw ApiException.notFound()
        var query = history.query.selectRelated(history.user)
                .filter(history.work.eq(work), history.comment.ne(""))
                .orderBy(history.id.desc())
        if (beforeId != null) {
            query = query.filter(history.id.lt(beforeId))
        }
        if (episode != null) {
            query = query.filter(history.status.eq(episode))
        }
        val limit = minOf(count, 128)
        return datastore.query(query.limit(limit))
                .map { postSerializer.serialize(it, includeUser = true) }
    }
}