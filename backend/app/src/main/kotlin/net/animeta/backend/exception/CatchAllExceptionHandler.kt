package net.animeta.backend.exception

import net.animeta.backend.dto.ErrorDTO
import org.slf4j.LoggerFactory
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.ControllerAdvice
import org.springframework.web.bind.annotation.ExceptionHandler

@ControllerAdvice
class CatchAllExceptionHandler {
    private val logger = LoggerFactory.getLogger(CatchAllExceptionHandler::class.java)

    @ExceptionHandler(Exception::class)
    fun handle(e: Exception): ResponseEntity<ErrorDTO> {
        logger.error(e.message, e)
        return ResponseEntity.status(500)
                .body(ErrorDTO(message = e.message ?: "Internal Server Error"))
    }
}