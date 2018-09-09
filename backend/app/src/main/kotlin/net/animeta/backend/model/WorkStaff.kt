package net.animeta.backend.model

import org.hibernate.annotations.Type
import javax.persistence.Column
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.JoinColumn
import javax.persistence.ManyToOne

@Entity
data class WorkStaff(
    @get:Id
    @get:GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null,

    @get:ManyToOne(fetch = FetchType.LAZY)
    @get:JoinColumn(name = "work_id", nullable = false)
    var work: Work,

    @get:Column(nullable = false)
    var task: String,

    @get:Column(nullable = false)
    var position: Int,

    @get:ManyToOne(fetch = FetchType.LAZY)
    @get:JoinColumn(name = "person_id", nullable = false)
    var person: Person,

    @get:Type(type = "jsonb")
    var metadata: String?
)