package net.animeta.backend.controller

import com.querydsl.jpa.HQLTemplates
import com.querydsl.jpa.impl.JPAQuery
import net.animeta.backend.dto.PostDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.History
import net.animeta.backend.model.QHistory.history
import net.animeta.backend.repository.UserRepository
import net.animeta.backend.serializer.PostSerializer
import org.springframework.data.jpa.repository.EntityGraph
import org.springframework.web.bind.annotation.*
import javax.persistence.EntityManager

@RestController
@RequestMapping("/v2/users/{name}/posts")
class UserPostsController(val userRepository: UserRepository,
                          val entityManager: EntityManager,
                          val postSerializer: PostSerializer) {
    @GetMapping
    fun get(@PathVariable name: String,
            @RequestParam("before_id", required = false) beforeId: Int?,
            @RequestParam(defaultValue = "32") count: Int): List<PostDTO> {
        val user = userRepository.findByUsername(name) ?: throw ApiException.notFound()
        val query = JPAQuery<History>(entityManager, HQLTemplates.DEFAULT)
                .select(history).from(history)
                .where(history.user.eq(user))
                .setHint(EntityGraph.EntityGraphType.LOAD.key, entityManager.getEntityGraph("history.withRecord"))
                .orderBy(history.id.desc())
        if (beforeId != null) {
            query.where(history.id.lt(beforeId))
        }
        val limit = minOf(count, 128)
        return query.limit(limit.toLong()).fetch()
                .map { postSerializer.serialize(it, includeRecord = true) }
    }
}