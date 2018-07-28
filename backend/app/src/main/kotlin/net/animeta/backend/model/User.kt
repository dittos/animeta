package net.animeta.backend.model

import java.sql.Timestamp
import javax.persistence.*

@Entity
@Table(name = "auth_user")
data class User(
        @get:Id
        @get:GeneratedValue(strategy = GenerationType.IDENTITY)
        var id: Int? = null,
        var username: String,
        var first_name: String = "",
        var last_name: String = "",
        var email: String = "",
        var password: String = "",
        @get:Column(name = "is_staff")
        var staff: Boolean = false,
        @get:Column(name = "is_active")
        var active: Boolean = true,
        @get:Column(name = "is_superuser")
        var superuser: Boolean = false,
        var last_login: Timestamp? = null,
        var date_joined: Timestamp
) {
        @get:OneToMany(fetch = FetchType.LAZY, mappedBy = "user")
        var twitterSettings: List<TwitterSetting> = listOf()

        @get:OneToMany(fetch = FetchType.LAZY, mappedBy = "user")
        @get:OrderBy("position, id")
        var categories: List<Category> = listOf()

        @get:OneToMany(fetch = FetchType.LAZY, mappedBy = "user")
        var records: List<Record> = listOf()
}