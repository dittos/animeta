package net.animeta.backend.model

import javax.persistence.*

@Entity
@Table(name = "record_category")
data class Category(
        @get:Id
        @get:GeneratedValue(strategy = GenerationType.IDENTITY)
        var id: Int? = null,
        @get:ManyToOne(fetch = FetchType.LAZY)
        @get:JoinColumn(name = "user_id")
        var user: User,
        var name: String,
        var position: Int
)