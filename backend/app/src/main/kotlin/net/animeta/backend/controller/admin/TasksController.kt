package net.animeta.backend.controller.admin

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.google.common.io.BaseEncoding
import net.animeta.backend.exception.ApiException
import net.animeta.backend.metadata.readStringList
import net.animeta.backend.model.Company
import net.animeta.backend.model.WorkCompany
import net.animeta.backend.repository.CompanyRepository
import net.animeta.backend.repository.WorkRepository
import net.animeta.backend.repository.WorkStaffRepository
import net.animeta.backend.service.admin.AnnService
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.HttpStatus
import org.springframework.transaction.support.TransactionTemplate
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.context.request.RequestContextHolder
import org.springframework.web.context.request.ServletRequestAttributes
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono
import reactor.core.publisher.UnicastProcessor
import reactor.core.scheduler.Schedulers
import java.security.MessageDigest

@RestController
@RequestMapping("/admin/tasks")
class TasksController(
    @Value("\${animeta.security.internal-password}") private val password: String,
    private val annService: AnnService,
    private val workRepository: WorkRepository,
    private val workStaffRepository: WorkStaffRepository,
    private val companyRepository: CompanyRepository,
    private val transactionTemplate: TransactionTemplate
) {
    private val mapper = jacksonObjectMapper()
    private val logger = LoggerFactory.getLogger(this::class.java)

    @PostMapping("/importAnnMetadata")
    fun importAnnMetadata(): Flux<String> {
        checkAuth()

        val processor = UnicastProcessor.create<String>()

        Mono.fromCallable {
            val works = workRepository.findAllMetadataHasProperty("ann_id")
            processor.onNext("Importing ${works.size} works")

            for ((chunkIndex, chunk) in works.asSequence().chunked(5).withIndex()) {
                processor.onNext("Chunk #$chunkIndex...")
                val annIds = chunk.associateBy { mapper.readTree(it.metadata)["ann_id"].asText() }
                val metadataMap = annService.getMetadata(annIds.keys)
                for ((annId, work) in annIds) {
                    val metadata = metadataMap[annId] ?: continue
                    transactionTemplate.execute {
                        val work = workRepository.findById(work.id!!).get()
                        processor.onNext("Importing: ${work.title} (annId: $annId)")
                        annService.importMetadata(work, metadata)
                    }
                }
                Thread.sleep(1000)
            }
        }
            .doOnSuccessOrError { _, throwable ->
                if (throwable != null) {
                    logger.error(throwable.message, throwable)
                    processor.onNext("Error: ${throwable.message}")
                }
                processor.onComplete()
            }
            .subscribeOn(Schedulers.elastic())
            .subscribe()

        return processor.map { it + "\n" }
    }

    @GetMapping("/dumpWork2Staff")
    fun dumpWork2Staff(): Flux<String> {
        checkAuth()

        val processor = UnicastProcessor.create<String>()

        Mono.fromCallable {
            for ((workId, staffs) in workStaffRepository.findAll().groupBy { it.work.id!! }) {
                processor.onNext("$workId\t${staffs.map { it.person.id!! }.distinct().joinToString(" ")}")
            }
        }
            .doOnSuccessOrError { _, throwable ->
                if (throwable != null) {
                    logger.error(throwable.message, throwable)
                    processor.onNext("Error: ${throwable.message}")
                }
                processor.onComplete()
            }
            .subscribeOn(Schedulers.elastic())
            .subscribe()

        return processor.map { it + "\n" }
    }

    @PostMapping("/migrateCompany")
    fun migrateCompany(): Flux<String> {
        checkAuth()

        val processor = UnicastProcessor.create<String>()

        Mono.fromCallable {
            val works = workRepository.findAllMetadataHasProperty("studio")
            processor.onNext("Migrating ${works.size} works")

            for (work in works) {
                transactionTemplate.execute {
                    val work = workRepository.findById(work.id!!).get()
                    val metadata = work.metadata!!.let { mapper.readTree(it) }
                    val studios = readStringList(metadata["studio"])
                    processor.onNext("${work.title}: $studios")
                    work.companies.clear()
                    work.companies.addAll(studios.withIndex().map { (index, name) ->
                        val company = companyRepository.findOneByName(name) ?:
                            companyRepository.save(Company(
                                name = name,
                                metadata = null,
                                annId = null
                            ))
                        WorkCompany(work = work, position = index, company = company)
                    })
                    workRepository.save(work)
                }
            }
        }
            .doOnSuccessOrError { _, throwable ->
                if (throwable != null) {
                    logger.error(throwable.message, throwable)
                    processor.onNext("Error: ${throwable.message}")
                }
                processor.onComplete()
            }
            .subscribeOn(Schedulers.elastic())
            .subscribe()

        return processor.map { it + "\n" }
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
