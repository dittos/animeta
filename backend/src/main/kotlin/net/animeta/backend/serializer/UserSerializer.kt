package net.animeta.backend.serializer

import net.animeta.backend.dto.UserDTO
import net.animeta.backend.model.User
import org.springframework.stereotype.Service

@Service
class UserSerializer(val categorySerializer: CategorySerializer) {
    fun serialize(user: User, viewer: User?, includeCategories: Boolean = true): UserDTO {
        val isViewer = viewer != null && user.id == viewer.id
        return UserDTO(
                id = user.id,
                name = user.username,
                date_joined = user.date_joined.toInstant().toEpochMilli(),
                is_twitter_connected = if (isViewer) viewer!!.twitterSetting != null else null,
                connected_services = if (isViewer) { if (viewer!!.twitterSetting != null) listOf("twitter") else listOf() } else null,
                categories = if (includeCategories) user.categories.map(categorySerializer::serialize) else null
        )
    }
}