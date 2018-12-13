package net.animeta.backend.controller.v2

import net.animeta.backend.db.Datastore
import net.animeta.backend.db.query
import net.animeta.backend.dto.PostDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.QHistory.history
import net.animeta.backend.model.StatusType
import net.animeta.backend.repository.WorkRepository
import net.animeta.backend.serializer.PostSerializer
import net.animeta.backend.sql.Histories
import org.jetbrains.exposed.sql.Database
import org.jetbrains.exposed.sql.and
import org.jetbrains.exposed.sql.countDistinct
import org.jetbrains.exposed.sql.select
import org.jetbrains.exposed.sql.transactions.transaction
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v2/works/{id:[0-9]+}/posts")
class WorkPostsController(val workRepository: WorkRepository,
                          val datastore: Datastore,
                          val database: Database,
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
            transaction(database) {
                val counts = Histories.slice(Histories.statusType, Histories.userId.countDistinct())
                    .select { Histories.workId.eq(work.id!!).and(Histories.status.eq(episode)) }
                    .groupBy(Histories.statusType)
                    .toList()
                Pair(
                    counts.sumBy { it[Histories.userId.countDistinct()] },
                    counts.find { it[Histories.statusType] == StatusType.SUSPENDED.ordinal }
                        ?.let { it[Histories.userId.countDistinct()] } ?: 0
                )
            }
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
