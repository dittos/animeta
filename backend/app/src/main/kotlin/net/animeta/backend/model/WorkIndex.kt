package net.animeta.backend.model

import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.Id
import javax.persistence.Table

@Entity
@Table(name = "search_workindex")
data class WorkIndex(
    @get:Id
    @get:Column(name = "work_id")
    var workId: Int,
    var title: String,
    var record_count: Int,
    @Deprecated("")
    var rank: Int = 0,
    var blacklisted: Boolean,
    var verified: Boolean
)