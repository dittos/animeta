package net.animeta.backend.controller.v2

import net.animeta.backend.db.Datastore
import net.animeta.backend.db.query
import net.animeta.backend.dto.PostDTO
import net.animeta.backend.model.QHistory.history
import net.animeta.backend.repository.WorkIndexRepository
import net.animeta.backend.serializer.PostSerializer
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v2/posts")
class PostsController(
    private val datastore: Datastore,
    private val postSerializer: PostSerializer,
    private val workIndexRepository: WorkIndexRepository
) {
    @GetMapping
    fun get(@RequestParam("before_id", required = false) beforeId: Int?,
            @RequestParam("min_record_count", required = false) minRecordCount: Int?,
            @RequestParam(defaultValue = "32") count: Int,
            @RequestParam(required = false) options: PostSerializer.Options?): List<PostDTO> {
        var query = history.query.selectRelated(history.user, history.record)
                .filter(history.comment.ne(""))
                .orderBy(history.id.desc())
        if (beforeId != null) {
            query = query.filter(history.id.lt(beforeId))
        }
        val limit = minOf(count, 128)

        var posts = datastore.query(query.limit(limit))
        if (minRecordCount != null) {
            val workIndexes = workIndexRepository.findAllById(posts.map { it.workId })
                .associateBy { it.workId }

            // TODO: fill posts if filtered out
            posts = posts.filter {
                val recordCount = workIndexes[it.workId]?.record_count ?: 0
                recordCount >= minRecordCount
            }
        }

        return posts
                .map { postSerializer.serialize(it, options ?: PostSerializer.legacyOptions(includeRecord = true, includeUser = true)) }
    }
}