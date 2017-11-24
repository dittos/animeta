package net.animeta.backend.controller

import net.animeta.backend.exception.ApiException
import net.animeta.backend.model.User
import net.animeta.backend.security.CurrentUser
import org.springframework.web.bind.annotation.DeleteMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import javax.persistence.EntityManager

@RestController
@RequestMapping("/v2/me/external-services")
class ExternalServicesController(private val entityManager: EntityManager) {
    data class DeleteTwitterResponse(val ok: Boolean)

    @DeleteMapping("/twitter")
    fun deleteTwitter(@CurrentUser currentUser: User): DeleteTwitterResponse {
        val twitterSetting = currentUser.twitterSettings.firstOrNull() ?: throw ApiException.notFound()
        entityManager.remove(twitterSetting)
        return DeleteTwitterResponse(ok = true)
    }
}