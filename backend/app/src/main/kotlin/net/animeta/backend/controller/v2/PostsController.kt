package net.animeta.backend.controller.v2

import net.animeta.backend.db.Datastore
import net.animeta.backend.db.query
import net.animeta.backend.dto.PostDTO
import net.animeta.backend.model.History
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
        val limit = minOf(count, 128)

        val posts = if (minRecordCount != null) {
            val filteredPosts = mutableListOf<History>()
            var batchBeforeId = beforeId
            var queryCount = 0
            while (filteredPosts.size < limit && queryCount < 5) {
                var batchQuery = history.query.selectRelated(history.user, history.record)
                    .filter(history.comment.ne(""))
                    .orderBy(history.id.desc())
                if (batchBeforeId != null) {
                    batchQuery = batchQuery.filter(history.id.lt(batchBeforeId))
                }
                val maxBatchSize = maxOf(32, limit - filteredPosts.size)
                val batch = datastore.query(batchQuery.limit(maxBatchSize))
                queryCount++
                val workIndexes = workIndexRepository.findAllById(batch.map { it.workId })
                    .associateBy { it.workId }
                val filteredBatch = batch.filter {
                    val recordCount = workIndexes[it.workId]?.record_count ?: 0
                    recordCount >= minRecordCount
                }
                filteredPosts.addAll(filteredBatch)
                batchBeforeId = batch.lastOrNull()?.id
                if (batch.size < maxBatchSize) {
                    // no more posts to find
                    break
                }
            }
            filteredPosts
        } else {
            var query = history.query.selectRelated(history.user, history.record)
                .filter(history.comment.ne(""))
                .orderBy(history.id.desc())
            if (beforeId != null) {
                query = query.filter(history.id.lt(beforeId))
            }
            datastore.query(query.limit(limit))
        }

        return posts
                .map { postSerializer.serialize(it, options ?: PostSerializer.legacyOptions(includeRecord = true, includeUser = true)) }
    }
}