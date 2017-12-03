package net.animeta.backend.controller.v2

import net.animeta.backend.dto.WorkDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.User
import net.animeta.backend.repository.TitleMappingRepository
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.WorkSerializer
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v2/works/by-title")
class WorkByTitleController(val titleMappingRepository: TitleMappingRepository, val workSerializer: WorkSerializer) {
    @GetMapping
    fun get(@RequestParam title: String, @CurrentUser(required = false) currentUser: User?): WorkDTO {
        val work = titleMappingRepository.findOneByTitle(title)?.work ?: throw ApiException.notFound()
        return workSerializer.serialize(work, currentUser, full = true)
    }
}