package net.animeta.backend.model

import javax.persistence.*

@Entity
@Table(name = "search_workperiodindex")
data class WorkPeriodIndex(
        @get:Id
        @get:GeneratedValue(strategy = GenerationType.IDENTITY)
        var id: Int? = null,
        @get:ManyToOne(fetch = FetchType.LAZY)
        @get:JoinColumn(name = "work_id")
        var work: Work,
        var period: String,
        @get:Column(name = "is_first_period")
        var firstPeriod: Boolean
)
