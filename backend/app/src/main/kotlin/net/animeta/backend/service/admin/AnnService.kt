package net.animeta.backend.service.admin

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import net.animeta.backend.metadata.PersonMetadata
import net.animeta.backend.metadata.WorkCastMetadata
import net.animeta.backend.metadata.WorkMetadata
import net.animeta.backend.metadata.WorkStaffMetadata
import net.animeta.backend.model.Person
import net.animeta.backend.model.Work
import net.animeta.backend.model.WorkCast
import net.animeta.backend.model.WorkStaff
import net.animeta.backend.repository.PersonRepository
import net.animeta.backend.repository.WorkCastRepository
import net.animeta.backend.repository.WorkStaffRepository
import net.animeta.backend.service.WorkService
import org.jsoup.nodes.Element
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.YearMonth

@Service
class AnnService(
    private val personRepository: PersonRepository,
    private val workStaffRepository: WorkStaffRepository,
    private val workCastRepository: WorkCastRepository,
    private val workService: WorkService,
    private val mapper: ObjectMapper
) {
    fun importMetadata(work: Work, anime: Element) {
        val metadata = work.metadata?.let { mapper.readValue<WorkMetadata>(it) } ?: WorkMetadata()
        val durationMinutes = metadata.durationMinutes ?:
            anime.selectFirst("info[type=\"Running time\"]")?.text()?.toIntOrNull()?.takeIf { it < 20 }
        val schedules = anime.selectFirst("info[type=\"Vintage\"]")?.text()?.let { s ->
            val schedule = "^\\d{4}-\\d{2}-\\d{2}".toRegex().find(s)?.let {
                WorkMetadata.Schedule(
                    date = LocalDate.parse(it.value).atStartOfDay(),
                    datePrecision = WorkMetadata.Schedule.DatePrecision.DATE,
                    broadcasts = null
                )
            } ?: "^\\d{4}-\\d{2}".toRegex().find(s)?.let {
                WorkMetadata.Schedule(
                    date = YearMonth.parse(it.value).atDay(1).atStartOfDay(),
                    datePrecision = WorkMetadata.Schedule.DatePrecision.YEAR_MONTH,
                    broadcasts = null
                )
            }
            schedule?.let { mapOf("jp" to it) }
        }.orEmpty() + metadata.schedules.orEmpty()
        val website = metadata.website ?:
            anime.select("info[type=\"Official website\"][lang=\"JA\"]")
                .map { it.attr("href") }
                .firstOrNull { "twitter.com" !in it }
        val studios = metadata.studios ?:
            anime.select("credit")
                .filter { it.selectFirst("task")?.text() == "Animation Production" }
                .mapNotNull { it.selectFirst("company")?.text() }
                .takeIf { it.isNotEmpty() }
        workService.editMetadata(work, metadata.copy(
            durationMinutes = durationMinutes,
            schedules = schedules,
            website = website,
            studios = studios
        ))

        val staffsByGid = work.staffs.associateBy { mapper.readValue(it.metadata, WorkStaffMetadata::class.java).annGid }
        val castsByGid = work.casts.associateBy { mapper.readValue(it.metadata, WorkCastMetadata::class.java).annGid }
        val staffs = anime.select("staff").mapIndexed { index, staffEl ->
            val personEl = staffEl.selectFirst("person")
            val person = getOrCreatePerson(
                name = personEl.text().trim(),
                annId = personEl.attr("id").toInt()
            )
            val gid = staffEl.attr("gid")
            staffsByGid[gid] ?: WorkStaff(
                work = work,
                task = staffEl.selectFirst("task").text(),
                position = index,
                person = person,
                metadata = mapper.writeValueAsString(WorkStaffMetadata(annGid = gid))
            )
        }
        workStaffRepository.saveAll(staffs)

        require(anime.select("cast").toList().all { it.hasAttr("lang") })
        val casts = anime.select("cast[lang=\"JA\"]").mapIndexed { index, castEl ->
            val personEl = castEl.selectFirst("person")
            val person = getOrCreatePerson(
                name = personEl.text().trim(),
                annId = personEl.attr("id").toInt()
            )
            val gid = castEl.attr("gid")
            castsByGid[gid] ?: WorkCast(
                work = work,
                role = castEl.selectFirst("role").text(),
                position = index,
                actor = person,
                metadata = mapper.writeValueAsString(WorkStaffMetadata(annGid = gid))
            )
        }
        workCastRepository.saveAll(casts)
    }

    private fun getOrCreatePerson(name: String, annId: Int): Person {
        return personRepository.findOneByAnnId(annId) ?: personRepository.save(Person(
            name = name,
            metadata = mapper.writeValueAsString(PersonMetadata(name_en = name)),
            annId = annId
        ))
    }
}