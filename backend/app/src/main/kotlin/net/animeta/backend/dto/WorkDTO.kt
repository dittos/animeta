package net.animeta.backend.dto

import com.fasterxml.jackson.annotation.JsonInclude
import net.animeta.backend.metadata.WorkMetadata

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
    MUSIC;

    companion object {
        private val taskToCreditType = mapOf(
            "chief director" to CreditType.CHIEF_DIRECTOR,
            "series director" to CreditType.SERIES_DIRECTOR,
            "director" to CreditType.DIRECTOR,
            "character design" to CreditType.CHARACTER_DESIGN,
            "animation character design" to CreditType.CHARACTER_DESIGN,
            "music" to CreditType.MUSIC,
            "series composition" to CreditType.SERIES_COMPOSITION,
            "original creator" to CreditType.ORIGINAL_WORK,
            "original work" to CreditType.ORIGINAL_WORK,
            "original story" to CreditType.ORIGINAL_WORK,
            "original manga" to CreditType.ORIGINAL_WORK
        )

        fun fromTask(task: String): CreditType? {
            return taskToCreditType[task.toLowerCase()]
        }
    }
}

data class WorkMetadataDTO(val title: String,
                           val links: WorkLinks,
                           val studios: List<String>?,
                           val source: WorkMetadata.SourceType?,
                           val schedule: Map<String, WorkSchedule?>?,
                           val durationMinutes: Int?)

data class Credit(val type: CreditType, val name: String, val personId: Int)

data class WorkCredit(val workId: Int, val workTitle: String, val type: CreditType)

sealed class Recommendation {
    data class ByCredit(val credit: Credit, val related: List<WorkCredit>, val score: Int) : Recommendation()
}

data class WorkDTO(
    val id: Int,
    val title: String,
    val image_url: String?,
    val image_center_y: Double,
    val episodes: List<Episode>?,
    val record_count: Int,
    val rank: Int?,
    val record: RecordDTO?,
    val metadata: WorkMetadataDTO?,
    val recommendations: List<Recommendation>? = null,
    val recommendationScore: Int = 0
)