package net.animeta.backend.dto

import com.fasterxml.jackson.annotation.JsonInclude

data class Episode(val number: Int, val post_count: Int?)

data class WorkLinks(val website: String?, val namu: String?, val ann_id: String?)

@JsonInclude(JsonInclude.Include.NON_EMPTY)
data class WorkSchedule(val date: Long?, val date_only: Boolean?, val broadcasts: List<String>?)

data class WorkMetadata(val title: String,
                        val links: WorkLinks,
                        val studios: List<String>?,
                        val source: String?,
                        val schedule: Map<String, WorkSchedule?>?)

data class WorkDTO(
        val id: Int,
        val title: String,
        val image_url: String?,
        val alt_titles: List<String>?,
        val episodes: List<Episode>?,
        val record_count: Int,
        val rank: Int?,
        val record: RecordDTO?,
        val metadata: WorkMetadata?
)