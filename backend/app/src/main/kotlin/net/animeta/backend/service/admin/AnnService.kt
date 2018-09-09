package net.animeta.backend.service.admin

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import net.animeta.backend.metadata.PersonMetadata
import net.animeta.backend.metadata.WorkCastMetadata
import net.animeta.backend.metadata.WorkStaffMetadata
import net.animeta.backend.model.Person
import net.animeta.backend.model.Work
import net.animeta.backend.model.WorkCast
import net.animeta.backend.model.WorkStaff
import net.animeta.backend.repository.PersonRepository
import net.animeta.backend.repository.WorkCastRepository
import net.animeta.backend.repository.WorkStaffRepository
import org.jsoup.Jsoup
import org.jsoup.nodes.Element
import org.jsoup.parser.Parser
import org.springframework.http.HttpMethod
import org.springframework.http.client.OkHttp3ClientHttpRequestFactory
import org.springframework.stereotype.Service
import org.springframework.web.client.ResponseExtractor
import org.springframework.web.client.RestTemplate

@Service
class AnnService(
    private val personRepository: PersonRepository,
    private val workStaffRepository: WorkStaffRepository,
    private val workCastRepository: WorkCastRepository
) {
    private val mapper = jacksonObjectMapper()
    private val restTemplate = RestTemplate(OkHttp3ClientHttpRequestFactory().apply {
        setConnectTimeout(0)
        setReadTimeout(0)
        setWriteTimeout(0)
    })

    fun getMetadata(annId: String): Element? {
        return getMetadata(listOf(annId))[annId]
    }

    fun getMetadata(annIds: Iterable<String>): Map<String, Element> {
        val url = "https://cdn.animenewsnetwork.com/encyclopedia/api.xml?anime=${annIds.joinToString("/")}"
        val doc = restTemplate.execute(url, HttpMethod.GET, null,
            ResponseExtractor {
                it.use {
                    Jsoup.parse(it.body, "UTF-8", "", Parser.xmlParser())
                }
            })
        return doc.select("anime").associateBy { it.attr("id") }
    }

    fun importMetadata(work: Work, anime: Element) {
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