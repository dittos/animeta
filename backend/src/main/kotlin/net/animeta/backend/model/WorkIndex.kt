package net.animeta.backend.model

import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.Table

@Entity
@Table(name = "search_workindex")
data class WorkIndex(
        @get:Id
        var work_id: Int,
        var title: String,
        var record_count: Int,
        var rank: Int,
        var blacklisted: Boolean
)