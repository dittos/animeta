package net.animeta.backend.model

import org.hibernate.annotations.Type
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id

@Entity
data class Company(
    @get:Id
    @get:GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null,

    @get:Column(nullable = false)
    var name: String,

    @get:Type(type = "jsonb")
    var metadata: String?,

    var annId: Int?
)