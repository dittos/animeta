package net.animeta.backend.model

import javax.persistence.*

@Entity
@Table(name = "connect_twittersetting")
data class TwitterSetting(
        @get:Id
        @get:GeneratedValue(strategy = GenerationType.IDENTITY)
        var id: Int? = null,
        @get:ManyToOne(fetch = FetchType.LAZY)
        @get:JoinColumn(name = "user_id")
        var user: User,
        var key: String,
        var secret: String
)