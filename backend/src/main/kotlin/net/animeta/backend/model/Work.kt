package net.animeta.backend.model

import javax.persistence.*

@Entity
@Table(name = "work_work")
data class Work(
        @get:Id
        var id: Int,
        @get:OneToMany(fetch = FetchType.LAZY)
        @get:JoinColumn(name = "work_id")
        var indexes: List<WorkIndex>
)