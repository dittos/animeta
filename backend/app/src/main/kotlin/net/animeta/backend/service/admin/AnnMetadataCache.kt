package net.animeta.backend.service.admin

import com.google.common.cache.CacheBuilder
import com.google.common.cache.CacheLoader
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
class AnnMetadataCache {
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
}