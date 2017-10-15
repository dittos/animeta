package net.animeta.backend.serializer

import net.animeta.backend.dto.RecordDTO
import net.animeta.backend.model.Record
import org.springframework.stereotype.Service

@Service
class RecordSerializer(val userSerializer: UserSerializer) {
    fun serialize(record: Record, includeHasNewerEpisode: Boolean = false, includeUser: Boolean = false): RecordDTO {
        return RecordDTO(
                id = record.id,
                user_id = record.user.id,
                work_id = record.work.id,
                category_id = record.category?.id,
                title = record.title,
                status = record.status,
                status_type = record.status_type.name.toLowerCase(),
                updated_at = record.updated_at?.toInstant()?.toEpochMilli(),
                has_newer_episode = if (includeHasNewerEpisode) false else null, // TODO
                user = if (includeUser) userSerializer.serialize(record.user, includeCategories = true) else null
        )
    }
}