package net.animeta.backend.controller

import com.querydsl.jpa.HQLTemplates
import com.querydsl.jpa.impl.JPAQuery
import net.animeta.backend.dto.PostDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.History
import net.animeta.backend.model.QHistory.history
import net.animeta.backend.repository.WorkRepository
import net.animeta.backend.serializer.PostSerializer
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.web.bind.annotation.*
import javax.persistence.EntityManager

@RestController
@RequestMapping("/v2/works/{id:[0-9]+}/posts")
class WorkPostsController(val workRepository: WorkRepository,
                          val entityManager: EntityManager,
                          val postSerializer: PostSerializer) {
    @GetMapping
    fun get(@PathVariable id: Int,
            @RequestParam("before_id", required = false) beforeId: Int?,
            @RequestParam(required = false) episode: String?,
            @RequestParam(defaultValue = "32") count: Int): List<PostDTO> {
        val work = workRepository.findOne(id) ?: throw ApiException.notFound()
        val query = JPAQuery<History>(entityManager, HQLTemplates.DEFAULT)
                .select(history).from(history)
                .where(history.work.eq(work))
                .setHint(EntityGraph.EntityGraphType.LOAD.key, entityManager.getEntityGraph("history.withUser"))
                .where(history.comment.ne(""))
                .orderBy(history.id.desc())
        if (beforeId != null) {
            query.where(history.id.lt(beforeId))
        }
        if (episode != null) {
            query.where(history.status.eq(episode))
        }
        val limit = minOf(count, 128)
        return query.limit(limit.toLong()).fetch()
                .map { postSerializer.serialize(it, includeUser = true) }
    }
}