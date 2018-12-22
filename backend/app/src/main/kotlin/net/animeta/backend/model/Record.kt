package net.animeta.backend.model

import java.sql.Timestamp
import javax.persistence.CascadeType
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
import javax.persistence.OneToMany
import javax.persistence.OrderBy
import javax.persistence.Table

@Entity
@Table(name = "record_record")
data class Record(
        @get:Id
        @get:GeneratedValue(strategy = GenerationType.IDENTITY)
        var id: Int? = null,
        @get:ManyToOne(fetch = FetchType.LAZY)
        @get:JoinColumn(name = "user_id")
        var user: User,
        @get:Column(name = "work_id")
        var workId: Int,
        var title: String,
        var status: String,
        @get:Enumerated(EnumType.ORDINAL)
        var status_type: StatusType,
        @get:ManyToOne(fetch = FetchType.LAZY)
        @get:JoinColumn(name = "category_id")
        var category: Category?,
        var updated_at: Timestamp?,
        var rating: Int?
) {
    @get:OneToMany(fetch = FetchType.LAZY, mappedBy = "record", cascade = arrayOf(CascadeType.ALL))
    @get:OrderBy("id DESC")
    var histories: List<History> = listOf()
}