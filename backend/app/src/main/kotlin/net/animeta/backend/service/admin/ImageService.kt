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
import java.io.File
import java.io.FileOutputStream
import java.io.IOException

@Service
class ImageService(
    @Value("\${animeta.media.root_location}") private val mediaRoot: Resource,
    private val annService: AnnService
) {
    private val restTemplate = RestTemplate(OkHttp3ClientHttpRequestFactory().apply {
        setConnectTimeout(0)
        setReadTimeout(0)
        setWriteTimeout(0)
    })

    fun downloadAnnPoster(annId: String, outFile: File) {
        val anime = annService.getMetadata(annId)!!
        val images = anime.select("info[@type=\"Picture\"] img")
        var fullsrc: String? = null
        for (image in images) {
            val src = image.attr("src")
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
