package net.animeta.backend.model

import net.animeta.backend.db.JSONBUserType
import org.hibernate.annotations.Type
import org.hibernate.annotations.TypeDef
import javax.persistence.*

@Entity
@Table(name = "work_work")
@TypeDef(name = "jsonb", typeClass = JSONBUserType::class)
data class Work(
        @get:Id
        @get:GeneratedValue(strategy = GenerationType.IDENTITY)
        var id: Int? = null,
        var title: String,
        var image_filename: String?,
        var original_image_filename: String? = null,
        var raw_metadata: String?,
        @get:Type(type = "jsonb")
        var metadata: String?,
        var blacklisted: Boolean
) {
    @get:OneToMany(fetch = FetchType.LAZY, mappedBy = "work", cascade = arrayOf(CascadeType.REMOVE), orphanRemoval = true)
    var indexes: List<WorkIndex> = listOf()

    @get:OneToMany(fetch = FetchType.LAZY, mappedBy = "work", cascade = arrayOf(CascadeType.REMOVE), orphanRemoval = true)
    var titleIndexes: List<WorkTitleIndex> = listOf()

    @get:OneToMany(fetch = FetchType.LAZY, mappedBy = "work")
    var histories: List<History> = listOf()

    @get:OneToMany(fetch = FetchType.LAZY, mappedBy = "work", cascade = arrayOf(CascadeType.REMOVE), orphanRemoval = true)
    var titleMappings: MutableList<TitleMapping> = mutableListOf()
}