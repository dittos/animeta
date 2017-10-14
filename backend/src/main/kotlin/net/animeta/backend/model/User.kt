package net.animeta.backend.model

import java.sql.Timestamp
import javax.persistence.*

@Entity
@Table(name = "auth_user")
data class User(
        @Id
        var id: Int,
        var username: String,
        var date_joined: Timestamp,

        @OneToOne(fetch = FetchType.LAZY, mappedBy = "user")
        var twitterSetting: TwitterSetting?,

        @OneToMany(fetch = FetchType.LAZY, mappedBy = "user")
        var categories: List<Category>
)