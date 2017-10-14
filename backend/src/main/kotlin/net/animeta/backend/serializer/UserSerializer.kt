package net.animeta.backend.serializer

import net.animeta.backend.dto.UserDTO
import net.animeta.backend.model.User
import org.springframework.stereotype.Service

@Service
class UserSerializer(val categorySerializer: CategorySerializer) {
    fun serialize(user: User, viewer: User?, includeCategories: Boolean = true) =
        UserDTO(
                id = user.id,
                name = user.username,
                date_joined = user.date_joined.toInstant().toEpochMilli(),
                is_twitter_connected = if (viewer != null && user.id == viewer.id) viewer.twitterSetting != null else null,
                categories = if (includeCategories) user.categories.map(categorySerializer::serialize) else null
        )
}