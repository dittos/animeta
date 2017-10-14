package net.animeta.backend.exception

import net.animeta.backend.dto.ErrorDTO
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler

@ControllerAdvice
class ApiExceptionHandler {
    @ExceptionHandler(ApiException::class)
    fun handle(e: ApiException): ResponseEntity<ErrorDTO> {
        return ResponseEntity.status(e.status).body(ErrorDTO(message = e.message, extra = e.extra))
    }
}