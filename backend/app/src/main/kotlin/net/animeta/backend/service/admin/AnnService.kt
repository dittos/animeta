package net.animeta.backend.service.admin

import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.google.common.cache.CacheBuilder
import com.google.common.cache.CacheLoader
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
import net.animeta.backend.service.WorkService
import org.jsoup.Jsoup
import org.jsoup.nodes.Element
import org.jsoup.parser.Parser
import org.springframework.http.HttpMethod
import org.springframework.http.client.OkHttp3ClientHttpRequestFactory
import org.springframework.stereotype.Service
import org.springframework.web.client.ResponseExtractor
import org.springframework.web.client.RestTemplate
import java.util.concurrent.TimeUnit

@Service
class AnnService(
    private val personRepository: PersonRepository,
    private val workStaffRepository: WorkStaffRepository,
    private val workCastRepository: WorkCastRepository,
    private val workService: WorkService
) {
    private val mapper = jacksonObjectMapper()
    private val restTemplate = RestTemplate(OkHttp3ClientHttpRequestFactory().apply {
        setConnectTimeout(0)
        setReadTimeout(0)
        setWriteTimeout(0)
    })
    private val cache = CacheBuilder.newBuilder()
        .expireAfterWrite(1, TimeUnit.DAYS)
        .build(object : CacheLoader<String, Element>() {
            override fun load(key: String): Element {
                return loadAll(listOf(key))[key]!!
            }

            override fun loadAll(keys: Iterable<String>): Map<String, Element> {
                val url = "https://cdn.animenewsnetwork.com/encyclopedia/api.xml?anime=${keys.joinToString("/")}"
                val doc = restTemplate.execute(url, HttpMethod.GET, null,
                    ResponseExtractor {
                        it.use {
                            Jsoup.parse(it.body, "UTF-8", "", Parser.xmlParser())
                        }
                    })
                return doc.select("anime").associateBy { it.attr("id") }
            }
        })

    fun getMetadata(annId: String): Element {
        return cache.get(annId)
    }

    fun getMetadata(annIds: Iterable<String>): Map<String, Element> {
        return cache.getAll(annIds)
    }

    fun importMetadata(work: Work, anime: Element) {
        val metadata = work.metadata?.let { mapper.readTree(it) as ObjectNode } ?: mapper.createObjectNode()
        metadata.put("ann_id", anime.attr("id"))
        if (!metadata.has("duration")) {
            anime.selectFirst("info[type=\"Running time\"]")?.text()?.toIntOrNull()?.let {
                if (it < 20) {
                    metadata.put("duration", it)
                }
            }
        }
        if (!metadata.has("schedule")) {
            anime.selectFirst("info[type=\"Vintage\"]")?.text()?.let {
                metadata.put("schedule", it)
            }
        }
        if (!metadata.has("website")) {
            anime.select("info[type=\"Official website\"][lang=\"JA\"]")
                .map { it.attr("href") }
                .firstOrNull { "twitter.com" !in it }
                ?.let {
                    metadata.put("website", it)
                }
        }
        if (!metadata.has("studio")) {
            val studios = anime.select("credit")
                .filter { it.selectFirst("task")?.text() == "Animation Production" }
                .mapNotNull { it.selectFirst("company")?.text() }
            if (studios.isNotEmpty()) {
                val array = metadata.putArray("studio")
                studios.forEach { array.add(it) }
            }
        }
        workService.editMetadata(work, mapper.writeValueAsString(metadata))

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