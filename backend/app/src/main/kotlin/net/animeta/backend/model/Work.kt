package net.animeta.backend.model

import net.animeta.backend.db.JSONBUserType
import org.hibernate.annotations.Type
import org.hibernate.annotations.TypeDef
import javax.persistence.CascadeType
import javax.persistence.Entity
import javax.persistence.FetchType
import javax.persistence.GeneratedValue
import javax.persistence.GenerationType
import javax.persistence.Id
import javax.persistence.OneToMany
import javax.persistence.OrderBy
import javax.persistence.Table

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
        var image_center_y: Double = 0.0,
        var raw_metadata: String?,
        @get:Type(type = "jsonb")
        var metadata: String?,
        var blacklisted: Boolean,
        var first_period: String? = null
) {
    @get:OneToMany(fetch = FetchType.LAZY, mappedBy = "work", cascade = [CascadeType.ALL], orphanRemoval = true)
    var periodIndexes: MutableList<WorkPeriodIndex> = mutableListOf()

    @get:OneToMany(fetch = FetchType.LAZY, mappedBy = "work", cascade = [CascadeType.REMOVE], orphanRemoval = true)
    var titleMappings: MutableList<TitleMapping> = mutableListOf()

    @get:OneToMany(fetch = FetchType.LAZY, mappedBy = "work", cascade = [CascadeType.REMOVE], orphanRemoval = true)
    @get:OrderBy("position")
    var casts: MutableList<WorkCast> = mutableListOf()

    @get:OneToMany(fetch = FetchType.LAZY, mappedBy = "work", cascade = [CascadeType.REMOVE], orphanRemoval = true)
    @get:OrderBy("position")
    var staffs: MutableList<WorkStaff> = mutableListOf()

    @get:OneToMany(fetch = FetchType.LAZY, mappedBy = "work", cascade = [CascadeType.ALL], orphanRemoval = true)
    @get:OrderBy("position")
    var companies: MutableList<WorkCompany> = mutableListOf()
}
