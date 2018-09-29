package net.animeta.backend.model

import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.Table

@Entity
@Table(name = "search_worktitleindex")
data class WorkTitleIndex(
        @get:Id
        @get:GeneratedValue(strategy = GenerationType.IDENTITY)
        var id: Int? = null,
        var key: String,
        @get:ManyToOne(fetch = FetchType.LAZY)
        @get:JoinColumn(name = "work_id")
        var work: Work
)