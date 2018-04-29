package net.animeta.backend.service

import com.google.common.io.Files
import net.animeta.backend.model.User
import net.animeta.backend.repository.HistoryRepository
import org.apache.commons.csv.CSVFormat
import org.apache.commons.csv.CSVPrinter
import org.apache.commons.csv.QuoteMode
import org.springframework.beans.factory.annotation.Value
import org.springframework.cloud.gcp.storage.GoogleStorageResourceObject
import org.springframework.core.io.Resource
import org.springframework.stereotype.Service
import java.io.File
import java.net.URI
import java.net.URL
import java.nio.charset.StandardCharsets
import java.time.LocalDateTime
import java.time.format.DateTimeFormatterBuilder
import java.time.temporal.ChronoField
import java.util.*
import java.util.concurrent.TimeUnit
import javax.persistence.EntityManager
import javax.transaction.Transactional

@Service
class BackupService(private val historyRepository: HistoryRepository,
                    private val entityManager: EntityManager,
                    @Value("\${animeta.backup.root_location}") private val backupRoot: Resource) {
    private val format = CSVFormat.EXCEL
            .withQuoteMode(QuoteMode.ALL)
            .withHeader("id", "title", "category", "status", "status_type", "comment", "updated_at", "contains_spoiler")
    private val batchSize = 1024
    private val utf8BOM = "\uFEFF"
    private val dateTimeFormat = DateTimeFormatterBuilder()
            .appendValue(ChronoField.YEAR, 4).appendValue(ChronoField.MONTH_OF_YEAR, 2).appendValue(ChronoField.DAY_OF_MONTH, 2)
            .appendValue(ChronoField.HOUR_OF_DAY, 2).appendValue(ChronoField.MINUTE_OF_HOUR, 2).appendValue(ChronoField.SECOND_OF_MINUTE, 2)
            .toFormatter(Locale.ENGLISH)

    @Transactional
    fun create(user: User): URL {
        val tempFile = File.createTempFile("bak", "csv")
        try {
            Files.asCharSink(tempFile, StandardCharsets.UTF_8).openBufferedStream().use { out ->
                out.write(utf8BOM)
                CSVPrinter(out, format).use { printer ->
                    historyRepository.streamAllByUserOrderByIdDesc(user).use { stream ->
                        var i = 1
                        stream.forEach {
                            printer.printRecord(it.id, it.record.title, it.record.category?.name,
                                    it.status, it.status_type, it.comment, it.updatedAt, it.contains_spoiler)
                            entityManager.detach(it)
                            i++
                            if (i % batchSize == 0) {
                                // control identity map size
                                entityManager.clear()
                            }
                        }
                    }
                }
            }
            val path = "animeta_backup_${user.username}_${dateTimeFormat.format(LocalDateTime.now())}.csv"
            val gsObject = backupRoot.createRelative(path) as GoogleStorageResourceObject
            gsObject.outputStream.use {
                Files.asByteSource(tempFile).copyTo(it)
            }
            return gsObject.createSignedUrl(TimeUnit.DAYS, 1)
        } finally {
            tempFile.delete()
        }
    }
}
