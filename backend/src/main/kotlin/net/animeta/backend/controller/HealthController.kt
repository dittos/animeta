package net.animeta.backend.controller

import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class HealthController {
    @GetMapping("/health")
    fun healthy() = "Hello world"

    @GetMapping("/sick")
    fun error(): String = throw RuntimeException("test")
}