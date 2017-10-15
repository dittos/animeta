package net.animeta.backend.model

import java.sql.Timestamp
import javax.persistence.*

@Entity
@Table(name = "record_record")
data class Record(
        @get:Id
        var id: Int,
        @get:ManyToOne(fetch = FetchType.LAZY)
        @get:JoinColumn(name = "user_id")
        var user: User,
        @get:ManyToOne(fetch = FetchType.LAZY)
        @get:JoinColumn(name = "work_id")
        var work: Work,
        var title: String,
        var status: String,
        @get:Enumerated(EnumType.ORDINAL)
        var status_type: StatusType,
        @get:ManyToOne(fetch = FetchType.LAZY)
        @get:JoinColumn(name = "category_id")
        var category: Category?,
        var updated_at: Timestamp?,
        @get:OneToMany(fetch = FetchType.LAZY, mappedBy = "record")
        @get:OrderBy("id DESC")
        var histories: List<History>
)