package net.animeta.backend.dto

import com.fasterxml.jackson.annotation.JsonInclude
import com.fasterxml.jackson.annotation.JsonProperty

@JsonInclude(JsonInclude.Include.NON_NULL)
data class UserDTO(
        val id: Int,
        val name: String,
        val date_joined: Long,
        @get:JsonProperty("is_twitter_connected")
        val is_twitter_connected: Boolean?,
        val connected_services: List<String>?,
        val categories: List<CategoryDTO>?,
        val record_count: Int?,
        val history_count: Int?
)