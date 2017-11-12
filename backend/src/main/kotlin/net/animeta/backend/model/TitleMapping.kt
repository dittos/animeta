package net.animeta.backend.model

import javax.persistence.*

@Entity
@Table(name = "work_titlemapping")
data class TitleMapping(
        @get:Id
        @get:GeneratedValue(strategy = GenerationType.IDENTITY)
        var id: Int? = null,
        @get:ManyToOne(fetch = FetchType.LAZY)
        @get:JoinColumn(name = "work_id")
        var work: Work,
        var title: String,
        var key: String
)