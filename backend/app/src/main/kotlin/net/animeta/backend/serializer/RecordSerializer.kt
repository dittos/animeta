package net.animeta.backend.serializer

import net.animeta.backend.dto.RecordDTO
import net.animeta.backend.model.Record
import net.animeta.backend.model.StatusType
import net.animeta.backend.repository.HistoryRepository
import org.springframework.stereotype.Service

@Service
class RecordSerializer(val userSerializer: UserSerializer,
                       val historyRepository: HistoryRepository) {
    data class Options(val hasNewerEpisode: Boolean = false, val user: UserSerializer.Options? = null)

    companion object {
        fun legacyOptions(includeHasNewerEpisode: Boolean = false, includeUser: Boolean = false,
                          includeUserStats: Boolean = false) =
                Options(
                        hasNewerEpisode = includeHasNewerEpisode,
                        user = if (includeUser) {
                            UserSerializer.legacyOptions(includeCategories = true, includeStats = includeUserStats)
                        } else {
                            null
                        }
                )
    }

    fun serialize(record: Record, options: Options): RecordDTO {
        return RecordDTO(
            id = record.id!!,
            user_id = record.user.id!!,
            work_id = record.workId,
            category_id = record.category?.id,
            title = record.title,
            status = record.status,
            status_type = record.status_type.name.toLowerCase(),
            updated_at = record.updated_at?.toInstant()?.toEpochMilli(),
            has_newer_episode = if (options.hasNewerEpisode) hasNewerEpisode(record) else null,
            user = if (options.user != null) userSerializer.serialize(record.user, options = options.user) else null,
            rating = record.rating
        )
    }

    fun hasNewerEpisode(record: Record): Boolean {
        if (record.status_type != StatusType.WATCHING)
            return false

        val episode = record.status.toIntOrNull() ?: return false
        val updatedAt = record.updated_at ?: return false
        return historyRepository.existsByWorkIdAndStatusAndUpdatedAtGreaterThan(record.workId, (episode + 1).toString(), updatedAt)
    }
}