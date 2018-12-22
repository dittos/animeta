package net.animeta.backend.dto

import com.fasterxml.jackson.annotation.JsonInclude

@JsonInclude(JsonInclude.Include.NON_NULL)
data class PostDTO(
        val id: Int,
        val record_id: Int,
        val status: String,
        val status_type: String,
        val comment: String,
        val updated_at: Long?,
        val contains_spoiler: Boolean,
        val record: RecordDTO?,
        val user: UserDTO?,
        val rating: Int?
)