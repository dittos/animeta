package net.animeta.backend.model

import javax.persistence.*

@Entity
@Table(name = "search_worktitleindex")
data class WorkTitleIndex(
        @get:Id
        var id: Int,
        var key: String,
        @get:ManyToOne(fetch = FetchType.LAZY)
        @get:JoinColumn(name = "work_id")
        var work: Work
)