package net.animeta.backend.model

import com.fasterxml.jackson.annotation.JsonIgnore
import org.hibernate.annotations.Type
import javax.persistence.Column
import javax.persistence.ElementCollection
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.OneToMany
import javax.persistence.OrderBy

@Entity
data class Company(
    @get:Id
    @get:GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null,

    @get:Column(nullable = false)
    var name: String,

    @get:Type(type = "jsonb")
    var metadata: String?,

    @Deprecated("Use annIds")
    var annId: Int?,

    @get:ElementCollection(fetch = FetchType.EAGER)
    var annIds: Set<Int> = emptySet()
) {
    @get:JsonIgnore
    @get:OneToMany(fetch = FetchType.LAZY, mappedBy = "company")
    @get:OrderBy("position")
    var works: MutableList<WorkCompany> = mutableListOf()
}