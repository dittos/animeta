package net.animeta.backend.dto

import com.fasterxml.jackson.annotation.JsonInclude

data class Episode(val number: Int, val post_count: Int?)

data class WorkLinks(val website: String?, val namu: String?, val ann: String?)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class WorkSchedule(val date: Long?, val date_only: Boolean?, val broadcasts: List<String>?)

enum class CreditType {
    ORIGINAL_WORK,
    CHIEF_DIRECTOR,
    SERIES_DIRECTOR,
    DIRECTOR,
    SERIES_COMPOSITION,
    CHARACTER_DESIGN,
    MUSIC,
}

data class Credit(val type: CreditType, val name: String, val personId: Int)

data class WorkMetadata(val title: String,
                        val links: WorkLinks,
                        val studios: List<String>?,
                        val source: String?,
                        val schedule: Map<String, WorkSchedule?>?,
                        val durationMinutes: Int?,
                        val credits: List<Credit>)

data class WorkCredit(val workId: Int, val workTitle: String, val type: CreditType)

sealed class Recommendation {
    data class ByCredit(val credit: Credit, val related: List<WorkCredit>, val score: Int) : Recommendation()
}

data class WorkDTO(
        val id: Int,
        val title: String,
        val image_url: String?,
        val image_center_y: Double,
        val alt_titles: List<String>?,
        val episodes: List<Episode>?,
        val record_count: Int,
        val rank: Int?,
        val record: RecordDTO?,
        val metadata: WorkMetadata?,
        val recommendations: List<Recommendation>? = null,
        val recommendationScore: Int = 0
)