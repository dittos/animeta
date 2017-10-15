package net.animeta.backend.model

import java.sql.Timestamp
import javax.persistence.*

@Entity
@Table(name = "record_history")
@NamedEntityGraphs(
        NamedEntityGraph(name = "history.withUser",
                attributeNodes = arrayOf(NamedAttributeNode("user"))),
        NamedEntityGraph(name = "history.withRecord",
                attributeNodes = arrayOf(NamedAttributeNode("record"))),
        NamedEntityGraph(name = "history.withUserAndRecord",
                attributeNodes = arrayOf(NamedAttributeNode("user"),
                        NamedAttributeNode("record")))
)
data class History(
        @get:Id
        var id: Int,
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
        var updated_at: Timestamp?,
        var contains_spoiler: Boolean
)