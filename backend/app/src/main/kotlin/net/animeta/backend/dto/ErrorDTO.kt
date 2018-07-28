package net.animeta.backend.dto

import com.fasterxml.jackson.annotation.JsonInclude

@JsonInclude(JsonInclude.Include.NON_NULL)
data class ErrorDTO(val message: String, val extra: Any? = null)