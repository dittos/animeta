package net.animeta.backend.serializer

import net.animeta.backend.dto.PostDTO
import net.animeta.backend.model.History
import org.springframework.stereotype.Service

@Service
class PostSerializer(val userSerializer: UserSerializer, val recordSerializer: RecordSerializer) {
    fun serialize(history: History, includeRecord: Boolean = false, includeUser: Boolean = false): PostDTO {
        return PostDTO(
                id = history.id,
                record_id = history.record.id,
                status = history.status,
                status_type = history.status_type.name.toLowerCase(),
                comment = history.comment,
                updated_at = history.updatedAt?.toInstant()?.toEpochMilli(),
                contains_spoiler = history.contains_spoiler,
                record = if (includeRecord) recordSerializer.serialize(history.record) else null,
                user = if (includeUser) userSerializer.serialize(history.user, includeCategories = false) else null
        )
    }
}