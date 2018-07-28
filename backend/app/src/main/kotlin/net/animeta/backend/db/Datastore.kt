package net.animeta.backend.db

import com.querydsl.jpa.JPQLTemplates
import com.querydsl.jpa.impl.JPAQuery
import org.springframework.stereotype.Service
import javax.persistence.EntityManager

@Service
class Datastore(val entityManager: EntityManager) {
    fun <T> query(query: Query<T>): List<T> {
        val jpaQuery = JPAQuery<T>(entityManager, JPQLTemplates.DEFAULT)
        jpaQuery.select(query.entityPath).from(query.entityPath)
        for (predicate in query.predicates) {
            jpaQuery.where(predicate)
        }
        if (query.relatedPaths.isNotEmpty()) {
            val entityGraph = entityManager.createEntityGraph(query.entityClass)
            buildEntityGraph(entityGraph, query.entityPath, query.relatedPaths)
            jpaQuery.setHint("javax.persistence.loadgraph", entityGraph)
        }
        if (query.orderSpecifiers != null) {
            jpaQuery.orderBy(*query.orderSpecifiers.toTypedArray())
        }
        if (query.limit != null) {
            jpaQuery.limit(query.limit.toLong())
        }
        if (query.offset != null) {
            jpaQuery.offset(query.offset.toLong())
        }
        return jpaQuery.fetch()
    }
}