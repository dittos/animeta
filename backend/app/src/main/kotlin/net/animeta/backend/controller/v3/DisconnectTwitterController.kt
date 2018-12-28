package net.animeta.backend.controller.v3

import net.animeta.backend.model.User
import net.animeta.backend.security.CurrentUser
import net.animeta.backend.service.TwitterService
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RestController

@RestController
class DisconnectTwitterController(
    private val twitterService: TwitterService
) {
    data class Result(
        val ok: Boolean
    )

    @PostMapping("/v3/DisconnectTwitter")
    @Transactional
    fun handle(@CurrentUser currentUser: User): Result {
        twitterService.removeOAuthAuthorization(currentUser)
        return Result(true)
    }
}
