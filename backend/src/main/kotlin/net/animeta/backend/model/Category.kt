package net.animeta.backend.model

import javax.persistence.*

@Entity
@Table(name = "record_category")
data class Category(
        @Id
        var id: Int,
        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "user_id")
        var user: User,
        var name: String,
        var position: Int
)