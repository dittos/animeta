package net.animeta.backend.indexer

import net.animeta.backend.model.WorkIndex
import net.animeta.backend.model.WorkTitleIndex
import net.animeta.backend.repository.TitleMappingRepository
import net.animeta.backend.repository.WorkIndexRepository
import net.animeta.backend.repository.WorkRepository
import net.animeta.backend.repository.WorkTitleIndexRepository
import net.animeta.backend.service.SearchService
import org.springframework.stereotype.Component
import org.springframework.transaction.support.TransactionTemplate
import java.util.stream.Collectors

@Component
class Indexer(
    private val workRepository: WorkRepository,
    private val workIndexRepository: WorkIndexRepository,
    private val workTitleIndexRepository: WorkTitleIndexRepository,
    private val titleMappingRepository: TitleMappingRepository,
    private val transactionTemplate: TransactionTemplate
) {
    fun run() {
        transactionTemplate.execute { _ ->
            workIndexRepository.deleteAllInBatch()
            val objects = mutableListOf<WorkIndex>()
            val recordCounts: Map<Int, Long> = workRepository.iterateAllByAllTimePopularity(minCount = 0)
                .use { stream ->
                    stream.collect(Collectors.toMap({ it.first }, { it.second }))
                }
            for (work in workRepository.findAll()) {
                objects.add(WorkIndex(
                    workId = work.id!!,
                    title = work.title,
                    record_count = recordCounts[work.id!!]?.toInt() ?: 0,
                    rank = 0,
                    blacklisted = work.blacklisted
                ))
            }
            objects.sortByDescending { it.record_count }
            var rank = 0
            var prev = -1
            for ((i, obj) in objects.withIndex()) {
                if (prev != obj.record_count) {
                    rank = i + 1
                }
                prev = obj.record_count
                obj.rank = rank
            }
            workIndexRepository.saveAll(objects)
        }

        transactionTemplate.execute {
            workTitleIndexRepository.deleteAllInBatch()
            val objects = mutableListOf<WorkTitleIndex>()
            for (mapping in titleMappingRepository.findAll()) {
                objects.add(WorkTitleIndex(
                    key = SearchService.makeKey(mapping.title),
                    work = mapping.work
                ))
            }
            workTitleIndexRepository.saveAll(objects)
        }
    }
}