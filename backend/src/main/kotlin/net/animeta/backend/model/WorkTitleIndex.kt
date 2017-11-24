package net.animeta.backend.model

import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.Table

@Entity
@Table(name = "search_worktitleindex")
data class WorkTitleIndex(
        @get:Id
        var id: Int,
        var key: String,
        var work_id: Int
)