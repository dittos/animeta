package net.animeta.backend.service

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import net.animeta.backend.exception.ApiException
import net.animeta.backend.metadata.WorkMetadata
import net.animeta.backend.model.Company
import net.animeta.backend.model.TitleMapping
import net.animeta.backend.model.Work
import net.animeta.backend.model.WorkCompany
import net.animeta.backend.model.WorkPeriodIndex
import net.animeta.backend.repository.RecordRepository
import net.animeta.backend.repository.TitleMappingRepository
import net.animeta.backend.repository.WorkIndexRepository
import net.animeta.backend.repository.WorkRepository
import net.animeta.backend.repository.WorkTitleIndexRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
class WorkMutations(
    private val workRepository: WorkRepository,
    private val titleMappingRepository: TitleMappingRepository,
    private val workTitleIndexRepository: WorkTitleIndexRepository,
    private val workIndexRepository: WorkIndexRepository,
    private val recordRepository: RecordRepository,
    private val objectMapper: ObjectMapper
) {
    @Autowired
    private lateinit var recordMutations: RecordMutations

    @Autowired
    private lateinit var companyMutations: CompanyMutations

    fun getOrCreate(title: String): Work {
        val mapping = titleMappingRepository.findOneByTitle(title)
        if (mapping != null) {
            return mapping.work
        }
        val key = WorkService.titleKey(title)
        val similarMapping = titleMappingRepository.findFirstByKey(key)
        if (similarMapping != null) {
            val mapping = titleMappingRepository.save(TitleMapping(
                work = similarMapping.work,
                title = title,
                key = key
            ))
            return mapping.work
        } else {
            val work = workRepository.save(Work(
                title = title,
                image_filename = null,
                raw_metadata = null,
                metadata = null,
                blacklisted = false
            ))
            titleMappingRepository.save(TitleMapping(
                work = work,
                title = title,
                key = key
            ))
            return work
        }
    }

    fun addTitleMapping(work: Work, title: String): TitleMapping {
        val key = WorkService.titleKey(title)
        if (titleMappingRepository.countByKeyAndWorkIsNot(key, work) > 0) {
            throw ApiException("Title already mapped", HttpStatus.FORBIDDEN)
        }
        val mapping = TitleMapping(work = work, title = title, key = key)
        titleMappingRepository.save(mapping)
        return mapping
    }

    fun deleteTitleMapping(titleMapping: TitleMapping) {
        // TODO: -> CategoryMut?
        if (recordRepository.countByTitle(titleMapping.title) > 0) {
            throw ApiException("Record exists", HttpStatus.FORBIDDEN)
        }
        titleMappingRepository.delete(titleMapping)
    }

    fun updatePrimaryTitleMapping(work: Work, primaryTitleMappingId: Int) {
        val mapping = titleMappingRepository.findById(primaryTitleMappingId)
            .orElseThrow { ApiException.notFound() }
        if (work.id != mapping.work.id) {
            throw ApiException("primaryTitleMappingId does not belong to work", HttpStatus.BAD_REQUEST)
        }
        work.title = mapping.title
        workRepository.save(work)
    }

    fun updateMetadata(work: Work, metadata: WorkMetadata) {
        work.metadata = objectMapper.writeValueAsString(metadata)
        work.raw_metadata = work.metadata
        val periods = metadata.periods ?: emptyList()
        work.periodIndexes.clear()
        work.periodIndexes.addAll(periods.sorted().mapIndexed { index, period ->
            WorkPeriodIndex(work = work, period = period.toString(), firstPeriod = index == 0)
        })
        val studios = metadata.studios?.map {
            companyMutations.getOrCreate(name = it)
        }
        work.companies.clear()
        if (studios != null) {
            work.companies.addAll(studios.withIndex().map { (index, company) ->
                WorkCompany(work = work, position = index, company = company)
            })
        }
        workRepository.saveAndFlush(work)
    }

    fun updateImageCenter(work: Work, y: Double) {
        work.image_center_y = y
        workRepository.save(work)
    }

    fun updateImageFilename(work: Work, filename: String, originalFilename: String) {
        work.image_filename = filename
        work.original_image_filename = originalFilename
        workRepository.save(work)
    }

    fun blacklist(work: Work) {
        work.blacklisted = true
        workRepository.save(work)
    }

    data class MergeError(val conflicts: List<MergeConflictDTO>)
    // TODO: -> AdminController?
    data class MergeConflictDTO(val user_id: Int, val username: String, val ids: List<Int>)

    fun merge(work: Work, other: Work, force: Boolean) {
        if (work.id == other.id) {
            throw ApiException("Cannot merge itself", HttpStatus.BAD_REQUEST)
        }
        val conflicts = recordRepository.findConflictingRecords(work.id!!, other.id!!)
        if (conflicts.isNotEmpty() && !force) {
            throw ApiException("Users with conflict exist", HttpStatus.UNPROCESSABLE_ENTITY,
                MergeError(conflicts = conflicts.map { (r, r2) ->
                    MergeConflictDTO(
                        user_id = r.user.id!!,
                        username = r.user.username,
                        ids = listOf(r.id!!, r2.id!!)
                    )
                }))
        }
        recordMutations.didMergeWork(work, other, conflicts.map { it.first.user })
        titleMappingRepository.replaceWork(other, work)
        workTitleIndexRepository.deleteAllByWork(other)
        workIndexRepository.findOneByWorkId(other.id!!)?.let {
            workIndexRepository.delete(it)
        }
        workRepository.delete(other)
    }

    fun delete(work: Work) {
        recordMutations.willDeleteWork(work)
        workRepository.delete(work)
    }

    fun didUpdateCompanyName(company: Company, prevName: String) {
        for (workCompany in company.works) {
            val work = workCompany.work
            val metadata = work.metadata?.let { objectMapper.readValue<WorkMetadata>(it) } ?: WorkMetadata()
            updateMetadata(work, metadata.copy(
                studios = metadata.studios?.map {
                    if (it == prevName) company.name else it
                }
            ))
        }
    }

    fun willMergeCompany(company: Company, other: Company) {
        if (other.works.any { it.company.id == company.id }) {
            throw ApiException("Works with conflict exists", HttpStatus.BAD_REQUEST)
        }
    }

    fun didMergeCompany(company: Company, other: Company) {
        // FIXME: Relies on other.works loaded in willMergeCompany
        for (workCompany in other.works) {
            val work = workCompany.work
            val metadata = work.metadata?.let { objectMapper.readValue<WorkMetadata>(it) } ?: WorkMetadata()
            updateMetadata(work, metadata.copy(
                studios = metadata.studios?.map {
                    if (it == other.name) company.name else it
                }
            ))
        }
    }
}
