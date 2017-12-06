package net.animeta.backend.service.admin

import com.google.common.io.Files
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpMethod
import org.springframework.stereotype.Service
import org.springframework.web.client.RequestCallback
import org.springframework.web.client.ResponseExtractor
import org.springframework.web.client.RestTemplate
import org.w3c.dom.NodeList
import org.xml.sax.InputSource
import java.io.File
import java.io.InputStreamReader
import java.io.IOException
import java.util.*
import javax.xml.parsers.DocumentBuilderFactory
import javax.xml.xpath.XPathConstants
import javax.xml.xpath.XPathFactory

@Service
class ImageService constructor (@Value("\${animeta.media.root_dir}") mediaRootDir: String) {
    private val mediaRoot = File(mediaRootDir)

    fun downloadPoster(url: String): String {
        val filename = UUID.randomUUID().toString()
        download(url, File(mediaRoot, filename))
        return filename
    }

    fun downloadAnnPoster(annId: String): String {
        val filename = "ann$annId.jpg"
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
        if (fullsrc != null) {
            download(fullsrc.replaceFirst("http://", "https://"), File(mediaRoot, filename))
            return filename
        }
        throw IllegalStateException("full image url not found")
    }

    fun generateThumbnail(filename: String, removeAnnWatermark: Boolean = false): String {
        val file = File(mediaRoot, filename)
        val thumbFilename = "thumb/" + filename
        val thumbFile = File(mediaRoot, thumbFilename)

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

        return thumbFilename
    }

    private fun download(url: String, dest: File) {
        val restTemplate = RestTemplate()
        restTemplate.execute(url, HttpMethod.GET, null,
                ResponseExtractor {
                    it.use {
                        Files.asByteSink(dest).writeFrom(it.body)
                    }
                })
    }
}
