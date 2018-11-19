package net.animeta.backend.serializer

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.google.common.net.UrlEscapers
import net.animeta.backend.dto.WorkDTO
import net.animeta.backend.dto.WorkLinks
import net.animeta.backend.dto.WorkMetadataDTO
import net.animeta.backend.dto.WorkSchedule
import net.animeta.backend.metadata.WorkMetadata
import net.animeta.backend.model.User
import net.animeta.backend.model.Work
import net.animeta.backend.repository.RecordRepository
import net.animeta.backend.repository.WorkIndexRepository
import net.animeta.backend.service.WorkService
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service
import java.io.IOException
import java.time.ZoneId

@Service
class WorkSerializer(val workService: WorkService,
                     val recordRepository: RecordRepository,
                     val workIndexRepository: WorkIndexRepository,
                     val recordSerializer: RecordSerializer,
                     val objectMapper: ObjectMapper,
                     @Value("\${animeta.media.base_url}") private val mediaBaseUrl: String) {
    private val defaultTimeZone = ZoneId.of("Asia/Seoul")

    fun serialize(work: Work, viewer: User? = null, full: Boolean = false): WorkDTO {
        val index = workIndexRepository.findOneByWorkId(work.id!!)
        return WorkDTO(
                id = work.id!!,
                title = work.title,
                image_url = getImageUrl(work),
                image_center_y = work.image_center_y,
                episodes = if (full) workService.getEpisodes(work) else null,
                record_count = index?.record_count ?: recordRepository.countByWorkId(work.id!!),
                rank = index?.rank,
                record = if (viewer != null) {
                    recordRepository.findOneByWorkIdAndUser(work.id!!, viewer)
                            ?.let { recordSerializer.serialize(it, RecordSerializer.legacyOptions()) }
                } else {
                    null
                },
                metadata = if (work.metadata != null) {
                    try {
                        work.metadata?.let { objectMapper.readValue<WorkMetadata>(it) }
                            ?.let { serializeMetadata(work, it) }
                    } catch (e: IOException) {
                        null
                    }
                } else {
                    null
                }
        )
    }

    fun getImageUrl(work: Work): String? {
        if (work.image_filename != null)
            return mediaBaseUrl + work.image_filename
        return null
    }

    fun serializeMetadata(work: Work, metadata: WorkMetadata): WorkMetadataDTO {
        val title = metadata.title ?: work.title

        val links = WorkLinks(
                website = metadata.website,
                namu = metadata.namuRef?.let { namuLink(it) },
                ann = metadata.annId?.let { "http://www.animenewsnetwork.com/encyclopedia/anime.php?id=${it}" }
        )

        return WorkMetadataDTO(
            title = title,
            links = links,
            studios = metadata.studios,
            source = metadata.source,
            schedule = metadata.schedules?.mapValues { (_, v) ->
                WorkSchedule(
                    date = v.date?.atZone(defaultTimeZone)?.toInstant()?.toEpochMilli(),
                    date_only = v.datePrecision?.let { it == WorkMetadata.Schedule.DatePrecision.DATE },
                    broadcasts = v.broadcasts
                )
            } ?: emptyMap(),
            durationMinutes = metadata.durationMinutes
        )
    }

    fun namuLink(ref: String): String {
        val page = ref.substringBeforeLast('#')
        val anchor = ref.substringAfterLast('#', "")
        val url = "https://namu.wiki/w/${UrlEscapers.urlPathSegmentEscaper().escape(page)}"
        if (anchor.isNotEmpty()) {
            return "${url}#${UrlEscapers.urlFragmentEscaper().escape(anchor)}"
        } else {
            return url
        }
    }
}
