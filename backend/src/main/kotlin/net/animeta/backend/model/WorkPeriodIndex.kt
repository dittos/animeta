package net.animeta.backend.model

import javax.persistence.*

@Entity
@Table(name = "search_workperiodindex")
@NamedEntityGraphs(
        NamedEntityGraph(name = "workPeriodIndex.work.withIndex",
                attributeNodes = arrayOf(NamedAttributeNode(value = "work", subgraph = "indexes")),
                subgraphs = arrayOf(NamedSubgraph(name = "indexes", attributeNodes = arrayOf(NamedAttributeNode("indexes")))))
)
data class WorkPeriodIndex(
        @get:Id
        var id: Int? = null,
        @get:ManyToOne(fetch = FetchType.LAZY)
        @get:JoinColumn(name = "work_id")
        var work: Work,
        var period: String,
        @get:Column(name = "is_first_period")
        var firstPeriod: Boolean
)