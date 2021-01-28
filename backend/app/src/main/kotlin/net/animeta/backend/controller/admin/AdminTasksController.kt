package net.animeta.backend.controller.admin

import com.google.common.io.BaseEncoding
import net.animeta.backend.exception.ApiException
import net.animeta.backend.indexer.Indexer
import net.animeta.backend.repository.WorkPeriodIndexRepository
import net.animeta.backend.repository.WorkRepository
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.transaction.support.TransactionTemplate
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.context.request.RequestContextHolder
import org.springframework.web.context.request.ServletRequestAttributes
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import reactor.core.publisher.Sinks
import reactor.core.scheduler.Schedulers
import java.security.MessageDigest
import java.util.concurrent.atomic.AtomicBoolean

@RestController
@RequestMapping("/admin/tasks")
class AdminTasksController(
    @Value("\${animeta.security.internal-password}") private val password: String,
    private val indexer: Indexer,
    private val transactionTemplate: TransactionTemplate,
    private val workPeriodIndexRepository: WorkPeriodIndexRepository,
    private val workRepository: WorkRepository
) {
    private val logger = LoggerFactory.getLogger(this::class.java)
    private val buildingIndex = AtomicBoolean(false)

    @PostMapping("/buildIndex")
    fun buildIndex(): Flux<String> {
        checkAuth()

        val processor = Sinks.many().unicast().onBackpressureBuffer<String>()

        Mono.fromCallable {
            if (buildingIndex.compareAndSet(false, true)) {
                logger.info("buildIndex: start")
                val start = System.currentTimeMillis()
                try {
                    indexer.run()
                } finally {
                    buildingIndex.set(false)
                }
                val end = System.currentTimeMillis()
                logger.info("buildIndex: end ({} ms)", end - start)
            } else {
                logger.info("buildIndex: already running")
            }
        }
            .doOnSuccessOrError { _, throwable ->
                if (throwable != null) {
                    logger.error(throwable.message, throwable)
                    processor.tryEmitNext("Error: ${throwable.message}")
                }
                processor.tryEmitComplete()
            }
            .subscribeOn(Schedulers.boundedElastic())
            .subscribe()

        return processor.asFlux().map { it + "\n" }
    }

    @PostMapping("/fillFirstPeriod")
    fun fillFirstPeriod() {
        val serializableTransactionTemplate = TransactionTemplate().apply {
            transactionManager = transactionTemplate.transactionManager
            isolationLevel = TransactionTemplate.ISOLATION_SERIALIZABLE
        }
        val workIdAndFirstPeriods = workPeriodIndexRepository.findAll().filter { it.firstPeriod }.map { Pair(it.work.id!!, it.period) }
        for ((workId, firstPeriod) in workIdAndFirstPeriods) {
            serializableTransactionTemplate.execute {
                val work = workRepository.findById(workId).get()
                work.first_period = firstPeriod
                workRepository.save(work)
            }
        }
    }

    private fun checkAuth() {
        val attrs = RequestContextHolder.getRequestAttributes() as ServletRequestAttributes
        val header = attrs.request.getHeader("Authorization")
        val requiredHeader = "Basic ${BaseEncoding.base64().encode("admin:${password}".toByteArray())}"
        if (!MessageDigest.isEqual(header.toByteArray(), requiredHeader.toByteArray())) {
            throw ApiException("Authorization required", HttpStatus.UNAUTHORIZED)
        }
    }
}
