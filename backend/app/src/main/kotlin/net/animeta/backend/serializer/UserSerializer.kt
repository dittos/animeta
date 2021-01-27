package net.animeta.backend.serializer

import net.animeta.backend.dto.UserDTO
import net.animeta.backend.model.User
import net.animeta.backend.repository.HistoryRepository
import net.animeta.backend.repository.RecordRepository
import org.springframework.stereotype.Service

@Service
class UserSerializer(val categorySerializer: CategorySerializer,
                     val recordRepository: RecordRepository,
                     val historyRepository: HistoryRepository) {
    data class Options(val categories: Boolean = false, val stats: Boolean = false, val twitter: Boolean = false)

    companion object {
        fun legacyOptions(includeCategories: Boolean = true, includeStats: Boolean = false) =
                Options(categories = includeCategories, stats = includeStats, twitter = true)
    }

    fun serialize(user: User, viewer: User? = null, options: Options): UserDTO {
        val isViewer = viewer != null && user.id == viewer.id
        return UserDTO(
                id = user.id!!,
                name = user.username,
                date_joined = user.date_joined.toEpochMilli(),
                is_twitter_connected = if (isViewer && options.twitter) !viewer!!.twitterSettings.isEmpty() else null,
                categories = if (options.categories) user.categories.map(categorySerializer::serialize) else null,
                record_count = if (options.stats) recordRepository.countByUser(user) else null,
                history_count = if (options.stats) historyRepository.countByUser(user) else null
        )
    }
}