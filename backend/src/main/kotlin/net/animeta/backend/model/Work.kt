package net.animeta.backend.model

import javax.persistence.*

@Entity
@Table(name = "work_work")
data class Work(
        @get:Id
        var id: Int,
        var title: String,
        var image_filename: String?,
        var metadata: String?
) {
        @get:OneToMany(fetch = FetchType.LAZY)
        @get:JoinColumn(name = "work_id")
        var indexes: List<WorkIndex> = listOf()

        @get:OneToMany(fetch = FetchType.LAZY, mappedBy = "work")
        var histories: List<History> = listOf()

        @get:OneToMany(fetch = FetchType.LAZY, mappedBy = "work")
        var titleMappings: List<TitleMapping> = listOf()
}