package net.animeta.backend.controller.v2

import net.animeta.backend.model.User
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.service.BackupService
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.context.request.async.WebAsyncTask

@RestController
@RequestMapping("/v2/backups")
class BackupController(private val backupService: BackupService) {
    @PostMapping
    fun create(@CurrentUser currentUser: User) = WebAsyncTask<ResponseEntity<Void>>(null, "backupTaskExecutor") {
        val result = backupService.create(currentUser)
        ResponseEntity.created(result).build()
    }
}
