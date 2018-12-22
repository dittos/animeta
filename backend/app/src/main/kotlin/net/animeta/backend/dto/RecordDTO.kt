package net.animeta.backend.dto

import com.fasterxml.jackson.annotation.JsonInclude

@JsonInclude(JsonInclude.Include.NON_NULL)
data class RecordDTO(
        val id: Int,
        val user_id: Int,
        val work_id: Int,
        val category_id: Int?,
        val title: String,
        val status: String,
        val status_type: String,
        val updated_at: Long?,
        val has_newer_episode: Boolean?,
        val user: UserDTO?,
        val rating: Int?
)