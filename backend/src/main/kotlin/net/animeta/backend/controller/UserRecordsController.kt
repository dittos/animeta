package net.animeta.backend.controller

import net.animeta.backend.dto.RecordDTO
import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.User
import net.animeta.backend.repository.UserRepository
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.serializer.RecordSerializer
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/v2/users/{name}/records")
class UserRecordsController(val userRepository: UserRepository,
                            val recordSerializer: RecordSerializer) {
    @GetMapping
    fun get(@PathVariable name: String,
            @CurrentUser(required = false) currentUser: User?,
            @RequestParam("include_has_newer_episode", defaultValue = "false") includeHasNewerEpisodeParam: Boolean): List<RecordDTO> {
        val user = userRepository.findByUsername(name) ?: throw ApiException.notFound()
        val includeHasNewerEpisode = includeHasNewerEpisodeParam && currentUser?.id == user.id
        return user.records.map { recordSerializer.serialize(it, includeHasNewerEpisode = includeHasNewerEpisode) }
    }
}