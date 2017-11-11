package net.animeta.backend.controller

import com.querydsl.jpa.HQLTemplates
import com.querydsl.jpa.impl.JPAQuery
import net.animeta.backend.dto.PostDTO
import net.animeta.backend.model.History
import net.animeta.backend.model.QHistory.history
import net.animeta.backend.serializer.PostSerializer
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController
import javax.persistence.EntityManager

@RestController
@RequestMapping("/v2/posts")
class PostsController(val entityManager: EntityManager, val postSerializer: PostSerializer) {
    @GetMapping
    fun get(@RequestParam("before_id", required = false) beforeId: Int?,
            @RequestParam("min_record_count", required = false) minRecordCount: Int?,
            @RequestParam(defaultValue = "32") count: Int): List<PostDTO> {
        val query = JPAQuery<History>(entityManager, HQLTemplates.DEFAULT)
                .select(history).from(history)
                .setHint(EntityGraph.EntityGraphType.LOAD.key, entityManager.getEntityGraph("history.withUserAndRecord"))
                .where(history.comment.ne(""))
                .orderBy(history.id.desc())
        if (beforeId != null) {
            query.where(history.id.lt(beforeId))
        }
        if (minRecordCount != null) {
            query.where(history.work.indexes.any().record_count.goe(minRecordCount))
        }
        val limit = minOf(count, 128)
        return query.limit(limit.toLong()).fetch()
                .map { postSerializer.serialize(it, includeRecord = true, includeUser = true) }
    }
}