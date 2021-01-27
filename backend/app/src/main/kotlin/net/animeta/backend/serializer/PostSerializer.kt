package net.animeta.backend.serializer

import net.animeta.backend.dto.PostDTO
import net.animeta.backend.model.History
import org.springframework.stereotype.Service

@Service
class PostSerializer(val userSerializer: UserSerializer, val recordSerializer: RecordSerializer) {
    data class Options(val record: RecordSerializer.Options? = null, val user: UserSerializer.Options? = null)

    companion object {
        fun legacyOptions(includeRecord: Boolean = false, includeUser: Boolean = false) =
                Options(
                        record = if (includeRecord) RecordSerializer.legacyOptions() else null,
                        user = if (includeUser) UserSerializer.legacyOptions(includeCategories = false) else null
                )
    }

    fun serialize(history: History, options: Options): PostDTO {
        return PostDTO(
            id = history.id!!,
            record_id = history.record.id!!,
            status = history.status,
            status_type = history.status_type.name.toLowerCase(),
            comment = history.comment,
            updated_at = history.updatedAt?.toEpochMilli(),
            contains_spoiler = history.contains_spoiler,
            record = if (options.record != null) recordSerializer.serialize(history.record, options.record) else null,
            user = if (options.user != null) userSerializer.serialize(history.user, options = options.user) else null,
            rating = history.rating
        )
    }
}