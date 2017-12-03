package net.animeta.backend.db

import com.querydsl.core.types.EntityPath
import com.querydsl.core.types.OrderSpecifier
import com.querydsl.core.types.Path
import com.querydsl.core.types.Predicate

inline val <reified T> EntityPath<T>.query: Query<T>
    get() = Query(T::class.java, this)

data class Query<T>(val entityClass: Class<T>,
                    val entityPath: EntityPath<T>,
                    val predicates: List<Predicate> = listOf(),
                    val orderSpecifiers: List<OrderSpecifier<*>>? = null,
                    val relatedPaths: List<Path<*>> = listOf(),
                    val limit: Int? = null,
                    val offset: Int? = null) {
    fun selectRelated(vararg paths: Path<*>): Query<T> {
        return copy(relatedPaths = relatedPaths + paths)
    }

    fun filter(vararg predicates: Predicate): Query<T> {
        return copy(predicates = this.predicates + predicates)
    }

    fun orderBy(vararg orderSpecifiers: OrderSpecifier<*>): Query<T> {
        return copy(orderSpecifiers = orderSpecifiers.toList())
    }

    fun limit(limit: Int): Query<T> {
        return copy(limit = limit)
    }

    fun offset(offset: Int): Query<T> {
        return copy(offset = offset)
    }
}