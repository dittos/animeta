package net.animeta.backend.exception

import org.springframework.http.HttpStatus

data class ApiException(override val message: String, val status: HttpStatus, val extra: Any? = null) : Exception(message) {
    companion object {
        fun notFound() = ApiException("Not found.", HttpStatus.NOT_FOUND)
        fun permissionDenied() = ApiException("Permission denied.", HttpStatus.FORBIDDEN)
    }
}