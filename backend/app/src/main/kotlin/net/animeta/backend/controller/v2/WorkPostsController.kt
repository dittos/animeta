package net.animeta.backend.controller.v2

import net.animeta.backend.db.Datastore
import net.animeta.backend.db.query
import net.animeta.backend.dto.PostDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.QHistory.history
import net.animeta.backend.model.StatusType
import net.animeta.backend.repository.HistoryRepository
import net.animeta.backend.repository.WorkRepository
import net.animeta.backend.serializer.PostSerializer
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v2/works/{id:[0-9]+}/posts")
class WorkPostsController(val workRepository: WorkRepository,
                          val historyRepository: HistoryRepository,
                          val datastore: Datastore,
                          val postSerializer: PostSerializer) {
    data class GetWithCountsResponse(val data: List<PostDTO>, val userCount: Int?, val suspendedUserCount: Int?)

    @GetMapping
    fun get(@PathVariable id: Int,
            @RequestParam("before_id", required = false) beforeId: Int?,
            @RequestParam(required = false) episode: String?,
            @RequestParam(defaultValue = "32") count: Int,
            @RequestParam(defaultValue = "false") withCounts: Boolean,
            @RequestParam(required = false) options: PostSerializer.Options?): Any {
        val work = workRepository.findById(id).orElseThrow { ApiException.notFound() }
        var query = history.query.selectRelated(history.user)
                .filter(history.workId.eq(work.id!!), history.comment.ne(""))
                .orderBy(history.id.desc())
        if (beforeId != null) {
            query = query.filter(history.id.lt(beforeId))
        }
        if (episode != null) {
            query = query.filter(history.status.eq(episode))
        }
        val limit = minOf(count, 128)
        val posts = datastore.query(query.limit(limit))
                .map { postSerializer.serialize(it, options ?: PostSerializer.legacyOptions(includeUser = true)) }
        if (!withCounts) {
            return posts
        }

        val (userCount, suspendedUserCount) = if (episode != null) {
            val counts = historyRepository.countDistinctUsersByStatusType(work.id!!, episode)
            Pair(
                counts.sumBy { it.second.toInt() },
                counts.find { it.first == StatusType.SUSPENDED }?.second?.toInt() ?: 0
            )
        } else {
            Pair(null, null) // TODO
        }
        return GetWithCountsResponse(
            data = posts,
            userCount = userCount,
            suspendedUserCount = suspendedUserCount
        )
    }
}
