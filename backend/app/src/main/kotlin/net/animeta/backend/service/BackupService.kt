package net.animeta.backend.service

import com.google.cloud.storage.BlobId
import com.google.cloud.storage.BlobInfo
import com.google.cloud.storage.Storage
import com.google.common.io.Files
import net.animeta.backend.model.User
import net.animeta.backend.repository.HistoryRepository
import org.apache.commons.csv.CSVFormat
import org.apache.commons.csv.CSVPrinter
import org.apache.commons.csv.QuoteMode
import org.springframework.beans.factory.annotation.Value
import org.springframework.core.io.Resource
import org.springframework.stereotype.Service
import java.io.File
import java.io.FileOutputStream
import java.io.OutputStreamWriter
import java.net.URL
import java.nio.channels.Channels
import java.nio.charset.StandardCharsets
import java.time.LocalDateTime
import java.time.format.DateTimeFormatterBuilder
import java.time.temporal.ChronoField
import java.util.Locale
import java.util.concurrent.TimeUnit
import java.util.zip.GZIPOutputStream
import javax.persistence.EntityManager
import javax.transaction.Transactional

@Service
class BackupService(private val historyRepository: HistoryRepository,
                    private val entityManager: EntityManager,
                    private val storage: Storage,
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
            OutputStreamWriter(GZIPOutputStream(FileOutputStream(tempFile)), StandardCharsets.UTF_8).use { out ->
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
            val blobId = BlobId.of(backupRoot.uri.authority, path)
            Channels.newOutputStream(storage.writer(BlobInfo.newBuilder(blobId)
                    .setContentType("text/csv")
                    .setContentDisposition("attachment; filename=${path}")
                    .setContentEncoding("gzip")
                    .build())).use {
                Files.asByteSource(tempFile).copyTo(it)
            }
            return storage.signUrl(BlobInfo.newBuilder(blobId).build(), 1, TimeUnit.DAYS)
        } finally {
            tempFile.delete()
        }
    }
}
