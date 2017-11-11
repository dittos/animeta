package net.animeta.backend.model

import java.sql.Timestamp
import javax.persistence.*

@Entity
@Table(name = "auth_user")
data class User(
        @get:Id
        var id: Int,
        var username: String,
        var date_joined: Timestamp,

        @get:OneToMany(fetch = FetchType.LAZY, mappedBy = "user")
        var twitterSettings: List<TwitterSetting>,

        @get:OneToMany(fetch = FetchType.LAZY, mappedBy = "user")
        @get:OrderBy("position, id")
        var categories: List<Category>
)