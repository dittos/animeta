package net.animeta.backend.model

import java.sql.Timestamp
import javax.persistence.*

@Entity
@Table(name = "record_history")
data class History(
        @get:Id
        @get:GeneratedValue(strategy = GenerationType.IDENTITY)
        var id: Int? = null,
        @get:ManyToOne(fetch = FetchType.LAZY)
        @get:JoinColumn(name = "user_id")
        var user: User,
        @get:ManyToOne(fetch = FetchType.LAZY)
        @get:JoinColumn(name = "work_id")
        var work: Work,
        @get:ManyToOne(fetch = FetchType.LAZY)
        @get:JoinColumn(name = "record_id")
        var record: Record,
        var status: String,
        @get:Enumerated(EnumType.ORDINAL)
        var status_type: StatusType,
        var comment: String,
        @get:Column(name = "updated_at")
        var updatedAt: Timestamp?,
        var contains_spoiler: Boolean
)