package net.animeta.backend.controller.v3

import net.animeta.backend.model.User
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.service.BackupService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.context.request.async.WebAsyncTask

@RestController
class CreateBackupController(
    private val backupService: BackupService
) {
    data class Result(
        val downloadUrl: String
    )

    @PostMapping("/v3/CreateBackup")
    fun handle(@CurrentUser currentUser: User) = WebAsyncTask<Result>(null, "backupTaskExecutor") {
        val result = backupService.create(currentUser)
        Result(downloadUrl = result.toString())
    }
}
