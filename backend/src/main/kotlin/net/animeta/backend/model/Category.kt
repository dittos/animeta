package net.animeta.backend.model

import javax.persistence.*

@Entity
@Table(name = "record_category")
data class Category(
        @get:Id
        var id: Int,
        @get:ManyToOne(fetch = FetchType.LAZY)
        @get:JoinColumn(name = "user_id")
        var user: User,
        var name: String,
        var position: Int,
        @get:OneToMany(fetch = FetchType.LAZY, mappedBy = "category")
        var records: List<Record>
)