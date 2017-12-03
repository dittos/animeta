package net.animeta.backend.model

import javax.persistence.*

@Entity
@Table(name = "search_workindex")
data class WorkIndex(
        @get:Id
        var work_id: Int,
        @get:ManyToOne(fetch = FetchType.LAZY)
        @get:JoinColumn(name = "work_id", insertable = false, updatable = false)
        var work: Work,
        var title: String,
        var record_count: Int,
        var rank: Int,
        var blacklisted: Boolean
)