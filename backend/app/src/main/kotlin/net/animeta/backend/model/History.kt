package net.animeta.backend.model

import java.sql.Timestamp
import java.time.Instant
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.EnumType
import javax.persistence.Enumerated
import javax.persistence.FetchType
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne
import javax.persistence.Table

@Entity
@Table(name = "record_history")
data class History(
        @get:Id
        @get:GeneratedValue(strategy = GenerationType.IDENTITY)
        var id: Int? = null,
        @get:ManyToOne(fetch = FetchType.LAZY)
        @get:JoinColumn(name = "user_id")
        var user: User,
        @get:Column(name = "work_id")
        var workId: Int,
        @get:ManyToOne(fetch = FetchType.LAZY)
        @get:JoinColumn(name = "record_id")
        var record: Record,
        var status: String,
        @get:Enumerated(EnumType.ORDINAL)
        var status_type: StatusType,
        var comment: String,
        @get:Column(name = "updated_at")
        var updatedAt: Instant?,
        var contains_spoiler: Boolean,
        var rating: Int?
)