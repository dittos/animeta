package net.animeta.backend.model

import javax.persistence.*

@Entity
@Table(name = "connect_twittersetting")
data class TwitterSetting(
        @Id
        var id: Int,
        @OneToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "user_id")
        var user: User,
        var key: String,
        var secret: String
)