package net.animeta.backend.service.admin

import com.google.common.io.Files
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.io.Resource
import org.springframework.core.io.WritableResource
import org.springframework.http.HttpMethod
import org.springframework.http.client.OkHttp3ClientHttpRequestFactory
import org.springframework.stereotype.Service
import org.springframework.web.client.ResponseExtractor
import org.springframework.web.client.RestTemplate
import org.w3c.dom.NodeList
import java.io.*
import javax.xml.parsers.DocumentBuilderFactory
import javax.xml.xpath.XPathConstants
import javax.xml.xpath.XPathFactory

@Service
class ImageService constructor (@Value("\${animeta.media.root_location}") private val mediaRoot: Resource) {
    fun downloadAnnPoster(annId: String, outFile: File) {
        val url = "https://cdn.animenewsnetwork.com/encyclopedia/api.xml?anime=$annId"
        val doc = DocumentBuilderFactory.newInstance().newDocumentBuilder().parse(url)
        val xpath = XPathFactory.newInstance().newXPath()
        val images = xpath.evaluate(".//info[@type=\"Picture\"]/img", doc, XPathConstants.NODESET) as NodeList
        var fullsrc: String? = null
        for (i in 0 until images.length) {
            val image = images.item(i)
            val src = image.attributes.getNamedItem("src").nodeValue
            if (src.contains("full")) {
                fullsrc = src
            } else if (src.contains("max") && fullsrc == null) {
                fullsrc = src
            }
        }
        if (fullsrc == null) {
            throw IllegalStateException("full image url not found")
        }
        download(fullsrc.replaceFirst("http://", "https://"), outFile)
    }

    fun generateThumbnail(file: File, thumbFile: File, removeAnnWatermark: Boolean = false) {
        var w = 233
        var h = 318
        val annWatermarkHeight = 13

        // Retina
        w *= 2
        h *= 2

        val args = mutableListOf<String>("convert", file.absolutePath)
        if (removeAnnWatermark) {
            args.add("-crop")
            args.add("+0-$annWatermarkHeight")
        }
        args.add("-resize")
        args.add("${w}x$h^")
        args.add("-gravity")
        args.add("north")
        args.add("-crop")
        args.add("${w}x$h+0+0")
        args.add(thumbFile.absolutePath)

        if (ProcessBuilder(args).inheritIO().start().waitFor() != 0) {
            throw Exception("resize failed")
        }

        try {
            ProcessBuilder(listOf("jpegoptim", "--max", "40", "--totals", thumbFile.absolutePath))
                    .inheritIO().start().waitFor()
        } catch (e: IOException) {
            // ignore
        }
    }

    fun download(url: String, dest: File) {
        val restTemplate = RestTemplate(OkHttp3ClientHttpRequestFactory())
        restTemplate.execute(url, HttpMethod.GET, null,
                ResponseExtractor {
                    it.use {
                        Files.asByteSink(dest).writeFrom(it.body)
                    }
                })
    }

    fun upload(source: File, path: String) {
        try {
            FileOutputStream(File(mediaRoot.file, path))
        } catch (e: UnsupportedOperationException) {
            (mediaRoot.createRelative(path) as WritableResource).outputStream
        }.use {
            Files.asByteSource(source).copyTo(it)
        }
    }
}
