package net.animeta.backend.db

import com.querydsl.core.types.EntityPath
import com.querydsl.core.types.Path
import com.querydsl.core.types.PathMetadata
import javax.persistence.EntityGraph
import javax.persistence.Subgraph

fun <T> buildEntityGraph(entityGraph: EntityGraph<T>, entityPath: EntityPath<T>, paths: Iterable<Path<*>>) {
    val root: Graph = EntityGraphAdapter(entityGraph)
    for (path in paths) {
        val metadata = path.metadata
        assert(!metadata.isRoot && metadata.rootPath == entityPath)
        ancestors(metadata).asSequence()
                .drop(1) // skip root
                .fold(root) { g, m -> g.subgraph(m.name) }
                .addAttributeNodes(metadata.name)
    }
}

private fun ancestors(metadata: PathMetadata): List<PathMetadata> {
    val ancestors = mutableListOf<PathMetadata>()
    var m = metadata
    while (!m.isRoot) {
        m = m.parent!!.metadata
        ancestors.add(m)
    }
    return ancestors.asReversed()
}

abstract class Graph {
    private val subgraphs = mutableMapOf<String, Subgraph<*>>()

    fun subgraph(name: String): Graph {
        return SubgraphAdapter(subgraphs.getOrPut(name) { createSubgraph(name) })
    }

    abstract fun addAttributeNodes(vararg name: String)
    abstract protected fun createSubgraph(name: String): Subgraph<*>
}

class EntityGraphAdapter<T>(val entityGraph: EntityGraph<T>) : Graph() {
    override fun createSubgraph(name: String): Subgraph<*> {
        return entityGraph.addSubgraph<Any>(name)
    }

    override fun addAttributeNodes(vararg name: String) {
        entityGraph.addAttributeNodes(*name)
    }
}

class SubgraphAdapter<T>(val subgraph: Subgraph<T>) : Graph() {
    override fun createSubgraph(name: String): Subgraph<*> {
        return subgraph.addSubgraph<Any>(name)
    }

    override fun addAttributeNodes(vararg name: String) {
        subgraph.addAttributeNodes(*name)
    }
}